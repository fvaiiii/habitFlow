import api from './client';

export const getTemplates = () => api.get('/templates');
export const getTemplate = (id) => api.get(`/templates/${id}`);
export const useTemplate = (id) => api.post(`/templates/${id}/use`);
