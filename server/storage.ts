import { db } from './db';
import { users, projects, agents, messages, checklistItems, projectAgents, workspaceLayouts, layoutRatings, workspaceAnalytics, layoutRecommendations, workspaceSnapshots, usageStats, fileAttachments, aiUsage } from '@shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import type { User, InsertUser, UpsertUser, Project, InsertProject, Agent, InsertAgent, Message, InsertMessage, ChecklistItem, InsertChecklistItem, WorkspaceLayout, InsertWorkspaceLayout, LayoutRating, InsertLayoutRating, WorkspaceAnalytic, InsertWorkspaceAnalytic, LayoutRecommendation, InsertLayoutRecommendation, WorkspaceSnapshot, InsertWorkspaceSnapshot, UsageStats, InsertUsageStats, FileAttachment, InsertFileAttachment, AiUsage, InsertAiUsage } from '@shared/schema';

export interface IStorage {
  // User operations (Replit Auth compatible)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserUsage(userId: string, usage: Partial<User['usageQuota']>): Promise<void>;

  // Project operations
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: number, userId?: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<Project>): Promise<void>;

  // Usage tracking operations
  createUsageStats(usage: InsertUsageStats): Promise<UsageStats>;
  getUserUsageStats(userId: string, period?: string): Promise<UsageStats[]>;
  trackAiUsage(usage: InsertAiUsage): Promise<AiUsage>;
  
  // File attachment operations
  createFileAttachment(attachment: InsertFileAttachment): Promise<FileAttachment>;
  getFileAttachments(userId: string, projectId?: number): Promise<FileAttachment[]>;
  deleteFileAttachment(id: number, userId: string): Promise<boolean>;

  // Agent operations
  getAgentsByProject(projectId: number): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;

  // Message operations
  getMessagesByProject(projectId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Checklist operations
  getChecklistItem(id: number): Promise<ChecklistItem | undefined>;
  getChecklistItemsByProject(projectId: number): Promise<ChecklistItem[]>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  updateChecklistItem(id: number, data: Partial<ChecklistItem>): Promise<void>;

  // Project-Agent association
  associateAgentWithProject(projectId: number, agentId: number): Promise<void>;

  // Workspace Layout operations
  getWorkspaceLayouts(filters?: { category?: string; isPublic?: boolean; userId?: number }): Promise<WorkspaceLayout[]>;
  getWorkspaceLayout(id: number): Promise<WorkspaceLayout | undefined>;
  createWorkspaceLayout(layout: InsertWorkspaceLayout): Promise<WorkspaceLayout>;
  updateWorkspaceLayout(id: number, data: Partial<WorkspaceLayout>): Promise<void>;
  incrementLayoutDownloads(id: number): Promise<void>;

  // Layout Rating operations
  createLayoutRating(rating: InsertLayoutRating): Promise<LayoutRating>;
  getUserLayoutRating(layoutId: number, userId: number): Promise<LayoutRating | undefined>;
  updateLayoutAverageRating(layoutId: number): Promise<void>;

  // Workspace Snapshot operations
  getWorkspaceSnapshots(userId: string, projectId?: number): Promise<WorkspaceSnapshot[]>;
  getWorkspaceSnapshotById(id: number, userId: string): Promise<WorkspaceSnapshot | undefined>;
  createWorkspaceSnapshot(snapshot: InsertWorkspaceSnapshot): Promise<WorkspaceSnapshot>;
  deleteWorkspaceSnapshot(id: number, userId: string): Promise<boolean>;
  cleanupAutoSaveSnapshots(userId: string, projectId: number, keepCount: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (Replit Auth compatible)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        usageQuota: userData.usageQuota || {
          aiCalls: 1000,
          storageGB: 1,
          workspaceHours: 50,
          projectCount: 5,
          resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserUsage(userId: string, usage: Partial<User['usageQuota']>): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const currentUsage = user.usageQuota || {
      aiCalls: 0,
      storageGB: 0,
      workspaceHours: 0,
      projectCount: 0,
      resetDate: new Date().toISOString()
    };

    await db
      .update(users)
      .set({
        usageQuota: { ...currentUsage, ...usage },
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Project operations with user authentication
  async getProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async getProject(id: number, userId?: string): Promise<Project | undefined> {
    const conditions = [eq(projects.id, id)];
    if (userId) {
      conditions.push(eq(projects.userId, userId));
    }
    const [project] = await db.select().from(projects).where(and(...conditions));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: number, data: Partial<Project>): Promise<void> {
    await db.update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id));
  }

  // Agent operations

  async getAgentsByProject(projectId: number): Promise<Agent[]> {
    const result = await db.select({
      agent: agents
    })
    .from(projectAgents)
    .innerJoin(agents, eq(projectAgents.agentId, agents.id))
    .where(eq(projectAgents.projectId, projectId));
    
    return result.map(r => r.agent);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db.insert(agents).values(insertAgent).returning();
    return agent;
  }



  // Message operations

  async getMessagesByProject(projectId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.projectId, projectId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  // Checklist operations
  async getChecklistItemsByProject(projectId: number): Promise<ChecklistItem[]> {
    return await db.select()
      .from(checklistItems)
      .where(eq(checklistItems.projectId, projectId))
      .orderBy(checklistItems.order);
  }

  async getChecklistItem(id: number): Promise<ChecklistItem | undefined> {
    const [item] = await db.select().from(checklistItems).where(eq(checklistItems.id, id));
    return item;
  }

  async createChecklistItem(insertItem: InsertChecklistItem): Promise<ChecklistItem> {
    const [item] = await db.insert(checklistItems).values(insertItem).returning();
    return item;
  }

  async updateChecklistItem(id: number, data: Partial<ChecklistItem>): Promise<void> {
    await db.update(checklistItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(checklistItems.id, id));
  }

  // Project-Agent association
  async associateAgentWithProject(projectId: number, agentId: number): Promise<void> {
    await db.insert(projectAgents).values({
      projectId,
      agentId,
    });
  }

  // Workspace Layout operations
  async getWorkspaceLayouts(filters?: { category?: string; isPublic?: boolean; userId?: number }): Promise<WorkspaceLayout[]> {
    let query = db.select().from(workspaceLayouts);
    
    if (filters) {
      const conditions = [];
      if (filters.category && filters.category !== 'all') {
        conditions.push(eq(workspaceLayouts.category, filters.category));
      }
      if (filters.isPublic !== undefined) {
        conditions.push(eq(workspaceLayouts.isPublic, filters.isPublic));
      }
      if (filters.userId !== undefined) {
        conditions.push(eq(workspaceLayouts.userId, filters.userId));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(workspaceLayouts.downloads), desc(workspaceLayouts.rating));
  }

  async getWorkspaceLayout(id: number): Promise<WorkspaceLayout | undefined> {
    const [layout] = await db.select().from(workspaceLayouts).where(eq(workspaceLayouts.id, id));
    return layout;
  }

  async createWorkspaceLayout(insertLayout: InsertWorkspaceLayout): Promise<WorkspaceLayout> {
    const [layout] = await db.insert(workspaceLayouts).values(insertLayout).returning();
    return layout;
  }

  async updateWorkspaceLayout(id: number, data: Partial<WorkspaceLayout>): Promise<void> {
    await db.update(workspaceLayouts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workspaceLayouts.id, id));
  }

  async incrementLayoutDownloads(id: number): Promise<void> {
    await db.update(workspaceLayouts)
      .set({ 
        downloads: sql`${workspaceLayouts.downloads} + 1`,
        updatedAt: new Date() 
      })
      .where(eq(workspaceLayouts.id, id));
  }

  // Layout Rating operations
  async createLayoutRating(insertRating: InsertLayoutRating): Promise<LayoutRating> {
    const [rating] = await db.insert(layoutRatings).values(insertRating).returning();
    await this.updateLayoutAverageRating(insertRating.layoutId);
    return rating;
  }

  async getUserLayoutRating(layoutId: number, userId: number): Promise<LayoutRating | undefined> {
    const [rating] = await db.select()
      .from(layoutRatings)
      .where(and(
        eq(layoutRatings.layoutId, layoutId),
        eq(layoutRatings.userId, userId)
      ));
    return rating;
  }

  async updateLayoutAverageRating(layoutId: number): Promise<void> {
    const ratings = await db.select({
      avgRating: sql<number>`AVG(${layoutRatings.rating})`.as('avg_rating')
    })
    .from(layoutRatings)
    .where(eq(layoutRatings.layoutId, layoutId));
    
    const avgRating = ratings[0]?.avgRating || 0;
    
    await db.update(workspaceLayouts)
      .set({ rating: avgRating })
      .where(eq(workspaceLayouts.id, layoutId));
  }

  // Usage tracking operations
  async createUsageStats(usage: InsertUsageStats): Promise<UsageStats> {
    const [stats] = await db.insert(usageStats).values(usage).returning();
    return stats;
  }

  async getUserUsageStats(userId: string, period?: string): Promise<UsageStats[]> {
    const conditions = [eq(usageStats.userId, userId)];
    if (period) {
      conditions.push(eq(usageStats.period, period));
    }
    
    return await db
      .select()
      .from(usageStats)
      .where(and(...conditions))
      .orderBy(desc(usageStats.periodStart));
  }

  async trackAiUsage(usage: InsertAiUsage): Promise<AiUsage> {
    const [aiUsageRecord] = await db.insert(aiUsage).values(usage).returning();
    return aiUsageRecord;
  }

  // File attachment operations
  async createFileAttachment(attachment: InsertFileAttachment): Promise<FileAttachment> {
    const [file] = await db.insert(fileAttachments).values(attachment).returning();
    return file;
  }

  async getFileAttachments(userId: string, projectId?: number): Promise<FileAttachment[]> {
    const conditions = [eq(fileAttachments.userId, userId)];
    if (projectId) {
      conditions.push(eq(fileAttachments.projectId, projectId));
    }
    
    return await db
      .select()
      .from(fileAttachments)
      .where(and(...conditions))
      .orderBy(desc(fileAttachments.createdAt));
  }

  async deleteFileAttachment(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(fileAttachments)
      .where(and(
        eq(fileAttachments.id, id),
        eq(fileAttachments.userId, userId)
      ));
    
    return (result.rowCount || 0) > 0;
  }

  // Workspace Snapshot operations (updated for string userId)
  async getWorkspaceSnapshots(userId: string, projectId?: number): Promise<WorkspaceSnapshot[]> {
    const conditions = [eq(workspaceSnapshots.userId, userId)];
    if (projectId) {
      conditions.push(eq(workspaceSnapshots.projectId, projectId));
    }
    
    return await db
      .select()
      .from(workspaceSnapshots)
      .where(and(...conditions))
      .orderBy(desc(workspaceSnapshots.createdAt));
  }

  async getWorkspaceSnapshotById(id: number, userId: string): Promise<WorkspaceSnapshot | undefined> {
    const [snapshot] = await db
      .select()
      .from(workspaceSnapshots)
      .where(and(eq(workspaceSnapshots.id, id), eq(workspaceSnapshots.userId, userId)));
    return snapshot;
  }

  async createWorkspaceSnapshot(insertSnapshot: InsertWorkspaceSnapshot): Promise<WorkspaceSnapshot> {
    const [snapshot] = await db.insert(workspaceSnapshots).values(insertSnapshot).returning();
    return snapshot;
  }

  async deleteWorkspaceSnapshot(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(workspaceSnapshots)
      .where(and(eq(workspaceSnapshots.id, id), eq(workspaceSnapshots.userId, userId)));
    return result.rowCount > 0;
  }

  async cleanupAutoSaveSnapshots(userId: number, projectId: number, keepCount: number): Promise<void> {
    // Get auto-save snapshots ordered by creation date (newest first)
    const autoSaves = await db
      .select({ id: workspaceSnapshots.id })
      .from(workspaceSnapshots)
      .where(and(
        eq(workspaceSnapshots.userId, userId),
        eq(workspaceSnapshots.projectId, projectId),
        eq(workspaceSnapshots.isAutoSaved, true)
      ))
      .orderBy(desc(workspaceSnapshots.createdAt));

    if (autoSaves.length > keepCount) {
      const toDelete = autoSaves.slice(keepCount);
      const idsToDelete = toDelete.map(s => s.id);
      
      for (const id of idsToDelete) {
        await db.delete(workspaceSnapshots).where(eq(workspaceSnapshots.id, id));
      }
    }
  }
}

export const storage: IStorage = new DatabaseStorage();
