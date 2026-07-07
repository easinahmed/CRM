import api from './axios';

export const getLeads = (params) => api.get('/leads', { params });
export const getLead = (id) => api.get(`/leads/${id}`);
export const createLead = (data) => api.post('/leads', data);
export const updateLead = (id, data) => api.put(`/leads/${id}`, data);
export const deleteLead = (id) => api.delete(`/leads/${id}`);
export const convertLead = (id) => api.post(`/leads/${id}/convert`);
export const bulkDeleteLeads = (ids) => api.post('/leads/bulk-delete', { ids });
