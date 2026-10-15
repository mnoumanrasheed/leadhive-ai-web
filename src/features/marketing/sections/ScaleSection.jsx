import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/shared/ui/Reveal'

const shifts = [
  ['Fragmented inboxes', 'Unified demand view'],
  ['Manual sorting', 'Prioritized opportunities'],
  ['Missing context', 'Sales-ready handover'],
  ['Reactive follow-up', 'Faster human action'],
]

export function ScaleSection() {
  return (
    <section className="scale-section section-pad" id="results">
      <div className="container">
        <Reveal className="scale-outcome-intro">
          <div>
            <p className="section-label">Operational impact</p>
            <h2>Turn conversation volume into operating clarity.</h2>
          </div>
          <p>LeadHive clarifies what needs a response, what needs qualification, and what deserves a seller's attention now.</p>
        </Reveal>
        <Reveal className="impact-table">
          <div className="impact-head"><span>Without LeadHive</span><span>With LeadHive</span></div>
          {shifts.map(([before, after], index) => (
            <div className="impact-row" key={before}>
              <span><i>0{index + 1}</i>{before}</span>
              <ArrowRight />
              <strong>{after}</strong>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}