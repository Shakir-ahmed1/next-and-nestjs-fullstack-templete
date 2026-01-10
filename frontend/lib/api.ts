import axios from 'axios';
import { PUBLIC_API_URL } from '@/config';

const api = axios.create({
  baseURL: PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export default api;


