import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams, useSearchParams } from 'react-router'
import MarketingApp from '@/features/marketing/MarketingApp'

const YoutubeApp = lazy(() =>
  import('@/features/youtube/YoutubeApp').then(m => ({ default: m.YoutubeApp }))
)
const LegalPage = lazy(() =>
  import('@/features/legal/LegalPage').then(m => ({ default: m.LegalPage }))
)
const NotFound = lazy(() => import('@/NotFound'))

// Backend OAuth callback lands on /dashboard/:channelId?auth=success|failed.
// YoutubeApp is hash-driven, so forward to it with the right screen.
function OAuthReturn() {
  const { channelId } = useParams()
  const [params] = useSearchParams()
  const failed = params.get('auth') === 'failed'
  const next = new URLSearchParams(params)
  if (channelId) next.set('channel_id', channelId)
  return <Navigate to={`/test-demo?${next.toString()}#${failed ? 'channel' : 'dashboard'}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/"                     element={<MarketingApp />} />
          <Route path="/contact"              element={<MarketingApp />} />
          <Route path="/test-demo"            element={<YoutubeApp />} />
          <Route path="/dashboard"            element={<OAuthReturn />} />
          <Route path="/dashboard/:channelId" element={<OAuthReturn />} />
          <Route path="/privacy"              element={<LegalPage type="privacy" />} />
          <Route path="/terms"                element={<LegalPage type="terms" />} />
          <Route path="*"                     element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}