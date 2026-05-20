import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search, X, Save, Loader2 } from 'lucide-react'
import { blogAPI } from '../../lib/api'
import toast from 'react-hot-toast'

const emptyPost = { title: '', slug: '', category: '', content: '', excerpt: '', status: 'draft', tags: '', author: '' }

export default function BlogManager() {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyPost)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const res = await blogAPI.getAll({ status: 'all', limit: 100 })
      setPosts(res.data?.data || res.data || [])
    } catch {
      toast.error('Failed to load posts')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = posts.filter((p) =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setForm(emptyPost)
    setEditing('new')
  }

  const openEdit = (post) => {
    setForm({ ...emptyPost, ...post })
    setEditing(post.id)
  }

  const handleSave = async () => {
    if (!form.title) return toast.error('Title is required')
    setSaving(true)
    try {
      if (editing === 'new') {
        const res = await blogAPI.create(form)
        const newPost = { ...form, id: res.data?.id || Date.now(), views: 0, date: new Date().toISOString().split('T')[0] }
        setPosts((prev) => [newPost, ...prev])
        toast.success('Post created!')
      } else {
        await blogAPI.update(editing, form)
        setPosts((prev) => prev.map((p) => p.id === editing ? { ...p, ...form } : p))
        toast.success('Post updated!')
      }
      setEditing(null)
    } catch {
      toast.error('Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return
    try {
      await blogAPI.delete(id)
      setPosts((prev) => prev.filter((p) => p.id !== id))
      toast.success('Post deleted')
    } catch {
      toast.error('Failed to delete post')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Blog Manager</h1>
          <p className="text-white/40 text-xs">{posts.length} posts</p>
        </div>
        <button onClick={openCreate}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold">
          <Plus size={15} /> New Post
        </button>
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50" />
      </div>

      <div className="border border-white/8 rounded-xl overflow-hidden bg-white/2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {['Title', 'Category', 'Status', 'Date', 'Views', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-white/40 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-white/30 text-sm">No posts found</td>
                </tr>
              ) : filtered.map((post) => (
                <tr key={post.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-white text-sm font-medium max-w-xs truncate">{post.title}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-[#7C3AED]/20 text-[#A78BFA]">{post.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'published' ? 'bg-emerald-400/15 text-emerald-400' : 'bg-white/10 text-white/40'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">{post.created_at?.split('T')[0] || post.date}</td>
                  <td className="px-4 py-3 text-white/60 text-xs">{(post.views || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(post)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => deletePost(post.id)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit/Create modal */}
      <AnimatePresence>
        {editing !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 rounded-2xl bg-[#0A0A0F] p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {editing === 'new' ? 'New Blog Post' : 'Edit Post'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Title *</label>
                  <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Slug</label>
                    <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" placeholder="auto-generated if empty" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Author</label>
                    <input value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Category</label>
                    <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Status</label>
                    <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50">
                      <option value="draft" className="bg-[#111118]">Draft</option>
                      <option value="published" className="bg-[#111118]">Published</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50" placeholder="Amazon, PPC, Strategy" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Excerpt</label>
                  <textarea rows={2} value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 resize-none" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Content (Markdown supported)</label>
                  <textarea rows={8} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 resize-none font-mono" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition-colors">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold disabled:opacity-50">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? 'Saving...' : 'Save Post'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
