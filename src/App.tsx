import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/dashboard'
import SystemInfo from './pages/system-info'
import Timer from './pages/timer'

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/system-info" element={<SystemInfo />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  )
}

export default App
