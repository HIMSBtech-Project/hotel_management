import axios from 'axios';

const API = axios.create({
  baseURL:  import.meta.env.VITE_API_URL || 'http://localhost:5000/api',//for local development:http://localhost:5000/api
});


API.interceptors.request.use((config) => {
  const storedProfile = localStorage.getItem('hotel_profile');

  if (storedProfile) {
    const { token } = JSON.parse(storedProfile);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default API;
