import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Image from '../models/Image.js';
import Like from '../models/Like.js';
import { authenticate } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
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

const router = express.Router();

router.post(
  '/upload',
  authenticate,
  upload.single('image'),
  [
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean')
  ],
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        fs.unlink(path.join(uploadDir, req.file.filename), () => {});
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg
        });
      }

      const { description, isPublic } = req.body;

      const image = new Image({
        filename: req.file.filename,
        originalname: req.file.originalname,
        filepath: `/uploads/${req.file.filename}`,
        uploadedBy: req.user._id,
        description: description || '',
        isPublic: isPublic === 'true' || isPublic === true || false
      });

      await image.save();

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        image: {
          id: image._id,
          filename: image.filename,
          originalname: image.originalname,
          filepath: image.filepath,
          description: image.description,
          isPublic: image.isPublic,
          likesCount: image.likesCount,
          createdAt: image.createdAt
        }
      });
    } catch (error) {
      if (req.file) {
        fs.unlink(path.join(uploadDir, req.file.filename), () => {});
      }
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during upload'
      });
    }
  }
);

router.get('/user', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const images = await Image.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Image.countDocuments({ uploadedBy: req.user._id });

    const likedImageIds = await Like.find({ userId: req.user._id })
      .distinct('imageId');

    const imagesWithLikeStatus = images.map(img => ({
      ...img,
      isLiked: likedImageIds.includes(img._id.toString())
    }));

    res.status(200).json({
      success: true,
      images: imagesWithLikeStatus,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Fetch user images error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching images'
    });
  }
});

router.get('/liked', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const likes = await Like.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const imageIds = likes.map(like => like.imageId);

    const images = await Image.find({ _id: { $in: imageIds } })
      .lean();

    const imageMap = {};
    images.forEach(img => {
      imageMap[img._id.toString()] = img;
    });

    const orderedImages = imageIds
      .map(id => imageMap[id.toString()])
      .filter(img => img !== undefined);

    const total = await Like.countDocuments({ userId: req.user._id });

    const imagesWithLikeStatus = orderedImages.map(img => ({
      ...img,
      isLiked: true
    }));

    res.status(200).json({
      success: true,
      images: imagesWithLikeStatus,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Fetch liked images error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching liked images'
    });
  }
});

router.get('/collection', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const userUploads = await Image.find({ uploadedBy: req.user._id })
      .lean();

    const likedImages = await Like.find({ userId: req.user._id })
      .distinct('imageId');

    const likedImageDocs = await Image.find({ _id: { $in: likedImages } })
      .lean();

    const allImages = [...userUploads, ...likedImageDocs];
    const uniqueImages = Array.from(
      new Map(allImages.map(img => [img._id.toString(), img])).values()
    );

    uniqueImages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const paginatedImages = uniqueImages.slice(skip, skip + parseInt(limit));

    const imagesWithLikeStatus = paginatedImages.map(img => ({
      ...img,
      isLiked: likedImages.some(id => id.toString() === img._id.toString())
    }));

    res.status(200).json({
      success: true,
      images: imagesWithLikeStatus,
      total: uniqueImages.length,
      page: parseInt(page),
      pages: Math.ceil(uniqueImages.length / parseInt(limit))
    });
  } catch (error) {
    console.error('Fetch collection error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching collection'
    });
  }
});

router.post('/:imageId/like', authenticate, async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const existingLike = await Like.findOne({
      userId: req.user._id,
      imageId
    });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      image.likesCount = Math.max(0, image.likesCount - 1);
      await image.save();

      return res.status(200).json({
        success: true,
        message: 'Image unliked',
        isLiked: false,
        likesCount: image.likesCount
      });
    }

    const like = new Like({
      userId: req.user._id,
      imageId
    });

    await like.save();
    image.likesCount += 1;
    await image.save();

    res.status(200).json({
      success: true,
      message: 'Image liked',
      isLiked: true,
      likesCount: image.likesCount
    });
  } catch (error) {
    console.error('Like image error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while liking the image'
    });
  }
});

router.delete('/:imageId', authenticate, async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    if (image.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this image'
      });
    }

    await Like.deleteMany({ imageId });
    await Image.deleteOne({ _id: imageId });

    const filePath = path.join(uploadDir, image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the image'
    });
  }
});

router.get('/stats', authenticate, async (req, res) => {
  try {
    const images = await Image.find({ uploadedBy: req.user._id }).select('likesCount');
    const totalLikes = images.reduce((sum, img) => sum + (img.likesCount || 0), 0);

    res.status(200).json({
      success: true,
      totalLikes
    });
  } catch (error) {
    console.error('Fetch image stats error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching image stats'
    });
  }
});

export default router;
