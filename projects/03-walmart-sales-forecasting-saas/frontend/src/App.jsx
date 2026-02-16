import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { FlowProvider } from './context/FlowContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthPage } from './pages/auth'
import Dashboard from './pages/Dashboard'
import DataUpload from './pages/DataUpload'
import ForecastExplorer from './pages/ForecastExplorer'
import ScenarioSimulator from './pages/ScenarioSimulator'
import Reports from './pages/Reports'
import AnalysisDashboard from './pages/AnalysisDashboard'
import ExecutiveDashboard from './pages/ExecutiveDashboard'
import ScenarioPlanningStudio from './pages/ScenarioPlanningStudio'
import MobileNav from './components/layout/MobileNav'


import AuthCallback from './pages/AuthCallback'
import ReloadPrompt from './components/common/ReloadPrompt'
import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <FlowProvider>
          <ToastProvider>
            <div className="App premium-bg pb-20 md:pb-0">
              <ReloadPrompt />
              <MobileNav />
              {isOffline && (
                <div className="bg-red-600 text-white text-xs font-bold text-center py-1 fixed top-0 w-full z-[100]">
                  <div className="flex items-center justify-center gap-2">
                    <WifiOff className="w-3 h-3" />
                    OFFLINE MODE - Changes may not save
                  </div>
                </div>
              )}
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
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
          </ToastProvider>
        </FlowProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App



