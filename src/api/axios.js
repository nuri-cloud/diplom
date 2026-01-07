import axios from "axios";

const api = axios.create({
  // baseURL: "http://89.23.99.85", <-- УДАЛИ ИЛИ ЗАКОММЕНТИРУЙ ЭТО
  baseURL: "", // Оставь пустым, теперь работает через прокси в vite.config.js
  headers: {
    "Content-Type": "application/json",
  },
});

// ... остальной код с interceptors
export default api;