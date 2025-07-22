import { db } from '../db';
import { projects, agents, messages, projectAgents, checklistItems, type Project, type InsertChecklistItem } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export class ProjectService {
  async createProject(name: string, description: string, userId: string): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values({
        name,
        description,
        userId,
        config: {
          primaryModel: 'gpt-4',
          maxBudget: 25,
          autoApprove: false
        }
      })
      .returning();
    
    // Create default agents for the project
    await this.createDefaultAgents(project.id);
    
    return project;
  }

  async createDefaultAgents(projectId: number): Promise<void> {
    const defaultAgents = [
      {
        name: 'Planning & Strategy Agent',
        role: 'planner',
        model: 'gpt-4-turbo',
        description: 'Analyzes requirements and creates development roadmaps',
        color: 'blue'
      },
      {
        name: 'System Architect',
        role: 'architect',
        model: 'claude-3.5-sonnet',
        description: 'Designs system architecture and data models',
        color: 'purple'
      },
      {
        name: 'Frontend Developer',
        role: 'frontend',
        model: 'moonshot-kimi',
        description: 'Builds responsive React components and UI',
        color: 'green'
      },
      {
        name: 'Backend Developer',
        role: 'backend',
        model: 'qwen-2.5-max',
        description: 'Implements APIs and database logic',
        color: 'orange'
      },
      {
        name: 'UI/UX Designer',
        role: 'designer',
        model: 'gemini-ultra',
        description: 'Creates beautiful and intuitive interfaces',
        color: 'pink'
      },
      {
        name: 'Testing & QA Agent',
        role: 'tester',
        model: 'grok-2',
        description: 'Writes tests and ensures code quality',
        color: 'red'
      }
    ];

    for (const agentData of defaultAgents) {
      const [agent] = await db
        .insert(agents)
        .values(agentData)
        .returning();
      
      await db.insert(projectAgents).values({
        projectId,
        agentId: agent.id
      });
    }
  }

  async getProjectWithAgents(projectId: number) {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        projectAgents: {
          with: {
            agent: true
          }
        }
      }
    });
    
    return project;
  }

  async updateProjectStatus(projectId: number, status: 'active' | 'paused' | 'completed') {
    await db
      .update(projects)
      .set({ status })
      .where(eq(projects.id, projectId));
  }

  async getProjectMessages(projectId: number, limit = 50) {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.projectId, projectId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  async trackProjectCost(projectId: number, cost: number) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));
    
    if (project) {
      await db
        .update(projects)
        .set({ 
          totalCost: (project.totalCost || 0) + cost 
        })
        .where(eq(projects.id, projectId));
    }
  }

  async generateProjectChecklist(projectId: number, projectDescription: string) {
    // Generate a comprehensive development checklist based on project description
    const checklistTemplate: Omit<InsertChecklistItem, 'projectId'>[] = [
      // Planning Phase
      { title: 'Requirements Analysis', description: 'Analyze and document project requirements', category: 'Planning', assignedAgent: 'Project Manager', order: 1 },
      { title: 'User Stories', description: 'Create user stories and acceptance criteria', category: 'Planning', assignedAgent: 'Project Manager', order: 2 },
      { title: 'Technical Specification', description: 'Document technical requirements and constraints', category: 'Planning', assignedAgent: 'Solution Architect', order: 3 },
      { title: 'Project Timeline', description: 'Create project timeline and milestones', category: 'Planning', assignedAgent: 'Project Manager', order: 4 },
      
      // Architecture Phase
      { title: 'System Architecture', description: 'Design overall system architecture', category: 'Architecture', assignedAgent: 'Solution Architect', order: 5 },
      { title: 'Database Schema', description: 'Design database tables and relationships', category: 'Architecture', assignedAgent: 'Backend Developer', order: 6 },
      { title: 'API Design', description: 'Design REST API endpoints and contracts', category: 'Architecture', assignedAgent: 'Backend Developer', order: 7 },
      { title: 'Technology Stack', description: 'Finalize technology choices', category: 'Architecture', assignedAgent: 'Solution Architect', order: 8 },
      
      // Design Phase
      { title: 'Wireframes', description: 'Create low-fidelity wireframes', category: 'Design', assignedAgent: 'UI/UX Designer', order: 9 },
      { title: 'UI/UX Design', description: 'Create high-fidelity designs', category: 'Design', assignedAgent: 'UI/UX Designer', order: 10 },
      { title: 'Design System', description: 'Establish design tokens and components', category: 'Design', assignedAgent: 'UI/UX Designer', order: 11 },
      { title: 'Brand Identity', description: 'Define colors, typography, and style', category: 'Design', assignedAgent: 'UI/UX Designer', order: 12 },
      
      // Development Phase
      { title: 'Setup Development Environment', description: 'Initialize project and dependencies', category: 'Development', assignedAgent: 'Frontend Developer', order: 13 },
      { title: 'Database Implementation', description: 'Set up database and migrations', category: 'Development', assignedAgent: 'Backend Developer', order: 14 },
      { title: 'Authentication System', description: 'Implement user authentication', category: 'Development', assignedAgent: 'Backend Developer', order: 15 },
      { title: 'Core Features', description: 'Implement main application features', category: 'Development', assignedAgent: 'Frontend Developer', order: 16 },
      { title: 'API Endpoints', description: 'Implement all API endpoints', category: 'Development', assignedAgent: 'Backend Developer', order: 17 },
      { title: 'Frontend Components', description: 'Build React components', category: 'Development', assignedAgent: 'Frontend Developer', order: 18 },
      { title: 'State Management', description: 'Implement application state management', category: 'Development', assignedAgent: 'Frontend Developer', order: 19 },
      { title: 'Third-party Integrations', description: 'Integrate external services', category: 'Development', assignedAgent: 'Backend Developer', order: 20 },
      
      // Testing Phase
      { title: 'Unit Tests', description: 'Write unit tests for components', category: 'Testing', assignedAgent: 'QA Engineer', order: 21 },
      { title: 'Integration Tests', description: 'Test API endpoints and integrations', category: 'Testing', assignedAgent: 'QA Engineer', order: 22 },
      { title: 'E2E Tests', description: 'End-to-end testing scenarios', category: 'Testing', assignedAgent: 'QA Engineer', order: 23 },
      { title: 'Performance Testing', description: 'Test and optimize performance', category: 'Testing', assignedAgent: 'QA Engineer', order: 24 },
      
      // Deployment Phase
      { title: 'Production Environment', description: 'Set up production infrastructure', category: 'Deployment', assignedAgent: 'Backend Developer', order: 25 },
      { title: 'CI/CD Pipeline', description: 'Configure automated deployment', category: 'Deployment', assignedAgent: 'Backend Developer', order: 26 },
      { title: 'Security Audit', description: 'Perform security review', category: 'Deployment', assignedAgent: 'QA Engineer', order: 27 },
      { title: 'Launch Preparation', description: 'Final checks before launch', category: 'Deployment', assignedAgent: 'Project Manager', order: 28 },
    ];

    // Create checklist items
    for (const item of checklistTemplate) {
      await db.insert(checklistItems).values({
        ...item,
        projectId,
        status: 'pending',
      });
    }

    // Mark first few items as in progress
    const firstItems = await db.select()
      .from(checklistItems)
      .where(eq(checklistItems.projectId, projectId))
      .limit(2);

    for (const item of firstItems) {
      await db.update(checklistItems)
        .set({ status: 'in_progress' })
        .where(eq(checklistItems.id, item.id));
    }
  }
}

export const projectService = new ProjectService();