import api from './axios';

export const getTransactions = (params) => api.get('/transactions', { params });
export const createTransaction = (data) => api.post('/transactions', data);
export const getTransactionSummary = () => api.get('/transactions/summary');
