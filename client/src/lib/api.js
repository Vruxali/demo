import axios from "axios";

// Use Vite env when provided; fall back to localhost:8080
const baseURL = (import.meta?.env?.VITE_API_URL) || "http://localhost:8080";

const api = axios.create({ baseURL });

// Optional: transparent retry to :8081 when :8080 is unavailable (no response)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const cfg = error?.config || {};
    const isNetworkError = !error.response;
    const used8080 = typeof cfg.baseURL === "string" && cfg.baseURL.includes(":8080");
    const alreadyRetried = cfg._retriedAltBase === true;
    if (isNetworkError && used8080 && !alreadyRetried && !import.meta?.env?.VITE_API_URL) {
      const alt = "http://localhost:8081";
      cfg.baseURL = alt;
      cfg._retriedAltBase = true;
      try {
        return await axios(cfg);
      } catch (e) {
        throw e;
      }
    }
    throw error;
  }
);

api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default api;
