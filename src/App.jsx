import { useEffect, useState } from 'react'
import SplashScreen from './components/SplashScreen.jsx'
import AdvanceScreen from './components/AdvanceScreen.jsx'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) return <SplashScreen />

  return <AdvanceScreen onAdvance={() => alert('Avançar clicado!')} />
}
