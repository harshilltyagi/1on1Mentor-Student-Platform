import express from "express";
import requireRole from "../middleware/roleMiddleware.js";
import auth from "../middleware/authMiddleware.js";
import {
  createSession,
  joinSession,
} from "../controllers/sessionController.js";
const router = express.Router();
router.post("/create", auth, requireRole("mentor"), createSession);
router.post("/join", auth, requireRole("student"), joinSession);

export default router;
