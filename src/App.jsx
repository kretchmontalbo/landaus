import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth.jsx'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import PropertyDetailPage from './pages/PropertyDetailPage.jsx'
import ListPropertyPage from './pages/ListPropertyPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import SuburbGuidesPage from './pages/SuburbGuidesPage.jsx'
import SuburbDetailPage from './pages/SuburbDetailPage.jsx'
import EditPropertyPage from './pages/EditPropertyPage.jsx'
import AccountSettingsPage from './pages/AccountSettingsPage.jsx'
import GetVerifiedPage from './pages/GetVerifiedPage.jsx'
import PrivacyPage from './pages/PrivacyPage.jsx'
import TermsPage from './pages/TermsPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import PricingPage from './pages/PricingPage.jsx'
import EmailConfirmedPage from './pages/EmailConfirmedPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <div style={{ padding: 64, textAlign: 'center' }}>Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/suburbs" element={<SuburbGuidesPage />} />
          <Route path="/suburbs/:slug" element={<SuburbDetailPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/auth/confirmed" element={<EmailConfirmedPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/list-property" element={
            <ProtectedRoute><ListPropertyPage /></ProtectedRoute>
          } />
          <Route path="/edit-property/:id" element={
            <ProtectedRoute><EditPropertyPage /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute><AccountSettingsPage /></ProtectedRoute>
          } />
          <Route path="/get-verified" element={
            <ProtectedRoute><GetVerifiedPage /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
