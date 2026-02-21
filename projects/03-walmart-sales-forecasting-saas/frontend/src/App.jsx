import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { FlowProvider } from './context/FlowContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import { useState, useEffect, lazy, Suspense } from 'react'
import { WifiOff, Loader2 } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

// Eager load critical pages
import Landing from './pages/Landing'
import { AuthPage } from './pages/auth'
import AuthCallback from './pages/AuthCallback'

// Lazy load dashboard and feature pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DataUpload = lazy(() => import('./pages/DataUpload'));
const ForecastExplorer = lazy(() => import('./pages/ForecastExplorer'));
const ScenarioSimulator = lazy(() => import('./pages/ScenarioSimulator'));
const Reports = lazy(() => import('./pages/Reports'));
const AnalysisDashboard = lazy(() => import('./pages/AnalysisDashboard'));
const ExecutiveDashboard = lazy(() => import('./pages/ExecutiveDashboard'));
const ScenarioPlanningStudio = lazy(() => import('./pages/ScenarioPlanningStudio'));
const MonitoringDashboard = lazy(() => import('./pages/MonitoringDashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));

import MobileNav from './components/layout/MobileNav'
import BusinessLayout from './components/layout/BusinessLayout'
import ReloadPrompt from './components/common/ReloadPrompt'
import PWAInstallPrompt from './components/pwa/PWAInstallPrompt'
import PWAStatus from './components/pwa/PWAStatus'
import PageTransition from './components/animations/PageTransition'
import EnterpriseErrorBoundary from './components/common/EnterpriseErrorBoundary'
import ApiErrorListener from './components/common/ApiErrorListener'

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-bg-primary">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
      <p className="text-text-secondary font-medium animate-pulse">Loading module...</p>
    </div>
  </div>
);

function App() {
  const location = useLocation();
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
            <EnterpriseErrorBoundary>
              <div className="App premium-bg pb-20 md:pb-0">
                <a href="#main-content" className="skip-link">
                  Skip to main content
                </a>
                <ReloadPrompt />
                <MobileNav />

                {/* Phase 1: PWA Components & Global Listeners */}
                <ApiErrorListener />
                <PWAStatus />
                <PWAInstallPrompt />

                <Suspense fallback={<PageLoader />}>
                  <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                      <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
                      <Route path="/login" element={<PageTransition><AuthPage /></PageTransition>} />
                      <Route path="/register" element={<PageTransition><AuthPage /></PageTransition>} />
                      <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
                      <Route path="/auth/callback" element={<AuthCallback />} />

                      <Route element={<ProtectedRoute><BusinessLayout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                        <Route path="/upload" element={<PageTransition><DataUpload /></PageTransition>} />
                        <Route path="/analysis" element={<PageTransition><AnalysisDashboard /></PageTransition>} />
                        <Route path="/forecast-explorer" element={<PageTransition><ForecastExplorer /></PageTransition>} />
                        <Route path="/scenario-simulator" element={<PageTransition><ScenarioSimulator /></PageTransition>} />
                        <Route path="/reports" element={<PageTransition><Reports /></PageTransition>} />
                        <Route path="/executive" element={<PageTransition><ExecutiveDashboard /></PageTransition>} />
                        <Route path="/scenario-planning" element={<PageTransition><ScenarioPlanningStudio /></PageTransition>} />
                        <Route path="/monitoring" element={<PageTransition><MonitoringDashboard /></PageTransition>} />
                        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
                        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
                      </Route>
                    </Routes>
                  </AnimatePresence>
                </Suspense>
              </div>
            </EnterpriseErrorBoundary>
          </ToastProvider>
        </FlowProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App



