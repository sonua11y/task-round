import axios from "axios";

const api = axios.create({
  baseURL: "https://task-round-x8c5.onrender.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.defaults.headers.put['Content-Type'] = 'application/json';
export default api;