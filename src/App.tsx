import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { Dashboard } from './pages/Dashboard'
import { CompanyPage } from './pages/CompanyPage'
import { HeroPage } from './pages/HeroPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { PropertiesPage } from './pages/PropertiesPage'
import { LocationsPage } from './pages/LocationsPage'
import { WhyChoosePage } from './pages/WhyChoosePage'
import { ReviewsPage } from './pages/ReviewsPage'
import { CareersPage } from './pages/CareersPage'
import { VisitSectionPage } from './pages/VisitSectionPage'
import { EmailSettingsPage } from './pages/EmailSettingsPage'
import { AssociatesPage } from './pages/AssociatesPage'
import { BookingsPage } from './pages/BookingsPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="company" element={<CompanyPage />} />
          <Route path="hero" element={<HeroPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="why-choose" element={<WhyChoosePage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="careers" element={<CareersPage />} />
          <Route path="visit-section" element={<VisitSectionPage />} />
          <Route path="email-settings" element={<EmailSettingsPage />} />
          <Route path="associates" element={<AssociatesPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
