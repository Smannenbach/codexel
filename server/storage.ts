import { db } from './db';
import { users, projects, agents, messages, checklistItems, projectAgents } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import type { User, InsertUser, Project, InsertProject, Agent, InsertAgent, Message, InsertMessage, ChecklistItem, InsertChecklistItem } from '@shared/schema';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project operations
  getProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<Project>): Promise<void>;

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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Project operations
  async getProjects(userId: number): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
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

  async createChecklistItem(insertItem: InsertChecklistItem): Promise<ChecklistItem> {
    const [item] = await db.insert(checklistItems).values(insertItem).returning();
    return item;
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
}

export const storage: IStorage = new DatabaseStorage();
