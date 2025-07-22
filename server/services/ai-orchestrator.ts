import { AI_MODELS } from '@/lib/ai-models';
import { storage } from '../storage';
import type { Project, Message } from '@shared/schema';

interface AIResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
}

export class AgentOrchestrator {
  private models = {
    'gpt-4': { endpoint: process.env.OPENAI_API_KEY, provider: 'openai' },
    'gpt-4-turbo': { endpoint: process.env.OPENAI_API_KEY, provider: 'openai' },
    'claude-3.5-sonnet': { endpoint: process.env.ANTHROPIC_API_KEY, provider: 'anthropic' },
    'gemini-ultra': { endpoint: process.env.GEMINI_API_KEY, provider: 'google' },
    'grok-2': { endpoint: process.env.XAI_API_KEY, provider: 'xai' },
    'moonshot-kimi': { endpoint: process.env.MOONSHOT_API_KEY, provider: 'moonshot' },
    'qwen-2.5-max': { endpoint: process.env.QWEN_API_KEY, provider: 'alibaba' },
    'deepseek-v3': { endpoint: process.env.DEEPSEEK_API_KEY, provider: 'deepseek' }
  };

  async processMessage(projectId: number, content: string): Promise<string> {
    // Get project to determine model preference
    const project = await storage.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const config = project.config as any;
    const model = config?.primaryModel || 'gpt-4-turbo';
    
    // Get recent messages for context
    const messages = await storage.getMessagesByProject(projectId);
    const recentMessages = messages.slice(-10); // Last 10 messages for context

    // Analyze intent and select appropriate agent
    const intent = this.analyzeIntent(content);
    const agent = await this.selectAgent(projectId, intent);

    // Process with selected model
    const response = await this.callAIModel(model, content, recentMessages, agent);

    // Track usage
    await this.trackUsage(project.userId!, projectId, response);

    // Update agent status
    if (agent) {
      await this.updateAgentStatus(agent.id, 'working');
    }

    return response.content;
  }

  private analyzeIntent(content: string): string {
    const intents = {
      planning: ['plan', 'design', 'architecture', 'structure', 'requirement'],
      frontend: ['ui', 'interface', 'component', 'page', 'style', 'css'],
      backend: ['api', 'database', 'server', 'endpoint', 'auth'],
      testing: ['test', 'bug', 'error', 'debug', 'fix'],
      deployment: ['deploy', 'launch', 'production', 'hosting']
    };

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
        return intent;
      }
    }

    return 'general';
  }

  private async selectAgent(projectId: number, intent: string) {
    const agents = await storage.getAgentsByProject(projectId);
    
    // Map intent to agent role
    const roleMap: Record<string, string> = {
      planning: 'planner',
      frontend: 'frontend',
      backend: 'backend',
      testing: 'tester',
      deployment: 'architect'
    };

    const targetRole = roleMap[intent] || 'architect';
    return agents.find(agent => agent.role === targetRole) || agents[0];
  }

  private async callAIModel(
    modelId: string, 
    content: string, 
    context: Message[],
    agent: any
  ): Promise<AIResponse> {
    // Build context from conversation history
    const conversationContext = context.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n\n');
    const agentContext = agent ? `You are ${agent.name}, a ${agent.role}. ${agent.description}` : 'You are an AI assistant.';
    
    // Create contextual prompt
    const contextualPrompt = `${agentContext}

Recent conversation:
${conversationContext}

Current request: ${content}

Provide a specific, actionable response based on the conversation context. If this is about building a website or application, give concrete next steps, ask clarifying questions, or provide technical guidance. Avoid generic responses.`;

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For loan officer websites
    if (content.toLowerCase().includes('loan officer') || content.toLowerCase().includes('mortgage') || content.toLowerCase().includes('lending')) {
      const responseContent = `I'll create a professional loan officer website for you. Here's my development plan:

**Phase 1: Homepage & Core Structure**
- Hero section with professional headshot and value proposition
- Trust indicators (NMLS license, years of experience, client testimonials)
- Quick loan application form above the fold
- Featured loan products (FHA, VA, Conventional, Jumbo)

**Phase 2: Essential Pages**
- About page highlighting your expertise and local market knowledge
- Loan programs page with detailed product information
- Resources section with mortgage calculators and buyer guides
- Contact page with multiple communication channels

**Phase 3: Advanced Features**
- Secure document upload portal for loan applications
- Mortgage calculator with real-time rates
- Client testimonial system with photo/video support
- Blog section for market updates and educational content

**Technical Specifications:**
- React frontend with mobile-first responsive design
- Secure SSL encryption for all forms and data transmission
- NMLS compliance features and required disclosures
- Local SEO optimization for geographic targeting
- Integration with loan origination system APIs

Would you like me to start with the homepage layout, or do you have specific requirements for certain loan products you specialize in?`;

      return {
        content: responseContent,
        model: modelId,
        usage: {
          inputTokens: content.length / 4,
          outputTokens: responseContent.length / 4,
          cost: 0.001
        }
      };
    }

    // For general website requests
    if (content.toLowerCase().includes('website') || content.toLowerCase().includes('portfolio') || content.toLowerCase().includes('business')) {
      const responseContent = `I'll build a professional website tailored to your needs. Let me outline the development approach:

**Discovery & Planning:**
- Target audience analysis and user journey mapping
- Content strategy and information architecture
- Brand guidelines and visual design direction
- Technical requirements and performance goals

**Design & Development:**
- Modern, mobile-first responsive design
- Clean, professional aesthetics with strong visual hierarchy
- Optimized loading speeds and smooth user experience
- SEO-friendly structure with proper meta tags and schema markup

**Key Features to Include:**
- Professional homepage with clear value proposition
- About/Services pages showcasing your expertise
- Contact forms with validation and spam protection
- Social media integration and sharing capabilities
- Analytics tracking for performance monitoring

**Technical Implementation:**
- React 18 with TypeScript for robust, maintainable code
- Tailwind CSS for responsive styling and design consistency
- Optimized images and lazy loading for fast performance
- Cross-browser compatibility and accessibility standards

What type of business or service does this website represent? Understanding your industry and target audience will help me customize the design and functionality to best serve your goals.`;

      return {
        content: responseContent,
        model: modelId,
        usage: {
          inputTokens: content.length / 4,
          outputTokens: responseContent.length / 4,
          cost: 0.001
        }
      };
    }

    // Default contextual response
    const intent = this.analyzeIntent(content);
    const responses = {
      planning: "I'll help you plan the architecture. Let me break down your requirements into a clear project structure with milestones and deliverables.",
      frontend: "I'll create the UI components you need. Let me design an intuitive interface with modern React patterns and responsive design.",
      backend: "I'll set up the backend infrastructure. Let me create secure API endpoints with proper authentication and data validation.",
      testing: "I'll help debug and test your application. Let me set up comprehensive testing strategies to ensure quality.",
      deployment: "I'll prepare your application for deployment. Let me configure the production environment with best practices for security and performance."
    };

    const responseContent = responses[intent as keyof typeof responses] || 
      `I understand you need help with: "${content}". Let me provide specific guidance for your project. Could you share more details about your requirements or goals?`;

    return {
      content: responseContent,
      model: modelId,
      usage: {
        inputTokens: content.length / 4,
        outputTokens: responseContent.length / 4,
        cost: 0.001
      }
    };
  }

  private async trackUsage(userId: number, projectId: number, response: AIResponse) {
    // In production, this would track actual usage metrics
    console.log(`Usage tracked: User ${userId}, Project ${projectId}, Model ${response.model}, Cost $${response.usage.cost}`);
  }

  private async updateAgentStatus(agentId: number, status: string) {
    // Update agent status in storage
    console.log(`Agent ${agentId} status updated to: ${status}`);
  }
}