import axios from 'axios';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchDashboardSummary = () => api.get('/dashboard/summary').then((res) => res.data);
export const fetchAlerts = (params?: { severity?: string; status?: string }) => api.get('/alerts', { params }).then((res) => res.data);
export const fetchAlertDetail = (id: string) => api.get(`/alerts/${id}`).then((res) => res.data);
export const fetchIncidents = (params?: { severity?: string; status?: string }) => api.get('/incidents', { params }).then((res) => res.data);
export const fetchIncidentDetail = (id: string) => api.get(`/incidents/${id}`).then((res) => res.data);
export const fetchIncidentTimeline = (id: string) => api.get(`/incidents/${id}/timeline`).then((res) => res.data);
export const runAIInvestigation = (id: string) => api.post(`/incidents/${id}/investigate`).then((res) => res.data);
export const fetchLatestInvestigation = (id: string) => api.get(`/incidents/${id}/investigation`).then((res) => res.data);
export const lookupThreatIntel = (value: string) => api.post('/threat-intel/lookup', { value }).then((res) => res.data);
export const fetchThreatIndicators = () => api.get('/threat-intel/indicators').then((res) => res.data);
export const fetchMitreMatrix = () => api.get('/mitre/matrix').then((res) => res.data);
export const fetchDetectionRules = () => api.get('/detection-rules').then((res) => res.data);
export const toggleDetectionRule = (id: string) => api.put(`/detection-rules/${id}/toggle`).then((res) => res.data);
export const fetchAssets = () => api.get('/assets').then((res) => res.data);
export const fetchReports = () => api.get('/reports').then((res) => res.data);
export const generateReport = (incident_id: string, format: string = 'pdf') => api.post('/reports/generate', { incident_id, format }).then((res) => res.data);
export const triggerResponseAction = (incident_id: string, action: string, target: string) => api.post(`/incidents/${incident_id}/response`, { action, target }).then((res) => res.data);
export const globalSearch = (q: string) => api.get('/search', { params: { q } }).then((res) => res.data);
