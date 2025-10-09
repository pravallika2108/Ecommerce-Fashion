import multer from "multer";

declare global {
  namespace Express {
    // Remove Multer if it's causing errors
    // If you need to type req.files, do:
    interface Request {
      files?: {
        [fieldname: string]: Express.Multer.File[];
      };
    }
  }
}
