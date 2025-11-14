import api from "./api";

export const createInventoryEntry = (payload) => api.post("/api/inventory/in", payload);
export const listInventoryEntries = (params = {}) => api.get("/api/inventory/in", { params });

export const issueInventory = (payload) => api.post("/api/inventory/out", payload);
export const listIssuedInventory = (params = {}) => api.get("/api/inventory/out", { params });

export const getInventorySummary = () => api.get("/api/inventory/summary");
export const getExpirySummary = () => api.get("/api/inventory/expiry-summary");
