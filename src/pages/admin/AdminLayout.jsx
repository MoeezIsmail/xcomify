import { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, MessageSquare, FileText, Briefcase,
  Star, Image, Settings, LogOut, Menu, X, Globe, Palette,
  Package, ChevronRight, Bell, Megaphone, Wand2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Applications', href: '/admin/applications', icon: Users },
  { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { label: 'Blog Manager', href: '/admin/blog', icon: FileText },
  { label: 'Services', href: '/admin/services', icon: Briefcase },
  { label: 'Portfolio', href: '/admin/portfolio', icon: Package },
  { label: 'Team', href: '/admin/team', icon: Users },
  { label: 'Testimonials', href: '/admin/testimonials', icon: Star },
  { label: 'Advertisements', href: '/admin/advertisements', icon: Megaphone },
  { label: 'Proposals', href: '/admin/proposals', icon: Wand2 },
  { label: 'Media Library', href: '/admin/media', icon: Image },
  { label: 'Site Settings', href: '/admin/settings', icon: Globe },
  { label: 'Theme & Colors', href: '/admin/theme', icon: Palette },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="h-screen overflow-hidden bg-[#07070C] flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-[#0A0A0F] border-r border-white/8 flex flex-col z-50"
          >
            {/* Brand */}
            <div className="p-5 border-b border-white/8">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] flex items-center justify-center">
                  <span className="text-white font-black text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>X</span>
                </div>
                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                  x<span className="text-[#00D4FF]">Comify</span>
                  <span className="text-white/30 ml-1 font-normal text-xs">Admin</span>
                </span>
              </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto p-3">
              <div className="flex flex-col gap-0.5">
                {navItems.map((item) => {
                  const active = location.pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                        active
                          ? 'bg-[#00D4FF]/12 text-[#00D4FF] border border-[#00D4FF]/20'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon size={16} />
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight size={12} />}
                    </Link>
                  )
                })}
              </div>
            </nav>

            {/* User */}
            <div className="p-3 border-t border-white/8">
              <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white font-bold text-xs">
                  {user?.name?.[0] || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-semibold truncate">{user?.name || 'Admin'}</div>
                  <div className="text-white/30 text-xs truncate">{user?.email || ''}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-400/8 transition-all"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-14 flex items-center px-6 border-b border-white/8 bg-[#07070C]/90 backdrop-blur-xl gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/50 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          <button className="relative w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
            <Bell size={16} />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00D4FF]" />
          </button>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white transition-colors"
          >
            <Globe size={12} />
            View Site
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
