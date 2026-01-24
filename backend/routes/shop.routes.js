import express from "express";
import upload from "../middleware/upload.middleware.js";
import  verifyToken  from "../middleware/auth.middleware.js";
import { isShopOwner } from "../middleware/owners.middleware.js";

import {
  createShop,
  updateShop,
  getNearbyShops,
  getShopById,
  searchByFood,
  searchByFoodAndDistance,
  searchByRadius,
  foodSuggestions,
  updateShopComplete,
  getMyShop
} from "../controllers/shop.controller.js";

const router = express.Router();

/* SEARCH */
router.get("/search/food-suggestions", foodSuggestions);
router.get("/search/food", searchByFood);
router.get("/search", searchByFoodAndDistance);
router.get("/search/radius", searchByRadius);
router.get("/me", verifyToken, getMyShop);

/* CREATE SHOP (WITH MEDIA) */
router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 2 }
  ]),
  createShop
);

/* update COMPLETE SHOP PROFILE */
router.put(
  "/:id/complete",
  verifyToken,
  isShopOwner,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 2 }
  ]),
  updateShopComplete
);

/* UPDATE MEDIA */
router.put("/:id", verifyToken, isShopOwner, updateShop);

/* OTHER */
router.get("/nearby", getNearbyShops);
router.get("/:id", getShopById);

export default router;
