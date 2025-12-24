// src/apis/axios.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor
instance.interceptors.response.use(
  (response) => {
    // 🔥 [디버깅] 여기서 데이터가 찍히는지 보세요!
    console.log('📡 Axios Interceptor 도착:', response);

    // 여기서 return을 안 해주면 나중에 undefined가 됩니다.
    // response.data가 실제 백엔드가 준 JSON입니다.
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  },
);

export default instance;
