import { useCallback, useEffect, useState } from 'react'
import {
  YoutubeApiError,
  youtubeAuthUrl,
  youtubeRequest,
  getAuthMe,
  getAuthChannels,
  logoutUser,
} from './api'

const CHANNEL_STORAGE_KEY = 'leadhive.youtube.channel_id'
const blankProfile = { business_name: '', website: '', services: '', brand_tone: '', ai_rules: '' }
const blankSchedule = { mode: 'all', target_date: '', start_time: '', end_time: '' }
const emptySession = { channels: [], selected: null, csrf: '' }

// ─── Helpers ────────────────────────────────────────────────────────────

function stringValue(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function nullableString(value) {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

function rememberSelectedChannelId(channelId) {
  try { window.localStorage.setItem(CHANNEL_STORAGE_KEY, channelId) } catch { /* noop */ }
}

function forgetSelectedChannelId() {
  try { window.localStorage.removeItem(CHANNEL_STORAGE_KEY) } catch { /* noop */ }
}

function readSelectedChannelId() {
  const params = new URLSearchParams(window.location.search)
  for (const key of ['channel_id', 'channel', 'selected_channel', 'id']) {
    const value = stringValue(params.get(key))
    if (value) return value
  }
  try {
    return stringValue(window.localStorage.getItem(CHANNEL_STORAGE_KEY))
  } catch {
    return null
  }
}

function readAuthResult() {
  const auth = new URLSearchParams(window.location.search).get('auth')
  if (!auth) return null
  return auth === 'failed' ? 'failed' : 'success'
}

function clearAuthParams() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('auth')) return
  url.searchParams.delete('auth')
  url.searchParams.delete('channel_id')
  window.history.replaceState(null, '', url.pathname + url.search + url.hash)
}

function parseChannel(raw) {
  if (!raw || typeof raw !== 'object') return null
  const item = raw
  const id = stringValue(item.id) || stringValue(item.channel_id) || stringValue(item.channelId)
  if (!id) return null
  return {
    id,
    title: stringValue(item.title) || stringValue(item.channel_title) || stringValue(item.name) || id,
    thumbnail: stringValue(item.thumbnail) || stringValue(item.thumbnail_url) || '',
    subscribers: nullableString(item.subscribers ?? item.subscriber_count),
    views: nullableString(item.views ?? item.view_count),
    videos: nullableString(item.videos ?? item.video_count),
  }
}

function extractChannels(payload) {
  // Backend may return { channels: [...] } or [...] directly
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.channels)
      ? payload.channels
      : Array.isArray(payload?.data)
        ? payload.data
        : []
  return list.map(parseChannel).filter(Boolean)
}

function extractAuthFlag(payload) {
  if (payload === null || payload === undefined) return false
  if (payload === true) return true
  if (typeof payload === 'object') {
    if (payload.authenticated === true) return true
    if (payload.authenticated === false) return false
    if (payload.logged_in === true) return true
    if (payload.user || payload.email) return true
    if (payload.id || payload.sub) return true
  }
  return false
}

function errorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback
}

function isUnauthorized(error) {
  return error instanceof YoutubeApiError && error.status === 401
}

// ─── Generic resource hook ─────────────────────────────────────────────

export function useYoutubeResource(path, refresh = 0) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setData(null); setError(''); setStatus(null)
    if (!path) { setLoading(false); return }
    setLoading(true)
    youtubeRequest(path, { signal: controller.signal })
      .then(setData)
      .catch(error => {
        if (controller.signal.aborted) return
        setStatus(error instanceof YoutubeApiError ? error.status : null)
        setError(errorMessage(error, 'Unable to load this section.'))
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [path, refresh])

  return { data, error, status, loading }
}

// ─── Main controller ───────────────────────────────────────────────────

export function useYouTubeIntelligence() {
  const [initial] = useState(() => ({ channelId: readSelectedChannelId(), authResult: readAuthResult() }))
  const [refresh, setRefresh] = useState(0)
  const [authStatus, setAuthStatus] = useState('loading')
  const [session, setSession] = useState(emptySession)
  const [error, setError] = useState(initial.authResult === 'failed' ? 'Google sign-in failed. Please try again.' : '')
  const [busy, setBusy] = useState(false)

  // Placeholder state — these will be filled once backend adds endpoints
  const [profile, setProfile] = useState(blankProfile)
  const [selection, setSelection] = useState([])
  const [schedule, setSchedule] = useState(blankSchedule)
  const [running, setRunning] = useState(false)
  const [videos, setVideos] = useState([])
  const [automationReady, setAutomationReady] = useState(false)

  const selected = session.selected

  useEffect(() => { clearAuthParams() }, [])

  // 1) Check auth + load channels on mount (and on refresh)
  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const me = await getAuthMe()
        // getAuthMe returns 200 with payload, or 401 which throws
        if (!extractAuthFlag(me)) {
          setSession(emptySession)
          setAuthStatus('anonymous')
          return
        }

        const channelsPayload = await getAuthChannels()
        const channels = extractChannels(channelsPayload)

        const fromServer =
          stringValue(channelsPayload?.selected) ||
          stringValue(channelsPayload?.selected_channel_id) ||
          stringValue(channelsPayload?.current_channel_id)

        const chosen =
          [initial.channelId, fromServer].find(id => id && channels.some(channel => channel.id === id)) ||
          channels[0]?.id ||
          null

        if (chosen) rememberSelectedChannelId(chosen)

        setSession({
          channels,
          selected: chosen,
          csrf: stringValue(channelsPayload?.csrf) || stringValue(channelsPayload?.csrf_token) || '',
        })
        setAuthStatus('authenticated')
        setError('')
      } catch (err) {
        if (controller.signal.aborted) return
        if (isUnauthorized(err)) {
          setSession(emptySession)
          setAuthStatus('anonymous')
          return
        }
        setError(errorMessage(err, 'Unable to reach YouTube Intelligence.'))
        setAuthStatus('error')
      }
    }

    load()
    return () => controller.abort()
  }, [initial.channelId, refresh])

  // 2) Mutations — endpoints not yet on backend, so this warns + returns false
  const mutate = useCallback(async (path, body, method = 'POST') => {
    // Special case: switching selected channel is local state only (for now)
    if (path === '/channel') {
      const nextChannel = stringValue(body?.channel)
      if (!nextChannel) return false
      if (!session.channels.some(channel => channel.id === nextChannel)) return false
      rememberSelectedChannelId(nextChannel)
      setSession(current => ({ ...current, selected: nextChannel }))
      return true
    }

    console.warn(
      `[YouTube] mutate(${path}) called but backend endpoint is not yet implemented. ` +
      `Request would be: ${method} ${path}`,
      body
    )
    return false
  }, [session.channels])

  async function chooseChannel(channel) {
    if (await mutate('/channel', { channel }, 'POST')) {
      setRefresh(value => value + 1)
      return true
    }
    return false
  }

  const connect = useCallback(() => {
    window.location.assign(youtubeAuthUrl('/auth/youtube/login'))
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } catch (err) {
      if (!isUnauthorized(err)) {
        setError(errorMessage(err, 'Unable to sign out.'))
        return false
      }
    }
    forgetSelectedChannelId()
    setSession(emptySession)
    setAuthStatus('anonymous')
    return true
  }, [])

  return {
    session,
    authenticated: authStatus === 'authenticated',
    authStatus,
    loading: authStatus === 'loading',
    error,
    busy,
    profile, setProfile,
    selection, setSelection,
    schedule, setSchedule,
    running, setRunning,
    videos,
    automationReady,
    channel: session.channels.find(channel => channel.id === session.selected) || null,
    chooseChannel,
    connect,
    logout,
    mutate,
    reload: () => setRefresh(value => value + 1),
  }
}