import api from './api';

export const fetchAccountDetails = async () => {
  const response = await api.get('/api/user/account');
  return response.data;
};
