import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Destinations from './pages/Destinations'
import MapView from './pages/MapView'
import Trips from './pages/Trips'
import Budget from './pages/Budget'

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/budget" element={<Budget />} />
        </Routes>
      </main>
    </div>
  )
}
