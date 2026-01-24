import express from "express";
import verifyToken from "../middleware/auth.middleware.js";
import {
  toggleFavourite,
  isFavourite,
  getMyFavourites
} from "../controllers/favourite.controller.js";

const router = express.Router();

router.post("/toggle", verifyToken, toggleFavourite);
router.get("/check/:shopId", verifyToken, isFavourite);
router.get("/me", verifyToken, getMyFavourites);

export default router;
