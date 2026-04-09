import { motion } from 'framer-motion'

export default function CardVibe({ data, isActive }) {
  const { cards, commit_messages_sample } = data
  const { headline, subtext } = cards.vibe
  const messages = (commit_messages_sample || []).slice(0, 5)

  return (
    <div className="card" id="card-4">
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
          Commit Vibe
        </span>
      </div>

      {/* Pull-quote section */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Decorative opening quote mark */}
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display font-extrabold select-none leading-none"
          style={{
            fontSize: '5rem',
            color: 'var(--accent-magenta)',
            textShadow: '0 0 30px rgba(255, 0, 110, 0.4), 0 0 60px rgba(255, 0, 110, 0.15)',
            lineHeight: '0.6',
            marginBottom: '-0.2rem',
          }}
        >
          &ldquo;
        </motion.span>

        {/* Main headline as pull-quote */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-display font-bold"
          style={{
            fontSize: '1.5rem',
            lineHeight: 1.25,
            color: 'var(--text-primary)',
            paddingLeft: '0.25rem',
          }}
        >
          {headline}
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="subtext mt-4"
          style={{ paddingLeft: '0.25rem' }}
        >
          {subtext}
        </motion.p>

        {/* Actual commit messages as pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-wrap gap-2 mt-6"
        >
          {messages.length > 0 ? (
            messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.3, delay: 0.7 + i * 0.08 }}
                className="pill"
              >
                <span style={{ color: 'var(--accent-cyan)', marginRight: '6px', opacity: 0.6 }}>$</span>
                {msg}
              </motion.div>
            ))
          ) : (
            <p
              className="font-mono"
              style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.5 }}
            >
              No commit messages to display.
            </p>
          )}
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isActive ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, var(--accent-magenta), transparent)',
          transformOrigin: 'left',
          marginTop: 'auto',
          opacity: 0.3,
        }}
      />
    </div>
  )
}
