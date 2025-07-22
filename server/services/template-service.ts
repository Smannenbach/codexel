import { storage } from '../storage';
import type { InsertProject, InsertAgent, InsertChecklistItem } from '@shared/schema';

interface TemplateConfig {
  templateId: string;
  features: string[];
  techStack: string[];
}

export class TemplateService {
  private templates = {
    'ecommerce': {
      checklist: [
        // Planning
        { title: 'Define product categories and inventory structure', category: 'Planning', priority: 'high' },
        { title: 'Design user authentication flow', category: 'Planning', priority: 'high' },
        { title: 'Plan payment processing integration', category: 'Planning', priority: 'high' },
        
        // Architecture
        { title: 'Set up database schema for products and orders', category: 'Architecture', priority: 'high' },
        { title: 'Design API endpoints for CRUD operations', category: 'Architecture', priority: 'high' },
        { title: 'Implement authentication middleware', category: 'Architecture', priority: 'medium' },
        
        // Design
        { title: 'Create product listing page', category: 'Design', priority: 'high' },
        { title: 'Design shopping cart interface', category: 'Design', priority: 'high' },
        { title: 'Build checkout flow UI', category: 'Design', priority: 'high' },
        
        // Development
        { title: 'Implement product catalog backend', category: 'Development', priority: 'high' },
        { title: 'Build shopping cart functionality', category: 'Development', priority: 'high' },
        { title: 'Integrate Stripe payment processing', category: 'Development', priority: 'high' },
        { title: 'Create order management system', category: 'Development', priority: 'medium' },
        { title: 'Implement email notifications', category: 'Development', priority: 'medium' },
        
        // Testing
        { title: 'Test payment flow end-to-end', category: 'Testing', priority: 'high' },
        { title: 'Verify cart calculations', category: 'Testing', priority: 'high' },
        { title: 'Test responsive design', category: 'Testing', priority: 'medium' },
        
        // Deployment
        { title: 'Set up production database', category: 'Deployment', priority: 'high' },
        { title: 'Configure SSL certificates', category: 'Deployment', priority: 'high' },
        { title: 'Deploy to production', category: 'Deployment', priority: 'high' }
      ],
      agents: [
        { name: 'Frontend Developer', role: 'frontend', specialties: ['React', 'UI/UX'] },
        { name: 'Backend Developer', role: 'backend', specialties: ['Node.js', 'API Design'] },
        { name: 'Database Architect', role: 'architect', specialties: ['PostgreSQL', 'Schema Design'] },
        { name: 'Payment Specialist', role: 'specialist', specialties: ['Stripe', 'Security'] }
      ]
    },
    'ai-chatbot': {
      checklist: [
        // Planning
        { title: 'Define chatbot personality and capabilities', category: 'Planning', priority: 'high' },
        { title: 'Choose AI models to integrate', category: 'Planning', priority: 'high' },
        
        // Architecture
        { title: 'Design message handling system', category: 'Architecture', priority: 'high' },
        { title: 'Set up WebSocket for real-time communication', category: 'Architecture', priority: 'high' },
        
        // Development
        { title: 'Implement chat interface', category: 'Development', priority: 'high' },
        { title: 'Integrate OpenAI API', category: 'Development', priority: 'high' },
        { title: 'Add conversation history', category: 'Development', priority: 'medium' },
        { title: 'Implement context awareness', category: 'Development', priority: 'medium' },
        
        // Testing
        { title: 'Test AI responses', category: 'Testing', priority: 'high' },
        { title: 'Verify WebSocket stability', category: 'Testing', priority: 'high' },
        
        // Deployment
        { title: 'Configure API keys', category: 'Deployment', priority: 'high' },
        { title: 'Deploy application', category: 'Deployment', priority: 'high' }
      ],
      agents: [
        { name: 'AI Engineer', role: 'ai-engineer', specialties: ['OpenAI', 'NLP'] },
        { name: 'Frontend Developer', role: 'frontend', specialties: ['React', 'WebSocket'] },
        { name: 'Backend Developer', role: 'backend', specialties: ['Node.js', 'Real-time'] }
      ]
    }
  };

  async createFromTemplate(
    userId: number, 
    projectData: Partial<InsertProject>, 
    templateConfig: TemplateConfig
  ) {
    const template = this.templates[templateConfig.templateId as keyof typeof this.templates];
    if (!template) {
      throw new Error('Template not found');
    }

    // Create project
    const project = await storage.createProject({
      userId,
      name: projectData.name || `New ${templateConfig.templateId} Project`,
      description: projectData.description || '',
      config: {
        ...projectData.config,
        template: templateConfig.templateId,
        features: templateConfig.features,
        techStack: templateConfig.techStack
      }
    });

    // Create agents
    for (const agentData of template.agents) {
      const agent = await storage.createAgent({
        name: agentData.name,
        role: agentData.role,
        model: 'gpt-4-turbo',
        color: this.getAgentColor(agentData.role),
        description: `${agentData.role} specialist`,
        status: 'idle'
      });
      await storage.associateAgentWithProject(project.id, agent.id);
    }

    // Create checklist items
    for (let i = 0; i < template.checklist.length; i++) {
      const item = template.checklist[i];
      await storage.createChecklistItem({
        projectId: project.id,
        ...item,
        status: 'pending',
        order: i + 1
      });
    }

    return project;
  }

  private getAgentColor(role: string): string {
    const colors: Record<string, string> = {
      'frontend': '#3b82f6',
      'backend': '#10b981',
      'architect': '#8b5cf6',
      'specialist': '#f59e0b',
      'ai-engineer': '#ec4899',
      'planner': '#06b6d4',
      'tester': '#ef4444'
    };
    return colors[role] || '#6b7280';
  }
}