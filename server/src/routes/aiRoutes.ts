import express from "express";
import {
  handleChat,
  handleSizeAdvisory,
  handleVisualSearch,
} from "../controllers/aiController";

const router = express.Router();

router.post("/chat", handleChat);
router.post("/size-advisory", handleSizeAdvisory);
router.post("/visual-search", handleVisualSearch);

export default router;
