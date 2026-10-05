import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { Check, Globe2, Sparkles } from 'lucide-react'
import { Reveal } from '../../../shared/ui/Reveal'

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a9.9 9.9 0 0 0-8.55 14.9L2 22l5.25-1.37A9.9 9.9 0 1 0 12 2Zm0 18.16c-1.46 0-2.9-.39-4.16-1.13l-.3-.18-3.11.82.82-3.02-.19-.31a8.22 8.22 0 1 1 6.94 3.82Zm4.52-6.15c-.24-.12-1.47-.73-1.7-.81-.23-.09-.39-.13-.56.12-.17.25-.65.81-.79.98-.14.16-.28.18-.53.06-.25-.12-1.06-.39-2.01-1.24-.74-.65-1.24-1.46-1.39-1.71-.14-.25-.01-.38.11-.5l.38-.44c.12-.14.16-.25.25-.41.08-.17.04-.32-.02-.44l-.76-1.84c-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.31 3.8 2.53 1.09 2.53.73 2.99.69.45-.05 1.47-.6 1.67-1.18.21-.59.21-1.09.15-1.19-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  )
}

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

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  )
}

const channels = [
  { id: 'facebook', name: 'Facebook', shortName: 'Facebook', copy: 'Community conversations, understood.', icon: FacebookIcon },
  { id: 'youtube', name: 'YouTube', shortName: 'YouTube', copy: 'Viewer intent, captured.', icon: YouTubeIcon },
  { id: 'instagram', name: 'Instagram Direct Messages', shortName: 'Instagram', copy: 'High-intent DMs, qualified.', icon: InstagramIcon },
  { id: 'whatsapp', name: 'WhatsApp Business', shortName: 'WhatsApp', copy: 'Demand qualified at scale.', icon: WhatsAppIcon },
  { id: 'website', name: 'Website', shortName: 'Website', copy: 'Visitor intent captured live.', icon: Globe2 },
]

const paths = [
  'M104 58 C172 58 198 180 248 218',
  'M300 58 L300 136',
  'M496 58 C428 58 402 180 352 218',
  'M104 397 C172 397 198 286 248 244',
  'M496 397 C428 397 402 286 352 244',
]

export function Channels() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: .25 })
  const reducedMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    if (!inView || reducedMotion) return
    const timer = window.setTimeout(() => setActive(current => (current + 1) % channels.length), 7000)
    return () => window.clearTimeout(timer)
  }, [active, inView, reducedMotion])

  const current = hovered ?? active

  return (
    <section className="channels-section section-pad" id="channels" ref={ref}>
      <div className="container channels-network-layout">
        <Reveal className="channels-copy">
          <p className="eyebrow channels-eyebrow"><Sparkles size={13} /> Unified channels</p>
          <h2>Built for where your customers <span className="channels-gradient-text">already talk to you.</span></h2>
          <p>Customers don&apos;t always fill out forms. They send messages. LeadHive turns those conversations into structured opportunities.</p>
          <div className="channels-proof">
            <span><Check /></span>
            <div>
              <small>One connected frontline</small>
              <strong>Every conversation. One intelligence layer.</strong>
            </div>
          </div>
        </Reveal>
        <Reveal className="channels-network-wrap" delay={.08}>
          <div className="channels-network">
            <svg className="channels-connection-map" viewBox="0 0 600 560" aria-hidden="true">
              {paths.map((path, index) => (
                <g key={path}>
                  <path className="channel-connection-base" d={path} />
                  {inView && !reducedMotion && current === index && (
                    <motion.path
                      className="channel-connection-signal"
                      d={path}
                      pathLength="1"
                      strokeDasharray=".2 .8"
                      initial={{ strokeDashoffset: 1, opacity: 0 }}
                      animate={{ strokeDashoffset: [1, 0], opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </g>
              ))}
              <path className="channel-output-line" d="M300 320 L300 496" />
              {inView && !reducedMotion && (
                <motion.path
                  className="channel-output-signal"
                  d="M300 320 L300 496"
                  pathLength="1"
                  strokeDasharray=".25 .75"
                  initial={{ strokeDashoffset: 1, opacity: 0 }}
                  animate={{ strokeDashoffset: [1, 0], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.8, delay: 0.6, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
                />
              )}
            </svg>
            {channels.map((channel, index) => {
              const Icon = channel.icon
              return (
                <button
                  type="button"
                  className={`channel-node channel-node-${index}${current === index ? ' is-active' : ''}`}
                  key={channel.id}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  aria-label={`${channel.name}, connected to LeadHive AI`}
                >
                  <span className={`channel-brand-icon ${channel.id}`}><Icon /></span>
                  <span className="channel-node-copy">
                    <strong>{channel.shortName}</strong>
                    <small>{channel.copy}</small>
                  </span>
                  <span className="channel-node-pulse" aria-hidden="true" />
                </button>
              )
            })}
            <div className="channels-ai-hub">
              <div className="channels-hub-glow" aria-hidden="true" />
              <div className="channels-hub-brand">
                <img src="/favicon.png" alt="" />
                <small>LeadHive AI</small>
                <span className="channels-hub-live-dot" aria-hidden="true" />
              </div>
              <h3>LeadHive Intelligence</h3>
              <div className="channels-processing-stages">
                <span className="stage-pill">Understand</span>
                <i>&rarr;</i>
                <span className="stage-pill">Qualify</span>
                <i>&rarr;</i>
                <span className="stage-pill">Prioritize</span>
              </div>
              <p>Commercial intent and qualification signals, connected.</p>
            </div>
            <div className="channels-lead-output">
              <span><Sparkles /></span>
              <div>
                <small>Qualified output</small>
                <strong>Sales-ready lead</strong>
              </div>
              <i><Check /></i>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}