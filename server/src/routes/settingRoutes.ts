import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import {
  addFeatureBanners,
  fetchFeatureBanners,
  getFeaturedProducts,
  updateFeaturedProducts,
  deleteFeatureBanner, // ADD THIS
} from "../controllers/settingsController";

const router = express.Router();

router.post(
  "/banners",
  authenticateJwt,
  isSuperAdmin,
  upload.array("images", 5),
  addFeatureBanners
);

router.get("/get-banners", authenticateJwt, fetchFeatureBanners);

// ADD THIS NEW ROUTE
router.delete(
  "/banners/:id",
  authenticateJwt,
  isSuperAdmin,
  deleteFeatureBanner
);

router.post(
  "/update-feature-products",
  authenticateJwt,
  isSuperAdmin,
  updateFeaturedProducts
);

router.get("/fetch-feature-products", authenticateJwt, getFeaturedProducts);

export default router;
