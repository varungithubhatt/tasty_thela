import axios from "axios";

const api = axios.create({
  baseURL: "https://tasty-thela-backend.onrender.com",
 //baseURL:"http://localhost:5000", 
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
