import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import CardDNA from './cards/CardDNA'
import CardHours from './cards/CardHours'
import CardStreak from './cards/CardStreak'
import CardVibe from './cards/CardVibe'
import CardFinal from './cards/CardFinal'

const CARD_COUNT = 5

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
  }),
}

export default function CardDeck({ data, onReset }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const hasNavigated = useRef(false)

  const goTo = useCallback((newIndex, dir) => {
    if (newIndex < 0 || newIndex >= CARD_COUNT) return
    setDirection(dir)
    setActiveIndex(newIndex)
    hasNavigated.current = true
  }, [])

  const goNext = useCallback(() => {
    if (activeIndex < CARD_COUNT - 1) goTo(activeIndex + 1, 1)
  }, [activeIndex, goTo])

  const goPrev = useCallback(() => {
    if (activeIndex > 0) goTo(activeIndex - 1, -1)
  }, [activeIndex, goTo])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev])

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: goNext,
    onSwipedRight: goPrev,
    preventScrollOnSwipe: true,
    trackMouse: false,
    delta: 30,
  })

  const CARDS = [
    <CardDNA key="dna" data={data} isActive={activeIndex === 0} />,
    <CardHours key="hours" data={data} isActive={activeIndex === 1} />,
    <CardStreak key="streak" data={data} isActive={activeIndex === 2} />,
    <CardVibe key="vibe" data={data} isActive={activeIndex === 3} />,
    <CardFinal key="final" data={data} isActive={activeIndex === 4} />,
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-screen px-4 py-8 relative z-10"
      {...swipeHandlers}
    >
      {/* Back button */}
      {onReset && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onReset}
          className="absolute top-6 left-6 font-mono flex items-center gap-1.5"
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          New lookup
        </motion.button>
      )}

      {/* Card area */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: '100%', maxWidth: '480px', height: '640px' }}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.25 },
              scale: { duration: 0.25 },
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {CARDS[activeIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation area */}
      <div className="flex flex-col items-center gap-4 mt-6">
        {/* Dot indicators */}
        <div className="flex items-center gap-3">
          {Array.from({ length: CARD_COUNT }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > activeIndex ? 1 : -1)}
              className={`dot ${i === activeIndex ? 'dot-active' : ''}`}
              style={{ border: 'none', cursor: 'pointer', padding: 0 }}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>

        {/* Arrow hint — only show briefly if user hasn't navigated yet */}
        {!hasNavigated.current && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ delay: 1.5, duration: 0.4 }}
            className="font-mono"
            style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}
          >
            Swipe or use arrow keys to navigate
          </motion.p>
        )}

        {/* Card counter */}
        <p
          className="font-mono"
          style={{
            fontSize: '0.65rem',
            color: 'var(--text-secondary)',
            opacity: 0.5,
          }}
        >
          {activeIndex + 1} / {CARD_COUNT}
        </p>
      </div>
    </motion.div>
  )
}
