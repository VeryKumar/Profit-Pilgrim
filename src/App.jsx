import { useEffect } from 'react'
import './App.css'
import MainLayout from './components/MainLayout'
import { StageProvider } from './contexts/StageContext'
import { useStore } from './stores/store'

function App() {
  const tickIdle = useStore(state => state.tickIdle)
  const updateBusinesses = useStore(state => state.updateBusinesses)

  useEffect(() => {
    // Setup idle ticker and business state updater
    const interval = setInterval(() => {
      const now = Date.now();
      tickIdle(now);
      // Only update business UI states, doesn't auto-collect profits anymore
      updateBusinesses();
    }, 100); // More frequent updates for smoother UI

    return () => clearInterval(interval);
  }, [tickIdle, updateBusinesses]);

  return (
    <StageProvider>
      <MainLayout />
    </StageProvider>
  )
}

export default App
