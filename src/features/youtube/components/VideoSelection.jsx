// Step 3 of FlowWidget: choose the one video LeadHive should monitor.
// Data: GET /selection-videos/{channel_id} lists uploads, POST /selection-videos/save saves exactly one.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Info, Play, Search } from 'lucide-react'
import { YoutubeApiError, youtubeRequest } from '../api'
import { useYoutubeResource } from '../hooks'
import { FlowLoader } from './FlowLoader'

const VIDEO_LIMIT = 5 
const DESCRIPTION_MAX = 800

// Backend fields -> the small shape this screen uses
function toVideo(raw) {
  return {
    id: raw.youtube_video_id,
    title: raw.title || 'Untitled video',
    description: raw.description || '',
    views: raw.views || 0,
    likes: raw.likes || 0,
    comments: raw.comments || 0,
    selected: Boolean(raw.selected), // true when this video was saved earlier
    descriptionRequired: Boolean(raw.description_required), // YouTube has no description for it
    thumbnail: raw.youtube_video_id ? `https://i.ytimg.com/vi/${raw.youtube_video_id}/mqdefault.jpg` : '',
  }
}

export function VideoSelection({ channel, video, onVideoSaved }) {
  const channelId = channel?.id
  const [refresh, setRefresh] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(video?.id || null)
  // Descriptions the user typed, by video id (falls back to the video's own description)
  const [descriptions, setDescriptions] = useState(video ? { [video.id]: video.description } : {})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const { data, error, loading } = useYoutubeResource(
    channelId ? `/selection-videos/${encodeURIComponent(channelId)}?limit=${VIDEO_LIMIT}` : null,
    refresh,
  )

  const videos = useMemo(
    () => (Array.isArray(data) ? data.map(toVideo).filter(item => item.id) : []),
    [data],
  )

  // On the first load only: if the backend already has a saved video, preselect it and unlock Next.
  // The ref stops this from running again later and overriding the user's own choice.
  const prefilled = useRef(false)
  useEffect(() => {
    if (prefilled.current || !videos.length) return
    prefilled.current = true
    if (video) return // already saved in this session
    const saved = videos.find(item => item.selected)
    if (!saved) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedId(saved.id)
    onVideoSaved({ id: saved.id, title: saved.title, description: saved.description })
  }, [videos, video, onVideoSaved])

  const descriptionFor = item => descriptions[item.id] ?? item.description
  const selected = videos.find(item => item.id === selectedId) || null
  const isSaved = Boolean(video) && video.id === selectedId
  const selectedDescription = selected ? descriptionFor(selected).trim() : ''
  // Only blocks saving when the backend says this video needs a description and none is typed
  const needsDescription = Boolean(selected?.descriptionRequired) && !selectedDescription

  const query = search.trim().toLowerCase()
  const filteredVideos = query
    ? videos.filter(item => `${item.title} ${descriptionFor(item)}`.toLowerCase().includes(query))
    : videos

  // Picking a different video makes the saved copy stale, so Next locks until saved again
  function selectVideo(id) {
    if (id === selectedId) return
    setSelectedId(id)
    setSaveError('')
    if (video) onVideoSaved(null)
  }

  function updateDescription(id, value) {
    setDescriptions(current => ({ ...current, [id]: value.slice(0, DESCRIPTION_MAX) }))
    if (video) onVideoSaved(null)
  }

  async function handleSave() {
    if (!selected || saving || isSaved || needsDescription) return

    setSaving(true)
    setSaveError('')
    try {
      await youtubeRequest('/selection-videos/save', {
        method: 'POST',
        body: {
          channel_id: channelId,
          videos: [{ youtube_video_id: selected.id, description: selectedDescription }],
        },
      })
      onVideoSaved({ id: selected.id, title: selected.title, description: selectedDescription }) // unlocks Next
    } catch (err) {
      setSaveError(
        err instanceof YoutubeApiError && err.status === 401
          ? 'Your session expired. Go back to the Channel step and reconnect.'
          : err.message || 'Unable to save your video selection.',
      )
    } finally {
      setSaving(false)
    }
  }

  // Safety net: Next is locked without a channel, but guard anyway
  if (!channel) {
    return <p className="text-sm text-gray-500">Select a channel in the first step.</p>
  }

  if (loading) return <FlowLoader message="Loading your videos..." />

  return (
    <section className="space-y-6">
      {/* Heading */}
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Video Library</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Choose <span className="text-blue-600">one video</span> to monitor
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Select a YouTube video that LeadHive should track, analyze, and reply to.
        </p>
      </header>

      {/* Guidance note */}
      <aside className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <span className="text-blue-600" aria-hidden="true">
          <Info size={18} />
        </span>
        <div>
          <strong className="text-sm text-gray-900">Only one video can be selected</strong>
          <p className="text-sm text-gray-600">
            You can monitor one video at a time. Choose the video that best represents your engagement
            goal.
          </p>
        </div>
      </aside>

      {/* Load failure with retry */}
      {error && (
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

      {/* Search + selected count */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:border-blue-500">
          <Search size={17} className="text-gray-400" aria-hidden="true" />
          <span className="sr-only">Search videos</span>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search videos by title or description..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <span
          className={
            'rounded-full px-3 py-1 text-sm font-medium ' +
            (selected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')
          }
        >
          {selected ? '1 video selected' : '0 videos selected'}
        </span>
      </div>

      {/* Empty states */}
      {!videos.length && !error && (
        <p className="text-sm text-gray-500">
          No channel content found. Make sure your connected YouTube channel has public videos.
        </p>
      )}
      {videos.length > 0 && !filteredVideos.length && (
        <p className="text-sm text-gray-500">No videos match your search.</p>
      )}

      {/* Video cards */}
      {filteredVideos.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredVideos.map(item => {
            const isSelected = selectedId === item.id
            const text = descriptionFor(item)
            const missing = item.descriptionRequired && !text.trim()
            const stats = `${item.views.toLocaleString()} views · ${item.likes.toLocaleString()} likes · ${item.comments.toLocaleString()} comments`

            return (
              <article
                key={item.id}
                onClick={() => selectVideo(item.id)}
                className={
                  'cursor-pointer overflow-hidden rounded-2xl border-2 bg-white shadow-sm ' +
                  (isSelected ? 'border-blue-500' : 'border-gray-200')
                }
              >
                {/* Thumbnail (the text shows through if the image fails to load) */}
                <div className="relative flex h-40 items-center justify-center bg-gray-100">
                  <small className="text-gray-400">No thumbnail</small>
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt=""
                      loading="lazy"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}

                  <label
                    onClick={e => e.stopPropagation()}
                    className="absolute left-3 top-3 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white shadow"
                  >
                    <input
                      type="radio"
                      name="monitored-video"
                      checked={isSelected}
                      onChange={() => selectVideo(item.id)}
                      aria-label={`Select ${item.title}`}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className="flex h-full w-full items-center justify-center rounded-full text-transparent peer-checked:bg-blue-600 peer-checked:text-white"
                    >
                      <Check size={14} />
                    </span>
                  </label>

                  <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
                    <Play size={12} fill="currentColor" /> YouTube
                  </span>
                  {isSelected && (
                    <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      <Check size={13} /> Selected
                    </span>
                  )}
                </div>

                {/* Title, stats, description */}
                <div className="space-y-3 p-4">
                  <div>
                    <h2 className="font-semibold text-gray-900">{item.title}</h2>
                    <p className="mt-1 text-xs text-gray-500">{stats}</p>
                  </div>

                  <div onClick={e => e.stopPropagation()}>
                    <label
                      htmlFor={`video-description-${item.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Video description{' '}
                      <span className={missing ? 'font-normal text-amber-600' : 'font-normal text-gray-400'}>
                        {item.descriptionRequired ? '(required for this video)' : '(optional)'}
                      </span>
                    </label>
                    <textarea
                      id={`video-description-${item.id}`}
                      rows={3}
                      maxLength={DESCRIPTION_MAX}
                      value={text}
                      onChange={e => updateDescription(item.id, e.target.value)}
                      disabled={!isSelected}
                      placeholder="Describe what this video is about..."
                      className="mt-1 w-full resize-none rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                    <div className="mt-1 flex items-start justify-between gap-3 text-xs text-gray-500">
                      <small>
                        The description helps LeadHive understand the video context for AI-generated
                        engagement.
                      </small>
                      <span className="shrink-0">{text.length} / {DESCRIPTION_MAX}</span>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {saveError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </p>
      )}

      {/* Save bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <strong className="text-sm text-gray-900">
            {selected ? selected.title : 'No video selected'}
          </strong>
          <p className="text-sm text-gray-500">
            LeadHive will monitor this video for comments, analyze them, and help you reply.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSaved && (
            <span className="inline-flex items-center gap-1 text-sm text-green-700">
              <Check size={16} /> Saved. You can continue.
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!selected || saving || isSaved || needsDescription}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : isSaved ? 'Saved' : 'Save selection'}
          </button>
        </div>
      </div>
    </section>
  )
}