import { useState } from 'react';
import { Heart, Trash2, Maximize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Image {
  _id: string;
  filename: string;
  originalname: string;
  filepath: string;
  uploadedBy: string;
  description: string;
  isPublic: boolean;
  likesCount: number;
  createdAt: string;
  isLiked?: boolean;
}

interface ImageGalleryProps {
  images: Image[];
  loading: boolean;
  onToggleLike: (imageId: string) => Promise<void>;
  onDeleteImage: (imageId: string) => Promise<void>;
  onImageClick: (image: Image) => void;
}

export default function ImageGallery({
  images,
  loading,
  onToggleLike,
  onDeleteImage,
  onImageClick,
}: ImageGalleryProps) {
  const { user } = useAuth();
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleLike = async (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    setActionLoading(imageId);
    try {
      await onToggleLike(imageId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this image?')) {
      setActionLoading(imageId);
      try {
        await onDeleteImage(imageId);
      } finally {
        setActionLoading(null);
      }
    }
  };

  if (loading && images.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg aspect-square animate-pulse" />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Maximize2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No images yet</h3>
        <p className="text-gray-600">Upload or like images to see them here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {images.map((image) => {
        const isUploaderCurrentUser = image.uploadedBy === user?.id;
        const isLiking = actionLoading === image._id;

        return (
          <div
            key={image._id}
            className="group relative rounded-lg overflow-hidden bg-gray-100 aspect-square cursor-pointer"
            onMouseEnter={() => setHoveredImageId(image._id)}
            onMouseLeave={() => setHoveredImageId(null)}
            onClick={() => onImageClick(image)}
          >
            <img
              src={`http://localhost:5000${image.filepath}`}
              alt={image.originalname}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {hoveredImageId === image._id && (
              <div className="absolute inset-0 bg-black/80 text-white transition-opacity duration-200 flex flex-col p-4">
                <div className="flex justify-between items-start gap-2 mb-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageClick(image);
                    }}
                    className="p-2 bg-black/60 rounded-full border border-white/10 hover:bg-black/70 transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-5 h-5 text-white" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleLike(e, image._id)}
                      disabled={isLiking}
                      className={`p-2 rounded-full border border-white/10 transition-colors ${
                        image.isLiked
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-black/60 hover:bg-black/70'
                      }`}
                      title={image.isLiked ? 'Unlike' : 'Like'}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          image.isLiked ? 'text-white fill-current' : 'text-white'
                        }`}
                      />
                    </button>

                    {isUploaderCurrentUser && (
                      <button
                        onClick={(e) => handleDelete(e, image._id)}
                        disabled={isLiking}
                        className="p-2 bg-black/60 rounded-full border border-white/10 hover:bg-black/70 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-300" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {image.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 text-xs font-medium">
                  <Heart className="w-4 h-4 text-red-400 fill-current" />
                  <span>{image.likesCount} {image.likesCount === 1 ? 'like' : 'likes'}</span>
                </div>
              </div>
            )}

            {hoveredImageId !== image._id && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-3">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <p className="text-white text-xs font-semibold opacity-90">Likes</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
                    <span className="text-white text-xs font-medium">{image.likesCount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
