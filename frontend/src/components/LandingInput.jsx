import { useState } from 'react'
import { motion } from 'framer-motion'

export default function LandingInput({ onSubmit, error }) {
  const [username, setUsername] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = username.trim()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 relative z-10"
    >
      {/* Decorative top accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        className="w-16 h-[2px] mb-8"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)',
          boxShadow: '0 0 12px var(--accent-cyan)',
        }}
      />

      {/* Pre-title label */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="label-caps mb-4"
        style={{ color: 'var(--accent-cyan)' }}
      >
        Your year in code
      </motion.p>

      {/* Main headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        className="font-display font-extrabold text-center leading-none mb-3"
        style={{
          fontSize: 'clamp(3rem, 10vw, 5.5rem)',
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
        }}
      >
        Git{' '}
        <span
          className="text-glow-cyan"
          style={{ color: 'var(--accent-cyan)' }}
        >
          Wrapped
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="font-mono text-center mb-10"
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          maxWidth: '360px',
          lineHeight: 1.6,
        }}
      >
        Like Spotify Wrapped, but for your GitHub.
        <br />
        Shareable. Roastable. Viral.
      </motion.p>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 w-full"
        style={{ maxWidth: '380px' }}
      >
        <div className="relative w-full">
          {/* GitHub icon in input */}
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username"
            maxLength={39}
            className="input-glow"
            style={{ paddingLeft: '2.75rem' }}
            autoComplete="off"
            spellCheck="false"
            autoFocus
          />
        </div>

        <motion.button
          type="submit"
          disabled={!username.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary btn-cyan w-full"
          style={{
            opacity: username.trim() ? 1 : 0.4,
            cursor: username.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Unwrap
        </motion.button>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-center w-full"
            style={{
              fontSize: '0.8rem',
              color: 'var(--accent-magenta)',
              textShadow: '0 0 10px rgba(255, 0, 110, 0.3)',
            }}
          >
            {error}
          </motion.p>
        )}
      </motion.form>

      {/* Bottom decorative element */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="font-mono mt-12"
        style={{
          fontSize: '0.65rem',
          color: 'var(--text-secondary)',
          opacity: 0.4,
        }}
      >
        Built for the developers who ship at 2AM
      </motion.p>
    </motion.div>
  )
}
