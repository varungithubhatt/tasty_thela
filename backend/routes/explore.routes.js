import express from "express";
import {
  getExploreCategories,
    getTrendingThelas,
    getPopularFoods,
    getTopRatedThelas,
    getNewThelas,
    getBudgetFriendlyThelas,
    getTimeBasedThelas
} from "../controllers/explore.controller.js";
const router = express.Router();

router.get("/categories", getExploreCategories);
router.get("/trending", getTrendingThelas);
router.get("/popular-foods", getPopularFoods);
router.get("/top-rated", getTopRatedThelas);
router.get("/new", getNewThelas);
router.get("/budget", getBudgetFriendlyThelas);
router.get("/time-based", getTimeBasedThelas);
router.get("/home", getExploreCategories);
export default router;