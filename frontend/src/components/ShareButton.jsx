import { useState } from 'react'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'

export default function ShareButton({ data }) {
  const [downloading, setDownloading] = useState(false)

  const {
    username,
    archetype_title,
    archetype_subtitle,
    total_commits,
    recent_streak_days,
    top_languages,
  } = data

  const topLanguage = top_languages.length > 0 ? top_languages[0].name : 'code'

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const el = document.getElementById('final-card')
      if (!el) return
      const canvas = await html2canvas(el, {
        useCORS: true,
        scale: 2,
        logging: false,
        backgroundColor: '#0A0A0F',
      })
      const link = document.createElement('a')
      link.download = `git-wrapped-${username}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      // Silently fail — don't crash the UI
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = () => {
    const tweetText = `My GitHub Wrapped just dropped \u{1F440}

"${archetype_title}" \u2014 ${archetype_subtitle}

~${total_commits} commits \u00b7 ${recent_streak_days} day streak \u00b7 mostly ${topLanguage}

Try yours \u2192 gitwrapped.app
#GitWrapped #100DaysOfCode`

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex gap-3 w-full">
        {/* Share on X */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          className="btn-primary btn-cyan flex-1 flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </motion.button>

        {/* Download PNG */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary btn-outline flex-1 flex items-center justify-center gap-2"
        >
          {downloading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </motion.div>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
          {downloading ? 'Saving...' : 'Download PNG'}
        </motion.button>
      </div>

      {/* Tooltip about attaching to tweet */}
      <p
        className="font-mono text-center"
        style={{
          fontSize: '0.6rem',
          color: 'var(--text-secondary)',
          opacity: 0.5,
        }}
      >
        Download the card and attach it to your tweet for full effect
      </p>
    </div>
  )
}
