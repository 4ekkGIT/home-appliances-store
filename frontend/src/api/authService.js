import { request } from './request'

export function getCurrentUser() {
  return request('/auth/me')
}

export function loginUser(email, password) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export function registerUser(data) {
  return request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function verifyEmail(token) {
  return request(`/auth/verify-email?token=${encodeURIComponent(token)}`)
}

export function resendVerificationEmail(email) {
  return request('/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
}

export function logoutUser() {
  return request('/auth/logout', { method: 'POST' })
}
