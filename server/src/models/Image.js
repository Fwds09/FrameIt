import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    unique: true,
  },
  originalname: {
    type: String,
    required: [true, 'Original filename is required'],
  },
  filepath: {
    type: String,
    required: [true, 'Filepath is required'],
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  likesCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

imageSchema.index({ uploadedBy: 1, createdAt: -1 });
imageSchema.index({ createdAt: -1 });

const Image = mongoose.model('Image', imageSchema);

export default Image;
