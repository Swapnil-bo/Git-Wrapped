import { AnimatePresence } from 'framer-motion'
import useWrapped from './hooks/useWrapped'
import LandingInput from './components/LandingInput'
import LoadingScreen from './components/LoadingScreen'
import CardDeck from './components/CardDeck'

function App() {
  const { status, data, error, analyze, reset } = useWrapped()

  return (
    <>
      <div className="noise-overlay" />
      <div className="scanline-overlay" />
      <div className="ambient-glow" />
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <LandingInput key="landing" onSubmit={analyze} />
        )}
        {status === 'loading' && (
          <LoadingScreen key="loading" />
        )}
        {status === 'error' && (
          <LandingInput key="error" onSubmit={analyze} error={error} />
        )}
        {status === 'success' && data && (
          <CardDeck key="cards" data={data} onReset={reset} />
        )}
      </AnimatePresence>
    </>
  )
}

export default App
