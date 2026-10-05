import { Layers, Target, Zap } from 'lucide-react'
import { Reveal } from '@/shared/ui/Reveal'

const benefits = [
  ['One intelligent frontline', 'Every channel becomes one consistent, intelligent customer experience.', Layers],
  ['Signals before noise', 'Commercial context is surfaced before your sales team starts sorting messages.', Target],
  ['Human action at the right moment', 'Your team gets involved when a conversation is ready for their expertise.', Zap],
]

export function WhyLeadHive() {
  return (
    <section className="why-section section-pad" id="why">
      <div className="container why-layout">
        <Reveal className="why-heading">
          <p className="section-label">Why LeadHive</p>
          <h2>Your sales team should sell, not sort messages.</h2>
          <p>More attention should create more business, not more operational chaos.</p>
        </Reveal>
        <div className="benefit-list">
          {benefits.map(([title, copy, Icon], index) => (
            <Reveal className="benefit-row" delay={index * .08} key={title}>
              <span>0{index + 1}</span>
              <div><h3>{title}</h3><p>{copy}</p></div>
              <Icon />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}