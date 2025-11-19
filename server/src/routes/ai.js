import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';
import { generateImageDescriptionFromBuffer } from '../services/gemini.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDir = path.join(__dirname, '../../uploads/tmp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const filename = `${timestamp}-${random}-${file.originalname}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

router.post(
  '/describe-image',
  authenticate,
  upload.single('image'),
  async (req, res) => {
    let tempFilePath = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      tempFilePath = path.join(tempDir, req.file.filename);
      const buffer = fs.readFileSync(tempFilePath);

      const description = await generateImageDescriptionFromBuffer(buffer, req.file.mimetype);

      return res.status(200).json({
        success: true,
        description
      });
    } catch (error) {
      console.error('AI describe-image error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate image description'
      });
    } finally {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlink(tempFilePath, (err) => {
          if (err) {
            console.error('Error deleting temp AI image file:', err);
          }
        });
      }
    }
  }
);

export default router;


