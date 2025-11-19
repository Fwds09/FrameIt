import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

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

interface FullscreenViewerProps {
  isOpen: boolean;
  images: Image[];
  initialIndex: number;
  onClose: () => void;
  onToggleLike: (imageId: string) => Promise<void>;
}

export default function FullscreenViewer({
  isOpen,
  images,
  initialIndex,
  onClose,
  onToggleLike,
}: FullscreenViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liking) return;
    setLiking(true);
    try {
      await onToggleLike(currentImage._id);
      setCurrentIndex(currentIndex);
    } finally {
      setLiking(false);
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  const uploadDate = new Date(currentImage.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/60 border border-white/20 hover:bg-black/80 rounded-full transition-colors"
          title="Close (Esc)"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={handlePrev}
          className="absolute left-4 z-10 p-2 bg-black/60 border border-white/20 hover:bg-black/80 rounded-full transition-colors"
          title="Previous (←)"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <div className="flex-1 flex items-center justify-center px-4">
          <img
            src={`http://localhost:5000${currentImage.filepath}`}
            alt={currentImage.originalname}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        <button
          onClick={handleNext}
          className="absolute right-4 z-10 p-2 bg-black/60 border border-white/20 hover:bg-black/80 rounded-full transition-colors"
          title="Next (→)"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="bg-black/80 backdrop-blur border-t border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 min-w-0 text-white">
            <h3 className="font-semibold text-lg mb-2 break-words">
              {currentImage.originalname}
            </h3>
            <div className="text-sm text-gray-200 whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed pr-1">
              {currentImage.description || 'No description provided.'}
            </div>
            <p className="text-gray-400 text-xs mt-2">{uploadDate}</p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border border-white/10 transition-colors ${
                currentImage.isLiked
                  ? 'bg-red-600/40 text-red-200 hover:bg-red-600/60'
                  : 'bg-black/60 text-white hover:bg-black/75'
              }`}
              title={currentImage.isLiked ? 'Unlike' : 'Like'}
            >
              <Heart
                className={`w-5 h-5 ${
                  currentImage.isLiked ? 'fill-current' : ''
                }`}
              />
              <span>{currentImage.likesCount}</span>
            </button>

            <div className="text-gray-400 text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
