import api from './axios';

export const getDeals = (params) => api.get('/deals', { params });
export const getDealPipeline = () => api.get('/deals/pipeline');
export const getDeal = (id) => api.get(`/deals/${id}`);
export const createDeal = (data) => api.post('/deals', data);
export const updateDeal = (id, data) => api.put(`/deals/${id}`, data);
export const updateDealStage = (id, stage) => api.patch(`/deals/${id}/stage`, { stage });
export const deleteDeal = (id) => api.delete(`/deals/${id}`);
