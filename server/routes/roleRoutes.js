import express from "express";
import requireRole from "../middleware/roleMiddleware.js";
import auth from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/mentor-only", auth, requireRole("mentor"), (req, res) => {
  res.json({ message: "Welcome Mentor" });
});

router.get("/student-only", auth, requireRole("student"), (req, res) => {
  res.json({ message: "Welcome Student" });
});
export default router;
