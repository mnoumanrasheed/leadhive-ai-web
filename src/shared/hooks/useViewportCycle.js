import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'

export function useViewportCycle({ steps, interval = 1800, amount = 0.2, paused = false }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount })
  const reducedMotion = useReducedMotion()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reducedMotion || !inView || paused) return
    const timer = window.setTimeout(() => setStep((current) => (current + 1) % steps), interval)
    return () => window.clearTimeout(timer)
  }, [inView, interval, paused, reducedMotion, step, steps])

  return { ref, inView, reducedMotion, step, setStep }
}