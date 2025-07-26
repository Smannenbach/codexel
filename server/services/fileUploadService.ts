import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../storage';
import { usageTracker } from './usageTracker';

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Store files in public/uploads directory
      cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/zip'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  }
});

export class FileUploadService {
  // Process uploaded files and save to database
  async processUploadedFiles(
    files: Express.Multer.File[],
    userId: string,
    projectId?: number
  ): Promise<any[]> {
    const processedFiles = [];

    for (const file of files) {
      try {
        // Save file info to database
        const fileRecord = await storage.createFileAttachment({
          userId,
          projectId,
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`,
          isPublic: false,
          metadata: {
            uploadedAt: new Date().toISOString(),
            path: file.path
          }
        });

        // Track storage usage
        await usageTracker.trackStorageUsage(userId, file.size / (1024 * 1024));

        processedFiles.push({
          id: fileRecord.id,
          filename: fileRecord.filename,
          originalName: fileRecord.originalName,
          size: fileRecord.size,
          type: fileRecord.mimeType,
          url: fileRecord.url,
          uploadedAt: fileRecord.createdAt
        });

      } catch (error) {
        console.error('Failed to process uploaded file:', error);
        throw new Error(`Failed to process file ${file.originalname}`);
      }
    }

    return processedFiles;
  }

  // Get file upload middleware
  getUploadMiddleware() {
    return upload.array('files', 5);
  }

  // Delete file
  async deleteFile(fileId: number, userId: string): Promise<boolean> {
    try {
      const file = await storage.getFileAttachments(userId);
      const targetFile = file.find(f => f.id === fileId);
      
      if (!targetFile) {
        return false;
      }

      // Delete from database
      const deleted = await storage.deleteFileAttachment(fileId, userId);
      
      if (deleted) {
        // TODO: Also delete physical file from disk
        // This would require fs.unlink() but we'll keep files for now for safety
        
        // Update storage usage (subtract)
        await usageTracker.trackStorageUsage(userId, -(targetFile.size / (1024 * 1024)));
      }

      return deleted;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  // Check if user has storage quota available
  async checkStorageQuota(userId: string, fileSizeMB: number): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.usageQuota) return false;

      const currentStorageGB = user.usageQuota.storageGB || 0;
      const maxStorageGB = this.getStorageLimit(user.subscriptionStatus || 'free');
      
      return (currentStorageGB + fileSizeMB / 1024) <= maxStorageGB;
    } catch (error) {
      console.error('Failed to check storage quota:', error);
      return false;
    }
  }

  private getStorageLimit(subscriptionStatus: string): number {
    switch (subscriptionStatus) {
      case 'free': return 1; // 1GB
      case 'pro': return 10; // 10GB
      case 'enterprise': return 100; // 100GB
      default: return 1;
    }
  }
}

export const fileUploadService = new FileUploadService();