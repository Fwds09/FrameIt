import { useState, useCallback } from 'react';
import api from '../utils/api';

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

interface ApiResponse {
  success: boolean;
  message?: string;
  images?: Image[];
  image?: Image;
  isLiked?: boolean;
  likesCount?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const useImages = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUserImages = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse>(`/images/user?page=${page}&limit=20`);
      if (response.data.success) {
        setImages(response.data.images || []);
        setTotal(response.data.total || 0);
        setCurrentPage(response.data.page || 1);
        setTotalPages(response.data.pages || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLikedImages = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse>(`/images/liked?page=${page}&limit=20`);
      if (response.data.success) {
        setImages(response.data.images || []);
        setTotal(response.data.total || 0);
        setCurrentPage(response.data.page || 1);
        setTotalPages(response.data.pages || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch liked images');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCollection = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse>(`/images/collection?page=${page}&limit=20`);
      if (response.data.success) {
        setImages(response.data.images || []);
        setTotal(response.data.total || 0);
        setCurrentPage(response.data.page || 1);
        setTotalPages(response.data.pages || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch collection');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleLike = useCallback(async (imageId: string) => {
    try {
      const response = await api.post<ApiResponse>(`/images/${imageId}/like`);
      if (response.data.success) {
        setImages(prevImages =>
          prevImages.map(img =>
            img._id === imageId
              ? {
                  ...img,
                  isLiked: response.data.isLiked,
                  likesCount: response.data.likesCount || 0
                }
              : img
          )
        );
        return response.data.isLiked;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle like');
      throw err;
    }
  }, []);

  const deleteImage = useCallback(async (imageId: string) => {
    try {
      const response = await api.delete(`/images/${imageId}`);
      if (response.data.success) {
        setImages(prevImages => prevImages.filter(img => img._id !== imageId));
        return true;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete image');
      throw err;
    }
  }, []);

  return {
    images,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    fetchUserImages,
    fetchLikedImages,
    fetchCollection,
    toggleLike,
    deleteImage,
    setError
  };
};
