// Step 1 of FlowWidget: connect Google/YouTube and pick the channel LeadHive should manage.
// Data: GET /auth/channels (401 = not connected yet). The picked channel is lifted to FlowWidget.
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowRight, Check, Link2 } from 'lucide-react'
import { useYoutubeResource } from '../hooks'
import { FlowLoader } from './FlowLoader'

// Full-page redirect to Google (the Vite proxy forwards /auth to the backend)
const CONNECT_URL = '/auth/google/login'

// Messages for the ?auth=failed&reason=... values the backend callback can send
const FAILURE_MESSAGES = {
  access_denied: 'YouTube permission was not granted.',
  provider_denied: 'Google declined the sign-in.',
  token_exchange: 'Google sign-in could not be completed. Please try again.',
  channel_fetch: "We couldn't retrieve your YouTube channel.",
  no_youtube_channel: 'No YouTube channel was found for this Google account.',
}
const FALLBACK_FAILURE = 'The connection could not be completed. Try connecting again.'

const ONBOARDING_STEPS = [
  { title: 'Authorize YouTube', text: 'Use the verified OAuth flow to grant LeadHive channel access.' },
  { title: 'Select the operating channel', text: 'Pick the account LeadHive should analyze and manage.' },
  { title: 'Configure AI engagement', text: 'Move into persona setup with channel context already attached.' },
]

// Backend fields -> the small shape the rest of the flow uses
function toChannel(raw) {
  return {
    id: raw.youtube_channel_id,
    name: raw.channel_name || raw.youtube_channel_id,
    subscribers: raw.channel_subscribers,
    views: raw.channel_views,
  }
}

// "1,234" for numeric values, '' when the backend sends nothing usable
function formatCount(value) {
  if (value === null || value === undefined || value === '') return ''
  const n = Number(value)
  return Number.isFinite(n) ? n.toLocaleString() : ''
}

export function ChannelSelection({ channel, onSelectChannel }) {
  const [params] = useSearchParams()
  const [refresh, setRefresh] = useState(0)
  const { data, error, status, loading } = useYoutubeResource('/auth/channels', refresh)

  // Backend sent us back here with ?auth=failed&reason=...
  const connectionFailed = params.get('auth') === 'failed'
  const failureMessage = FAILURE_MESSAGES[params.get('reason')] || FALLBACK_FAILURE

  const notConnected = status === 401 // 401 just means "not signed in yet", not a real error
  const hardError = error && !notConnected
  const channels = Array.isArray(data) ? data.map(toChannel) : []
  const hasChannels = channels.length > 0

  // Shown right after Google login (and on every refetch) until /auth/channels answers,
  // so the Connect button never flashes before the real state is known
  if (loading) return <FlowLoader message="Loading your YouTube workspace..." />

  return (
    <section className="space-y-6">
      {/* Heading + connect-another link */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Channel Setup</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Connect your YouTube workspace</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Authorize YouTube, choose the channel LeadHive should manage, and keep the workspace tied
            to verified channel data.
          </p>
        </div>
        {hasChannels && (
          <a
            href={CONNECT_URL}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Link2 size={15} /> Connect another account
          </a>
        )}
      </div>

      {connectionFailed && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {failureMessage}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: onboarding intro */}
        <aside
          aria-label="YouTube connection onboarding"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Link2 size={14} /> Google OAuth connection
          </span>

          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Bring your channel into the LeadHive command layer.
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            LeadHive uses the connected channel to read uploads, load performance metrics, and prepare
            AI engagement from your configured brand persona.
          </p>

          {/* Connect button only until at least one channel is connected */}
          {!hasChannels && (
            <a
              href={CONNECT_URL}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Link2 size={15} /> Connect YouTube
            </a>
          )}

          <ol className="mt-6 space-y-4">
            {ONBOARDING_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {i + 1}
                </span>
                <div>
                  <strong className="block text-sm text-gray-900">{step.title}</strong>
                  <small className="text-gray-500">{step.text}</small>
                </div>
              </li>
            ))}
          </ol>
        </aside>

        {/* Right: connected channels */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Connected channels</h2>
          <p className="text-sm text-gray-500">
            {hasChannels
              ? `${channels.length} ${channels.length === 1 ? 'channel' : 'channels'} available`
              : 'Connect a channel to begin'}
          </p>

          <div className="mt-4 space-y-3">
            {/* Real error with a retry (reloads via the loader above) */}
            {hardError && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => setRefresh(n => n + 1)}
                  className="mt-2 rounded-lg border border-red-300 bg-white px-3 py-1 font-medium hover:bg-red-100"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Not signed in, or signed in but the account has no channel */}
            {!hasChannels && !hardError && (
              <p className="text-sm text-gray-500">No channel connected yet.</p>
            )}

            {/* Channel list */}
            {channels.map(item => {
              const selected = channel?.id === item.id
              const stats = [
                formatCount(item.subscribers) && `${formatCount(item.subscribers)} subscribers`,
                formatCount(item.views) && `${formatCount(item.views)} views`,
              ]
                .filter(Boolean)
                .join(' · ')

              return (
                <article
                  key={item.id}
                  className={
                    'flex items-center gap-4 rounded-xl border-2 p-4 ' +
                    (selected ? 'border-blue-500 bg-blue-50/40' : 'border-gray-200')
                  }
                >
                  {/* No thumbnail from the backend yet, so show the first letter */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600">
                    {item.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span
                      className={
                        'inline-block rounded-full px-2 py-0.5 text-xs font-medium ' +
                        (selected ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700')
                      }
                    >
                      {selected ? 'Selected channel' : 'Connected'}
                    </span>
                    <h3 className="mt-1 truncate font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{stats || 'YouTube channel'}</p>
                  </div>

                  {selected && (
                    <span aria-label="Selected" className="text-blue-600">
                      <Check size={18} />
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={selected}
                    onClick={() => onSelectChannel(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Select <ArrowRight size={15} />
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}