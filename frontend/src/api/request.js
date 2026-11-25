const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api')
  .replace(/\/$/, '')

async function readResponse(response) {
  if (!response.ok) {
    let message = `Request failed (${response.status}).`
    try {
      const body = await response.json()
      message = body.detail || body.message || body.error || message
    } catch {
      // The response may not contain a JSON error body.
    }

    const error = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null
  return response.json()
}

async function fetchApi(path, options = {}) {
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...options,
    })
  } catch {
    throw new Error('Could not connect to the store. Check that the backend is running.')
  }
}

export async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = await readResponse(await fetchApi('/auth/csrf'))
    headers['X-XSRF-TOKEN'] = csrf.token
  }

  const response = await fetchApi(path, { ...options, method, headers })
  return readResponse(response)
}
