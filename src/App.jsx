import { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoadingScreen from './screens/LoadingScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import GardenScreen from './screens/GardenScreen';
import PlotDetailScreen from './screens/PlotDetailScreen';
import CompostHeapScreen from './screens/CompostHeapScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomNav from './components/BottomNav';

function AppShell() {
  const { state } = useApp();
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('garden');
  const [plotId, setPlotId] = useState(null);

  const handleLoadingDone = useCallback(() => setLoading(false), []);

  const navigateTo = useCallback(s => {
    setScreen(s);
    setPlotId(null);
  }, []);

  const openPlot = useCallback(id => {
    setPlotId(id);
    setScreen('plot');
  }, []);

  const backToGarden = useCallback(() => {
    setPlotId(null);
    setScreen('garden');
  }, []);

  if (loading) {
    return <LoadingScreen onDone={handleLoadingDone} />;
  }

  if (!state.settings.onboarded) {
    return <OnboardingScreen />;
  }

  const showNav = screen !== 'plot';

  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {screen === 'garden'  && <GardenScreen onPlotTap={openPlot} />}
        {screen === 'plot'    && <PlotDetailScreen categoryId={plotId} onBack={backToGarden} />}
        {screen === 'compost' && <CompostHeapScreen />}
        {screen === 'settings'&& <SettingsScreen />}
      </div>
      {showNav && (
        <BottomNav screen={screen} onNavigate={navigateTo} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
