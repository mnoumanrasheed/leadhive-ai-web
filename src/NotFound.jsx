import { Link } from 'react-router'

export default function NotFound() {
  return (
    <main
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        padding: '48px 24px',
        textAlign: 'center',
        background: 'var(--canvas)',
        color: 'var(--text)',
      }}
    >
      <div>
        <p style={{ margin: '0 0 12px', color: 'var(--accent)', fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}>
          404
        </p>
        <h1 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800 }}>
          Page not found
        </h1>
        <p style={{ margin: '0 0 24px', color: 'var(--text-muted)' }}>
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            padding: '10px 18px',
            borderRadius: 10,
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Back to LeadHive AI
        </Link>
      </div>
    </main>
  )
}