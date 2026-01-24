import api from "./api";

export const toggleFavourite = (shopId) => {
  return api.post(
    "/favourites/toggle",
    { shopId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );
};

export const checkFavourite = (shopId) => {
  return api.get(`/favourites/check/${shopId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
};

export const getMyFavourites = () => {
  return api.get("/favourites/me", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
};
