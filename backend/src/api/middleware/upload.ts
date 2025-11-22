import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { ValidationError } from '../../utils/errors';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError(`Invalid file type: ${file.mimetype}`) as any);
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});
