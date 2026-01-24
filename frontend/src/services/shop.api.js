import api from "./api";

export const getMyShop = () =>
  api.get("/shops/me");

export const createShop = (formData) =>
  api.post("/shops", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
