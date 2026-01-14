import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const gigAPI = {
  getGigs: (params) => api.get('/gigs', { params }),
  getMyGigs: (params) => api.get('/gigs/my-gigs', { params }),
  createGig: (gigData) => api.post('/gigs', gigData),
  getGigById: (id) => api.get(`/gigs/${id}`),
  updateGig: (id, gigData) => api.put(`/gigs/${id}`, gigData),
  deleteGig: (id) => api.delete(`/gigs/${id}`),
};

export const bidAPI = {
  createBid: (bidData) => api.post('/bids', bidData),
  getBidsByGig: (gigId) => api.get(`/bids/${gigId}`),
  hireFreelancer: (bidId) => api.patch(`/bids/${bidId}/hire`),
  getMyBids: () => api.get('/bids/my-bids'),
};

export default api;
