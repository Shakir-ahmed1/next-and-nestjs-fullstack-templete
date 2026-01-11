import axios from 'axios';
import { NEXT_PUBLIC_API_URL } from '@/config';

const api = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});


// Request interceptor to log the full URL
api.interceptors.request.use((config) => {
  // Log the full request URL
  const fullUrl = `${config.baseURL?.replace(/\/$/, '')}${config.url}`;
  console.log('Axios request URL:', fullUrl);

  return config; // must return the config
}, (error) => {
  return Promise.reject(error);
});

export default api;
