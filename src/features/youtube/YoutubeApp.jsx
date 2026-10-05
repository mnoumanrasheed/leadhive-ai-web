import { useEffect, useState } from 'react'
import { DemoShell } from './DemoShell'
import { PlatformSelection } from './screens/PlatformSelection'
import { screenFromHash } from './types'
import './styles/workspace.css'
import './styles/intelligence.css'
import './styles/premium.css'

export function YoutubeApp() {
  const [screen, setScreen] = useState(screenFromHash)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'YouTube Intelligence | LeadHive AI'
    const onHashChange = () => setScreen(screenFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => {
      document.title = previousTitle
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  function navigate(next) {
    window.location.hash = next
  }

  function renderScreen() {
    switch (screen) {
      case 'platform':
        return <PlatformSelection navigate={navigate} />
      default:
        return (
          <div className="td-heading">
            <p className="td-eyebrow">YouTube Intelligence</p>
            <h1 tabIndex={-1}>{screen}</h1>
            <p className="td-description">This screen is coming in the next batch.</p>
          </div>
        )
    }
  }

  return <DemoShell screen={screen}>{renderScreen()}</DemoShell>
}