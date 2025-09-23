import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Assuming your backend runs on port 5000

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
