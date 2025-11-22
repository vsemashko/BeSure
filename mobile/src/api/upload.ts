import apiClient from './client';
import type { ApiResponse } from '../types';

interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export const uploadApi = {
  /**
   * Upload profile picture
   */
  async uploadProfilePicture(imageUri: string): Promise<UploadResult> {
    const formData = new FormData();

    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await apiClient.post<ApiResponse<UploadResult>>(
      '/upload/profile',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to upload image');
  },

  /**
   * Upload question image
   */
  async uploadQuestionImage(imageUri: string): Promise<UploadResult> {
    const formData = new FormData();

    const filename = imageUri.split('/').pop() || 'question.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await apiClient.post<ApiResponse<UploadResult>>(
      '/upload/question',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to upload image');
  },

  /**
   * Upload option image
   */
  async uploadOptionImage(imageUri: string): Promise<UploadResult> {
    const formData = new FormData();

    const filename = imageUri.split('/').pop() || 'option.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await apiClient.post<ApiResponse<UploadResult>>(
      '/upload/option',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to upload image');
  },

  /**
   * Delete uploaded image
   */
  async deleteImage(key: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/upload/${encodeURIComponent(key)}`
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete image');
    }
  },
};

export default uploadApi;
