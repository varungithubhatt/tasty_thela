import express from "express";
import { register, login, deleteAccount } from "../controllers/auth.controller.js";
import {
  loginLimiter,
  registerLimiter
} from "../middleware/ratelimit.middleware.js";
import  verifyToken  from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/register",  register);
router.post("/login",  login);
router.delete("/delete-account", verifyToken, deleteAccount);
export default router;
 