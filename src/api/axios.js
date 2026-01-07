import axios from "axios";

const api = axios.create({
  baseURL: "http://89.23.99.85", 
  headers: {
    "Content-Type": "application/json",
  },
});

// ... остальной код с interceptors
export default api;