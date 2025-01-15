import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/users',
});

export const registerUser = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/login', credentials);
  return response.data;
};