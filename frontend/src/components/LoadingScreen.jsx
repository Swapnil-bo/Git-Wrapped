import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const QUIPS = [
  "Judging your commit frequency...",
  "Counting your 2AM regrets...",
  "Analyzing commit messages for trauma...",
  "Asking Groq what kind of developer you are...",
  "Calculating your main character arc...",
  "Reading between the git diffs...",
  "Summoning your coder archetype...",
  "Checking if your streak is real or coping...",
  "Parsing the vibes. The vibes are chaotic.",
]

export default function LoadingScreen() {
  const [quipIndex, setQuipIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setQuipIndex((prev) => (prev + 1) % QUIPS.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 relative z-10"
    >
      {/* Pulsing orb */}
      <div className="relative mb-12">
        {/* Outer glow ring */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full"
          style={{
            width: '120px',
            height: '120px',
            top: '-20px',
            left: '-20px',
            background: 'radial-gradient(circle, var(--accent-cyan) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />

        {/* Middle glow ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
          className="absolute inset-0 rounded-full"
          style={{
            width: '80px',
            height: '80px',
            background: 'radial-gradient(circle, var(--accent-cyan) 0%, transparent 70%)',
            filter: 'blur(10px)',
          }}
        />

        {/* Core dot */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            boxShadow: [
              '0 0 20px var(--accent-cyan), 0 0 40px rgba(0, 245, 255, 0.3)',
              '0 0 30px var(--accent-cyan), 0 0 60px rgba(0, 245, 255, 0.5)',
              '0 0 20px var(--accent-cyan), 0 0 40px rgba(0, 245, 255, 0.3)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative rounded-full"
          style={{
            width: '80px',
            height: '80px',
            background: 'radial-gradient(circle at 35% 35%, rgba(0, 245, 255, 0.25), rgba(0, 245, 255, 0.08) 60%, transparent)',
            border: '1px solid rgba(0, 245, 255, 0.3)',
          }}
        />

        {/* Orbiting particle 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute"
          style={{ width: '80px', height: '80px', top: 0, left: 0 }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: '6px',
              height: '6px',
              top: '-8px',
              left: '37px',
              background: 'var(--accent-cyan)',
              boxShadow: '0 0 8px var(--accent-cyan)',
            }}
          />
        </motion.div>

        {/* Orbiting particle 2 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          className="absolute"
          style={{ width: '80px', height: '80px', top: 0, left: 0 }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: '4px',
              height: '4px',
              bottom: '-12px',
              left: '38px',
              background: 'var(--accent-magenta)',
              boxShadow: '0 0 6px var(--accent-magenta)',
            }}
          />
        </motion.div>
      </div>

      {/* Analyzing label */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="label-caps mb-6"
        style={{ color: 'var(--accent-cyan)' }}
      >
        Unwrapping
      </motion.p>

      {/* Rotating quips */}
      <div style={{ height: '28px', position: 'relative', width: '100%', maxWidth: '400px' }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={quipIndex}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.3 }}
            className="font-mono text-center absolute inset-x-0"
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            {QUIPS[quipIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-10">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
            className="rounded-full"
            style={{
              width: '6px',
              height: '6px',
              background: 'var(--accent-cyan)',
              boxShadow: '0 0 8px rgba(0, 245, 255, 0.4)',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
