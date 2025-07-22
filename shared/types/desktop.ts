// Desktop Application Types for Codexel.ai

export interface DesktopCapabilities {
  // Platform Integrations
  platformIntegrations: {
    linkedin: LinkedInIntegration;
    github: GitHubIntegration;
    twitter: TwitterIntegration;
    slack: SlackIntegration;
    email: EmailIntegration;
  };

  // Autonomous Actions
  autonomousActions: {
    appBuilding: AppBuildingCapability;
    workflowManagement: WorkflowManagement;
    taskAutomation: TaskAutomation;
    testing: TestingCapability;
    deployment: DeploymentCapability;
  };

  // Security
  security: SecurityFeatures;

  // Memory System
  memorySystem: MemoryCapabilities;
}

export interface LinkedInIntegration {
  enabled: boolean;
  capabilities: {
    login: boolean;
    followUsers: boolean;
    connectWithUsers: boolean;
    sendMessages: boolean;
    postContent: boolean;
    scrapeProfiles: boolean;
    automateOutreach: boolean;
  };
  rateLimits: {
    connectionsPerDay: number;
    messagesPerDay: number;
    actionsPerHour: number;
  };
}

export interface GitHubIntegration {
  enabled: boolean;
  capabilities: {
    createRepositories: boolean;
    pushCode: boolean;
    createPullRequests: boolean;
    reviewCode: boolean;
    manageIssues: boolean;
    automateReleases: boolean;
  };
}

export interface AppBuildingCapability {
  supportedFrameworks: string[];
  capabilities: {
    generateCode: boolean;
    createUI: boolean;
    setupDatabase: boolean;
    implementAPIs: boolean;
    addAuthentication: boolean;
    setupPayments: boolean;
    deployToProduction: boolean;
  };
  automationLevel: 'full' | 'guided' | 'assisted';
}

export interface WorkflowManagement {
  maxConcurrentTasks: number;
  supportedApps: number; // 17+ apps as mentioned
  capabilities: {
    orchestrateMultipleAgents: boolean;
    manageTaskDependencies: boolean;
    parallelExecution: boolean;
    errorHandling: boolean;
    retryLogic: boolean;
    progressTracking: boolean;
  };
}

export interface SecurityFeatures {
  encryption: {
    atRest: boolean;
    inTransit: boolean;
    endToEnd: boolean;
  };
  aiSecurity: {
    rogueAgentDetection: boolean;
    sandboxedExecution: boolean;
    permissionSystem: boolean;
    auditLogging: boolean;
    threatMonitoring: boolean;
  };
  dataProtection: {
    piiDetection: boolean;
    dataIsolation: boolean;
    complianceChecks: boolean;
  };
}

export interface MemoryCapabilities {
  provider: 'vertex-ai' | 'custom' | 'hybrid';
  features: {
    perfectRecall: boolean;
    contextualRetrieval: boolean;
    crossAgentSharing: boolean;
    longTermStorage: boolean;
    embeddingSearch: boolean;
    hiveMind: HiveMindConfig;
  };
}

export interface HiveMindConfig {
  enabled: boolean;
  storageCapacity: string; // e.g., "1TB"
  sharedKnowledge: {
    codePatterns: boolean;
    userPreferences: boolean;
    problemSolutions: boolean;
    workflowTemplates: boolean;
    errorResolutions: boolean;
  };
  privacyControls: {
    userDataIsolation: boolean;
    anonymization: boolean;
    optOut: boolean;
  };
}

export interface DesktopAgent {
  id: string;
  name: string;
  capabilities: string[];
  status: 'idle' | 'working' | 'learning' | 'syncing';
  memoryAccess: {
    personal: boolean;
    hiveMind: boolean;
    contextWindow: number;
  };
  currentTask?: {
    type: string;
    progress: number;
    estimatedCompletion: Date;
    requiredApps: string[];
  };
}

export interface AutonomousTask {
  id: string;
  type: 'app-building' | 'automation' | 'integration' | 'design' | 'testing';
  description: string;
  requiredCapabilities: string[];
  assignedAgents: string[];
  workflow: WorkflowStep[];
  status: 'planning' | 'executing' | 'testing' | 'completed' | 'failed';
  securityChecks: SecurityCheck[];
}

export interface WorkflowStep {
  id: string;
  action: string;
  app: string;
  parameters: Record<string, any>;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: any;
}

export interface SecurityCheck {
  type: 'code-scan' | 'permission-check' | 'data-validation' | 'threat-detection';
  status: 'pending' | 'passed' | 'failed' | 'warning';
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface MemoryQuery {
  context: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  relevanceThreshold: number;
  maxResults: number;
  includeHiveMind: boolean;
}

export interface MemoryResult {
  memories: Memory[];
  relevanceScores: number[];
  source: 'personal' | 'hiveMind' | 'both';
}

export interface Memory {
  id: string;
  timestamp: Date;
  type: 'conversation' | 'code' | 'decision' | 'preference' | 'error' | 'solution';
  content: any;
  embedding: number[];
  metadata: {
    userId?: string;
    projectId?: string;
    agentId?: string;
    tags: string[];
  };
}