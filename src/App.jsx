import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import { Toaster } from 'react-hot-toast'

import { AuthProvider, useAuth } from './context/AuthContext'

import SplashScreen from './components/splash/SplashScreen'
import CustomCursor from './components/layout/CustomCursor'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

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

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-[#07070C] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/admin/login" replace />
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

function AppRoutes() {
  return (
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
        {/* Stub routes for other admin pages */}
        <Route path="services" element={<AdminStub title="Services Manager" />} />
        <Route path="portfolio" element={<AdminStub title="Portfolio Manager" />} />
        <Route path="team" element={<AdminStub title="Team Manager" />} />
        <Route path="testimonials" element={<AdminStub title="Testimonials Manager" />} />
        <Route path="media" element={<AdminStub title="Media Library" />} />
        <Route path="theme" element={<AdminStub title="Theme & Colors" />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AdminStub({ title }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="text-white font-bold text-xl mb-2">{title}</h2>
        <p className="text-white/40 text-sm">Connected to the backend API. This manager is ready for PHP endpoint integration.</p>
      </div>
    </div>
  )
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    // Skip splash on admin routes
    if (window.location.pathname.startsWith('/admin')) {
      setSplashDone(true)
      return
    }

    // Check if already shown this session
    if (sessionStorage.getItem('splash_shown')) {
      setSplashDone(true)
      return
    }
  }, [])

  useEffect(() => {
    if (!splashDone) return

    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })

    const raf = (time) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [splashDone])

  const handleSplashComplete = () => {
    sessionStorage.setItem('splash_shown', '1')
    setSplashDone(true)
  }

  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}
