import express from "express";
import { userSign, userLogin } from "../controllers/authController.js";
const router = express.Router();
router.post("/signup", userSign);
router.post("/login", userLogin);
export default router;
