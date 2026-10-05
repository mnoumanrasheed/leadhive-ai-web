import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '../ui/Reveal'
import { Link, useLocation } from 'react-router'

export function Footer() {
  const { pathname } = useLocation()
  const homePath = pathname === '/'
  const sectionHref = (id) => `${homePath ? '' : '/'}#${id}`

  return (
    <footer>
      <Reveal className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" aria-label="LeadHive AI home">
            <img src="/leadhive-logo.png" alt="LeadHive AI" />
          </Link>
          <p>Turning digital conversations into clear, qualified sales opportunities.</p>
          <small>Built by <a href="https://m3hive.com/" target="_blank" rel="noreferrer">M3Hive</a></small>
        </div>
        <div>
          <h3>Product</h3>
          <a href={sectionHref('product')}>Lead Intelligence</a>
          <a href={sectionHref('workflow')}>How it works</a>
          <a href={sectionHref('channels')}>Channels</a>
        </div>
        <div>
          <h3>Company</h3>
          <a href={sectionHref('why')}>Why LeadHive</a>
          <Link to="/contact">Contact Us</Link>
        </div>
        <div className="footer-contact">
          <h3>Contact</h3>
          <a href="mailto:support@leadhive-ai.com">support@leadhive-ai.com <ArrowUpRight /></a>
          <small>For product, partnership, and demo enquiries.</small>
        </div>
      </Reveal>
      <div className="container footer-bottom">
        <span>Copyright 2026 LeadHive AI. All rights reserved.</span>
        <div>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  )
}
