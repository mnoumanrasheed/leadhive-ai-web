import { Reveal } from "@/shared/ui/Reveal"

const pressurePoints = [
  ['01', 'Fragmented channels', 'Demand lands in separate inboxes.', 'WhatsApp, Instagram, Messenger, and web chat each create a different queue and an incomplete customer view.'],
  ['02', 'Slow response', 'Buying momentum disappears quickly.', 'High-intent questions wait behind general enquiries while teams work through the backlog manually.'],
  ['03', 'Hidden opportunity', 'The strongest signals look like every other message.', 'Budget, urgency, scope, and decision timing stay buried in conversation history.'],
  ['04', 'Manual triage', 'Sales spends time sorting instead of selling.', 'Reps read repetitive questions and low-intent messages before reaching conversations that need human attention.'],
]

export function ProblemSection() {
  return (
    <section className="problem-section section-pad" id="problem">
      <div className="container problem-editorial-layout">
        <Reveal className="problem-editorial-copy">
          <p className="section-label">The problem</p>
          <h2>More inbound attention should not create more sales chaos.</h2>
          <p>Customer demand arrives continuously, but the information sales needs is scattered across channels, buried in natural language, and discovered too late.</p>
          <aside className="problem-thesis"><span>The real bottleneck</span><strong>Knowing where human attention creates the most value.</strong></aside>
        </Reveal>
        <div className="problem-pressure-list" aria-label="Common lead management challenges">
          {pressurePoints.map(([number, label, title, copy], index) => (
            <Reveal className="problem-pressure-row" delay={index * .07} key={label}>
              <span className="problem-pressure-number">{number}</span>
              <div><small>{label}</small><h3>{title}</h3><p>{copy}</p></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}