// YouTube API client for the FastAPI backend.
// Uses relative paths, so requests go through the Vite dev proxy (same origin, cookie works).

// Error with HTTP status and a short code: 'timeout' | 'network' | 'unauthorized' | 'forbidden' | 'server' | 'http'
export class YoutubeApiError extends Error {
  constructor(message, status, code = 'http') {
    super(message)
    this.name = 'YoutubeApiError'
    this.status = status
    this.code = code
  }
}

const AUTH_TIMEOUT_MS = 12000

// Maps the frontend's auth paths to the backend's real ones
//   /auth/youtube/login  -> /auth/google/login
//   /auth/youtube/logout -> /auth/logout
export function youtubeAuthUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (normalized === '/auth/youtube/login') return '/auth/google/login'
  if (normalized === '/auth/youtube/logout') return '/auth/logout'
  return normalized
}

// Reads the body as text first, then parses JSON only when the server says it is JSON
async function responseBody(response) {
  const text = await response.text()
  if (!text) return null
  if (!response.headers.get('content-type')?.includes('application/json')) return text
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// Pulls a readable message out of FastAPI error bodies
function detailMessage(data) {
  if (data && typeof data === 'object') {
    if ('detail' in data) {
      const detail = data.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
    }
    if ('message' in data && typeof data.message === 'string') return data.message
    if ('error' in data && typeof data.error === 'string') return data.error
  }
  return 'YouTube Intelligence is currently unavailable. Please try again.'
}

// Core request helper. options: { method, body, signal, timeoutMs, csrf }
export async function youtubeRequest(path, options = {}) {
  const requestController = new AbortController()
  const timeoutMs = options.timeoutMs
  let timedOut = false

  // Forward the caller's abort signal to our own controller
  const abortFromCaller = () => requestController.abort(options.signal?.reason)
  if (options.signal?.aborted) abortFromCaller()
  else options.signal?.addEventListener('abort', abortFromCaller, { once: true })

  const timeout = timeoutMs
    ? globalThis.setTimeout(() => {
        timedOut = true
        requestController.abort()
      }, timeoutMs)
    : null

  let response
  let data
  try {
    response = await fetch(path, {
      method: options.method || 'GET',
      credentials: 'include', // sends the access_token cookie
      signal: requestController.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.csrf ? { 'X-Leadhive-CSRF': options.csrf } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    })
    data = await responseBody(response)
  } catch (error) {
    if (options.signal?.aborted) throw error // caller cancelled, let it through untouched
    if (timedOut) {
      throw new YoutubeApiError('The request timed out. Please try again.', null, 'timeout')
    }
    console.error('[YouTube API] Request failed', { path, error })
    throw new YoutubeApiError('Unable to reach YouTube Intelligence.', null, 'network')
  } finally {
    if (timeout) globalThis.clearTimeout(timeout)
    options.signal?.removeEventListener('abort', abortFromCaller)
  }

  if (!response.ok) {
    console.error('[YouTube API] Error response', { path, status: response.status, body: data })
    const code =
      response.status === 401 ? 'unauthorized'
      : response.status === 403 ? 'forbidden'
      : response.status >= 500 ? 'server'
      : 'http'
    throw new YoutubeApiError(detailMessage(data), response.status, code)
  }

  return data
}

// ── Auth endpoints ──────────────────────────────────────────────────────

// GET /auth/me: is the user logged in? (401 if not)
export const getAuthMe = (options = {}) =>
  youtubeRequest('/auth/me', { timeoutMs: AUTH_TIMEOUT_MS, ...options })

// GET /auth/channels: the signed-in user's saved YouTube channels
export const getAuthChannels = (options = {}) =>
  youtubeRequest('/auth/channels', { timeoutMs: AUTH_TIMEOUT_MS, ...options })

// POST /auth/logout: clears the JWT cookie
export const logoutUser = () => youtubeRequest('/auth/logout', { method: 'POST' })