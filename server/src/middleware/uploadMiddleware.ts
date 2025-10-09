import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fieldSize: 1024 * 1024 * 5 },
});

