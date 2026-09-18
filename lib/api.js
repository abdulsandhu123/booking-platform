import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Restore token on page refresh (before React state kicks in).
// Guarded for SSR: localStorage doesn't exist on the server.
if (typeof window !== "undefined") {
  const savedToken = localStorage.getItem("token");
  if (savedToken) {
    api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
  }
}

// Auth
export const registerRequest = (data) => api.post("/auth/register", data);
export const loginRequest = (data) => api.post("/auth/login", data);
export const getMeRequest = () => api.get("/auth/me");

// Properties
export const searchProperties = (params) => api.get("/properties", { params });
export const getProperty = (id) => api.get(`/properties/${id}`);
export const getMyProperties = () => api.get("/properties/mine");
export const createProperty = (data) => api.post("/properties", data);
export const updatePropertyRequest = (id, data) => api.put(`/properties/${id}`, data);
export const deletePropertyRequest = (id) => api.delete(`/properties/${id}`);

// Bookings
export const getPropertyBookings = (propertyId) =>
  api.get(`/bookings/property/${propertyId}`);
export const createBooking = (data) => api.post("/bookings", data);
export const getGuestBookings = (email) => api.get(`/bookings/guest/${email}`);
export const getSellerBookings = () => api.get("/bookings/seller");
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);

// Admin
export const getOverview = () => api.get("/admin/overview");
export const getAllUsers = () => api.get("/admin/users");
export const updateUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
export const deleteUserRequest = (id) => api.delete(`/admin/users/${id}`);

export default api;
