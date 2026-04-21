import { motion } from 'framer-motion'

export default function CardDNA({ data, isActive }) {
  const { top_languages, cards } = data
  const { headline, subtext } = cards.dna

  return (
    <div className="card" id="card-1">
      {/* Card number tag */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="rounded-full"
          style={{
            width: '6px',
            height: '6px',
            background: 'var(--accent-green)',
            boxShadow: '0 0 8px var(--accent-green)',
          }}
        />
        <span className="label-caps" style={{ color: 'var(--accent-green)', letterSpacing: '0.15em' }}>
          Coder DNA
        </span>
      </div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="headline-lg mb-6"
        style={{ color: 'var(--text-primary)' }}
      >
        {headline}
      </motion.h2>

      {/* Language bars */}
      <div className="flex flex-col gap-3 flex-1">
        {top_languages.length > 0 ? (
          top_languages.map((lang, i) => (
            <motion.div
              key={lang.name}
              initial={{ opacity: 0, x: -20 }}
              animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
            >
              {/* Label row */}
              <div className="flex justify-between items-center mb-1.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="rounded-full flex-shrink-0"
                    style={{
                      width: '8px',
                      height: '8px',
                      background: lang.color,
                      boxShadow: `0 0 6px ${lang.color}`,
                    }}
                  />
                  <span
                    className="font-mono truncate"
                    style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}
                  >
                    {lang.name}
                  </span>
                </div>
                <span
                  className="font-mono flex-shrink-0"
                  style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                >
                  {lang.percent}%
                </span>
              </div>

              {/* Bar track */}
              <div
                className="relative rounded-full overflow-hidden"
                style={{
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Bar fill — animates from 0 to actual width only when active */}
                <motion.div
                  initial={{ width: '0%' }}
                  animate={isActive ? { width: `${lang.percent}%` } : { width: '0%' }}
                  transition={{
                    duration: 0.8,
                    delay: 0.4 + i * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${lang.color}, ${lang.color}cc)`,
                    boxShadow: `0 0 12px ${lang.color}66`,
                  }}
                />
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center justify-center flex-1 gap-3"
          >
            <span style={{ fontSize: '2.5rem' }}>
              {'\u{1F4AD}'}
            </span>
            <p
              className="font-mono text-center"
              style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
            >
              No public code detected.
              <br />
              Your DNA remains a mystery.
            </p>
          </motion.div>
        )}
      </div>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="subtext mt-auto pt-4"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {subtext}
      </motion.p>
    </div>
  )
}
