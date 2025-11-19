import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Image, LogOut, Upload, Grid } from 'lucide-react';
import ImageUploadModal from '../components/ImageUploadModal';
import ImageGallery from '../components/ImageGallery';
import FullscreenViewer from '../components/FullscreenViewer';
import { useImages } from '../hooks/useImages';
import { fetchImageStats } from '../utils/api';

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

type FilterType = 'all' | 'uploads' | 'liked';

export default function Collections() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    images,
    loading,
    error: fetchError,
    currentPage,
    totalPages,
    fetchCollection,
    fetchUserImages,
    fetchLikedImages,
    toggleLike,
    deleteImage,
    setError
  } = useImages();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [statsError, setStatsError] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadCollection();
  }, []);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await fetchImageStats();
      setTotalLikes(data.totalLikes);
      setStatsError(null);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStatsError('Unable to load stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!profileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const loadCollection = async () => {
    switch (filterType) {
      case 'uploads':
        await fetchUserImages(1);
        break;
      case 'liked':
        await fetchLikedImages(1);
        break;
      case 'all':
      default:
        await fetchCollection(1);
        break;
    }
  };

  const handleFilterChange = async (type: FilterType) => {
    setFilterType(type);
    switch (type) {
      case 'uploads':
        await fetchUserImages(1);
        break;
      case 'liked':
        await fetchLikedImages(1);
        break;
      case 'all':
      default:
        await fetchCollection(1);
        break;
    }
  };

  const handleUploadSuccess = () => {
    loadCollection();
    loadStats();
  };

  const handleImageClick = (image: Image) => {
    const index = images.findIndex(img => img._id === image._id);
    setSelectedImageIndex(index);
    setSelectedImage(image);
  };

  const handleToggleLike = async (imageId: string) => {
    try {
      await toggleLike(imageId);
      loadStats();
      const updatedImage = images.find(img => img._id === imageId);
      if (updatedImage) {
        setSelectedImage(updatedImage);
      }
    } catch (err) {
      setError('Failed to update like status');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteImage(imageId);
      loadStats();
      if (selectedImage?._id === imageId) {
        setSelectedImage(null);
      }
    } catch (err) {
      setError('Failed to delete image');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    switch (filterType) {
      case 'uploads':
        await fetchUserImages(nextPage);
        break;
      case 'liked':
        await fetchLikedImages(nextPage);
        break;
      case 'all':
      default:
        await fetchCollection(nextPage);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                <Image className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold ml-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                FrameIt
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold flex items-center justify-center"
                  title="View profile"
                >
                  {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 z-50">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center text-lg">
                        {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-semibold">{user?.username}</p>
                        <p className="text-gray-500 text-sm truncate">{user?.email}</p>
                      </div>
                    </div>

                    <div className="pt-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                        Total Likes
                      </p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {statsLoading ? '...' : totalLikes}
                      </p>
                      {statsError && (
                        <p className="text-xs text-red-500 mt-1">{statsError}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Your Collections
          </h2>
          <p className="text-gray-600">
            Explore your uploaded and liked images
          </p>
        </div>

        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { value: 'all' as FilterType, label: 'All Images', icon: Grid },
            { value: 'uploads' as FilterType, label: 'My Uploads' },
            { value: 'liked' as FilterType, label: 'Liked' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleFilterChange(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === filter.value
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-500'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {fetchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {fetchError}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <ImageGallery
            images={images}
            loading={loading}
            onToggleLike={handleToggleLike}
            onDeleteImage={handleDeleteImage}
            onImageClick={handleImageClick}
          />

          {currentPage < totalPages && !loading && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Load More Images
              </button>
            </div>
          )}
        </div>
      </main>

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <FullscreenViewer
        isOpen={selectedImage !== null}
        images={images}
        initialIndex={selectedImageIndex}
        onClose={() => setSelectedImage(null)}
        onToggleLike={handleToggleLike}
      />
    </div>
  );
}
