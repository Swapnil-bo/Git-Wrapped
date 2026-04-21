import { motion } from 'framer-motion'
import ShareButton from '../ShareButton'

export default function CardFinal({ data, isActive }) {
  const {
    avatar_url,
    archetype_title,
    archetype_subtitle,
    total_commits,
    total_repos,
    recent_streak_days,
    cards,
  } = data
  const { headline, subtext, sign_off } = cards.final

  return (
    <div className="card" id="final-card">
      {/* Card number tag */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="rounded-full"
          style={{
            width: '6px',
            height: '6px',
            background: 'var(--accent-cyan)',
            boxShadow: '0 0 8px var(--accent-cyan)',
          }}
        />
        <span className="label-caps" style={{ color: 'var(--accent-cyan)', letterSpacing: '0.15em' }}>
          Your Wrapped
        </span>
      </div>

      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center mb-4"
      >
        <div className="relative">
          {/* Glow behind avatar */}
          <div
            className="absolute -inset-3 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0, 245, 255, 0.15) 0%, transparent 70%)',
              filter: 'blur(12px)',
            }}
          />
          {avatar_url ? (
            <img
              src={avatar_url}
              alt="GitHub avatar"
              crossOrigin="anonymous"
              className="relative rounded-full"
              style={{
                width: '80px',
                height: '80px',
                border: '2px solid var(--accent-cyan)',
                boxShadow: '0 0 20px var(--accent-cyan), 0 0 40px rgba(0, 245, 255, 0.15)',
              }}
            />
          ) : (
            <div
              className="relative rounded-full flex items-center justify-center"
              style={{
                width: '80px',
                height: '80px',
                border: '2px solid var(--accent-cyan)',
                boxShadow: '0 0 20px var(--accent-cyan), 0 0 40px rgba(0, 245, 255, 0.15)',
                background: 'rgba(0, 245, 255, 0.05)',
                fontSize: '2rem',
                color: 'var(--accent-cyan)',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
          )}
        </div>
      </motion.div>

      {/* Archetype title — MASSIVE */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="font-display font-extrabold text-center"
        style={{
          fontSize: 'clamp(1.3rem, 5.5vw, 2.1rem)',
          lineHeight: 1.1,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          textShadow: '0 0 30px rgba(0, 245, 255, 0.2)',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          hyphens: 'auto',
        }}
      >
        {archetype_title}
      </motion.h2>

      {/* Archetype subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="font-mono text-center mt-2 mb-4"
        style={{
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
        }}
      >
        {archetype_subtitle}
      </motion.p>

      {/* Decorative separator */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isActive ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mx-auto mb-4"
        style={{
          width: '60px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)',
          boxShadow: '0 0 8px rgba(0, 245, 255, 0.3)',
        }}
      />

      {/* Groq headline + subtext */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="text-center mb-3"
      >
        <p
          className="font-display font-semibold"
          style={{
            fontSize: '0.9rem',
            lineHeight: 1.35,
            color: 'var(--text-primary)',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
          }}
        >
          {headline}
        </p>
        <p
          className="font-mono mt-1.5"
          style={{
            fontSize: '0.72rem',
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
          }}
        >
          {subtext}
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="flex items-center justify-center gap-x-2 gap-y-1 my-3 flex-wrap w-full"
      >
        <StatChip value={`~${total_commits}`} label="commits" />
        <span style={{ color: 'var(--text-secondary)', opacity: 0.3 }}>&middot;</span>
        <StatChip value={total_repos} label="repos" />
        <span style={{ color: 'var(--text-secondary)', opacity: 0.3 }}>&middot;</span>
        <StatChip value={recent_streak_days} label="day streak" />
      </motion.div>

      {/* Sign-off */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="font-mono text-center mb-4"
        style={{
          fontSize: '0.75rem',
          fontStyle: 'italic',
          color: 'var(--accent-cyan)',
          textShadow: '0 0 10px rgba(0, 245, 255, 0.2)',
        }}
      >
        {sign_off}
      </motion.p>

      {/* Share + Download buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="mt-auto"
      >
        <ShareButton data={data} />
      </motion.div>
    </div>
  )
}

function StatChip({ value, label }) {
  return (
    <span className="font-mono" style={{ fontSize: '0.75rem' }}>
      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
      {' '}
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </span>
  )
}
