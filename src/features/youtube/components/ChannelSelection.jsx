// Step 1 of FlowWidget: connect Google/YouTube and pick the channel LeadHive should manage.
// Data: GET /auth/channels (401 = not connected yet). The picked channel is lifted to FlowWidget.
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowRight, Check, Link2 } from 'lucide-react'
import { deleteAccount, disconnectYoutube } from '../api'
import { useYoutubeResource } from '../hooks'

// Full-page redirect to Google (the Vite proxy forwards /auth to the backend)
const CONNECT_URL = '/auth/google/login'
const AUTH_RETURN_KEY = 'leadhive.youtube.auth-return'

function markAuthReturn() {
  sessionStorage.setItem(AUTH_RETURN_KEY, 'pending')
}

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

export function ChannelSelection({ channel, onSelectChannel, onDisconnected, onAccountDeleted }) {
  const [params] = useSearchParams()
  const [refresh, setRefresh] = useState(0)
  const [accountAction, setAccountAction] = useState('')
  const [accountActionError, setAccountActionError] = useState('')
  const [accountActionSuccess, setAccountActionSuccess] = useState('')
  const { data, error, status, loading } = useYoutubeResource('/auth/channels', refresh)

  // Backend sent us back here with ?auth=failed&reason=...
  const connectionFailed = params.get('auth') === 'failed'
  const failureMessage = FAILURE_MESSAGES[params.get('reason')] || FALLBACK_FAILURE

  const notConnected = status === 401 // 401 just means "not signed in yet", not a real error
  const hardError = error && !notConnected
  const channels = Array.isArray(data) ? data.map(toChannel) : []
  const hasChannels = channels.length > 0

  async function handleDisconnect() {
    const confirmed = window.confirm(
      'Disconnect your YouTube channel from LeadHive? You can connect it again later.',
    )
    if (!confirmed) return

    setAccountAction('disconnect')
    setAccountActionError('')
    setAccountActionSuccess('')
    try {
      await disconnectYoutube()
      onDisconnected?.()
      setAccountActionSuccess('YouTube channel disconnected successfully.')
      setRefresh(value => value + 1)
    } catch (actionError) {
      setAccountActionError(actionError?.message || 'Could not disconnect the YouTube channel. Please try again.')
    } finally {
      setAccountAction('')
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Permanently delete your LeadHive account and all saved data? This action cannot be undone.',
    )
    if (!confirmed) return

    setAccountAction('delete')
    setAccountActionError('')
    setAccountActionSuccess('')
    try {
      await deleteAccount()
      onAccountDeleted?.()
    } catch (actionError) {
      setAccountActionError(actionError?.message || 'Could not delete the account. Please try again.')
      setAccountAction('')
    }
  }

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
        <div className="flex flex-wrap items-center gap-2">
          {hasChannels && (
            <a
              href={CONNECT_URL}
              onClick={markAuthReturn}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#2cc1df]/60 hover:bg-[#f2fcfe]"
            >
              <Link2 size={15} /> Connect another account
            </a>
          )}
        </div>
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
          {!loading && !hasChannels && (
            <div className="mt-5">
              <a
                href={CONNECT_URL}
                onClick={markAuthReturn}
                className="lh-primary-action inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
              >
                <Link2 size={15} /> Connect YouTube
              </a>
              <p className="mt-3 text-xs text-gray-500">
                By connecting, you acknowledge our <a className="font-medium text-blue-700 hover:underline" href="/privacy">Privacy Policy</a>.
              </p>
            </div>
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
            {loading
              ? 'Checking your YouTube connection...'
              : hasChannels
              ? `${channels.length} ${channels.length === 1 ? 'channel' : 'channels'} available`
              : 'Connect a channel to begin'}
          </p>

          <div className="mt-4 space-y-3">
            {loading && (
              <div role="status" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5">
                <div className="h-2 w-28 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-2 w-44 animate-pulse rounded bg-slate-200" />
                <span className="sr-only">Loading your YouTube workspace...</span>
              </div>
            )}

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
            {!loading && !hasChannels && !hardError && (
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
                    'rounded-2xl border-2 p-4 shadow-sm transition ' +
                    (selected ? 'border-[#2cc1df] bg-[#f4fcfd]' : 'border-gray-200 bg-white hover:border-[#b7eaf3]')
                  }
                >
                  <div className="flex flex-wrap items-center gap-4">
                    {/* No thumbnail from the backend yet, so show the first letter */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#dff7fb] font-semibold text-[#168ca1]">
                      {item.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span
                        className={
                          'inline-block rounded-full px-2.5 py-1 text-xs font-semibold ' +
                          (selected ? 'bg-[#dff7fb] text-[#168ca1]' : 'bg-green-100 text-green-700')
                        }
                      >
                        {selected ? 'Selected channel' : 'Connected'}
                      </span>
                      <h3 className="mt-1 truncate font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{stats || 'YouTube channel'}</p>
                    </div>

                    {selected && (
                      <span aria-label="Selected" className="text-[#168ca1]">
                        <Check size={18} />
                      </span>
                    )}

                    <button
                      type="button"
                      disabled={selected}
                      onClick={() => onSelectChannel(item)}
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Select <ArrowRight size={15} />
                    </button>
                  </div>

                </article>
              )
            })}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="text-sm font-semibold text-slate-900">Account and connection</h3>
            <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
              <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">YouTube connection</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">Stop syncing data from the connected channel.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={Boolean(accountAction)}
                  aria-busy={accountAction === 'disconnect'}
                  className="channel-settings-action channel-settings-action--disconnect"
                >
                  {accountAction === 'disconnect' ? 'Disconnecting...' : 'Disconnect YouTube Channel'}
                </button>
              </div>
              <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">LeadHive account</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">Permanently remove this account and its saved data.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={Boolean(accountAction)}
                  aria-busy={accountAction === 'delete'}
                  className="channel-settings-action channel-settings-action--delete"
                >
                  {accountAction === 'delete' ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
            {accountActionError && (
              <p role="alert" className="mt-3 text-sm text-red-700">{accountActionError}</p>
            )}
            {accountActionSuccess && (
              <p role="status" className="mt-3 text-sm text-green-700">{accountActionSuccess}</p>
            )}
          </div>
        </div>
      </div>

    </section>
  )
}
