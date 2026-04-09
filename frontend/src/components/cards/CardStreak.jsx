import { motion } from 'framer-motion'
import CountUp from 'react-countup'

export default function CardStreak({ data, isActive }) {
  const { recent_streak_days, cards } = data
  const { headline, subtext } = cards.streak

  return (
    <div className="card" id="card-3">
      {/* Card number tag */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="rounded-full"
          style={{
            width: '6px',
            height: '6px',
            background: 'var(--accent-magenta)',
            boxShadow: '0 0 8px var(--accent-magenta)',
          }}
        />
        <span className="label-caps" style={{ color: 'var(--accent-magenta)', letterSpacing: '0.15em' }}>
          Streak
        </span>
      </div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="headline-lg mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {headline}
      </motion.h2>

      {/* Giant number — the hero */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Background glow behind the number */}
          <div
            className="absolute inset-0 -m-8"
            style={{
              background: 'radial-gradient(circle, rgba(255, 0, 110, 0.12) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />

          <span
            className="font-display font-extrabold relative block text-center"
            style={{
              fontSize: 'clamp(6rem, 20vw, 10rem)',
              lineHeight: 1,
              color: 'var(--text-primary)',
              textShadow:
                '0 0 40px rgba(255, 0, 110, 0.3), 0 0 80px rgba(255, 0, 110, 0.15)',
            }}
          >
            {isActive ? (
              <CountUp
                start={0}
                end={recent_streak_days}
                duration={1.5}
                useEasing
              />
            ) : (
              '0'
            )}
          </span>
        </motion.div>

        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="font-mono font-semibold mt-4"
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--accent-magenta)',
            textShadow: '0 0 10px rgba(255, 0, 110, 0.3)',
          }}
        >
          Recent Streak
        </motion.p>

        {/* Days label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="font-mono mt-1"
          style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
        >
          {recent_streak_days === 1 ? 'day' : 'days'}
        </motion.p>

        {/* Caveat — required by spec, do not hide */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 0.4 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="font-mono mt-3 text-center"
          style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}
        >
          (based on last ~90 events)
        </motion.p>
      </div>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="subtext mt-auto pt-4"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
      >
        {subtext}
      </motion.p>
    </div>
  )
}
