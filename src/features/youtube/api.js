// ─────────────────────────────────────────────────────────────────────────
// YouTube API — real backend calls only.
// Only endpoints that exist on the backend today are implemented.
// Endpoints for videos/analytics/profile/etc. will be added when the
// backend supports them (see bottom of file for the list).
// ─────────────────────────────────────────────────────────────────────────

export class YoutubeApiError extends Error {
  constructor(message, status, code = 'http') {
    super(message)
    this.name = 'YoutubeApiError'
    this.status = status
    this.code = code
  }
}

const AUTH_TIMEOUT_MS = 30000
const MAX_SAFE_GET_RETRIES = 2
const RETRY_BASE_DELAY_MS = 250

/**
 * Maps the frontend's expected auth paths to the backend's real paths.
 *   /auth/youtube/login  → /auth/google/login
 *   /auth/youtube/logout → /auth/logout
 * The Vite proxy forwards /auth/* to the backend.
 */
export function youtubeAuthUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (normalized === '/auth/youtube/login') return '/auth/google/login'
  if (normalized === '/auth/youtube/logout') return '/auth/logout'
  return normalized
}

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

function safeRequestPath(path) {
  try {
    return new URL(path, 'https://leadhive.invalid').pathname
  } catch {
    return '[invalid-path]'
  }
}

function timestamp() {
  return globalThis.performance?.now?.() ?? Date.now()
}

function durationSince(startedAt) {
  return Math.round(timestamp() - startedAt)
}

function developmentDiagnostic(event, details) {
  if (!import.meta.env.DEV) return
  console.info(`[YouTube API] ${event}`, details)
}

function isOAuthAuthorizationCodeExchange(path) {
  const pathname = safeRequestPath(path)
  return /^\/auth\/(?:google|oauth)(?:\/[^/]+)?\/callback\/?$/.test(pathname) ||
    /^\/auth\/callback\/?$/.test(pathname)
}

function shouldRetrySafeGet(error, method, path) {
  if (method !== 'GET' || isOAuthAuthorizationCodeExchange(path)) return false
  if (!(error instanceof YoutubeApiError)) return false
  return error.code === 'network' ||
    error.code === 'timeout' ||
    error.status === 429 ||
    (error.status !== null && error.status >= 500)
}

function retryDelay(attempt) {
  return RETRY_BASE_DELAY_MS * (2 ** attempt)
}

function waitForRetry(delayMs, signal) {
  return new Promise((resolve, reject) => {
    const timeout = globalThis.setTimeout(cleanup(resolve), delayMs)

    function abort() {
      globalThis.clearTimeout(timeout)
      cleanup(() => reject(signal.reason || new Error('Request aborted')))()
    }

    function cleanup(callback) {
      return () => {
        signal?.removeEventListener('abort', abort)
        callback()
      }
    }

    if (signal?.aborted) abort()
    else signal?.addEventListener('abort', abort, { once: true })
  })
}

async function performRequest(path, options, method, attempt) {
  const requestUrl = path.startsWith('http') ? path : path
  const requestController = new AbortController()
  const timeoutMs = options.timeoutMs
  const diagnostic = { method, path: safeRequestPath(path), attempt: attempt + 1 }
  const startedAt = timestamp()
  let timedOut = false

  const abortFromCaller = () => requestController.abort(options.signal?.reason)
  if (options.signal?.aborted) abortFromCaller()
  else options.signal?.addEventListener('abort', abortFromCaller, { once: true })

  const timeout = timeoutMs
    ? globalThis.setTimeout(() => {
        timedOut = true
        requestController.abort()
      }, timeoutMs)
    : null

  try {
    const response = await fetch(requestUrl, {
      method,
      credentials: 'include',
      signal: requestController.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.csrf ? { 'X-Leadhive-CSRF': options.csrf } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    })
    const data = await responseBody(response)
    developmentDiagnostic('response', {
      ...diagnostic,
      status: response.status,
      durationMs: durationSince(startedAt),
    })
    if (!response.ok) {
      const code = response.status === 401
        ? 'unauthorized'
        : response.status === 403
          ? 'forbidden'
          : response.status >= 500
            ? 'server'
            : 'http'
      throw new YoutubeApiError(detailMessage(data), response.status, code)
    }

    return data
  } catch (error) {
    if (options.signal?.aborted) {
      developmentDiagnostic('aborted', {
        ...diagnostic,
        durationMs: durationSince(startedAt),
      })
      throw error
    }
    if (error instanceof YoutubeApiError) throw error
    if (timedOut) {
      developmentDiagnostic('timeout', {
        ...diagnostic,
        timeoutMs,
        durationMs: durationSince(startedAt),
      })
      throw new YoutubeApiError('The request timed out. Please try again.', null, 'timeout')
    }
    developmentDiagnostic('network failure', {
      ...diagnostic,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      durationMs: durationSince(startedAt),
    })
    throw new YoutubeApiError('Unable to reach YouTube Intelligence.', null, 'network')
  } finally {
    if (timeout) globalThis.clearTimeout(timeout)
    options.signal?.removeEventListener('abort', abortFromCaller)
  }
}

export async function youtubeRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const maxRetries = method === 'GET' && !isOAuthAuthorizationCodeExchange(path)
    ? MAX_SAFE_GET_RETRIES
    : 0

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await performRequest(path, options, method, attempt)
    } catch (error) {
      if (attempt >= maxRetries || !shouldRetrySafeGet(error, method, path)) {
        throw error
      }

      const delayMs = retryDelay(attempt)
      developmentDiagnostic('retry scheduled', {
        method,
        path: safeRequestPath(path),
        nextAttempt: attempt + 2,
        delayMs,
        status: error.status,
        failure: error.code,
      })
      await waitForRetry(delayMs, options.signal)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Real endpoints (exist on the backend today)
// ─────────────────────────────────────────────────────────────────────────

/** GET /auth/me — check if the user is logged in. 401 if not. */
export const getAuthMe = (options = {}) =>
  youtubeRequest('/auth/me', { timeoutMs: AUTH_TIMEOUT_MS, ...options })

/** GET /auth/channels — return the signed-in user's saved YouTube channels. */
export const getAuthChannels = (options = {}) =>
  youtubeRequest('/auth/channels', { timeoutMs: AUTH_TIMEOUT_MS, ...options })

/** POST /auth/logout — clear the JWT cookie. */
export const logoutUser = () => youtubeRequest('/auth/logout', { method: 'POST' })

// ─────────────────────────────────────────────────────────────────────────
// Endpoints to be added on the backend later (uncomment when available)
// ─────────────────────────────────────────────────────────────────────────
//
// export const getWorkspace    = ()           => youtubeRequest('/api/youtube/workspace')
// export const getDashboard    = (channelId)  => youtubeRequest('/dashboard/' + encodeURIComponent(channelId))
// export const getAnalytics    = (channelId)  => youtubeRequest('/analytics/' + encodeURIComponent(channelId))
// export const getLogs         = (channelId)  => youtubeRequest('/api/logs/' + encodeURIComponent(channelId))
// export const saveProfile     = (channelId, profile) =>
//   youtubeRequest('/api/channels/' + encodeURIComponent(channelId) + '/profile', { method: 'PUT', body: profile })
// export const saveSelection   = (channelId, videoIds) =>
//   youtubeRequest('/save-selected-videos', { method: 'POST', body: { channel_id: channelId, video_ids: videoIds } })
// export const saveSchedule    = (channelId, schedule) =>
//   youtubeRequest('/api/channels/' + encodeURIComponent(channelId) + '/schedule', { method: 'PUT', body: schedule })
// export const toggleAutomation = (channelId, running) =>
//   youtubeRequest('/api/toggle-bot/' + encodeURIComponent(channelId), { method: 'POST', body: { running } })
