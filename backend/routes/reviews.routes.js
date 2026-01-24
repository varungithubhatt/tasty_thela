// routes/review.routes.js
import express from "express";
import verifyToken from "../middleware/auth.middleware.js";
import { reviewLimiter } from "../middleware/ratelimit.middleware.js";
import {
  addReview,
  deleteReview,
  getShopReviews
} from "../controllers/reviews.controller.js";

const router = express.Router();

router.post("/:shopId", verifyToken,  addReview);
router.delete("/:shopId", verifyToken,  deleteReview);
router.get("/:shopId", getShopReviews);

export default router;
