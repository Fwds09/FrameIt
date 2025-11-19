import { useState, useCallback } from 'react';
import api from '../utils/api';

interface UploadResponse {
  success: boolean;
  message: string;
  image?: {
    id: string;
    filename: string;
    originalname: string;
    filepath: string;
    description: string;
    isPublic: boolean;
    likesCount: number;
    createdAt: string;
  };
}

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = useCallback(
    async (
      file: File,
      description: string = '',
      isPublic: boolean = false
    ): Promise<UploadResponse['image'] | null> => {
      setUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('description', description);
        formData.append('isPublic', String(isPublic));

        const response = await api.post<UploadResponse>('/images/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          },
        });

        if (response.data.success) {
          setUploadProgress(100);
          return response.data.image || null;
        } else {
          setUploadError(response.data.message || 'Upload failed');
          return null;
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'An error occurred while uploading';
        setUploadError(errorMessage);
        return null;
      } finally {
        setUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    []
  );

  const resetUploadState = useCallback(() => {
    setUploading(false);
    setUploadError(null);
    setUploadProgress(0);
  }, []);

  return {
    uploading,
    uploadError,
    uploadProgress,
    uploadImage,
    resetUploadState,
    setUploadError,
  };
};
