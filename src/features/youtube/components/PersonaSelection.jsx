// Step 2 of FlowWidget: configure the AI persona (brand name, tone, services, rules).
// Data: GET /business-profile/{channel_id} to prefill, POST /business-profile/save to save.
// The saved persona lives in FlowWidget (profile prop); Next unlocks only while it is saved.
import { useEffect, useState } from 'react'
import { Building2, CheckCircle2, Sparkles } from 'lucide-react'
import { YoutubeApiError, youtubeRequest } from '../api'
import { useYoutubeResource } from '../hooks'
import { FlowLoader } from './FlowLoader'

// Max lengths match what the backend accepts today
const NAME_MAX = 255
const SERVICES_MAX = 800 // raise when the backend limit changes
const RULES_MAX = 300 // raise when the backend limit changes
const BLANK = { business_name: '', brand_tone: '', services: '', ai_rules: '' }

// Shared input styling so the fields stay consistent
const fieldClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500'

// The GET response shape isn't in the OpenAPI spec, so accept the fields directly or under "profile"
function toForm(payload) {
  const source = payload?.profile || payload || {}
  return {
    business_name: source.business_name || '',
    brand_tone: source.brand_tone || '',
    services: source.services || '',
    ai_rules: source.ai_rules || '',
  }
}

// "123 / 800"
function Counter({ length, max }) {
  return <span className="mt-1 block text-xs text-gray-500">{length} / {max}</span>
}

export function PersonaSelection({ channel, profile, onProfileSaved }) {
  const channelId = channel?.id
  const [form, setForm] = useState(profile || BLANK)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [refresh, setRefresh] = useState(0)

  // Only fetch when nothing is saved in this session yet (coming back via Back reuses the saved one)
  const resource = useYoutubeResource(
    channelId && !profile ? '/business-profile/' + encodeURIComponent(channelId) : null,
    refresh,
  )
  const { data, error, status, loading } = resource
  const loadError = error && status !== 404 ? error : '' // 404 just means "no persona saved yet"

  // Prefill from the saved persona. Only treat it as saved (unlocking Next) when a brand name exists,
  // because the backend may return blank defaults for a channel that has no persona yet
  useEffect(() => {
    if (!data) return
    const loaded = toForm(data)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(loaded)
    if (loaded.business_name) onProfileSaved(loaded)
  }, [data, onProfileSaved])

  const isSaved = Boolean(profile)
  const servicesLength = form.services.trim().length
  const rulesLength = form.ai_rules.trim().length

  // Any edit makes the saved copy stale, so Next locks until the persona is saved again
  function update(key, value) {
    setForm(current => ({ ...current, [key]: value }))
    if (profile) onProfileSaved(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (saving || isSaved) return

    const payload = {
      business_name: form.business_name.trim(),
      brand_tone: form.brand_tone,
      services: form.services.trim(),
      ai_rules: form.ai_rules.trim(),
    }

    setSaving(true)
    setSaveError('')
    try {
      await youtubeRequest('/business-profile/save', {
        method: 'POST',
        body: { channel_id: channelId, ...payload },
      })
      setForm(payload)
      onProfileSaved(payload) // unlocks Next
    } catch (err) {
      setSaveError(
        err instanceof YoutubeApiError && err.status === 401
          ? 'Your session expired. Go back to the Channel step and reconnect.'
          : err.message || 'Unable to save your persona.',
      )
    } finally {
      setSaving(false)
    }
  }

  // Safety net: Next is locked without a channel, but guard anyway
  if (!channel) {
    return <p className="text-sm text-gray-500">Select a channel in the previous step first.</p>
  }

  if (loading) return <FlowLoader message="Loading your persona..." />

  return (
    <section className="space-y-6">
      {/* Heading */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">AI Persona</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Configure your AI persona</h1>
        <p className="mt-2 text-sm text-gray-600">
          Define how LeadHive should represent your business in YouTube comment replies.
        </p>
      </div>

      {/* Failed to load a saved persona (not a 404) */}
      {loadError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => setRefresh(n => n + 1)}
            className="mt-2 rounded-lg border border-red-300 bg-white px-3 py-1 font-medium hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: persona form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Persona identity &amp; directives</h2>
              <p className="text-sm text-gray-500">
                Set the communication style, core offerings, and behavioral guardrails for AI engagement.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {channel.name}
            </span>
          </div>

          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Business / Brand Name</span>
              <span className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:border-blue-500">
                <Building2 size={15} className="text-gray-400" aria-hidden="true" />
                <input
                  maxLength={NAME_MAX}
                  value={form.business_name}
                  onChange={e => update('business_name', e.target.value)}
                  placeholder="e.g. Acme Studio"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Brand Tone</span>
              <select
                value={form.brand_tone}
                onChange={e => update('brand_tone', e.target.value)}
                className={fieldClass}
              >
                <option value="">Select a conversational tone</option>
                <option value="Professional & Helpful">Professional &amp; Helpful</option>
                <option value="Casual & Friendly">Casual &amp; Friendly</option>
                <option value="Witty & Humorous">Witty &amp; Humorous</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Core Services &amp; Offerings</span>
              <textarea
                rows={4}
                maxLength={SERVICES_MAX}
                value={form.services}
                onChange={e => update('services', e.target.value)}
                placeholder="Briefly describe what your business does and key solutions offered..."
                className={fieldClass + ' resize-none'}
              />
              <Counter length={servicesLength} max={SERVICES_MAX} />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Rules &amp; Response Directives</span>
              <textarea
                rows={4}
                maxLength={RULES_MAX}
                value={form.ai_rules}
                onChange={e => update('ai_rules', e.target.value)}
                placeholder="E.g., Always direct pricing queries to the website; never make promises on timelines..."
                className={fieldClass + ' resize-none'}
              />
              <Counter length={rulesLength} max={RULES_MAX} />
            </label>
          </div>

          {saveError && (
            <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || isSaved}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : isSaved ? 'Saved' : 'Save persona'}
            </button>
            {isSaved && (
              <span className="inline-flex items-center gap-1 text-sm text-green-700">
                <CheckCircle2 size={16} /> Persona saved. You can continue.
              </span>
            )}
          </div>
        </div>

        {/* Right: live persona snapshot */}
        <aside
          aria-label="AI persona live preview"
          className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Live Preview</span>
              <h2 className="text-lg font-semibold text-gray-900">Persona snapshot</h2>
            </div>
            <span
              className={
                'rounded-full px-2 py-0.5 text-xs font-medium ' +
                (isSaved ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')
              }
            >
              {isSaved ? 'Saved' : 'Draft'}
            </span>
          </div>

          <div className="mt-5 flex flex-col items-center rounded-xl bg-gray-50 p-5 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Sparkles size={20} />
            </span>
            <strong className="mt-3 text-gray-900">{form.business_name || 'Your Brand'}</strong>
            <small className="text-gray-500">{form.brand_tone || 'Voice not selected'}</small>
          </div>

          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-gray-500">Channel</dt>
              <dd className="text-gray-900">{channel.name}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Core Services</dt>
              <dd className="break-words text-gray-900">
                {form.services || 'Describe what LeadHive represents.'}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Directives</dt>
              <dd className="break-words text-gray-900">
                {form.ai_rules || 'No communication constraints specified.'}
              </dd>
            </div>
          </dl>
        </aside>
      </form>
    </section>
  )
}