import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('xcomify_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('xcomify_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export default api

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const applicationsAPI = {
  getAll: (params) => api.get('/applications', { params }),
  getOne: (id) => api.get(`/applications/${id}`),
  delete: (id) => api.delete(`/applications/${id}`),
  update: (id, data) => api.put(`/applications/${id}`, data),
}

export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contacts', { params }),
  delete: (id) => api.delete(`/contacts/${id}`),
  markRead: (id) => api.put(`/contacts/${id}/read`),
}

export const blogAPI = {
  getAll: (params) => api.get('/blogs', { params }),
  getOne: (slug) => api.get(`/blogs/${slug}`),
  create: (data) => api.post('/blogs', data),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`),
}

export const servicesAPI = {
  getAll: () => api.get('/services'),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
}

export const teamAPI = {
  getAll: () => api.get('/team'),
  create: (data) => api.post('/team', data),
  update: (id, data) => api.put(`/team/${id}`, data),
  delete: (id) => api.delete(`/team/${id}`),
}

export const portfolioAPI = {
  getAll: () => api.get('/portfolio'),
  create: (data) => api.post('/portfolio', data),
  update: (id, data) => api.put(`/portfolio/${id}`, data),
  delete: (id) => api.delete(`/portfolio/${id}`),
}

export const testimonialsAPI = {
  getAll: () => api.get('/testimonials'),
  create: (data) => api.post('/testimonials', data),
  update: (id, data) => api.put(`/testimonials/${id}`, data),
  delete: (id) => api.delete(`/testimonials/${id}`),
}

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
}

export const mediaAPI = {
  upload: (formData) => api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: () => api.get('/media'),
  delete: (id) => api.delete(`/media/${id}`),
}

export const advertisementAPI = {
  getActive: () => api.get('/advertisements/active'),
  getAll: () => api.get('/advertisements'),
  create: (data) => api.post('/advertisements', data),
  update: (id, data) => api.put(`/advertisements/${id}`, data),
  delete: (id) => api.delete(`/advertisements/${id}`),
}

export const notificationsAPI = {
  getAll:      () => api.get('/notifications'),
  getLog:      (page = 1) => api.get('/notifications/log', { params: { page } }),
  markAllRead: () => api.put('/notifications/read-all'),
}

export const chatAPI = {
  send: (message) => api.post('/chat', { message }),
}

export const proposalAPI = {
  generate: (data) => api.post('/proposals/generate', data),
  send: (data) => api.post('/proposals/send', data),
}

export const aiAPI = {
  getCriteria: () => api.get('/ai/criteria'),
  saveCriteria: (data) => api.put('/ai/criteria', data),
  analyzeCV: (id) => api.post(`/ai/analyze/${id}`),
}
