import { motion } from 'motion/react'
import { Check, MessageCircle, Sparkles, Target } from 'lucide-react'

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.8 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H17V3.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.1H7.8V13h2.7v8h3.3Z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2C1.9 9 1.9 12 1.9 12s0 3 .5 4.8a3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1c.5-1.8.5-4.8.5-4.8s0-3-.5-4.8ZM9.9 15.1V8.9l5.4 3.1-5.4 3.1Z" />
    </svg>
  )
}

const sources = [
  { label: 'WhatsApp', tone: 'whatsapp', Icon: MessageCircle, y: 112 },
  { label: 'Facebook', tone: 'facebook', Icon: FacebookIcon, y: 182 },
  { label: 'Instagram', tone: 'instagram', Icon: MessageCircle, y: 258 },
  { label: 'YouTube', tone: 'youtube', Icon: YouTubeIcon, y: 328 },
]

const cycle = { duration: 8, repeat: Infinity, repeatDelay: 0.7, ease: 'easeInOut' }

export function HeroPipelineVisual({ active }) {
  return (
    <div className="intelligence-visual" aria-label="Incoming channel signals are evaluated by LeadHive AI and become a qualified sales opportunity">
      <div className="intelligence-ambient" aria-hidden="true" />
      <p className="intelligence-label">Signal intelligence</p>
      <span className="intelligence-live"><i /> Live processing</span>
      <p className="intelligence-stage-label intelligence-input-label">Incoming conversations</p>

      <div className="intelligence-sources">
        {sources.map(({ label, tone, Icon }, index) => (
          <motion.div
            className={'intelligence-source ' + tone}
            key={label}
            animate={active
              ? { opacity: [.38, .38, 1, 1, .62, .62], x: [0, 0, 2, 2, 0, 0] }
              : { opacity: 1 }}
            transition={{ ...cycle, delay: index * .48, times: [0, .05, .11, .22, .3, 1] }}
          >
            <Icon />
            <span>{label}</span>
          </motion.div>
        ))}
      </div>

      <svg className="intelligence-lines" viewBox="0 0 640 440" fill="none" aria-hidden="true">
        {sources.map(({ label, y }, index) => (
          <motion.path
            key={label}
            className="intelligence-input-path"
            d={`M 145 ${y} C 215 ${y} 252 ${y + (220 - y) * .58} 290 220`}
            initial={false}
            animate={active
              ? { pathLength: [0, 0, 1, 1], opacity: [.12, .12, .82, .32] }
              : { pathLength: 1, opacity: .55 }}
            transition={{ ...cycle, delay: index * .48, times: [0, .05, .14, .3] }}
          />
        ))}
        <motion.path
          className="intelligence-output-path"
          d="M 410 220 C 452 220 478 220 516 220"
          initial={false}
          animate={active
            ? { pathLength: [0, 0, 1, 1], opacity: [.14, .14, .9, .48] }
            : { pathLength: 1, opacity: .7 }}
          transition={{ ...cycle, delay: 4.1, times: [0, .06, .15, .32] }}
        />
        {sources.map(({ label, y }, index) => (
          <motion.circle
            key={label}
            className="intelligence-particle"
            r="3.6"
            initial={false}
            animate={active
              ? { cx: [145, 145, 290, 290], cy: [y, y, 220, 220], opacity: [0, 0, 1, 0] }
              : { cx: 290, cy: 220, opacity: .8 }}
            transition={{ ...cycle, delay: index * .48, times: [0, .1, .22, .3] }}
          />
        ))}
        <motion.circle
          className="intelligence-particle intelligence-output-particle"
          r="3.6"
          initial={false}
          animate={active
            ? { cx: [410, 410, 516, 516], opacity: [0, 0, 1, 0] }
            : { cx: 516, opacity: .8 }}
          transition={{ ...cycle, delay: 4.1, times: [0, .08, .2, .32] }}
        />
      </svg>

      <p className="intelligence-stage-label intelligence-core-label">Intent evaluation</p>

      <div className="intelligence-core">
        <motion.div
          className="intelligence-core-inner"
          animate={active ? { scale: [1, 1, 1.045, 1.045, 1] } : { scale: 1 }}
          transition={{ ...cycle, delay: 3.45, times: [0, .08, .18, .3, 1] }}
        >
          <span className="intelligence-core-icon"><Sparkles size={20} /></span>
          <strong>LeadHive AI</strong>
          <small>Qualifying intent</small>
        </motion.div>
      </div>

      <motion.div
        className="intelligence-output"
        initial={false}
        animate={active
          ? { opacity: [.54, .54, 1, 1, .72], y: [4, 4, 0, 0, 0], borderColor: ['rgba(127,235,241,.24)', 'rgba(127,235,241,.24)', 'rgba(103,232,249,.8)', 'rgba(127,235,241,.3)', 'rgba(127,235,241,.24)'] }
          : { opacity: 1, y: 0, borderColor: 'rgba(103,232,249,.48)' }}
        transition={{ ...cycle, delay: 4.1, times: [0, .08, .18, .32, 1] }}
      >
        <span><Target size={17} /></span>
        <div>
          <small>Sales opportunity</small>
          <strong>Qualified lead</strong>
        </div>
        <motion.i
          animate={active ? { scale: [0, 0, 1.15, 1, 1] } : { scale: 1 }}
          transition={{ ...cycle, delay: 4.55, times: [0, .08, .18, .25, 1] }}
        >
          <Check size={15} />
        </motion.i>
      </motion.div>

      <div className="intelligence-footer">
        <span>Conversations</span><i /><span>Understanding</span><i /><span>Opportunity</span>
      </div>
    </div>
  )
}