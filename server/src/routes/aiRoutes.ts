import express,{Router} from "express";
import {
  handleChat,
  handleSizeAdvisory,
  handleVisualSearch,
} from "../controllers/aiController";

const router = express.Router();

router.post("/chat", handleChat);
router.post("/size-recommendation", handleSizeAdvisory);
router.post("/visual-search", handleVisualSearch);

export default router;
