package com.nexora.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

public class AuthRateLimitFilter extends OncePerRequestFilter {
    private static final int MAX_TRACKED_ADDRESSES = 10_000;

    private final int maxAttempts;
    private final long windowMillis;
    private final Map<String, AttemptWindow> attemptsByAddress = new HashMap<>();

    public AuthRateLimitFilter(int maxAttempts, Duration window) {
        if (maxAttempts < 1 || window.isZero() || window.isNegative()) {
            throw new IllegalArgumentException("Rate limit and window must be positive");
        }
        this.maxAttempts = maxAttempts;
        this.windowMillis = window.toMillis();
        if (windowMillis < 1) {
            throw new IllegalArgumentException("Rate limit window must be at least one millisecond");
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String contextPath = request.getContextPath();
        String requestPath = request.getRequestURI().substring(contextPath.length());
        if (!HttpMethod.POST.matches(request.getMethod())) {
            return true;
        }
        return !"/api/auth/login".equals(requestPath)
                && !"/api/auth/register".equals(requestPath)
                && !"/api/auth/resend-verification".equals(requestPath);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String contextPath = request.getContextPath();
        String requestPath = request.getRequestURI().substring(contextPath.length());
        String endpointKey = requestPath + ":";
        long retryAfterSeconds = recordAttempt(
                endpointKey + "ip:" + request.getRemoteAddr(), System.currentTimeMillis());
        if (retryAfterSeconds == 0 && "/api/auth/resend-verification".equals(requestPath)) {
            CachedBodyHttpServletRequest cachedRequest = cacheAndWrapRequest(request);
            String email = getEmail(cachedRequest);
            if (!email.isBlank()) {
                retryAfterSeconds = recordAttempt(
                        endpointKey + "email:" + email.toLowerCase(Locale.ROOT), System.currentTimeMillis());
            }
            if (retryAfterSeconds == 0) {
                filterChain.doFilter(cachedRequest, response);
                return;
            }
        } else if (retryAfterSeconds == 0) {
            filterChain.doFilter(request, response);
            return;
        }
        if (retryAfterSeconds > 0) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", Long.toString(retryAfterSeconds));
            return;
        }
    }

    private CachedBodyHttpServletRequest cacheAndWrapRequest(HttpServletRequest request) throws IOException {
        return new CachedBodyHttpServletRequest(request, request.getInputStream().readAllBytes());
    }

    private String getEmail(CachedBodyHttpServletRequest request) {
        String body = new String(request.getCachedBody(), StandardCharsets.UTF_8);
        java.util.regex.Matcher matcher = java.util.regex.Pattern
                .compile("\"email\"\\s*:\\s*\"([^\"]*)\"")
                .matcher(body);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return "";
    }

    private static final class CachedBodyHttpServletRequest extends HttpServletRequestWrapper {
        private final byte[] cachedBody;

        private CachedBodyHttpServletRequest(HttpServletRequest request, byte[] cachedBody) {
            super(request);
            this.cachedBody = cachedBody;
        }

        private byte[] getCachedBody() {
            return cachedBody;
        }

        @Override
        public jakarta.servlet.ServletInputStream getInputStream() {
            ByteArrayInputStream stream = new ByteArrayInputStream(cachedBody);
            return new jakarta.servlet.ServletInputStream() {
                @Override
                public int read() {
                    return stream.read();
                }

                @Override
                public boolean isFinished() {
                    return stream.available() == 0;
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setReadListener(jakarta.servlet.ReadListener readListener) {
                }
            };
        }

        @Override
        public BufferedReader getReader() {
            return new BufferedReader(new InputStreamReader(
                    new ByteArrayInputStream(cachedBody), StandardCharsets.UTF_8));
        }
    }

    private synchronized long recordAttempt(String address, long now) {
        String clientAddress = address == null ? "unknown" : address;
        AttemptWindow window = attemptsByAddress.get(clientAddress);
        if (window == null || now >= window.expiresAtMillis()) {
            makeRoomIfNeeded(now);
            if (attemptsByAddress.size() >= MAX_TRACKED_ADDRESSES) {
                return (windowMillis + 999) / 1000;
            }
            window = new AttemptWindow(now + windowMillis, 0);
            attemptsByAddress.put(clientAddress, window);
        }

        if (window.attempts() >= maxAttempts) {
            return Math.max(1, (window.expiresAtMillis() - now + 999) / 1000);
        }
        window.increment();
        return 0;
    }

    private void makeRoomIfNeeded(long now) {
        if (attemptsByAddress.size() < MAX_TRACKED_ADDRESSES) {
            return;
        }

        attemptsByAddress.values().removeIf(window -> now >= window.expiresAtMillis());
    }

    private static final class AttemptWindow {
        private final long expiresAtMillis;
        private int attempts;

        private AttemptWindow(long expiresAtMillis, int attempts) {
            this.expiresAtMillis = expiresAtMillis;
            this.attempts = attempts;
        }

        private long expiresAtMillis() {
            return expiresAtMillis;
        }

        private int attempts() {
            return attempts;
        }

        private void increment() {
            attempts++;
        }
    }
}
