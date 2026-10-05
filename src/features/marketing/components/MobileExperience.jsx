import { ArrowRight, Bell, Check, MessageSquare } from 'lucide-react'
import { motion } from 'motion/react'
import { Reveal } from '../../../shared/ui/Reveal'
import { additionalLeads, primaryLead, salesRepresentative } from '../data/demoData'
import { useViewportCycle } from '../../../shared/hooks/useViewportCycle'

const features = [
  ['Hot Opportunity alerts', 'Act the moment high-intent opportunities emerge.'],
  ['Lead Intelligence summaries', 'Understand every conversation without reading every message.'],
  ['Channel performance', 'See demand, engagement, and quality across touchpoints.'],
  ['Live team visibility', 'Keep sales aligned with what needs action.'],
]

export function MobileExperience() {
  const { ref, inView, reducedMotion, step } = useViewportCycle({ steps: 4, interval: 1750, amount: 0.2 })
  const score = [76, 84, 92, 92][step]

  return (
    <section className="mobile-section section-pad" id="mobile" ref={ref}>
      <div className="container mobile-layout">
        <Reveal className="phone-stage">
          <motion.div className="phone" animate={inView && !reducedMotion ? { y: [0, -2, 0] } : { y: 0 }} transition={{ duration: 6.5, repeat: inView && !reducedMotion ? Infinity : 0, ease: 'easeInOut' }}>
            <div className="phone-top"><span>9:41</span><i /></div>
            <div className="app-head">
              <div><small>Good morning, {salesRepresentative.name.split(' ')[0]}</small><strong>Lead Intelligence</strong></div>
              <span>{salesRepresentative.initials}</span>
            </div>
            <div className={`mobile-metric${step >= 2 ? ' is-hot' : ''}`}>
              <small>Opportunity Score</small>
              <div>
                <motion.strong key={score} initial={reducedMotion ? false : { y: 3, opacity: 0.55 }} animate={{ y: 0, opacity: 1 }}>{score}</motion.strong>
                <span>{step < 2 ? 'AI qualifying' : 'Hot Opportunity'}</span>
              </div>
              <motion.i animate={{ scaleX: score / 100 }} transition={{ duration: 0.7 }} />
            </div>
            <div className="mobile-subhead"><strong>Needs your attention</strong><span>Conversations</span></div>
            <motion.div className={`mobile-lead${step >= 1 ? ' selected' : ''}`} animate={step >= 1 && !reducedMotion ? { x: [0, 2, 0] } : undefined}>
              <span className="avatar navy">{primaryLead.initials}</span>
              <div><strong>{primaryLead.name}</strong><small>{primaryLead.deployment} · {primaryLead.region}</small></div>
              <em>{step >= 2 ? 'HOT' : 'AI'}</em>
            </motion.div>
            <div className="mobile-lead">
              <span className="avatar amber">{additionalLeads[0].initials}</span>
              <div><strong>{additionalLeads[0].name}</strong><small>{additionalLeads[0].note}</small></div>
              <em>{additionalLeads[0].score}</em>
            </div>
            <motion.div className="mobile-summary" animate={{ opacity: step >= 2 ? 1 : 0.68, y: step >= 2 ? 0 : 3 }}>
              <span>Recommended Action</span>
              <p>Share enterprise pricing and schedule a discovery call for the 20-site rollout.</p>
              <small><Check /> {step >= 3 ? 'Ready for Sales Handover' : 'AI preparing context'}</small>
            </motion.div>
            <div className="app-tabs"><MessageSquare /><span><i /></span><Bell /></div>
          </motion.div>
          <motion.div className="phone-notification" animate={{ opacity: step === 3 || reducedMotion ? 1 : 0, y: step === 3 || reducedMotion ? 0 : 6, scale: step === 3 || reducedMotion ? 1 : 0.98 }}>
            <span><Bell /></span>
            <div><small>Hot Opportunity</small><strong>{primaryLead.name}</strong></div>
            <b>{primaryLead.score}</b>
          </motion.div>
        </Reveal>

        <div className="mobile-copy">
          <Reveal>
            <p className="eyebrow light">LeadHive mobile</p>
            <h2>Your sales intelligence. In your pocket.</h2>
            <p>Give your team immediate visibility into the opportunities that matter most—wherever the day takes them.</p>
          </Reveal>
          <div className="mobile-feature-list">
            {features.map(([title, copy], index) => (
              <Reveal className="mobile-feature-row" delay={index * 0.07} key={title}>
                <span>0{index + 1}</span>
                <div><h3>{title}</h3><p>{copy}</p></div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <a className="text-link light" href="#contact">Explore the mobile experience <ArrowRight /></a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}