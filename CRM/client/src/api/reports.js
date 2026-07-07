import api from './axios';

export const getSalesReport = (params) => api.get('/reports/sales', { params });
export const getCustomerReport = (params) => api.get('/reports/customers', { params });
export const getInventoryReport = (params) => api.get('/reports/inventory', { params });
export const getProfitLoss = (params) => api.get('/reports/profit-loss', { params });
export const getEmployeeReport = (params) => api.get('/reports/employees', { params });
