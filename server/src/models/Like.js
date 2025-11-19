import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: [true, 'Image ID is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

likeSchema.index({ userId: 1, imageId: 1 }, { unique: true });
likeSchema.index({ userId: 1, createdAt: -1 });
likeSchema.index({ imageId: 1 });

const Like = mongoose.model('Like', likeSchema);

export default Like;
