export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  costPerToken: number;
  maxTokens: number;
  contextWindow: number;
  responseTime: 'fast' | 'medium' | 'slow';
}

export const AI_MODELS: Record<string, AIModel> = {
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Most capable model for complex reasoning and code generation',
    capabilities: ['text', 'code', 'analysis', 'creative'],
    costPerToken: 0.03,
    maxTokens: 8192,
    contextWindow: 8192,
    responseTime: 'medium'
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Faster and more cost-effective GPT-4 with larger context',
    capabilities: ['text', 'code', 'vision', 'analysis'],
    costPerToken: 0.01,
    maxTokens: 128000,
    contextWindow: 128000,
    responseTime: 'fast'
  },
  'claude-3.5-sonnet': {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Excellent for code writing and technical documentation',
    capabilities: ['text', 'code', 'analysis', 'technical'],
    costPerToken: 0.003,
    maxTokens: 200000,
    contextWindow: 200000,
    responseTime: 'fast'
  },
  'gemini-ultra': {
    id: 'gemini-ultra',
    name: 'Gemini Ultra',
    provider: 'Google',
    description: 'Multimodal model with advanced reasoning capabilities',
    capabilities: ['text', 'code', 'vision', 'multimodal'],
    costPerToken: 0.005,
    maxTokens: 32768,
    contextWindow: 32768,
    responseTime: 'fast'
  },
  'grok-2': {
    id: 'grok-2',
    name: 'Grok-2',
    provider: 'xAI',
    description: 'Real-time knowledge and humor-aware AI model',
    capabilities: ['text', 'code', 'real-time', 'humor'],
    costPerToken: 0.008,
    maxTokens: 100000,
    contextWindow: 100000,
    responseTime: 'fast'
  },
  'moonshot-kimi': {
    id: 'moonshot-kimi',
    name: 'Moonshot Kimi',
    provider: 'Moonshot',
    description: 'Cost-effective model with large context window',
    capabilities: ['text', 'code', 'multilingual'],
    costPerToken: 0.001,
    maxTokens: 200000,
    contextWindow: 200000,
    responseTime: 'fast'
  },
  'qwen-2.5-max': {
    id: 'qwen-2.5-max',
    name: 'Qwen 2.5 Max',
    provider: 'Alibaba',
    description: 'High-performance budget-friendly option',
    capabilities: ['text', 'code', 'multilingual', 'math'],
    costPerToken: 0.002,
    maxTokens: 32768,
    contextWindow: 32768,
    responseTime: 'fast'
  },
  'deepseek-v3': {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    description: 'Open-source model optimized for coding tasks',
    capabilities: ['text', 'code', 'technical'],
    costPerToken: 0.001,
    maxTokens: 16384,
    contextWindow: 16384,
    responseTime: 'fast'
  }
};

export function getModelById(modelId: string): AIModel | undefined {
  return AI_MODELS[modelId];
}

export function getCheapestModel(): AIModel {
  return Object.values(AI_MODELS).reduce((cheapest, model) => 
    model.costPerToken < cheapest.costPerToken ? model : cheapest
  );
}

export function getFastestModel(): AIModel {
  return Object.values(AI_MODELS).find(model => model.responseTime === 'fast') || AI_MODELS['gpt-4-turbo'];
}

export function getModelsByCapability(capability: string): AIModel[] {
  return Object.values(AI_MODELS).filter(model => 
    model.capabilities.includes(capability)
  );
}