import api from "./api";

export const getBloodBankDashboard = () => api.get("/api/blood-bank/dashboard-data");
export const getBloodBankAnalytics = () => api.get("/api/blood-bank/analytics-data");
