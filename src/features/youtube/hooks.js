
// The shared flow state (channel, profile, video) moves into a context in the next step.
import { useEffect, useState } from 'react'
import { YoutubeApiError, youtubeRequest } from './api'

function errorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback
}

// useYoutubeResource(path, refresh, pollInterval)
// - pass null as path to skip fetching (e.g. until a channel is selected)
// - change refresh to refetch
// - set pollInterval to refetch after each completed request
// Returns { data, error, status, loading }
export function useYoutubeResource(path, refresh = 0, pollInterval = 0) {
  // One key per request, so stale results from a previous path are never shown
  const requestKey = path ? `${path}:${refresh}` : null
  const [result, setResult] = useState({ key: null, data: null, error: '', status: null })

  useEffect(() => {
    if (!path) return
    const controller = new AbortController()

    let timeout
    async function fetchResource() {
      try {
        const data = await youtubeRequest(path, { signal: controller.signal })
        if (controller.signal.aborted) return
        setResult({ key: requestKey, data, error: '', status: null })
      } catch (error) {
        if (controller.signal.aborted) return
        setResult({
          key: requestKey,
          data: null,
          error: errorMessage(error, 'Unable to load this section.'),
          status: error instanceof YoutubeApiError ? error.status : null,
        })
      } finally {
        if (!controller.signal.aborted && pollInterval > 0) {
          timeout = globalThis.setTimeout(fetchResource, pollInterval)
        }
      }
    }

    fetchResource()
    return () => {
      controller.abort()
      if (timeout) globalThis.clearTimeout(timeout)
    }
  }, [path, requestKey, pollInterval])

  // loading is derived: no result yet for the current key means still loading
  if (!requestKey) return { data: null, error: '', status: null, loading: false }
  if (result.key !== requestKey) return { data: null, error: '', status: null, loading: true }
  return { ...result, loading: false }
}