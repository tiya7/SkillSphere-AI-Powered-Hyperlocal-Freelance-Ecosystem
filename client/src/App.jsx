import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { fetchMe } from './store/slices/authSlice';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from './pages/AuthHelperPages';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import GigMarketplacePage from './pages/GigMarketplacePage';
import CreateGigPage from './pages/CreateGigPage';
import GigDetailPage from './pages/GigDetailPage';
import MyProposalsPage from './pages/MyProposalsPage';
import MyGigsPage from './pages/MyGigsPage';
import FreelancerSearchPage from './pages/FreelancerSearchPage';
import MessagesPage from './pages/MessagesPage';
import ReviewsPage from './pages/ReviewsPage';
import NotificationsPage from './pages/NotificationsPage';
import PaymentsPage from './pages/PaymentsPage';
import DisputesPage from './pages/DisputesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

import './styles/global.css';

const AppInitializer = ({ children }) => {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) store.dispatch(fetchMe());
    else store.dispatch({ type: 'auth/me/rejected' });
  }, []);
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
    <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
    <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
    <Route path="/reset-password/:token" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />
    <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

    {/* Protected */}
    <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="/dashboard" replace />} />

      {/* Week 1 */}
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="profile" element={<ProfilePage />} />

      {/* Week 2 */}
      <Route path="gigs" element={<GigMarketplacePage />} />
      <Route path="gigs/create" element={<CreateGigPage />} />
      <Route path="gigs/:id" element={<GigDetailPage />} />
      <Route path="my-gigs" element={<MyGigsPage />} />
      <Route path="proposals" element={<MyProposalsPage />} />
      <Route path="freelancers" element={<FreelancerSearchPage />} />

      {/* Week 3 */}
      <Route path="messages" element={<MessagesPage />} />
      <Route path="reviews" element={<ReviewsPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />

      {/* Week 4 */}
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="disputes" element={<DisputesPage />} />
      <Route path="settings" element={<SettingsPage />} />

      {/* Admin */}
      <Route path="admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="admin/users" element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App = () => (
  <Provider store={store}>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || 'placeholder'}>
      <Router>
        <AppInitializer>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{
            style: { fontFamily: 'var(--font-body)', fontSize: 14, borderRadius: 10 },
            success: { iconTheme: { primary: '#16a34a', secondary: 'white' } },
            error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
          }} />
        </AppInitializer>
      </Router>
    </GoogleOAuthProvider>
  </Provider>
);

export default App;
