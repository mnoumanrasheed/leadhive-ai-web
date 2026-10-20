// Step 4 of FlowWidget: review the video's comments, then generate and post AI replies.
// Data: GET /comments/{channel_id}/{video_id}, POST /ai/{channel_id}/{video_id}/generate-and-post-replies.
import { useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  CornerDownRight,
  Info,
  MessageSquare,
  ThumbsUp,
  Wand2,
} from 'lucide-react'
import { YoutubeApiError, youtubeRequest } from '../api'
import { useYoutubeResource } from '../hooks'
import { FlowLoader } from './FlowLoader'

const enc = encodeURIComponent
const COMMENTS_POLL_INTERVAL_MS = 10_000

// The comments response shape isn't in the OpenAPI spec, so accept the likely variations
function toComment(raw) {
  if (!raw || typeof raw !== 'object') return null
  const inner = raw.snippet?.topLevelComment?.snippet || raw.snippet || raw
  const text =
    inner.text ||
    inner.textDisplay ||
    inner.textOriginal ||
    inner.comment_text ||
    inner.commentText ||
    (typeof inner.comment === 'string' ? inner.comment : '') ||
    ''
  const id =
    raw.youtube_comment_id ||
    raw.id ||
    raw.comment_id ||
    inner.id ||
    text.slice(0, 20)

  return {
    id,
    author:
      inner.author ||
      inner.authorDisplayName ||
      inner.author_display_name ||
      inner.author_name ||
      'Unknown',
    text,
    published: inner.published_at || inner.publishedAt || inner.created_at || inner.published || '',
    likes: Number(inner.likes ?? inner.likeCount ?? inner.like_count ?? 0) || 0,
    isReplied: raw.is_replied === true || raw.isReplied === true,
    aiReply: raw.ai_reply || raw.aiReply || '',
    // Replies to this comment (same shape as a comment)
    replies: Array.isArray(raw.replies) ? raw.replies.map(toComment).filter(Boolean) : [],
  }
}

// Accept a plain list or a list inside common API response envelopes
function toComments(payload) {
  const candidates = [
    payload,
    payload?.comments,
    payload?.items,
    payload?.data,
    payload?.data?.comments,
    payload?.data?.items,
    payload?.results,
    payload?.youtube_comments,
  ]
  const list = candidates.find(Array.isArray) || []
  return list.map(toComment).filter(Boolean)
}

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

// "3 replies posted successfully. 1 failed."
function resultSummary(result) {
  const posted = Math.max(0, Number(result?.posted) || 0)
  const failed = Math.max(0, Number(result?.failed) || 0)
  const base = `${posted} ${posted === 1 ? 'reply' : 'replies'} posted successfully.`
  return failed ? `${base} ${failed} failed.` : base
}

// All replies under one comment, indented with a left border
function ReplyThread({ replies }) {
  if (!replies.length) return null
  return (
    <div className="ml-12 mt-3 space-y-3 border-l-2 border-gray-200 pl-4">
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
        <CornerDownRight size={13} />
        {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
      </span>

      {replies.map(reply => (
        <div
          key={reply.id}
          className={
            'rounded-lg border p-3 ' +
            (reply.isReplied ? 'border-green-200 bg-green-50/40' : 'border-gray-200 bg-gray-50')
          }
        >
          <header className="flex items-center justify-between gap-2">
            <div>
              <strong className="text-sm text-gray-900">{reply.author}</strong>
              {reply.published && (
                <time className="ml-2 text-xs text-gray-400">{formatTime(reply.published)}</time>
              )}
            </div>
            {reply.isReplied && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Reply posted
              </span>
            )}
          </header>

          <p className="mt-1 break-words text-sm text-gray-700">{reply.text}</p>

          {reply.likes > 0 && (
            <span className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500">
              <ThumbsUp size={13} /> {reply.likes}
            </span>
          )}

          {reply.isReplied && (
            <aside aria-label="Final posted reply" className="mt-2 rounded-lg bg-white p-3 text-sm">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                <CheckCircle2 size={15} /> Final posted reply
              </span>
              <p className="mt-1 break-words text-gray-700">
                {reply.aiReply || 'Reply posted on YouTube.'}
              </p>
            </aside>
          )}
        </div>
      ))}
    </div>
  )
}

export function ReplySection({ channel, video }) {
  const channelId = channel?.id
  const videoId = video?.id
  const [refresh, setRefresh] = useState(0)
  const [posting, setPosting] = useState(false)
  const [result, setResult] = useState(null) // response of the last generate-and-post run
  const [actionError, setActionError] = useState('')

  const { data, error, loading } = useYoutubeResource(
    channelId && videoId ? `/comments/${enc(channelId)}/${enc(videoId)}` : null,
    refresh,
    COMMENTS_POLL_INTERVAL_MS,
  )

  const comments = useMemo(() => toComments(data), [data])
  const replyCount = useMemo(
    () => comments.reduce((total, comment) => total + comment.replies.length, 0),
    [comments],
  )
  const unreplied = comments.filter(comment => !comment.isReplied).length
  const allReplied = comments.length > 0 && unreplied === 0
  const canPost = !error && unreplied > 0

  async function handlePost() {
    if (!canPost || posting) return
    setPosting(true)
    setResult(null)
    setActionError('')
    try {
      const response = await youtubeRequest(
        `/ai/${enc(channelId)}/${enc(videoId)}/generate-and-post-replies`,
        { method: 'POST' },
      )
      setResult(response)
      setRefresh(n => n + 1) // reload comments so posted replies show up
    } catch (err) {
      setActionError(
        err instanceof YoutubeApiError && err.status === 401
          ? 'Your session expired. Go back to the Channel step and reconnect.'
          : err.message || 'Could not generate and post replies. Please try again.',
      )
    } finally {
      setPosting(false)
    }
  }

  // Safety net: Next is locked until a video is saved, but guard anyway
  if (!channel || !video) {
    return <p className="text-sm text-gray-500">Select and save a video in the previous step first.</p>
  }

  // Full-screen loader before any page content: initial comment load, and the
  // generate-and-post run (the comment reload after posting is covered too)
  if (loading || posting) {
    return (
      <FlowLoader
        message={posting ? 'Generating and posting replies...' : 'Loading comments...'}
      />
    )
  }

  const failures = Array.isArray(result?.failures) ? result.failures : []

  return (
    <section className="space-y-6">
      {/* Heading */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Operations Console</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">AI Command Center</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review YouTube comments and generate and post AI replies directly.
        </p>
      </div>

      {/* Monitored video card */}
      <section
        aria-labelledby="monitored-video-title"
        className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <img
          src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
          alt=""
          onError={e => { e.currentTarget.style.display = 'none' }}
          className="h-20 w-36 rounded-lg bg-gray-100 object-cover"
        />

        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Monitored video</span>
          <h2 id="monitored-video-title" className="truncate text-lg font-semibold text-gray-900">
            {video.title}
          </h2>
          <span className="text-xs text-gray-500">Video ID: {videoId}</span>
        </div>

        <a
          href={`https://www.youtube.com/watch?v=${enc(videoId)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Open on YouTube <ArrowUpRight size={15} />
        </a>
      </section>

      {/* Video context */}
      <section
        aria-labelledby="video-context-title"
        className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4"
      >
        <span className="text-blue-600" aria-hidden="true">
          <Info size={18} />
        </span>
        <div>
          <h2 id="video-context-title" className="text-sm font-semibold text-gray-900">
            About this video
          </h2>
          <p className="text-sm text-gray-600">{video.description || 'No video context provided.'}</p>
        </div>
      </section>

      {/* Comments + action button */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-blue-600" aria-hidden="true">
              <MessageSquare size={20} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
              <p className="text-sm text-gray-500">
                Comments pulled from YouTube. Updates automatically every 10 seconds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              {replyCount > 0 && ` · ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
            </span>
            <button
              type="button"
              onClick={handlePost}
              disabled={!canPost}
              className="lh-primary-action inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              <Wand2 size={14} /> Generate &amp; Post Replies
            </button>
          </div>
        </header>

        {/* Result of the last run */}
        {result && (
          <div role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <p className="flex items-center gap-2">
              <CheckCircle2 size={17} /> {resultSummary(result)}
            </p>
            {failures.length > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-1 text-amber-800">
                {failures.map(item => (
                  <li key={item.youtube_comment_id}>
                    {item.youtube_comment_id}: {item.detail}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Error from the last run */}
        {actionError && (
          <div role="alert" className="mt-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0" />
            <div>
              <strong>Unable to post replies.</strong>
              <p>{actionError}</p>
            </div>
          </div>
        )}

        {allReplied && (
          <p role="status" className="mt-4 flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle2 size={18} /> All comments have been replied to.
          </p>
        )}

        <div className="mt-5 space-y-4">
          {/* Failed to load comments */}
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

          {!error && comments.length === 0 && (
            <p className="text-sm text-gray-500">
              No comments found for this video yet. As viewers comment on YouTube, they will appear here.
            </p>
          )}

          {comments.map(comment => (
            <article
              key={comment.id}
              className={
                'rounded-xl border p-4 ' +
                (comment.isReplied ? 'border-green-200 bg-green-50/40' : 'border-gray-200 bg-white')
              }
            >
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                  <span aria-hidden="true">{comment.author.charAt(0).toUpperCase() || '?'}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <header className="flex items-center justify-between gap-2">
                    <div>
                      <strong className="text-sm text-gray-900">{comment.author}</strong>
                      {comment.published && (
                        <time className="ml-2 text-xs text-gray-400">{formatTime(comment.published)}</time>
                      )}
                    </div>
                    {comment.isReplied && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Reply posted
                      </span>
                    )}
                  </header>
                  <p className="mt-1 break-words text-sm text-gray-700">{comment.text}</p>
                  {comment.likes > 0 && (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500">
                      <ThumbsUp size={13} /> {comment.likes}
                    </span>
                  )}
                </div>
              </div>

              {comment.isReplied && (
                <aside aria-label="Final posted reply" className="ml-12 mt-3 rounded-lg bg-white p-3 text-sm">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                    <CheckCircle2 size={15} /> Final posted reply
                  </span>
                  <p className="mt-1 break-words text-gray-700">
                    {comment.aiReply || 'Reply posted on YouTube.'}
                  </p>
                </aside>
              )}

              {/* All replies under this comment */}
              <ReplyThread replies={comment.replies} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
