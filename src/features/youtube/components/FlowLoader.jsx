// real time based loader
import { motion, useReducedMotion } from 'motion/react'
export function FlowLoader({ message = 'Loading...' }) {
  const reduced = useReducedMotion()

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-5"
    >
      <img src="/leadhive-logo.png" alt="" aria-hidden="true" className="h-14 w-auto" />
      <p className="text-sm font-medium text-gray-600">{message}</p>

      {/* Indeterminate bar: a short segment sliding across the track (static if reduced motion) */}
      <div className="h-1 w-56 overflow-hidden rounded-full bg-gray-200">
        <motion.i
          className="block h-full w-1/3 rounded-full bg-blue-600"
          animate={reduced ? undefined : { x: ['-100%', '300%'] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}