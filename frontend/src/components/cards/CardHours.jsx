import { motion } from 'framer-motion'

export default function CardHours({ data, isActive }) {
  const { peak_hour, peak_period_label, cards } = data
  const { headline, subtext } = cards.hours

  const histogram = data.hour_histogram || generateApproxHistogram(peak_hour)
  const totalCommits = histogram.reduce((a, b) => a + b, 0)
  const maxCount = Math.max(...histogram, 1)

  return (
    <div className="card" id="card-2">
      {/* Card number tag */}
      <div className="flex items-center gap-2 mb-4">
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
          Peak Hours
        </span>
      </div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="headline-lg mb-5"
        style={{ color: 'var(--text-primary)' }}
      >
        {headline}
      </motion.h2>

      {/* 24-bar histogram */}
      {totalCommits > 0 ? (
        <>
          <div className="flex-1 flex flex-col justify-center">
            <div
              className="flex items-end justify-between gap-[3px]"
              style={{ height: '160px', padding: '0 2px' }}
            >
              {histogram.map((count, hour) => {
                const isPeak = hour === peak_hour
                const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0
                const minHeight = count > 0 ? 4 : 2

                return (
                  <motion.div
                    key={hour}
                    className="flex-1 rounded-t-sm relative"
                    initial={{ height: minHeight }}
                    animate={
                      isActive
                        ? { height: `${Math.max(heightPercent, (minHeight / 160) * 100)}%` }
                        : { height: minHeight }
                    }
                    transition={{
                      duration: 0.6,
                      delay: 0.15 + hour * 0.03,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    style={{
                      background: isPeak ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.12)',
                      boxShadow: isPeak
                        ? '0 0 12px var(--accent-cyan), 0 0 24px rgba(0, 245, 255, 0.3)'
                        : 'none',
                      minHeight: `${minHeight}px`,
                    }}
                  />
                )
              })}
            </div>

            {/* Hour labels (show every 6th) */}
            <div className="flex justify-between mt-2 px-[2px]">
              {[0, 6, 12, 18, 23].map((h) => (
                <span
                  key={h}
                  className="font-mono"
                  style={{
                    fontSize: '0.55rem',
                    color: h === peak_hour ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    opacity: h === peak_hour ? 1 : 0.5,
                  }}
                >
                  {h.toString().padStart(2, '0')}
                </span>
              ))}
            </div>
          </div>

          {/* Peak period label — big and confident */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="text-center my-4"
          >
            <p
              className="font-display font-bold"
              style={{
                fontSize: '1.6rem',
                color: 'var(--accent-cyan)',
                textShadow: '0 0 20px rgba(0, 245, 255, 0.4)',
              }}
            >
              {peak_period_label}
            </p>
            <p className="font-mono mt-1" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Peak activity at {peak_hour.toString().padStart(2, '0')}:00 UTC
            </p>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex-1 flex flex-col items-center justify-center gap-3"
        >
          <span style={{ fontSize: '2.5rem' }}>
            {'\u{1F570}\uFE0F'}
          </span>
          <p
            className="font-mono text-center"
            style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
          >
            No commit timestamps found this year.
            <br />
            The clock is still waiting.
          </p>
        </motion.div>
      )}

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 1.1 }}
        className="subtext mt-auto pt-4"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
      >
        {subtext}
      </motion.p>
    </div>
  )
}

function generateApproxHistogram(peakHour) {
  const hist = new Array(24).fill(0)
  for (let h = 0; h < 24; h++) {
    const dist = Math.min(Math.abs(h - peakHour), 24 - Math.abs(h - peakHour))
    hist[h] = Math.max(0, Math.round(20 * Math.exp(-0.3 * dist) + Math.random() * 3))
  }
  hist[peakHour] = 25
  return hist
}
