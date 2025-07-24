import type { Express } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { rateLimiters } from "../middleware/rateLimiter";

const snapshotSchema = z.object({
  projectId: z.number(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  snapshotData: z.any(), // Complete workspace state
  thumbnail: z.string().optional(),
  isAutoSaved: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

const restoreSnapshotSchema = z.object({
  snapshotId: z.number(),
  projectId: z.number()
});

export function registerSnapshotRoutes(app: Express) {
  // Create a workspace snapshot
  app.post("/api/snapshots", rateLimiters.general, async (req, res) => {
    try {
      const snapshot = snapshotSchema.parse(req.body);
      const userId = 1; // In real app, get from authenticated user

      console.log('📸 Creating workspace snapshot:', {
        name: snapshot.name,
        projectId: snapshot.projectId,
        isAutoSaved: snapshot.isAutoSaved
      });

      // Create snapshot with complete workspace state
      const createdSnapshot = await storage.createWorkspaceSnapshot({
        userId,
        projectId: snapshot.projectId,
        name: snapshot.name,
        description: snapshot.description,
        snapshotData: snapshot.snapshotData,
        thumbnail: snapshot.thumbnail,
        isAutoSaved: snapshot.isAutoSaved,
        tags: snapshot.tags
      });

      res.json({ 
        success: true, 
        snapshot: createdSnapshot,
        message: `Snapshot "${snapshot.name}" created successfully`
      });

    } catch (error) {
      console.error('Snapshot creation error:', error);
      res.status(400).json({ 
        success: false, 
        error: 'Invalid snapshot request' 
      });
    }
  });

  // Get all snapshots for a project
  app.get("/api/snapshots/project/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = 1; // In real app, get from authenticated user

      const snapshots = await storage.getWorkspaceSnapshots(userId, projectId);

      res.json({ 
        snapshots: snapshots.map(snapshot => ({
          ...snapshot,
          snapshotData: undefined // Don't send full data in list view
        }))
      });

    } catch (error) {
      console.error('Error fetching snapshots:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch snapshots' 
      });
    }
  });

  // Get a specific snapshot with full data
  app.get("/api/snapshots/:id", async (req, res) => {
    try {
      const snapshotId = parseInt(req.params.id);
      const userId = 1; // In real app, get from authenticated user

      const snapshot = await storage.getWorkspaceSnapshotById(snapshotId, userId);
      
      if (!snapshot) {
        return res.status(404).json({ 
          success: false, 
          error: 'Snapshot not found' 
        });
      }

      res.json({ snapshot });

    } catch (error) {
      console.error('Error fetching snapshot:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch snapshot' 
      });
    }
  });

  // Restore workspace from snapshot
  app.post("/api/snapshots/restore", rateLimiters.general, async (req, res) => {
    try {
      const { snapshotId, projectId } = restoreSnapshotSchema.parse(req.body);
      const userId = 1; // In real app, get from authenticated user

      console.log('🔄 Restoring workspace from snapshot:', {
        snapshotId,
        projectId,
        userId
      });

      const snapshot = await storage.getWorkspaceSnapshotById(snapshotId, userId);
      
      if (!snapshot) {
        return res.status(404).json({ 
          success: false, 
          error: 'Snapshot not found' 
        });
      }

      // In a real implementation, this would:
      // 1. Validate snapshot compatibility
      // 2. Backup current state
      // 3. Restore workspace configuration
      // 4. Update project state
      // 5. Notify user of successful restoration

      res.json({ 
        success: true, 
        snapshot: snapshot.snapshotData,
        message: `Workspace restored from "${snapshot.name}"`
      });

    } catch (error) {
      console.error('Snapshot restore error:', error);
      res.status(400).json({ 
        success: false, 
        error: 'Failed to restore snapshot' 
      });
    }
  });

  // Delete a snapshot
  app.delete("/api/snapshots/:id", rateLimiters.general, async (req, res) => {
    try {
      const snapshotId = parseInt(req.params.id);
      const userId = 1; // In real app, get from authenticated user

      const deleted = await storage.deleteWorkspaceSnapshot(snapshotId, userId);
      
      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          error: 'Snapshot not found' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Snapshot deleted successfully' 
      });

    } catch (error) {
      console.error('Error deleting snapshot:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete snapshot' 
      });
    }
  });

  // Auto-save workspace state (called periodically)
  app.post("/api/snapshots/auto-save", rateLimiters.upload, async (req, res) => {
    try {
      const { projectId, snapshotData } = req.body;
      const userId = 1; // In real app, get from authenticated user

      // Delete old auto-save snapshots (keep only latest 3)
      await storage.cleanupAutoSaveSnapshots(userId, projectId, 3);

      // Create new auto-save snapshot
      const autoSnapshot = await storage.createWorkspaceSnapshot({
        userId,
        projectId,
        name: `Auto-save ${new Date().toLocaleString()}`,
        description: 'Automatically saved workspace state',
        snapshotData,
        isAutoSaved: true,
        tags: ['auto-save']
      });

      res.json({ 
        success: true, 
        autoSnapshot: { id: autoSnapshot.id, name: autoSnapshot.name }
      });

    } catch (error) {
      console.error('Auto-save error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Auto-save failed' 
      });
    }
  });
}