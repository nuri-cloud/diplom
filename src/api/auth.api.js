const BASE_URL = ""; // Пусто для работы через vite proxy

const request = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Server Error" }));
    throw error;
  }
  
  return response.json();
};

// AUTH
export const loginRequest = (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) });
export const registerRequest = (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) });
export const confirmRequest = (data) => request("/auth/confirm", { 
  method: "POST", 
  body: JSON.stringify({ ...data, code: String(data.code) }) // Код строго строкой
});

// LOGS & SETTINGS
export const getLogsRequest = (p = 1) => request(`/logs/?page=${p}&page_size=20`);
export const getAnalyticsRequest = () => request("/logs/analytics");
export const getLogByIdRequest = (id) => request(`/logs/${id}`);
export const getSettingsRequest = () => request("/settings/", { method: "GET", body: JSON.stringify() });
export const updateSettingsRequest = (data) => request("/settings/", { method: "PUT", body: JSON.stringify(data) });