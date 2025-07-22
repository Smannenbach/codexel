import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db';
import { aiUsage } from '@shared/schema';

// Model pricing in cents per 1K tokens
const MODEL_PRICING = {
  // OpenAI
  'gpt-4': { input: 3.0, output: 6.0 },
  'gpt-4-turbo': { input: 1.0, output: 3.0 },
  'gpt-3.5-turbo': { input: 0.05, output: 0.15 },
  
  // Anthropic
  'claude-3.5-sonnet': { input: 0.3, output: 1.5 },
  'claude-3-haiku': { input: 0.025, output: 0.125 },
  
  // Google
  'gemini-ultra': { input: 0.5, output: 1.5 },
  'gemini-pro': { input: 0.025, output: 0.1 },
  
  // Others (mock prices for now)
  'moonshot-kimi': { input: 0.02, output: 0.08 },
  'qwen-2.5-max': { input: 0.02, output: 0.08 },
  'grok-2': { input: 0.5, output: 1.5 },
  'mixtral-8x7b': { input: 0.03, output: 0.1 }
};

class AIService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private genai: GoogleGenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  async sendMessage(
    systemPrompt: string, 
    userMessage: string, 
    model: string,
    userId?: number,
    projectId?: number
  ): Promise<{ content: string; inputTokens: number; outputTokens: number; cost: number }> {
    let response: string;
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      // Route to appropriate provider based on model
      if (model.startsWith('gpt')) {
        const completion = await this.openai.chat.completions.create({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 2000
        });

        response = completion.choices[0].message.content || '';
        inputTokens = completion.usage?.prompt_tokens || 0;
        outputTokens = completion.usage?.completion_tokens || 0;

      } else if (model.startsWith('claude')) {
        const completion = await this.anthropic.messages.create({
          model: model === 'claude-3.5-sonnet' ? 'claude-3-5-sonnet-20241022' : model,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
          max_tokens: 2000
        });

        const content = completion.content[0];
        response = content.type === 'text' ? content.text : '';
        inputTokens = completion.usage?.input_tokens || 0;
        outputTokens = completion.usage?.output_tokens || 0;

      } else if (model.startsWith('gemini')) {
        const fullPrompt = systemPrompt + '\n\n' + userMessage;
        const result = await this.genai.models.generateContent({
          model: model,
          contents: fullPrompt,
        });

        response = result.text || '';
        // Estimate tokens for Gemini (it doesn't provide exact counts)
        inputTokens = Math.ceil((systemPrompt.length + userMessage.length) / 4);
        outputTokens = Math.ceil(response.length / 4);

      } else {
        // Mock response for other models
        response = `[${model}]: I understand your request about "${userMessage.substring(0, 50)}...". Let me help you with that.`;
        inputTokens = Math.ceil((systemPrompt.length + userMessage.length) / 4);
        outputTokens = Math.ceil(response.length / 4);
      }

      // Calculate cost
      const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING] || { input: 0.05, output: 0.15 };
      const cost = Math.ceil(
        (inputTokens * pricing.input / 1000) + 
        (outputTokens * pricing.output / 1000)
      );

      // Track usage if userId provided
      if (userId) {
        await db.insert(aiUsage).values({
          userId,
          projectId,
          model,
          inputTokens,
          outputTokens,
          cost
        });
      }

      return {
        content: response,
        inputTokens,
        outputTokens,
        cost
      };

    } catch (error: any) {
      console.error('AI Service Error:', error);
      
      // Fallback response
      return {
        content: `I apologize, but I encountered an error while processing your request. Please ensure the ${model} API key is configured correctly.`,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0
      };
    }
  }

  async generateCode(
    requirements: string,
    model: string,
    language: string = 'typescript',
    userId?: number,
    projectId?: number
  ): Promise<{ code: string; explanation: string; cost: number }> {
    const systemPrompt = `You are an expert ${language} developer. Generate clean, well-commented code based on the requirements. 
    Provide your response in this format:
    
    CODE:
    [Your code here]
    
    EXPLANATION:
    [Brief explanation of the code]`;

    const result = await this.sendMessage(
      systemPrompt,
      requirements,
      model,
      userId,
      projectId
    );

    // Parse the response
    const parts = result.content.split(/CODE:|EXPLANATION:/);
    const code = parts[1]?.trim() || result.content;
    const explanation = parts[2]?.trim() || 'Code generated based on your requirements.';

    return {
      code,
      explanation,
      cost: result.cost
    };
  }

  async analyzeCode(
    code: string,
    model: string,
    userId?: number,
    projectId?: number
  ): Promise<{ analysis: string; suggestions: string[]; cost: number }> {
    const systemPrompt = `You are an expert code reviewer. Analyze the provided code for:
    1. Code quality and best practices
    2. Potential bugs or security issues
    3. Performance optimizations
    4. Readability improvements
    
    Provide your response in this format:
    
    ANALYSIS:
    [Your detailed analysis]
    
    SUGGESTIONS:
    - [Suggestion 1]
    - [Suggestion 2]
    - [etc]`;

    const result = await this.sendMessage(
      systemPrompt,
      code,
      model,
      userId,
      projectId
    );

    // Parse the response
    const parts = result.content.split(/ANALYSIS:|SUGGESTIONS:/);
    const analysis = parts[1]?.trim() || result.content;
    const suggestionsText = parts[2]?.trim() || '';
    const suggestions = suggestionsText
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, ''));

    return {
      analysis,
      suggestions,
      cost: result.cost
    };
  }

  getModelCapabilities(model: string) {
    const capabilities: Record<string, any> = {
      'gpt-4': {
        maxTokens: 8192,
        strengths: ['Complex reasoning', 'Code generation', 'Analysis'],
        costLevel: 'high'
      },
      'gpt-4-turbo': {
        maxTokens: 128000,
        strengths: ['Large context', 'Fast responses', 'Code generation'],
        costLevel: 'medium'
      },
      'claude-3.5-sonnet': {
        maxTokens: 200000,
        strengths: ['Code writing', 'Technical documentation', 'Complex analysis'],
        costLevel: 'medium'
      },
      'gemini-ultra': {
        maxTokens: 32000,
        strengths: ['Multimodal', 'Creative tasks', 'Analysis'],
        costLevel: 'medium'
      },
      'moonshot-kimi': {
        maxTokens: 128000,
        strengths: ['Large context', 'Chinese language', 'Cost-effective'],
        costLevel: 'low'
      },
      'qwen-2.5-max': {
        maxTokens: 32000,
        strengths: ['Fast responses', 'Multilingual', 'Cost-effective'],
        costLevel: 'low'
      }
    };

    return capabilities[model] || {
      maxTokens: 4096,
      strengths: ['General tasks'],
      costLevel: 'low'
    };
  }
}

export const aiService = new AIService();