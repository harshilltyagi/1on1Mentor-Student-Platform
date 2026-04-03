import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  saveEditorState,
  getEditorState,
} from "../controllers/editorController.js";

const router = express.Router();

router.post("/save", auth, saveEditorState);
router.get("/:meetingCode", auth, getEditorState);

export default router;
