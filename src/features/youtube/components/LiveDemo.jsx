// Public interactive demo: a sample video plus a comment box.
// Comments go to the isolated /demo endpoints and the AI answers with a sample persona.
// Nothing is posted to YouTube and no login is needed.
import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, ArrowRight, Bot, Loader2, Play, Send, ShieldCheck } from 'lucide-react'
import { youtubeRequest } from '../api'
import { useYoutubeResource } from '../hooks'
import { FlowLoader } from './FlowLoader'

const MAX_LENGTH = 400 // matches the backend limit on /demo/reply

// Persona fields shown to visitors, in order (business_name is used as the heading)
const PERSONA_FIELDS = [
  ['tone', 'Tone'],
  ['offers', 'Offers'],
  ['reply_rules', 'Reply rules'],
]

export function LiveDemo() {
  const [refresh, setRefresh] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  // Comments typed by the visitor, newest first: { id, text, reply, error, pending, time }
  const [userComments, setUserComments] = useState([])

  const { data, error, loading } = useYoutubeResource('/demo/video', refresh)

  const video = data?.video ?? {}
  const persona = data?.persona ?? {}
  const sampleComments = data?.comments ?? []

  // "id" is an internal label; the YouTube id is embed_video_id (always exactly 11 characters)
  const embedId = video.embed_video_id || ''
  const validVideoId = /^[A-Za-z0-9_-]{11}$/.test(embedId)
  const title = video.title || 'Demo video'
  const brandName = persona.business_name || 'LeadHive Demo'
  const personaRows = PERSONA_FIELDS.filter(([key]) => persona[key])

  // Suggestion chips come from the backend's sample comments, so they always fit the video
  const suggestions = sampleComments.slice(0, 3).map(comment => comment.text).filter(Boolean)

  const updateComment = (id, patch) =>
    setUserComments(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)))

  async function handleSubmit(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    const id = crypto.randomUUID()
    setDraft('')
    setSending(true)
    setUserComments(prev => [
      { id, text, reply: '', error: '', pending: true, time: new Date() },
      ...prev,
    ])

    try {
      const response = await youtubeRequest('/demo/reply', { method: 'POST', body: { comment: text } })
      updateComment(id, { reply: response.reply, pending: false })
    } catch (err) {
      // 422 (rejected comment), 429 (rate limit) and 503 (AI unavailable) all arrive as readable messages
      updateComment(id, { error: err.message || 'Could not get a reply right now. Please try again.', pending: false })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header: same look as the flow header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
          <img src="/leadhive-logo.png" alt="LeadHive AI" className="h-8 w-auto shrink-0" />
          <span className="hidden h-6 w-px bg-gray-300 sm:block" aria-hidden="true" />
          <span className="hidden whitespace-nowrap text-sm font-semibold text-gray-700 md:block">
            YouTube Intelligence
          </span>

          <div className="flex-1" />

          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={15} aria-hidden="true" /> Back to Home
          </Link>
          <Link
            to="/flow?step=1"
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Connect your channel <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        {loading ? (
          <FlowLoader message="Loading demo..." />
        ) : error || !data ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm text-red-700">{error || 'The demo is not available right now.'}</p>
            <button
              type="button"
              onClick={() => setRefresh(n => n + 1)}
              className="mt-3 rounded bg-red-600 px-3 py-1.5 text-sm text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Heading */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Interactive demo</p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">See the AI reply to your comment</h1>
              <p className="mt-2 text-sm text-gray-600">
                Type a comment on this sample video and watch the AI answer in the brand&apos;s voice. No login needed.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left: video, persona, comment box */}
              <div className="space-y-6 lg:col-span-2">
                {/* Video */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="aspect-video overflow-hidden rounded-lg bg-black">
                    {!validVideoId ? (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        Sample video unavailable
                      </div>
                    ) : playing ? (
                      <iframe
                        className="h-full w-full"
                        src={`https://www.youtube-nocookie.com/embed/${embedId}?autoplay=1`}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPlaying(true)}
                        aria-label={`Play ${title}`}
                        className="group relative h-full w-full"
                      >
                        <img
                          src={`https://i.ytimg.com/vi/${embedId}/hqdefault.jpg`}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/40" />
                        <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-blue-600 shadow-xl">
                          <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="mt-4 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {brandName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
                      <p className="text-xs text-gray-500">{brandName}</p>
                      {video.description && (
                        <p className="mt-2 text-sm text-gray-600">{video.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Persona the AI replies as */}
                {personaRows.length > 0 && (
                  <section className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <span className="text-blue-600" aria-hidden="true">
                      <Bot size={18} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-gray-900">
                        The AI is replying as {brandName}
                      </h2>
                      <dl className="mt-2 space-y-1 text-sm">
                        {personaRows.map(([key, label]) => (
                          <div key={key}>
                            <dt className="inline text-xs font-medium text-gray-500">{label}: </dt>
                            <dd className="inline break-words text-gray-700">{persona[key]}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </section>
                )}

                {/* Comment box */}
                <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                      YOU
                    </div>
                    <div className="min-w-0 flex-1">
                      <label htmlFor="demo-comment" className="sr-only">
                        Your comment
                      </label>
                      <textarea
                        id="demo-comment"
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        maxLength={MAX_LENGTH}
                        rows={2}
                        placeholder="Ask a question or leave a comment..."
                        className="w-full resize-none border-b border-gray-300 pb-2 text-sm outline-none focus:border-blue-600"
                      />

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-gray-500">
                          {suggestions.length > 0 && <span className="hidden sm:inline">Try:</span>}
                          {suggestions.map(suggestion => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setDraft(suggestion)}
                              title={suggestion}
                              className="max-w-[16rem] truncate rounded-full border border-gray-200 bg-white px-3 py-1 font-medium text-gray-600 hover:bg-gray-50"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">
                            {draft.length}/{MAX_LENGTH}
                          </span>
                          <button
                            type="submit"
                            disabled={!draft.trim() || sending}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Right: comments */}
              <aside className="lg:col-span-1">
                <div className="sticky top-20 flex max-h-[calc(100vh-6rem)] flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <h2 className="text-sm font-bold text-gray-900">Comments</h2>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {userComments.length + sampleComments.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                    {userComments.map(comment => (
                      <VisitorComment key={comment.id} comment={comment} />
                    ))}

                    {sampleComments.map((comment, index) => (
                      <SampleComment key={`${comment.author}-${index}`} comment={comment} />
                    ))}

                    {userComments.length + sampleComments.length === 0 && (
                      <p className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-xs text-gray-500">
                        Be the first to comment.
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-100 px-4 py-3">
                    <p className="flex items-start gap-2 text-[11px] text-gray-500">
                      <ShieldCheck size={13} className="mt-0.5 shrink-0 text-green-500" aria-hidden="true" />
                      This is a simulation. Your comment is not posted to YouTube, and replies come from a sample brand
                      persona.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// One of the fixed example comments from the backend (no AI reply attached)
function SampleComment({ comment }) {
  const author = comment.author || 'Viewer'
  return (
    <div className="flex items-start gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-500 text-[10px] font-bold text-white">
        {author.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-xs font-semibold text-gray-900">{author}</span>
        <p className="mt-0.5 break-words text-xs leading-5 text-gray-700">{comment.text}</p>
      </div>
    </div>
  )
}

// A comment typed by the visitor, with the AI reply (or a typing / error state) under it
function VisitorComment({ comment }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
          YOU
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-900">You</span>
            <time className="text-[10px] text-gray-400">{comment.time.toLocaleTimeString()}</time>
          </div>
          <p className="mt-0.5 break-words text-xs leading-5 text-gray-700">{comment.text}</p>
        </div>
      </div>

      {comment.error ? (
        <p role="alert" className="ml-9 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {comment.error}
        </p>
      ) : (
        <div className="ml-9 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2">
          <div className="mb-1 flex items-center gap-1.5">
            <Bot size={12} className="text-blue-600" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-blue-700">AI Assistant</span>
            {comment.pending && (
              <span role="status" className="flex items-center gap-1 text-[10px] text-blue-500">
                <Loader2 size={10} className="animate-spin" /> typing...
              </span>
            )}
          </div>
          {comment.reply && <p className="break-words text-xs leading-5 text-gray-800">{comment.reply}</p>}
        </div>
      )}
    </div>
  )
}