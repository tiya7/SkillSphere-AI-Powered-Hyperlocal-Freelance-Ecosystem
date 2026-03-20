import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import store from './store';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import {
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from './pages/AuthHelperPages';
import { fetchMe } from './store/slices/authSlice';
import './styles/global.css';

// App initializer - checks auth on startup
const AppInitializer = ({ children }) => {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      store.dispatch(fetchMe());
    } else {
      store.dispatch({ type: 'auth/me/rejected' });
    }
  }, []);
  return children;
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id'}>
      <Provider store={store}>
        <AppInitializer>
          <Router>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                },
                success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
                error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
              }}
            />
            <Routes>
              {/* Public only routes (redirect to dashboard if logged in) */}
              <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
              <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
              <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

              {/* Protected dashboard routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />

                {/* Placeholder routes - will be built in Weeks 2-4 */}
                <Route path="gigs/*" element={<ComingSoon title="Gig Marketplace" week={2} />} />
                <Route path="freelancers" element={<ComingSoon title="Find Freelancers" week={2} />} />
                <Route path="proposals" element={<ComingSoon title="My Proposals" week={2} />} />
                <Route path="messages" element={<ComingSoon title="Messages & Chat" week={3} />} />
                <Route path="payments" element={<ComingSoon title="Payments" week={4} />} />
                <Route path="analytics" element={<ComingSoon title="Analytics" week={4} />} />
                <Route path="reviews" element={<ComingSoon title="Reviews" week={3} />} />
                <Route path="notifications" element={<ComingSoon title="Notifications" week={3} />} />
                <Route path="settings" element={<ComingSoon title="Settings" week={4} />} />

                {/* Admin routes */}
                <Route path="admin/*" element={
                  <ProtectedRoute roles={['admin']}>
                    <ComingSoon title="Admin Dashboard" week={4} />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AppInitializer>
      </Provider>
    </GoogleOAuthProvider>
  );
};

// Placeholder for upcoming weeks
const ComingSoon = ({ title, week }) => (
  <div className="page-enter" style={{ textAlign: 'center', paddingTop: '80px' }}>
    <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚧</div>
    <h2 style={{ marginBottom: '8px' }}>{title}</h2>
    <p className="text-muted" style={{ marginBottom: '24px' }}>This module will be built in Week {week}</p>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--brand-50)', border: '1px solid var(--brand-200)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--brand-700)' }}>
      📅 Coming in Week {week}
    </div>
  </div>
);

export default App;
