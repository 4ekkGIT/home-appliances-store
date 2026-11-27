package com.nexora.backend;

import com.nexora.backend.config.AuthRateLimitFilter;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AuthRateLimitFilterTests {
    @Test
    void limitsLoginAttemptsPerIpAndReturnsRetryAfter() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(2, Duration.ofMinutes(1));
        AtomicInteger passedRequests = new AtomicInteger();

        for (int i = 0; i < 2; i++) {
            var response = sendLoginRequest(filter, "192.0.2.1", (request, result) ->
                    passedRequests.incrementAndGet());
            assertEquals(200, response.getStatus());
        }

        MockHttpServletResponse limitedResponse = sendLoginRequest(
                filter, "192.0.2.1", (request, result) -> passedRequests.incrementAndGet());
        assertEquals(429, limitedResponse.getStatus());
        assertEquals("60", limitedResponse.getHeader("Retry-After"));

        MockHttpServletResponse otherAddressResponse = sendLoginRequest(
                filter, "192.0.2.2", (request, result) -> passedRequests.incrementAndGet());
        assertEquals(200, otherAddressResponse.getStatus());
        assertEquals(3, passedRequests.get());
    }

    @Test
    void limitsRegistrationAndResendEndpoints() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(1, Duration.ofMinutes(1));
        AtomicInteger passedRequests = new AtomicInteger();

        MockHttpServletRequest firstRequest = new MockHttpServletRequest("POST", "/api/auth/register");
        firstRequest.setRemoteAddr("192.0.2.1");
        MockHttpServletResponse firstResponse = new MockHttpServletResponse();
        FilterChain chain = (servletRequest, servletResponse) -> passedRequests.incrementAndGet();
        filter.doFilter(firstRequest, firstResponse, chain);
        assertEquals(200, firstResponse.getStatus());

        MockHttpServletRequest resendRequest = new MockHttpServletRequest("POST", "/api/auth/resend-verification");
        resendRequest.setRemoteAddr("192.0.2.1");
        MockHttpServletResponse resendResponse = new MockHttpServletResponse();
        filter.doFilter(resendRequest, resendResponse, chain);
        assertEquals(429, resendResponse.getStatus());

        assertEquals(1, passedRequests.get());
    }

    private MockHttpServletResponse sendLoginRequest(AuthRateLimitFilter filter, String address,
                                                     FilterChain chain) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr(address);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, chain);
        return response;
    }
}
