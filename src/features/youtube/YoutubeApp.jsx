/* TEMPORARY STUB — replace when YouTube feature is migrated */

export function YoutubeApp() {
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
          Test Demo
        </p>
        <h1 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800 }}>
          Coming soon
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          The YouTube test demo is being migrated. Check back shortly.
        </p>
      </div>
    </main>
  )
}