import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Trash2, Copy, Check, Search, Image, FileText, Film, X, Grid3X3, List, ExternalLink } from 'lucide-react'
import { mediaAPI } from '../../lib/api'
import toast from 'react-hot-toast'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function FileIcon({ mime }) {
  if (mime?.startsWith('image/')) return <Image size={20} className="text-[#00D4FF]" />
  if (mime?.startsWith('video/')) return <Film size={20} className="text-[#7C3AED]" />
  return <FileText size={20} className="text-white/40" />
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
        copied ? 'bg-emerald-400/15 text-emerald-400' : 'bg-white/8 text-white/50 hover:text-white hover:bg-white/12'
      }`}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copied!' : 'Copy URL'}
    </button>
  )
}

export default function MediaLibrary() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('grid')
  const [preview, setPreview] = useState(null)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)
  const dropRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const res = await mediaAPI.getAll()
      setFiles(res.data?.data || [])
    } catch {
      toast.error('Failed to load media')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const uploadFiles = async (fileList) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf']
    const valid = Array.from(fileList).filter(f => {
      if (!allowed.includes(f.type)) { toast.error(`${f.name}: type not allowed`); return false }
      if (f.size > 20 * 1024 * 1024) { toast.error(`${f.name}: exceeds 20 MB`); return false }
      return true
    })
    if (!valid.length) return

    setUploading(true)
    let ok = 0
    for (const file of valid) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await mediaAPI.upload(fd)
        const newFile = {
          id: res.data.id || Date.now(),
          filename: res.data.filename,
          original_name: file.name,
          mime_type: file.type,
          size: file.size,
          path: res.data.path,
          created_at: new Date().toISOString(),
        }
        setFiles(prev => [newFile, ...prev])
        ok++
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    if (ok) toast.success(`${ok} file${ok > 1 ? 's' : ''} uploaded`)
    setUploading(false)
  }

  const handleDelete = async (file, e) => {
    e.stopPropagation()
    if (!confirm(`Delete "${file.original_name}"?`)) return
    try {
      await mediaAPI.delete(file.id)
      setFiles(prev => prev.filter(f => f.id !== file.id))
      if (preview?.id === file.id) setPreview(null)
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  // Drag-drop zone
  const onDrop = (e) => {
    e.preventDefault(); setDrag(false)
    uploadFiles(e.dataTransfer.files)
  }

  const filtered = files.filter(f => {
    const matchSearch = !search || f.original_name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'image' ? f.mime_type?.startsWith('image/') :
      filter === 'video' ? f.mime_type?.startsWith('video/') :
      filter === 'doc'   ? f.mime_type === 'application/pdf' : true
    return matchSearch && matchFilter
  })

  const imageFiles = filtered.filter(f => f.mime_type?.startsWith('image/'))
  const stats = {
    total: files.length,
    images: files.filter(f => f.mime_type?.startsWith('image/')).length,
    size: formatBytes(files.reduce((s, f) => s + (f.size || 0), 0)),
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Media Library</h1>
          <p className="text-white/40 text-xs mt-0.5">
            {stats.total} files · {stats.images} images · {stats.size} total
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white text-sm font-semibold disabled:opacity-60 shrink-0"
        >
          {uploading ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input ref={inputRef} type="file" multiple accept="image/*,video/mp4,application/pdf" className="hidden"
          onChange={e => uploadFiles(e.target.files)} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…"
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/50" />
        </div>

        <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          {[['all','All'],['image','Images'],['video','Video'],['doc','PDF']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${filter === val ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden ml-auto">
          <button onClick={() => setView('grid')} className={`p-2 transition-all ${view === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}><Grid3X3 size={14} /></button>
          <button onClick={() => setView('list')} className={`p-2 transition-all ${view === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}><List size={14} /></button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={dropRef}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`transition-all rounded-xl border-2 border-dashed mb-4 ${drag ? 'border-[#00D4FF] bg-[#00D4FF]/5 py-8' : 'border-transparent py-0'}`}
      >
        {drag && (
          <div className="text-center pointer-events-none">
            <Upload size={28} className="mx-auto text-[#00D4FF] mb-2" />
            <p className="text-[#00D4FF] text-sm font-medium">Drop files here</p>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-2 border-dashed border-white/8 rounded-xl py-20 text-center">
          <Image size={40} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/30 text-sm">{files.length ? 'No files match your filter' : 'No files yet — upload something!'}</p>
          {!files.length && (
            <button onClick={() => inputRef.current?.click()}
              className="mt-4 px-4 py-2 rounded-xl bg-white/8 text-white/60 text-xs hover:text-white hover:bg-white/12 transition-all">
              Choose files
            </button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(file => (
            <motion.div key={file.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              onClick={() => setPreview(file)}
              className="group relative border border-white/8 rounded-xl overflow-hidden bg-white/2 hover:border-white/20 cursor-pointer transition-all">
              {/* Thumbnail */}
              <div className="aspect-square bg-white/4 flex items-center justify-center relative overflow-hidden">
                {file.mime_type?.startsWith('image/') ? (
                  <img src={file.path} alt={file.original_name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                ) : (
                  <FileIcon mime={file.mime_type} />
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={e => handleDelete(file, e)}
                    className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-white/70 text-xs truncate">{file.original_name}</p>
                <p className="text-white/25 text-[10px]">{formatBytes(file.size)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="border border-white/8 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {['File', 'Type', 'Size', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-white/40 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(file => (
                <tr key={file.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                        {file.mime_type?.startsWith('image/') ? (
                          <img src={file.path} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                        ) : <FileIcon mime={file.mime_type} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm truncate max-w-[160px]">{file.original_name}</p>
                        <p className="text-white/30 text-xs truncate max-w-[160px]">{file.path}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">{file.mime_type?.split('/')[1]?.toUpperCase()}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">{formatBytes(file.size)}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">{file.created_at?.split('T')[0] || ''}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <CopyBtn text={window.location.origin + file.path} />
                      <a href={file.path} target="_blank" rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-all">
                        <ExternalLink size={12} />
                      </a>
                      <button onClick={e => handleDelete(file, e)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview lightbox */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreview(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative max-w-2xl w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0F]"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                <div>
                  <p className="text-white text-sm font-medium">{preview.original_name}</p>
                  <p className="text-white/40 text-xs">{formatBytes(preview.size)} · {preview.mime_type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CopyBtn text={window.location.origin + preview.path} />
                  <a href={preview.path} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all">
                    <ExternalLink size={14} />
                  </a>
                  <button onClick={() => setPreview(null)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all">
                    <X size={14} />
                  </button>
                </div>
              </div>
              {preview.mime_type?.startsWith('image/') ? (
                <div className="max-h-[60vh] overflow-hidden flex items-center justify-center bg-black/30">
                  <img src={preview.path} alt={preview.original_name} className="max-w-full max-h-[60vh] object-contain" />
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <FileIcon mime={preview.mime_type} />
                  <span className="ml-3 text-white/50 text-sm">Preview not available</span>
                </div>
              )}
              <div className="px-4 py-3 bg-white/2">
                <p className="text-white/40 text-xs font-mono break-all">{window.location.origin + preview.path}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
