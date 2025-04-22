import { useEffect } from 'react'
import './App.css'
import MainLayout from './components/MainLayout'
import { StageProvider } from './contexts/StageContext'
import { useStore } from './stores/store'

function App() {
  const tickIdle = useStore(state => state.tickIdle)
  const updateBusinesses = useStore(state => state.updateBusinesses)

  useEffect(() => {
    // Setup idle ticker
    const interval = setInterval(() => {
      const now = Date.now();
      tickIdle(now);
      updateBusinesses();
    }, 1000);

    return () => clearInterval(interval);
  }, [tickIdle, updateBusinesses]);

  return (
    <StageProvider>
      <MainLayout />
    </StageProvider>
  )
}

export default App
