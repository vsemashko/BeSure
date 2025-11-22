import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import crypto from 'crypto';
import path from 'path';
import config from '../config/constants';
import logger from '../utils/logger';
import { ValidationError } from '../utils/errors';

// Type for Multer file
// eslint-disable-next-line no-undef
type MulterFile = Express.Multer.File;

// Allowed image types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Initialize S3 client (compatible with Cloudflare R2)
const s3Client = new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});

interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

class UploadService {
  /**
   * Upload an image file to S3/R2
   */
  async uploadImage(
    file: MulterFile,
    folder: 'profiles' | 'questions' | 'options'
  ): Promise<UploadResult> {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new ValidationError(
        `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const filename = `${folder}/${timestamp}-${uniqueId}${fileExtension}`;

    try {
      // Upload to S3/R2
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: config.s3.bucket,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
          // Make publicly readable
          ACL: 'public-read',
        },
      });

      await upload.done();

      // Construct public URL
      const url = `${config.s3.endpoint}/${config.s3.bucket}/${filename}`;

      logger.info(`File uploaded successfully: ${filename}`);

      return {
        url,
        key: filename,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      logger.error('Failed to upload file', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  /**
   * Delete an image from S3/R2
   */
  async deleteImage(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: config.s3.bucket,
        Key: key,
      });

      await s3Client.send(command);

      logger.info(`File deleted successfully: ${key}`);
    } catch (error) {
      logger.error('Failed to delete file', error);
      throw new Error('Failed to delete file from storage');
    }
  }

  /**
   * Validate image file before upload
   */
  validateImageFile(file: MulterFile): void {
    if (!file) {
      throw new ValidationError('No file provided');
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new ValidationError(
        `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
  }
}

export default new UploadService();
