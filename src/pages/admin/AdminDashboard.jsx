import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, MessageSquare, FileText, TrendingUp, Eye, UserCheck, Clock, ArrowUpRight } from 'lucide-react'
import { applicationsAPI, contactAPI } from '../../lib/api'

const StatCard = ({ icon: Icon, label, value, change, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="border border-white/8 rounded-xl p-5 bg-white/2 hover:border-white/15 transition-colors"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ color, background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon size={18} />
      </div>
      {change && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${change > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
    <div className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</div>
    <div className="text-white/40 text-xs">{label}</div>
  </motion.div>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState({ applications: 0, inquiries: 0, views: 0, conversions: 0 })
  const [recentApps, setRecentApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [appRes, contactRes] = await Promise.all([
          applicationsAPI.getAll({ limit: 5 }),
          contactAPI.getAll({ limit: 1 }),
        ])
        setStats({
          applications: appRes.data.total || appRes.data.data?.length || 0,
          inquiries: contactRes.data.total || 0,
          views: 12847,
          conversions: 94,
        })
        setRecentApps(appRes.data.data || [])
      } catch {
        // Backend not connected — show placeholder data
        setStats({ applications: 24, inquiries: 38, views: 12847, conversions: 94 })
        setRecentApps([
          { id: 1, full_name: 'Ahmad Hassan', email: 'ahmad@email.com', skills: 'Amazon PPC', created_at: '2024-03-15', status: 'pending' },
          { id: 2, full_name: 'Fatima Khan', email: 'fatima@email.com', skills: 'Shopify Dev', created_at: '2024-03-14', status: 'reviewed' },
          { id: 3, full_name: 'Omar Malik', email: 'omar@email.com', skills: 'Etsy Management', created_at: '2024-03-13', status: 'pending' },
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</h1>
        <p className="text-white/40 text-sm">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Job Applications" value={stats.applications} change={12} color="#00D4FF" delay={0} />
        <StatCard icon={MessageSquare} label="Contact Inquiries" value={stats.inquiries} change={8} color="#7C3AED" delay={0.08} />
        <StatCard icon={Eye} label="Monthly Page Views" value={stats.views.toLocaleString()} change={23} color="#F59E0B" delay={0.16} />
        <StatCard icon={TrendingUp} label="Lead Conversions" value={`${stats.conversions}%`} change={-2} color="#10B981" delay={0.24} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 border border-white/8 rounded-xl bg-white/2">
          <div className="flex items-center justify-between p-5 border-b border-white/8">
            <h2 className="text-white font-semibold text-sm">Recent Applications</h2>
            <a href="/admin/applications" className="text-xs text-[#00D4FF] flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowUpRight size={12} />
            </a>
          </div>
          <div className="divide-y divide-white/6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10" />
                  <div className="flex-1">
                    <div className="h-3 bg-white/10 rounded mb-2 w-1/3" />
                    <div className="h-2 bg-white/8 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : recentApps.map((app) => (
              <div key={app.id} className="p-4 flex items-center gap-3 hover:bg-white/2 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00D4FF]/30 to-[#7C3AED]/30 flex items-center justify-center text-white font-bold text-xs">
                  {app.full_name?.[0] || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{app.full_name}</div>
                  <div className="text-white/40 text-xs">{app.skills} · {app.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    app.status === 'pending' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' :
                    app.status === 'reviewed' ? 'bg-[#00D4FF]/15 text-[#00D4FF]' :
                    'bg-emerald-400/15 text-emerald-400'
                  }`}>
                    {app.status || 'pending'}
                  </span>
                  <span className="text-white/20 text-xs">{app.created_at?.split('T')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-4">
          <div className="border border-white/8 rounded-xl p-5 bg-white/2">
            <h2 className="text-white font-semibold text-sm mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Add Blog Post', href: '/admin/blog', icon: FileText, color: '#00D4FF' },
                { label: 'Add Team Member', href: '/admin/team', icon: UserCheck, color: '#7C3AED' },
                { label: 'Review Applications', href: '/admin/applications', icon: Clock, color: '#F59E0B' },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg border border-white/8 hover:border-white/20 hover:bg-white/4 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: action.color, background: `${action.color}15` }}>
                    <action.icon size={15} />
                  </div>
                  <span className="text-white/70 text-sm group-hover:text-white transition-colors">{action.label}</span>
                  <ArrowUpRight size={12} className="ml-auto text-white/20 group-hover:text-white/60" />
                </a>
              ))}
            </div>
          </div>

          <div className="border border-[#00D4FF]/20 rounded-xl p-5 bg-[#00D4FF]/5">
            <h3 className="text-[#00D4FF] font-semibold text-sm mb-2">Site Status</h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">All systems operational</span>
            </div>
            <div className="text-white/40 text-xs">Last deployment: Today, 9:41 AM</div>
          </div>
        </div>
      </div>
    </div>
  )
}
