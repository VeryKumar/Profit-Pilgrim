import { useEffect } from 'react'
import './App.css'
import MainLayout from './components/MainLayout'
import { StageProvider } from './contexts/StageContext'
import { useDispatch } from 'react-redux'
import { tickIdleThunk } from './slices/clickerSlice'
import { updateBusinesses } from './slices/businessSlice'
import { Provider } from 'react-redux'
import store from './slices/store'

function GameContainer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Setup idle ticker and business state updater
    const interval = setInterval(() => {
      const now = Date.now();
      dispatch(tickIdleThunk(now));
      // Update business timers and auto-collect via managers
      dispatch(updateBusinesses());
    }, 100); // More frequent updates for smoother UI

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <StageProvider>
      <MainLayout />
    </StageProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <GameContainer />
    </Provider>
  );
}

export default App;
