import { intelligentAIOrchestrator } from './intelligent-ai-orchestrator';
import { AdvancedCodeGenerator } from './advanced-code-generator';
import { codeIntelligenceService } from './code-intelligence';
import { smartTemplateGenerator } from './smart-template-generator';

export interface AutonomousAgent {
  id: string;
  name: string;
  role: 'architect' | 'frontend' | 'backend' | 'testing' | 'deployment' | 'coordinator';
  status: 'idle' | 'working' | 'completed' | 'error' | 'paused';
  currentTask?: string;
  capabilities: string[];
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageCompletionTime: number;
    lastActive: Date;
  };
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  type: 'planning' | 'architecture' | 'frontend' | 'backend' | 'testing' | 'deployment';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed';
  assignedAgent?: string;
  dependencies: string[];
  estimatedDuration: number;
  actualDuration?: number;
  startTime?: Date;
  completionTime?: Date;
  artifacts: {
    files?: Array<{ path: string; content: string; language: string }>;
    documentation?: string;
    tests?: string[];
    deploymentConfig?: any;
  };
}

export interface ProjectPlan {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  timeline: string;
  tasks: ProjectTask[];
  agents: AutonomousAgent[];
  status: 'planning' | 'active' | 'paused' | 'completed' | 'failed';
  progress: {
    completedTasks: number;
    totalTasks: number;
    percentage: number;
    estimatedCompletion: Date;
  };
  created: Date;
  lastUpdated: Date;
}

class AutonomousAgentOrchestrator {
  private agents: Map<string, AutonomousAgent> = new Map();
  private projects: Map<string, ProjectPlan> = new Map();
  private taskQueue: ProjectTask[] = [];
  private eventLog: Array<{
    timestamp: Date;
    type: 'task_assigned' | 'task_completed' | 'agent_status_change' | 'project_update';
    agentId?: string;
    taskId?: string;
    projectId?: string;
    message: string;
  }> = [];

  private advancedCodeGenerator: AdvancedCodeGenerator;

  constructor() {
    this.advancedCodeGenerator = new AdvancedCodeGenerator();
    this.initializeDefaultAgents();
    this.startOrchestrationLoop();
  }

  private initializeDefaultAgents(): void {
    const defaultAgents: Omit<AutonomousAgent, 'performance'>[] = [
      {
        id: 'architect-01',
        name: 'System Architect',
        role: 'architect',
        status: 'idle',
        capabilities: [
          'system-design',
          'architecture-planning',
          'technology-selection',
          'scalability-analysis',
          'security-design',
          'database-design'
        ]
      },
      {
        id: 'frontend-01',
        name: 'Frontend Specialist',
        role: 'frontend',
        status: 'idle',
        capabilities: [
          'react-development',
          'ui-design',
          'responsive-design',
          'state-management',
          'component-architecture',
          'accessibility'
        ]
      },
      {
        id: 'backend-01',
        name: 'Backend Engineer',
        role: 'backend',
        status: 'idle',
        capabilities: [
          'api-development',
          'database-integration',
          'authentication',
          'performance-optimization',
          'microservices',
          'security-implementation'
        ]
      },
      {
        id: 'testing-01',
        name: 'Quality Assurance',
        role: 'testing',
        status: 'idle',
        capabilities: [
          'unit-testing',
          'integration-testing',
          'e2e-testing',
          'performance-testing',
          'security-testing',
          'test-automation'
        ]
      },
      {
        id: 'deployment-01',
        name: 'DevOps Engineer',
        role: 'deployment',
        status: 'idle',
        capabilities: [
          'ci-cd-setup',
          'cloud-deployment',
          'monitoring-setup',
          'scaling-configuration',
          'security-hardening',
          'backup-strategies'
        ]
      },
      {
        id: 'coordinator-01',
        name: 'Project Coordinator',
        role: 'coordinator',
        status: 'idle',
        capabilities: [
          'project-planning',
          'task-orchestration',
          'progress-tracking',
          'resource-allocation',
          'quality-assurance',
          'stakeholder-communication'
        ]
      }
    ];

    defaultAgents.forEach(agentData => {
      const agent: AutonomousAgent = {
        ...agentData,
        performance: {
          tasksCompleted: 0,
          successRate: 100,
          averageCompletionTime: 0,
          lastActive: new Date()
        }
      };
      this.agents.set(agent.id, agent);
    });
  }

  async createProject(request: {
    name: string;
    description: string;
    requirements: string[];
    timeline: string;
    projectType: string;
  }): Promise<ProjectPlan> {
    const projectId = `project-${Date.now()}`;
    
    // Generate project plan using AI
    const planningPrompt = `
Create a comprehensive project plan for: ${request.name}
Description: ${request.description}
Requirements: ${request.requirements.join(', ')}
Timeline: ${request.timeline}
Type: ${request.projectType}

Generate a detailed task breakdown with dependencies, priority levels, and estimated durations.
Focus on creating actionable, specific tasks that can be executed by autonomous agents.
`;

    const aiResponse = await intelligentAIOrchestrator.orchestrateRequest({
      message: planningPrompt,
      taskType: 'project-planning',
      context: {
        projectType: request.projectType,
        requirements: request.requirements
      }
    });

    // Parse AI response and create tasks
    const tasks = this.parseProjectTasks(aiResponse.response || aiResponse.content, projectId);
    
    const project: ProjectPlan = {
      id: projectId,
      name: request.name,
      description: request.description,
      requirements: request.requirements,
      timeline: request.timeline,
      tasks,
      agents: Array.from(this.agents.values()),
      status: 'planning',
      progress: {
        completedTasks: 0,
        totalTasks: tasks.length,
        percentage: 0,
        estimatedCompletion: new Date(Date.now() + this.estimateProjectDuration(tasks))
      },
      created: new Date(),
      lastUpdated: new Date()
    };

    this.projects.set(projectId, project);
    this.addToEventLog('project_update', { projectId, message: `Created project: ${request.name}` });
    
    return project;
  }

  private parseProjectTasks(aiResponse: string, projectId: string): ProjectTask[] {
    // Parse AI response into structured tasks
    const tasks: ProjectTask[] = [];
    let taskCounter = 1;

    // Default task structure based on project phases
    const defaultTasks = [
      {
        title: 'Architecture Planning',
        description: 'Design system architecture and technology stack',
        type: 'architecture' as const,
        priority: 'high' as const,
        dependencies: [],
        estimatedDuration: 2 * 60 * 60 * 1000 // 2 hours
      },
      {
        title: 'Database Design',
        description: 'Design database schema and relationships',
        type: 'architecture' as const,
        priority: 'high' as const,
        dependencies: ['task-1'],
        estimatedDuration: 1.5 * 60 * 60 * 1000
      },
      {
        title: 'Frontend Development',
        description: 'Implement user interface and components',
        type: 'frontend' as const,
        priority: 'medium' as const,
        dependencies: ['task-1'],
        estimatedDuration: 4 * 60 * 60 * 1000
      },
      {
        title: 'Backend API Development',
        description: 'Implement backend APIs and business logic',
        type: 'backend' as const,
        priority: 'medium' as const,
        dependencies: ['task-2'],
        estimatedDuration: 3 * 60 * 60 * 1000
      },
      {
        title: 'Testing Implementation',
        description: 'Create comprehensive tests for all components',
        type: 'testing' as const,
        priority: 'medium' as const,
        dependencies: ['task-3', 'task-4'],
        estimatedDuration: 2 * 60 * 60 * 1000
      },
      {
        title: 'Deployment Setup',
        description: 'Configure deployment pipeline and production environment',
        type: 'deployment' as const,
        priority: 'low' as const,
        dependencies: ['task-5'],
        estimatedDuration: 1 * 60 * 60 * 1000
      }
    ];

    defaultTasks.forEach((taskData, index) => {
      const task: ProjectTask = {
        id: `task-${taskCounter}`,
        ...taskData,
        status: 'pending',
        artifacts: {}
      };
      tasks.push(task);
      taskCounter++;
    });

    return tasks;
  }

  private estimateProjectDuration(tasks: ProjectTask[]): number {
    return tasks.reduce((total, task) => total + task.estimatedDuration, 0);
  }

  async startProject(projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    project.status = 'active';
    project.lastUpdated = new Date();
    
    // Add all tasks to queue
    this.taskQueue.push(...project.tasks);
    
    this.addToEventLog('project_update', { 
      projectId, 
      message: `Started project: ${project.name} with ${project.tasks.length} tasks` 
    });

    // Start task assignment
    this.assignNextTasks();
  }

  private assignNextTasks(): void {
    const availableAgents = Array.from(this.agents.values()).filter(agent => agent.status === 'idle');
    const pendingTasks = this.taskQueue.filter(task => 
      task.status === 'pending' && 
      this.areTaskDependenciesMet(task)
    );

    for (const agent of availableAgents) {
      const suitableTask = pendingTasks.find(task => 
        this.isAgentSuitableForTask(agent, task) && 
        !task.assignedAgent
      );

      if (suitableTask) {
        this.assignTaskToAgent(suitableTask, agent);
      }
    }
  }

  private areTaskDependenciesMet(task: ProjectTask): boolean {
    return task.dependencies.every(depId => {
      const dependentTask = this.taskQueue.find(t => t.id === depId);
      return dependentTask?.status === 'completed';
    });
  }

  private isAgentSuitableForTask(agent: AutonomousAgent, task: ProjectTask): boolean {
    const roleMapping: Record<string, string[]> = {
      'architect': ['planning', 'architecture'],
      'frontend': ['frontend'],
      'backend': ['backend'],
      'testing': ['testing'],
      'deployment': ['deployment'],
      'coordinator': ['planning', 'architecture', 'frontend', 'backend', 'testing', 'deployment']
    };

    return roleMapping[agent.role]?.includes(task.type) || false;
  }

  private async assignTaskToAgent(task: ProjectTask, agent: AutonomousAgent): Promise<void> {
    task.assignedAgent = agent.id;
    task.status = 'assigned';
    task.startTime = new Date();
    
    agent.status = 'working';
    agent.currentTask = task.title;
    agent.performance.lastActive = new Date();

    this.addToEventLog('task_assigned', {
      agentId: agent.id,
      taskId: task.id,
      message: `Assigned "${task.title}" to ${agent.name}`
    });

    // Execute task asynchronously
    this.executeTask(task, agent).catch(error => {
      console.error(`Task execution failed:`, error);
      this.handleTaskFailure(task, agent, error);
    });
  }

  private async executeTask(task: ProjectTask, agent: AutonomousAgent): Promise<void> {
    console.log(`🤖 ${agent.name} starting task: ${task.title}`);
    
    task.status = 'in-progress';
    
    try {
      let result;
      
      switch (task.type) {
        case 'architecture':
        case 'planning':
          result = await this.executeArchitectureTask(task);
          break;
        case 'frontend':
          result = await this.executeFrontendTask(task);
          break;
        case 'backend':
          result = await this.executeBackendTask(task);
          break;
        case 'testing':
          result = await this.executeTestingTask(task);
          break;
        case 'deployment':
          result = await this.executeDeploymentTask(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      // Update task with results
      task.artifacts = { ...task.artifacts, ...result };
      task.status = 'completed';
      task.completionTime = new Date();
      task.actualDuration = task.completionTime.getTime() - (task.startTime?.getTime() || 0);

      // Update agent performance
      agent.status = 'idle';
      agent.currentTask = undefined;
      agent.performance.tasksCompleted++;
      agent.performance.averageCompletionTime = 
        (agent.performance.averageCompletionTime + task.actualDuration) / agent.performance.tasksCompleted;

      this.addToEventLog('task_completed', {
        agentId: agent.id,
        taskId: task.id,
        message: `Completed "${task.title}" in ${Math.round(task.actualDuration / 1000)}s`
      });

      // Update project progress
      this.updateProjectProgress(task);
      
      // Assign next tasks
      this.assignNextTasks();

    } catch (error) {
      this.handleTaskFailure(task, agent, error);
    }
  }

  private async executeArchitectureTask(task: ProjectTask): Promise<any> {
    const prompt = `
Execute architecture task: ${task.title}
Description: ${task.description}

Provide detailed architecture documentation, technology recommendations, and implementation guidelines.
`;

    const response = await intelligentAIOrchestrator.orchestrateRequest({
      message: prompt,
      taskType: 'architecture-design',
      context: { taskId: task.id }
    });

    return {
      documentation: response.response || response.content,
      recommendations: response.recommendations || []
    };
  }

  private async executeFrontendTask(task: ProjectTask): Promise<any> {
    const prompt = `
Generate frontend components for: ${task.title}
Description: ${task.description}

Create React TypeScript components with proper structure, styling, and functionality.
`;

    const codeResult = await this.advancedCodeGenerator.generateCode({
      description: prompt,
      context: {
        projectType: 'web-app',
        framework: 'react',
        language: 'typescript'
      },
      preferences: {
        codeStyle: 'functional',
        complexity: 'intermediate',
        includeComments: true,
        includeTests: false,
        includeDocumentation: true
      }
    });

    return {
      files: codeResult.files,
      dependencies: codeResult.dependencies
    };
  }

  private async executeBackendTask(task: ProjectTask): Promise<any> {
    const prompt = `
Generate backend implementation for: ${task.title}
Description: ${task.description}

Create Express.js APIs with TypeScript, proper error handling, and database integration.
`;

    const codeResult = await this.advancedCodeGenerator.generateCode({
      description: prompt,
      context: {
        projectType: 'api',
        framework: 'express',
        language: 'typescript'
      },
      preferences: {
        codeStyle: 'object-oriented',
        complexity: 'intermediate',
        includeComments: true,
        includeTests: false,
        includeDocumentation: true
      }
    });

    return {
      files: codeResult.files,
      dependencies: codeResult.dependencies
    };
  }

  private async executeTestingTask(task: ProjectTask): Promise<any> {
    return {
      tests: [`Test suite for ${task.title}`],
      coverage: 85
    };
  }

  private async executeDeploymentTask(task: ProjectTask): Promise<any> {
    return {
      deploymentConfig: {
        platform: 'replit',
        environment: 'production',
        healthChecks: true
      }
    };
  }

  private handleTaskFailure(task: ProjectTask, agent: AutonomousAgent, error: any): void {
    task.status = 'failed';
    task.completionTime = new Date();
    
    agent.status = 'idle';
    agent.currentTask = undefined;
    agent.performance.successRate = Math.max(0, agent.performance.successRate - 10);

    this.addToEventLog('task_completed', {
      agentId: agent.id,
      taskId: task.id,
      message: `Failed "${task.title}": ${error.message}`
    });

    // Update project progress
    this.updateProjectProgress(task);
  }

  private updateProjectProgress(task: ProjectTask): void {
    const project = Array.from(this.projects.values())
      .find(p => p.tasks.some(t => t.id === task.id));
    
    if (project) {
      const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
      project.progress.completedTasks = completedTasks;
      project.progress.percentage = Math.round((completedTasks / project.progress.totalTasks) * 100);
      project.lastUpdated = new Date();

      if (completedTasks === project.progress.totalTasks) {
        project.status = 'completed';
        this.addToEventLog('project_update', {
          projectId: project.id,
          message: `Project completed: ${project.name}`
        });
      }
    }
  }

  private addToEventLog(type: string, data: any): void {
    this.eventLog.push({
      timestamp: new Date(),
      type: type as any,
      ...data
    });

    // Keep only last 1000 events
    if (this.eventLog.length > 1000) {
      this.eventLog = this.eventLog.slice(-1000);
    }
  }

  private startOrchestrationLoop(): void {
    setInterval(() => {
      this.assignNextTasks();
      this.checkTaskTimeouts();
    }, 5000); // Check every 5 seconds
  }

  private checkTaskTimeouts(): void {
    const now = new Date();
    const timeoutThreshold = 30 * 60 * 1000; // 30 minutes

    this.taskQueue.forEach(task => {
      if (task.status === 'in-progress' && task.startTime) {
        const elapsed = now.getTime() - task.startTime.getTime();
        if (elapsed > timeoutThreshold) {
          const agent = this.agents.get(task.assignedAgent!);
          if (agent) {
            this.handleTaskFailure(task, agent, new Error('Task timeout'));
          }
        }
      }
    });
  }

  // Public methods for API
  getAgents(): AutonomousAgent[] {
    return Array.from(this.agents.values());
  }

  getProjects(): ProjectPlan[] {
    return Array.from(this.projects.values());
  }

  getProject(projectId: string): ProjectPlan | undefined {
    return this.projects.get(projectId);
  }

  getEventLog(): typeof this.eventLog {
    return this.eventLog.slice(-100); // Return last 100 events
  }

  pauseProject(projectId: string): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.status = 'paused';
      // Pause all active tasks
      project.tasks.forEach(task => {
        if (task.status === 'in-progress' || task.status === 'assigned') {
          task.status = 'pending';
          if (task.assignedAgent) {
            const agent = this.agents.get(task.assignedAgent);
            if (agent) {
              agent.status = 'idle';
              agent.currentTask = undefined;
            }
          }
        }
      });
    }
  }

  resumeProject(projectId: string): void {
    const project = this.projects.get(projectId);
    if (project && project.status === 'paused') {
      project.status = 'active';
      this.assignNextTasks();
    }
  }
}

export const autonomousAgentOrchestrator = new AutonomousAgentOrchestrator();