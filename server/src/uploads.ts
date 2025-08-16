import multer, { StorageEngine } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    // Try to get userId from body first, then from query, then from headers
    const userId =
      req.body.userId || req.query.userId || req.headers["user-id"];

    if (!userId) {
      return cb(new Error("UserId is required to save the image"), "");
    }

    const userFolder = path.join(__dirname, `uploads/${userId}`);
    fs.mkdirSync(userFolder, { recursive: true });

    cb(null, userFolder);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export default upload;
