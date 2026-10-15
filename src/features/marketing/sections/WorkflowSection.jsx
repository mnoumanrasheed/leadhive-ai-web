import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { BrainCircuit, Gauge, MessageCircle, Send, SlidersHorizontal } from 'lucide-react'
import { Reveal } from '@/shared/ui/Reveal'

const steps = [
  ['01', 'Incoming message', 'Demand arrives on any connected channel.', 'LeadHive receives the conversation and keeps its source and history.', MessageCircle],
  ['02', 'AI understanding', 'Language becomes usable customer context.', 'Intent, entities, urgency, and provided information are recognised.', BrainCircuit],
  ['03', 'Qualification', 'Missing criteria are collected naturally.', 'LeadHive asks the next relevant question using your sales rules.', SlidersHorizontal],
  ['04', 'Lead scoring', 'Fit and buying signals create a priority.', 'Each conversation is ranked against intent, completeness, urgency, and fit.', Gauge],
  ['05', 'Sales handover', 'A seller receives an opportunity ready to act.', 'The owner gets a concise summary, context, and a recommended next step.', Send],
]

export function WorkflowSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: .2 })
  const reducedMotion = useReducedMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!inView || reducedMotion) return
    const timer = window.setTimeout(() => setActive(current => (current + 1) % steps.length), 1800)
    return () => window.clearTimeout(timer)
  }, [active, inView, reducedMotion])

  const [, label, title, copy, Icon] = steps[active]

  return (
    <section className="workflow-section section-pad" id="workflow" ref={ref}>
      <div className="container">
        <div className="workflow-intro">
          <Reveal>
            <p className="section-label">How it works</p>
            <h2>One continuous path from first message to human action.</h2>
          </Reveal>
          <Reveal delay={.08}>
            <p>The workflow keeps context intact and brings your team in only when human judgment can move the opportunity forward.</p>
          </Reveal>
        </div>
        <div className="workflow-experience">
          <div className="workflow-rail" aria-label="LeadHive qualification workflow">
            {steps.map(([number, stepLabel, , , StepIcon], index) => (
              <button
                type="button"
                key={number}
                onClick={() => setActive(index)}
                className={active === index ? 'is-active' : ''}
              >
                <span>{number}</span>
                <StepIcon />
                <small>{stepLabel}</small>
              </button>
            ))}
            <motion.i
              className="workflow-signal"
              animate={{ top: `${(active / (steps.length - 1)) * 100}%` }}
              transition={{ duration: .55, ease: [0.16, 1, .3, 1] }}
            />
          </div>
          <motion.article
            className="workflow-detail"
            key={label}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .42 }}
          >
            <span className="workflow-detail-icon"><Icon /></span>
            <small>{label}</small>
            <h3>{title}</h3>
            <p>{copy}</p>
            <span className="workflow-note">LeadHive keeps the signal and context connected.</span>
          </motion.article>
        </div>
      </div>
    </section>
  )
}