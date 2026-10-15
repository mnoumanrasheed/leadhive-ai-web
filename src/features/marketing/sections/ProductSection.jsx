import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { Check, Inbox, Search, Send } from 'lucide-react'
import { Reveal } from '../../../shared/ui/Reveal'
import { additionalLeads, primaryLead } from '../data/demoData'

const states = [
  { id: 'inbox', label: 'Unified conversations', title: 'Every active conversation, in one operational view.', copy: 'Bring each channel together without losing context or ownership.', icon: Inbox, signals: ['4 connected channels', 'Shared customer history', 'One priority queue'] },
  { id: 'qualification', label: 'AI qualification', title: 'Commercial signals become clear next steps.', copy: 'LeadHive identifies intent, captures missing context, and applies your qualification criteria.', icon: Search, signals: ['Budget confirmed', '20 locations', 'Next-month timeline'] },
  { id: 'handoff', label: 'Sales-ready handover', title: 'Your seller starts with the full picture.', copy: 'A clean summary, qualification evidence, and recommended action arrive together.', icon: Send, signals: ['High-priority queue', 'Context attached', 'Owner assigned'] },
]

const leads = [primaryLead, ...additionalLeads]

export function ProductSection() {
  const [active, setActive] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { amount: .2 })
  const reducedMotion = useReducedMotion()
  const selected = states[active]
  const Icon = selected.icon

  useEffect(() => {
    if (!inView || reducedMotion) return
    const timer = window.setTimeout(() => setActive(current => (current + 1) % states.length), 5000)
    return () => window.clearTimeout(timer)
  }, [active, inView, reducedMotion])

  return (
    <section className="product-section section-pad" id="product" ref={ref}>
      <div className="container">
        <div className="product-intro">
          <Reveal>
            <p className="section-label">The product</p>
            <h2>One intelligence layer for every customer conversation.</h2>
          </Reveal>
          <Reveal delay={.08}>
            <p>LeadHive gives revenue teams a shared system for understanding demand, prioritizing opportunity, and acting with complete context.</p>
          </Reveal>
        </div>
        <Reveal className="product-showcase">
          <div className="product-capability-rail" role="tablist" aria-label="LeadHive product states">
            <small>Product view</small>
            {states.map((state, index) => (
              <button
                type="button"
                key={state.id}
                onClick={() => setActive(index)}
                className={active === index ? 'active' : ''}
                role="tab"
                aria-selected={active === index}
              >
                <span>0{index + 1}</span>{state.label}
              </button>
            ))}
          </div>
          <div className="product-dashboard" role="tabpanel">
            <header className="product-dashboard-header">
              <div><strong>Lead intelligence</strong><span>Shared operational workspace</span></div>
              <span className="product-dashboard-status"><i /> Live</span>
            </header>
            <div className="product-dashboard-grid">
              <div className="product-lead-queue">
                <div className="product-panel-heading">
                  <div><small>Priority queue</small><strong>Opportunities</strong></div>
                  <span>Score</span>
                </div>
                {leads.map((lead, index) => (
                  <div className={`product-lead-row${index === 0 ? ' selected' : ''}`} key={lead.name}>
                    <span className={`avatar ${index === 0 ? 'navy' : index === 1 ? 'amber' : 'blue'}`}>{lead.initials}</span>
                    <div><strong>{lead.name}</strong><small>{lead.company}</small></div>
                    <span>{index === 0 ? 'High intent' : 'Qualified'}</span>
                    <b>{lead.score}</b>
                  </div>
                ))}
              </div>
              <motion.aside
                className="product-intelligence-panel"
                key={selected.id}
                initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .38, ease: [0.16, 1, .3, 1] }}
              >
                <span className="product-panel-icon"><Icon /></span>
                <small>{selected.label}</small>
                <h3>{selected.title}</h3>
                <p>{selected.copy}</p>
                <div className="product-signal-list">
                  {selected.signals.map(signal => <span key={signal}><Check /> {signal}</span>)}
                </div>
              </motion.aside>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}