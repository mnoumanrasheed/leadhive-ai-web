import { Reveal } from '@/shared/ui/Reveal'
import { motion } from 'motion/react'
import { useViewportCycle } from '@/shared/hooks/useViewportCycle'

const trustSignals = ['AI Engineering', 'Customer Experience', 'Sales Automation', 'Enterprise Delivery']

export function TrustSection() {
  const { ref, inView, reducedMotion, step } = useViewportCycle({ steps: trustSignals.length, interval: 1500, amount: 0.4 })

  return (
    <section className="trust-section" id="trust" aria-label="LeadHive credibility" ref={ref}>
      <Reveal className="container trust-layout">
        <div>
          <span>Built by</span>
          <strong><a href="https://m3hive.com/" target="_blank" rel="noreferrer">M3Hive</a></strong>
        </div>
        <p>
          {trustSignals.map((signal, index) => (
            <span className={step === index ? 'is-active' : ''} key={signal}>
              {signal}
              {index < trustSignals.length - 1 && <i />}
            </span>
          ))}
        </p>
        <small>Built for sales teams managing high-volume digital conversations.</small>
        <motion.b
          className="trust-scan"
          animate={inView && !reducedMotion
            ? { scaleX: [0, 1], opacity: [0, 0.55, 0] }
            : { scaleX: 0, opacity: 0 }}
          transition={{ duration: 5.5, repeat: inView && !reducedMotion ? Infinity : 0, ease: 'easeInOut' }}
        />
      </Reveal>
    </section>
  )
}