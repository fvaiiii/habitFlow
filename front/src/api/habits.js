import api from './client';

export const getHabits = () => api.get('/habits');
export const getHabit = (id) => api.get(`/habits/${id}`);
export const createHabit = (data) => api.post('/habits', data);
export const updateHabit = (id, data) => api.patch(`/habits/${id}`, data);
export const deleteHabit = (id) => api.delete(`/habits/${id}`);
export const createCheckIn = (habitId) => api.post(`/habits/${habitId}/check-ins`);
export const getCheckIns = (habitId) => api.get(`/habits/${habitId}/check-ins`);
export const getStreak = (habitId) => api.get(`/habits/${habitId}/streak`);
// Шаблоны
export const getTemplates = () => api.get('/templates');
export const useTemplate = (templateId) => api.post(`/templates/${templateId}/use`);

// Статистика
export const getStats = () => api.get('/stats');
export const getHeatmap = () => api.get('/stats/heatmap');

// Теги
export const getTags = () => api.get('/tags');
export const createTag = (data) => api.post('/tags', data);
export const deleteTag = (tagId) => api.delete(`/tags/${tagId}`);
export const addTagToHabit = (habitId, tagId) => api.post(`/habits/${habitId}/tags/${tagId}`);
export const removeTagFromHabit = (habitId, tagId) => api.delete(`/habits/${habitId}/tags/${tagId}`);
export const getHabitTags = (habitId) => api.get(`/habits/${habitId}/tags`);

// Admin (superuser)
export const getAllUsers = () => api.get('/admin/users');
export const createTemplate = (data) => api.post('/admin/templates', data);
export const updateTemplate = (id, data) => api.patch(`/admin/templates/${id}`, data);
export const deleteTemplate = (id) => api.delete(`/admin/templates/${id}`);
export const getTemplateModeration = () => api.get('/admin/template-moderation');
