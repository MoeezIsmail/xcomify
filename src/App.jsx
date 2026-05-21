import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import { Toaster } from 'react-hot-toast'

import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'

import SplashScreen from './components/splash/SplashScreen'
import CustomCursor from './components/layout/CustomCursor'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ChatWidget from './components/ui/ChatWidget'
import AdvertisementBanner from './components/ui/AdvertisementBanner'

import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Portfolio from './pages/Portfolio'
import Careers from './pages/Careers'
import Contact from './pages/Contact'
import Testimonials from './pages/Testimonials'
import Blog from './pages/Blog'
import Pricing from './pages/Pricing'
import Team from './pages/Team'

import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import ApplicationsManager from './pages/admin/ApplicationsManager'
import InquiriesManager from './pages/admin/InquiriesManager'
import BlogManager from './pages/admin/BlogManager'
import SiteSettings from './pages/admin/SiteSettings'
import PortfolioManager from './pages/admin/PortfolioManager'
import TeamManager from './pages/admin/TeamManager'
import TestimonialsManager from './pages/admin/TestimonialsManager'
import ServicesManager from './pages/admin/ServicesManager'
import AdvertisementManager from './pages/admin/AdvertisementManager'
import ProposalManager from './pages/admin/ProposalManager'
import MediaLibrary from './pages/admin/MediaLibrary'
import NotificationLog from './pages/admin/NotificationLog'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-[#07070C] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/admin/login" replace />
}

function MaintenancePage() {
  const { settings } = useSettings()
  return (
    <div className="min-h-screen bg-[#07070C] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(0,212,255,0.4)]">
          <span className="text-white font-black text-2xl" style={{ fontFamily: 'Syne, sans-serif' }}>⚙</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
          Under Maintenance
        </h1>
        <p className="text-white/50 text-base leading-relaxed">
          {settings.tagline || 'Premium eCommerce Management'} — we are making improvements and will be back shortly.
        </p>
      </div>
    </div>
  )
}

function PublicLayout({ children }) {
  const { settings } = useSettings()
  const isMaintenance = settings.maintenance_mode === '1' || settings.maintenance_mode === true
  if (isMaintenance) return <MaintenancePage />
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

function PublicWidgets() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  if (isAdmin) return null
  return (
    <>
      <ChatWidget />
      <AdvertisementBanner />
    </>
  )
}

function AppRoutes() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const rafRef = useRef(null)

  useEffect(() => {
    if (isAdmin) return

    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
    const raf = (time) => {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }
    rafRef.current = requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      cancelAnimationFrame(rafRef.current)
    }
  }, [isAdmin])

  return (
    <>
      <PublicWidgets />
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
        <Route path="/portfolio" element={<PublicLayout><Portfolio /></PublicLayout>} />
        <Route path="/careers" element={<PublicLayout><Careers /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/testimonials" element={<PublicLayout><Testimonials /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
        <Route path="/team" element={<PublicLayout><Team /></PublicLayout>} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="applications" element={<ApplicationsManager />} />
          <Route path="inquiries" element={<InquiriesManager />} />
          <Route path="blog" element={<BlogManager />} />
          <Route path="settings" element={<SiteSettings />} />
          <Route path="services" element={<ServicesManager />} />
          <Route path="portfolio" element={<PortfolioManager />} />
          <Route path="team" element={<TeamManager />} />
          <Route path="testimonials" element={<TestimonialsManager />} />
          <Route path="advertisements" element={<AdvertisementManager />} />
          <Route path="proposals" element={<ProposalManager />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="notifications" element={<NotificationLog />} />
          <Route path="theme" element={<AdminStub title="Theme & Colors" />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

function AdminStub({ title }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="text-white font-bold text-xl mb-2">{title}</h2>
        <p className="text-white/40 text-sm">This manager is coming soon.</p>
      </div>
    </div>
  )
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) {
      setSplashDone(true)
      return
    }
    if (sessionStorage.getItem('splash_shown')) {
      setSplashDone(true)
      return
    }
  }, [])

  const handleSplashComplete = () => {
    sessionStorage.setItem('splash_shown', '1')
    setSplashDone(true)
  }

  return (
    <AuthProvider>
      <SettingsProvider>
      <BrowserRouter>
        <CustomCursor />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#111118', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }
        }} />

        <AnimatePresence>
          {!splashDone && (
            <SplashScreen onComplete={handleSplashComplete} />
          )}
        </AnimatePresence>

        {splashDone && <AppRoutes />}
      </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  )
}
