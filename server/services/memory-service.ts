import { VertexAI } from '@google-cloud/vertexai';
import { db } from '../db';
import { memories, hiveMindEntries } from '@shared/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import type { Memory, MemoryQuery, MemoryResult } from '@shared/types/desktop';

export class MemoryService {
  private vertexAI: VertexAI;
  private embeddingModel: any;

  constructor() {
    // Initialize Vertex AI for embeddings and memory management
    this.vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT || '',
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
    });

    this.embeddingModel = this.vertexAI.preview.getGenerativeModel({
      model: 'textembedding-gecko@003',
    });
  }

  /**
   * Store a memory with embeddings for future retrieval
   */
  async storeMemory(memory: Omit<Memory, 'id' | 'embedding'>): Promise<Memory> {
    try {
      // Generate embedding for the memory content
      const embedding = await this.generateEmbedding(JSON.stringify(memory.content));

      // Store in personal memory
      const [stored] = await db.insert(memories).values({
        ...memory,
        embedding,
        timestamp: new Date(),
      }).returning();

      // If it's a valuable pattern or solution, consider adding to hive mind
      if (this.shouldAddToHiveMind(memory)) {
        await this.addToHiveMind(memory, embedding);
      }

      return stored;
    } catch (error) {
      console.error('Failed to store memory:', error);
      throw error;
    }
  }

  /**
   * Query memories based on context and relevance
   */
  async queryMemories(query: MemoryQuery): Promise<MemoryResult> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query.context);

      // Search personal memories
      const personalMemories = await this.searchPersonalMemories(
        queryEmbedding,
        query
      );

      // Search hive mind if requested
      let hiveMindMemories: Memory[] = [];
      if (query.includeHiveMind) {
        hiveMindMemories = await this.searchHiveMind(queryEmbedding, query);
      }

      // Combine and rank results
      const allMemories = [...personalMemories, ...hiveMindMemories];
      const rankedMemories = this.rankMemories(allMemories, queryEmbedding, query.maxResults);

      return {
        memories: rankedMemories.memories,
        relevanceScores: rankedMemories.scores,
        source: query.includeHiveMind ? 'both' : 'personal'
      };
    } catch (error) {
      console.error('Failed to query memories:', error);
      throw error;
    }
  }

  /**
   * Consolidate user experiences into hive mind knowledge
   */
  async consolidateToHiveMind(userId: string, projectId: string): Promise<void> {
    try {
      // Fetch valuable memories from user's experience
      const valuableMemories = await db.select()
        .from(memories)
        .where(
          and(
            eq(memories.userId, userId),
            eq(memories.projectId, projectId),
            sql`metadata->>'valuable' = 'true'`
          )
        );

      // Process and anonymize before adding to hive mind
      for (const memory of valuableMemories) {
        const anonymized = this.anonymizeMemory(memory);
        await this.addToHiveMind(anonymized, memory.embedding);
      }
    } catch (error) {
      console.error('Failed to consolidate to hive mind:', error);
      throw error;
    }
  }

  /**
   * Perfect recall - retrieve all context for a specific task
   */
  async perfectRecall(taskId: string, agentId: string): Promise<Memory[]> {
    try {
      // Get all memories related to the task
      const taskMemories = await db.select()
        .from(memories)
        .where(
          and(
            sql`metadata->>'taskId' = ${taskId}`,
            eq(memories.agentId, agentId)
          )
        )
        .orderBy(desc(memories.timestamp));

      // Also get relevant hive mind knowledge
      const relevantPatterns = await this.getRelevantPatterns(taskMemories[0]?.type || 'general');

      return [...taskMemories, ...relevantPatterns];
    } catch (error) {
      console.error('Failed to perform perfect recall:', error);
      throw error;
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const request = {
        instances: [{ content: text }],
      };

      const [response] = await this.embeddingModel.predict(request);
      return response.predictions[0].embeddings.values;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      // Fallback to a simple hash-based embedding
      return this.generateSimpleEmbedding(text);
    }
  }

  private generateSimpleEmbedding(text: string): number[] {
    // Simple fallback embedding generation
    const embedding = new Array(768).fill(0);
    for (let i = 0; i < text.length; i++) {
      embedding[i % 768] += text.charCodeAt(i) / 1000;
    }
    return embedding.map(v => Math.tanh(v));
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private shouldAddToHiveMind(memory: any): boolean {
    // Determine if a memory is valuable enough for hive mind
    const valuableTypes = ['solution', 'pattern', 'optimization', 'error-resolution'];
    return valuableTypes.includes(memory.type) && 
           memory.metadata?.valuable === true;
  }

  private async addToHiveMind(memory: any, embedding: number[]): Promise<void> {
    // Anonymize and add to hive mind
    const anonymized = this.anonymizeMemory(memory);
    
    await db.insert(hiveMindEntries).values({
      type: memory.type,
      content: anonymized.content,
      embedding,
      metadata: {
        ...anonymized.metadata,
        addedAt: new Date(),
        useCount: 0
      }
    });
  }

  private anonymizeMemory(memory: any): any {
    // Remove user-specific information
    const anonymized = { ...memory };
    delete anonymized.userId;
    delete anonymized.metadata?.userId;
    
    // Generalize content
    if (typeof anonymized.content === 'string') {
      anonymized.content = anonymized.content
        .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g, '[EMAIL]')
        .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
        .replace(/\b(?:user|client|customer)\s+\w+/gi, '[USER]');
    }
    
    return anonymized;
  }

  private async searchPersonalMemories(
    queryEmbedding: number[],
    query: MemoryQuery
  ): Promise<Memory[]> {
    let conditions = [];

    if (query.timeRange) {
      conditions.push(
        gte(memories.timestamp, query.timeRange.start),
        lte(memories.timestamp, query.timeRange.end)
      );
    }

    const results = await db.select()
      .from(memories)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(query.maxResults * 2); // Get more to filter by relevance

    // Calculate relevance scores
    return results
      .map(memory => ({
        ...memory,
        relevance: this.calculateCosineSimilarity(queryEmbedding, memory.embedding)
      }))
      .filter(m => m.relevance >= query.relevanceThreshold)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, query.maxResults);
  }

  private async searchHiveMind(
    queryEmbedding: number[],
    query: MemoryQuery
  ): Promise<Memory[]> {
    const results = await db.select()
      .from(hiveMindEntries)
      .limit(query.maxResults * 2);

    return results
      .map(entry => ({
        id: entry.id,
        timestamp: entry.metadata?.addedAt || new Date(),
        type: entry.type,
        content: entry.content,
        embedding: entry.embedding,
        metadata: {
          ...entry.metadata,
          source: 'hiveMind'
        }
      }))
      .map(memory => ({
        ...memory,
        relevance: this.calculateCosineSimilarity(queryEmbedding, memory.embedding)
      }))
      .filter(m => m.relevance >= query.relevanceThreshold)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, query.maxResults);
  }

  private rankMemories(
    memories: any[],
    queryEmbedding: number[],
    maxResults: number
  ): { memories: Memory[]; scores: number[] } {
    const rankedMemories = memories
      .map(memory => ({
        ...memory,
        score: this.calculateCosineSimilarity(queryEmbedding, memory.embedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    return {
      memories: rankedMemories.map(({ score, ...memory }) => memory),
      scores: rankedMemories.map(m => m.score)
    };
  }

  private async getRelevantPatterns(type: string): Promise<Memory[]> {
    // Get common patterns from hive mind for a given type
    const patterns = await db.select()
      .from(hiveMindEntries)
      .where(eq(hiveMindEntries.type, type))
      .orderBy(desc(sql`metadata->>'useCount'`))
      .limit(5);

    return patterns.map(p => ({
      id: p.id,
      timestamp: new Date(),
      type: p.type,
      content: p.content,
      embedding: p.embedding,
      metadata: {
        ...p.metadata,
        source: 'hiveMind'
      }
    }));
  }
}

export const memoryService = new MemoryService();