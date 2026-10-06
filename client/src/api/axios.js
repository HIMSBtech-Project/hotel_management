import axios from 'axios';

const API = axios.create({
  baseURL: 'https://hotel-reservation-server-r1ev.onrender.com',//for local development:http://localhost:5000/api
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
