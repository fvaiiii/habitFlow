import api from './client';

export const getHabits = () => api.get('/habits');
export const getHabit = (id) => api.get(`/habits/${id}`);
export const createHabit = (data) => api.post('/habits', data);
export const updateHabit = (id, data) => api.patch(`/habits/${id}`, data);
export const deleteHabit = (id) => api.delete(`/habits/${id}`);
export const createCheckIn = (habitId) => api.post(`/habits/${habitId}/check-ins`);
export const getCheckIns = (habitId) => api.get(`/habits/${habitId}/check-ins`);