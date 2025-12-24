import api from './api';

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  async register(email: string, password: string, binanceApiKey: string, binanceSecretKey: string) {
    const response = await api.post('/auth/register', { email, password, binanceApiKey, binanceSecretKey });
    return response.data;
  },
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      //console.log(error);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
};
