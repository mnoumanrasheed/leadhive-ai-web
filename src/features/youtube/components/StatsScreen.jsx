// Step 5 of FlowWidget: analytics for the monitored video.
// Loads GET /analytics/selected-videos/{channel.id}/{video.id} and renders the response.
import { useState } from 'react'
import { ArrowUpRight, ImageIcon } from 'lucide-react'
import { useYoutubeResource } from '../hooks'
import { FlowLoader } from './FlowLoader'

// Badge colors per reply status
const STATUS_STYLES = {
  posted: 'bg-green-100 text-green-700',
  failed: 'bg-amber-100 text-amber-700',
  pending: 'bg-gray-100 text-gray-600',
}

export function StatsScreen({ channel, video }) {
  const [refresh, setRefresh] = useState(0)

  // null path = skip fetching (shouldn't happen at step 5, but keeps the hook safe)
  const path =
    channel?.id && video?.id
      ? `/analytics/selected-videos/${channel.id}/${video.id}`
      : null

  const { data: d, error, loading } = useYoutubeResource(path, refresh)

  if (loading) {
    return <FlowLoader message="Loading analytics..." />
  }

  if (error || !d) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm text-red-700">{error || 'No analytics available for this video yet.'}</p>
        <button
          onClick={() => setRefresh(n => n + 1)}
          className="mt-3 rounded bg-red-600 px-3 py-1.5 text-sm text-white"
        >
          Retry
        </button>
      </div>
    )
  }

  const views = d.views ?? 0
  const likes = d.likes ?? 0
  const commentCount = d.youtube_comment_count ?? 0
  const drafts = d.generated_drafts ?? 0
  const posted = d.posted_replies ?? 0
  const uncertain = d.uncertain_replies ?? 0
  const comments = d.comments ?? []
  const replyRate = drafts > 0 ? Math.round((posted / drafts) * 100) : 0

  // Summary cards shown at the top
  const stats = [
    { label: 'Total Views', value: views.toLocaleString(), note: 'On the monitored video' },
    { label: 'Likes', value: likes.toLocaleString(), note: 'Across the video' },
    { label: 'YouTube Comments', value: commentCount.toLocaleString(), note: `${drafts} AI drafts generated` },
    { label: 'Replies Posted', value: posted.toLocaleString(), note: `${replyRate}% of drafts posted` },
  ]

  return (
    <section className="space-y-6">
      {/* Heading */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Analytics &amp; Insights</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Monitored video insights</h1>
        <p className="mt-2 text-sm text-gray-600">
          Live metrics, comment activity, and AI reply performance for your selected video.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => (
          <article key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <span className="text-sm text-gray-500">{stat.label}</span>
            <strong className="mt-1 block text-3xl font-bold text-gray-900">{stat.value}</strong>
            <small className="text-gray-400">{stat.note}</small>
          </article>
        ))}
      </div>

      {/* Monitored video card */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-20 w-36 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
          <ImageIcon size={25} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Monitored video · {d.channel_name || channel?.name}
          </span>
          <h2 className="truncate text-lg font-semibold text-gray-900">{d.title || video?.title}</h2>
          <span className="text-xs text-gray-500">Video ID: {d.youtube_video_id || video?.id}</span>
        </div>

        {/* Uncertain replies warning badge, shown only when > 0 */}
        {uncertain > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            {uncertain} uncertain
          </span>
        )}

        <a
          href={`https://www.youtube.com/watch?v=${d.youtube_video_id || video?.id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Open on YouTube <ArrowUpRight size={15} />
        </a>
      </div>

      {/* Comment activity */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Comment activity</h2>
        <p className="text-sm text-gray-500">Comments and AI reply status for this video.</p>

        <div className="mt-5 space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comment activity recorded yet.</p>
          ) : (
            comments.map((comment, index) => (
              <article
                key={comment.youtube_comment_id ?? comment.id ?? index}
                className="rounded-xl border border-gray-200 p-4"
              >
                <span
                  className={
                    'inline-block rounded-full px-2 py-0.5 text-xs font-medium ' +
                    (STATUS_STYLES[comment.reply_status] || STATUS_STYLES.pending)
                  }
                >
                  {comment.reply_status}
                </span>
                <p className="mt-2 text-sm text-gray-800">{comment.comment_text}</p>
                {comment.ai_reply && (
                  <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                    <strong>AI:</strong> {comment.ai_reply}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}