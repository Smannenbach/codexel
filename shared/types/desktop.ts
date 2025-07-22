// Desktop automation types for cross-platform integration
export interface DesktopCapabilities {
  linkedin: boolean;
  github: boolean;
  slack: boolean;
  email: boolean;
  twitter: boolean;
  figma: boolean;
  notion: boolean;
  calendar: boolean;
  automation: boolean;
  fileSystem: boolean;
  notifications: boolean;
  screenCapture: boolean;
}

export interface LinkedInIntegration {
  profile: {
    name: string;
    title: string;
    company: string;
    connections: number;
  };
  automation: {
    connectionsPerDay: number;
    messagesPerDay: number;
    followsPerDay: number;
  };
  campaigns: LinkedInCampaign[];
}

export interface LinkedInCampaign {
  id: string;
  name: string;
  type: 'outreach' | 'recruitment' | 'sales' | 'networking';
  targets: LinkedInTarget[];
  template: string;
  status: 'active' | 'paused' | 'completed';
  metrics: {
    sent: number;
    accepted: number;
    replied: number;
    conversions: number;
  };
}

export interface LinkedInTarget {
  id: string;
  name: string;
  title: string;
  company: string;
  profileUrl: string;
  status: 'pending' | 'sent' | 'connected' | 'replied' | 'rejected';
  lastContact?: Date;
}

export interface AutonomousTask {
  id: string;
  type: 'linkedin' | 'app-building' | 'integration' | 'design' | 'automation';
  description: string;
  requiredCapabilities: string[];
  assignedAgents: string[];
  workflow: WorkflowStep[];
  status: 'planning' | 'executing' | 'testing' | 'completed' | 'failed';
  securityChecks: SecurityCheck[];
  createdAt: Date;
  completedAt?: Date;
}

export interface WorkflowStep {
  id: string;
  action: string;
  app: string;
  parameters: Record<string, any>;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: any;
  startTime?: Date;
  endTime?: Date;
  estimatedDuration?: number;
}

export interface SecurityCheck {
  type: 'permission-check' | 'data-validation' | 'threat-detection' | 'code-scan';
  status: 'passed' | 'warning' | 'failed';
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: Date;
}

export interface AppIntegration {
  id: string;
  name: string;
  type: 'productivity' | 'social' | 'development' | 'design' | 'communication';
  installed: boolean;
  authenticated: boolean;
  permissions: string[];
  capabilities: string[];
  apiLimits?: {
    daily: number;
    hourly: number;
    remaining: number;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    app: string;
    event: string;
    conditions: Record<string, any>;
  };
  actions: {
    app: string;
    action: string;
    parameters: Record<string, any>;
  }[];
  enabled: boolean;
  lastRun?: Date;
  successCount: number;
  errorCount: number;
}

export interface DesktopNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  actions?: {
    label: string;
    action: string;
  }[];
}

export interface ScreenCapture {
  id: string;
  type: 'screenshot' | 'recording' | 'area-select';
  data: string; // base64 or file path
  timestamp: Date;
  annotations?: {
    type: 'arrow' | 'rectangle' | 'text' | 'highlight';
    x: number;
    y: number;
    width?: number;
    height?: number;
    text?: string;
    color?: string;
  }[];
}

export interface FileSystemAccess {
  permissions: {
    read: string[];
    write: string[];
    execute: string[];
  };
  watchedDirectories: string[];
  recentFiles: {
    path: string;
    lastAccessed: Date;
    type: 'read' | 'write' | 'create' | 'delete';
  }[];
}

export interface DesktopState {
  capabilities: DesktopCapabilities;
  integrations: AppIntegration[];
  activeTasks: AutonomousTask[];
  automationRules: AutomationRule[];
  notifications: DesktopNotification[];
  systemInfo: {
    platform: string;
    version: string;
    arch: string;
    memory: {
      total: number;
      used: number;
      available: number;
    };
    cpu: {
      cores: number;
      usage: number;
    };
  };
}