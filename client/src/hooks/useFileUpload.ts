import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface FileAttachment {
  id: number;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  isPublic: boolean;
  uploadedAt: string;
  projectId?: number;
}

export function useFileUpload(projectId?: number) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get user's files
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['/api/files', projectId],
    queryFn: async () => {
      const params = projectId ? `?projectId=${projectId}` : '';
      const response = await apiRequest('GET', `/api/files${params}`);
      const data = await response.json();
      return data.files as FileAttachment[];
    }
  });

  // Upload files
  const uploadFiles = async (files: FileList, onProgress?: (progress: number) => void): Promise<FileAttachment[]> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const params = projectId ? `?projectId=${projectId}` : '';
      
      // Use XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setUploadProgress(progress);
            onProgress?.(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result.files);
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `/api/files/upload${params}`);
        xhr.send(formData);
      });

    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: uploadFiles,
    onSuccess: (uploadedFiles) => {
      // Refresh file list
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      
      toast({
        title: "Upload Successful",
        description: `${uploadedFiles.length} file(s) uploaded successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      return apiRequest('DELETE', `/api/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      toast({
        title: "File Deleted",
        description: "File has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  });

  // Download file
  const downloadFile = (fileId: number, filename: string) => {
    const link = document.createElement('a');
    link.href = `/api/files/${fileId}?download=true`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    files,
    isLoading,
    isUploading,
    uploadProgress,
    uploadFiles: uploadMutation.mutateAsync,
    deleteFile: deleteFileMutation.mutateAsync,
    downloadFile,
    isUploadPending: uploadMutation.isPending,
    isDeletePending: deleteFileMutation.isPending,
  };
}