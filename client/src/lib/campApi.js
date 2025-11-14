import api from "./api";

export const createCamp = (payload) => api.post("/api/camps", payload);
export const listCamps = (params={}) => api.get("/api/camps", { params });
export const updateCamp = (id, payload) => api.patch(`/api/camps/${id}`, payload);
export const getCamp = (id) => api.get(`/api/camps/${id}`);

// Registrations
export const createCampRegistration = (payload) => api.post("/api/camp-registrations", payload);
export const listCampRegistrations = (params={}) => api.get("/api/camp-registrations", { params });
export const listAvailableCamps = (params={}) => api.get("/api/camps/available", { params });
