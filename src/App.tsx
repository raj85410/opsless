import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SearchProvider } from './contexts/SearchContext';
import { AWSProvider } from './contexts/AWSContext';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';


// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
// const Help = lazy(() => import('./pages/Help'));
const Login = lazy(() => import('./components/Auth/Login'));
const Signup = lazy(() => import('./components/Auth/Signup'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const MonitoringDashboard = lazy(() => import('./components/Dashboard/MonitoringDashboard'));

// ✅ Make sure this file exists: src/components/Logs/LogViewer.tsx
const LogViewer = lazy(() => import('./components/Logs/LogViewer'));

const PipelineLogsDemo = lazy(() => import('./pages/PipelineLogsDemo'));
const ChatBot = lazy(() => import('./components/Chat/ChatBot'));
const CredentialsSetup = lazy(() => import('./components/Credentials/CredentialsSetup'));
const AWSCredentialsSetup = lazy(() => import('./components/AWSCredentialsSetup'));
const AWSServicesManager = lazy(() => import('./components/AWS/AWSServicesManager'));
const PaymentCards = lazy(() => import('./components/Payment/PaymentCards'));
const ProjectCreator = lazy(() => import('./components/Projects/ProjectCreator'));
const Profile = lazy(() => import('./pages/Profile'));
const Support = lazy(() => import('./pages/Support'));
const HelpNew = lazy(() => import('./pages/HelpNew'));
const DevOpsAssistant = lazy(() => import('./components/AI/DevOpsAssistant'));
const QuickLinksTest = lazy(() => import('./components/Support/QuickLinksTest'));
const Pricing = lazy(() => import('./pages/Pricing'));

// Spinner while loading lazy components
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public route wrapper
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  return !currentUser ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Main content
function AppContent() {
  const { currentUser } = useAuth();

  return (
    <div className="App">
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
<Route path="/about" element={<About />} />
<Route path="/help" element={<HelpNew />} />
<Route path="/pricing" element={<Pricing />} />

            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />

            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } 
            />

            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/monitoring" 
              element={
                <ProtectedRoute>
                  <MonitoringDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/logs" 
              element={
                <ProtectedRoute>
                  <LogViewer />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/pipeline-logs" 
              element={
                <ProtectedRoute>
                  <PipelineLogsDemo />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/credentials" 
              element={
                <ProtectedRoute>
                  <CredentialsSetup />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/aws-credentials" 
              element={
                <ProtectedRoute>
                  <AWSCredentialsSetup />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/aws-services" 
              element={
                <ProtectedRoute>
                  <AWSServicesManager />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/payment" 
              element={<PaymentCards />} 
            />

            <Route 
              path="/projects/new" 
              element={
                <ProtectedRoute>
                  <ProjectCreator />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/support" 
              element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/test-links" 
              element={
                <ProtectedRoute>
                  <QuickLinksTest />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/ai-assistant" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50 py-8">
                    <div className="max-w-4xl mx-auto px-4">
                      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">DevOps AI Assistant</h1>
                      <DevOpsAssistant />
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>

      {/* ChatBot only visible if authenticated */}
      {currentUser && <ChatBot />}

      {/* Toasts */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

// Root App
function App() {
  return (
    <Router>
      <AuthProvider>
        <SearchProvider>
          <AWSProvider>
            <AppContent />
          </AWSProvider>
        </SearchProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
