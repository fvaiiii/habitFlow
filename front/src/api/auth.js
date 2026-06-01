import api from './client';

export const register = (email, password) => 
  api.post('/register', { email, password });

export const login = (email, password) => 
  api.post('/login', { email, password });

export const getMe = () => 
    api.get('/me');