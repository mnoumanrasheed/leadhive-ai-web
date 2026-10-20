import { Reveal } from '@/shared/ui/Reveal'
import { ArrowUpRight } from 'lucide-react'

const trustSignals = ['AI Engineering', 'Customer Experience', 'Sales Automation', 'Enterprise Delivery']

export function TrustSection() {
  return (
    <section className="trust-section" id="trust" aria-label="LeadHive credibility">
      <Reveal className="container trust-layout">
        <div className="trust-partner">
          <span className="trust-label">Technology partner</span>
          <strong>
            <a href="https://m3hive.com/" target="_blank" rel="noreferrer">
              M3Hive <ArrowUpRight aria-hidden="true" />
            </a>
          </strong>
          <small>Product engineering for intelligent, customer-facing systems.</small>
        </div>
        <div className="trust-capabilities">
          <span className="trust-label">Core capabilities</span>
          <div>
            {trustSignals.map(signal => (
              <span key={signal}><i aria-hidden="true" />{signal}</span>
            ))}
          </div>
        </div>
        <div className="trust-outcome">
          <span className="trust-label">Designed for scale</span>
          <strong>From conversation to qualified opportunity.</strong>
          <small>Built for sales teams managing high-volume digital conversations.</small>
        </div>
      </Reveal>
    </section>
  )
}
