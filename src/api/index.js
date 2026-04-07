import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const destinations = {
  list: (params) => api.get('/destinations', { params }).then(r => r.data),
  get: (id) => api.get(`/destinations/${id}`).then(r => r.data),
  create: (data) => api.post('/destinations', data).then(r => r.data),
  update: (id, data) => api.put(`/destinations/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/destinations/${id}`).then(r => r.data),
}

export const trips = {
  list: () => api.get('/trips').then(r => r.data),
  get: (id) => api.get(`/trips/${id}`).then(r => r.data),
  create: (data) => api.post('/trips', data).then(r => r.data),
  update: (id, data) => api.put(`/trips/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/trips/${id}`).then(r => r.data),
}

export const budget = {
  forTrip: (tripId) => api.get(`/budget/trip/${tripId}`).then(r => r.data),
  create: (tripId, data) => api.post(`/budget/trip/${tripId}`, data).then(r => r.data),
  update: (id, data) => api.put(`/budget/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/budget/${id}`).then(r => r.data),
  annualFund: () => api.get('/budget/annual').then(r => r.data),
  setAnnualFund: (data) => api.post('/budget/annual', data).then(r => r.data),
  annualStats: (year) => api.get(`/budget/stats/annual/${year}`).then(r => r.data),
}

export const stats = {
  get: () => api.get('/stats').then(r => r.data),
}

export const currency = {
  rates: (base) => api.get(`/currency/${base}`).then(r => r.data),
}

export default api
