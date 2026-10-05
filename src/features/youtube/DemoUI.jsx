import { ArrowLeft, ArrowRight, Link2, LoaderCircle } from 'lucide-react'
import { youtubeAuthUrl } from './api'

export function StatusBadge({ children, tone = 'neutral' }) {
  return (
    <span className={'td-status-badge td-status-' + tone}>
      <i aria-hidden="true" />
      {children}
    </span>
  )
}

export function ScreenHeading({ eyebrow, title, children }) {
  return (
    <div className="td-heading">
      <p className="td-eyebrow">{eyebrow}</p>
      <h1 tabIndex={-1}>{title}</h1>
      <p className="td-description">{children}</p>
    </div>
  )
}

export function Panel({ className = '', children }) {
  return <section className={'td-panel ' + className}>{children}</section>
}

export function PanelHeader({ eyebrow, title, children, action }) {
  return (
    <div className="td-panel-header">
      <div>
        {eyebrow && <span className="td-panel-kicker">{eyebrow}</span>}
        <h2>{title}</h2>
        {children && <p>{children}</p>}
      </div>
      {action && <div className="td-panel-action">{action}</div>}
    </div>
  )
}

export function StepActions({ back, next, label = 'Continue', submit = false, busy = false, disabled = false }) {
  return (
    <div className="td-actions">
      <button type="button" className="td-button td-button-quiet" onClick={back}>
        <ArrowLeft size={16} /> Back
      </button>
      {(next || submit) && (
        <button
          type={submit ? 'submit' : 'button'}
          disabled={disabled || busy}
          className="button td-button td-button-primary"
          onClick={next}
        >
          {busy ? 'Saving...' : label}
          {busy ? <LoaderCircle size={16} className="td-spin" /> : <ArrowRight size={16} />}
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon, title, children, action }) {
  return (
    <div className="td-empty">
      <span className="td-empty-icon" aria-hidden="true">{icon}</span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action && <div className="td-empty-action">{action}</div>}
    </div>
  )
}

export function ConnectButton() {
  return (
    <a className="button td-button td-button-primary" href={youtubeAuthUrl('/auth/youtube/login')}>
      <Link2 size={16} /> Connect YouTube
    </a>
  )
}

export function ConnectionRequired() {
  return (
    <EmptyState
      icon={<Link2 size={24} />}
      title="Connect your YouTube channel"
      action={<ConnectButton />}
    >
      Your channel data will appear here after you connect and select an account.
    </EmptyState>
  )
}

export function ResourceStatus({ loading, error, retry }) {
  if (loading) {
    return (
      <p className="td-load-state" role="status">
        <LoaderCircle size={16} className="td-spin" /> Loading channel data...
      </p>
    )
  }
  if (error) {
    return (
      <div className="td-error" role="alert">
        <p>{error}</p>
        {retry && <button className="td-text-action" onClick={retry}>Try again</button>}
      </div>
    )
  }
  return null
}