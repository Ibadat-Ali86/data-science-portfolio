import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { FlowProvider } from './context/FlowContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DataUpload from './pages/DataUpload'
import ForecastExplorer from './pages/ForecastExplorer'
import ScenarioSimulator from './pages/ScenarioSimulator'
import Reports from './pages/Reports'
import AnalysisDashboard from './pages/AnalysisDashboard'
import ExecutiveDashboard from './pages/ExecutiveDashboard'
import ScenarioPlanningStudio from './pages/ScenarioPlanningStudio'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FlowProvider>
          <div className="App premium-bg">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><DataUpload /></ProtectedRoute>} />
              <Route path="/analysis" element={<ProtectedRoute><AnalysisDashboard /></ProtectedRoute>} />
              <Route path="/forecast-explorer" element={<ProtectedRoute><ForecastExplorer /></ProtectedRoute>} />
              <Route path="/scenario-simulator" element={<ProtectedRoute><ScenarioSimulator /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/executive" element={<ProtectedRoute><ExecutiveDashboard /></ProtectedRoute>} />
              <Route path="/scenario-planning" element={<ProtectedRoute><ScenarioPlanningStudio /></ProtectedRoute>} />
            </Routes>
          </div>
        </FlowProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App



