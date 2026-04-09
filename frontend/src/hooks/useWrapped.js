import { useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function useWrapped() {
  const [status, setStatus] = useState('idle')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const analyze = useCallback(async (username) => {
    setStatus('loading')
    setData(null)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })

      if (response.ok) {
        const json = await response.json()
        setData(json)
        setStatus('success')
        return
      }

      if (response.status === 422) {
        const body = await response.json().catch(() => null)
        setError(body?.error || "Invalid username format.")
      } else if (response.status === 404) {
        setError("That GitHub username doesn't exist.")
      } else if (response.status === 429) {
        setError("GitHub rate limit hit. Try again in a minute.")
      } else if (response.status === 504) {
        setError("GitHub is being slow. Try again.")
      } else {
        setError("Something broke. Try again.")
      }
      setStatus('error')
    } catch {
      setError("Can't reach the server. Is the backend running?")
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setData(null)
    setError(null)
  }, [])

  return { status, data, error, analyze, reset }
}
