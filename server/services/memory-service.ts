import { db } from '../db';
import { memories, hiveMindEntries } from '@shared/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import type { InsertMemory, InsertHiveMindEntry } from '@shared/schema';

export class MemoryService {
  private embeddingCache = new Map<string, number[]>();

  // Store personal memory for AI
  async storeMemory(memory: InsertMemory) {
    // Generate embedding (mock for now - would use Google Vertex AI in production)
    const embedding = this.generateMockEmbedding(memory.content);
    
    const [stored] = await db
      .insert(memories)
      .values({
        ...memory,
        embedding,
        vectorMagnitude: this.calculateMagnitude(embedding)
      })
      .returning();
    
    return stored;
  }

  // Search memories using vector similarity
  async searchMemories(query: string, userId: string, limit = 10) {
    const queryEmbedding = this.generateMockEmbedding(query);
    
    // In production, use pgvector for similarity search
    const results = await db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId))
      .orderBy(desc(memories.timestamp))
      .limit(limit);
    
    // Calculate similarity scores
    return results.map(memory => ({
      ...memory,
      similarity: this.cosineSimilarity(queryEmbedding, memory.embedding as number[])
    })).sort((a, b) => b.similarity - a.similarity);
  }

  // Store shared knowledge in hive mind
  async storeHiveMindEntry(entry: InsertHiveMindEntry) {
    const embedding = this.generateMockEmbedding(entry.content);
    
    // Check for duplicates or conflicts
    const existingEntries = await this.searchHiveMind(entry.content, 5);
    
    for (const existing of existingEntries) {
      if (existing.similarity > 0.95) {
        // Update existing entry if very similar
        await db
          .update(hiveMindEntries)
          .set({
            content: entry.content,
            metadata: { ...existing.metadata, ...entry.metadata },
            confidence: Math.max(existing.confidence, entry.confidence || 0.5)
          })
          .where(eq(hiveMindEntries.id, existing.id));
        
        return existing;
      }
    }
    
    // Store new entry
    const [stored] = await db
      .insert(hiveMindEntries)
      .values({
        ...entry,
        embedding,
        vectorMagnitude: this.calculateMagnitude(embedding)
      })
      .returning();
    
    return stored;
  }

  // Search hive mind knowledge
  async searchHiveMind(query: string, limit = 10) {
    const queryEmbedding = this.generateMockEmbedding(query);
    
    const results = await db
      .select()
      .from(hiveMindEntries)
      .orderBy(desc(hiveMindEntries.confidence))
      .limit(limit * 2); // Get more results for filtering
    
    return results.map(entry => ({
      ...entry,
      similarity: this.cosineSimilarity(queryEmbedding, entry.embedding as number[])
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
  }

  // Get agent-specific memories
  async getAgentMemories(agentId: string, limit = 20) {
    return await db
      .select()
      .from(memories)
      .where(and(
        eq(memories.agentId, agentId),
        eq(memories.type, 'agent_learning')
      ))
      .orderBy(desc(memories.timestamp))
      .limit(limit);
  }

  // Conflict resolution for memories
  async resolveMemoryConflict(memory1Id: number, memory2Id: number, resolution: string) {
    // Mark one as primary, other as superseded
    await db
      .update(memories)
      .set({
        metadata: sql`${memories.metadata} || jsonb_build_object('superseded', true, 'superseded_by', ${memory1Id})`
      })
      .where(eq(memories.id, memory2Id));
    
    // Update primary memory with resolution
    await db
      .update(memories)
      .set({
        metadata: sql`${memories.metadata} || jsonb_build_object('conflict_resolved', true, 'resolution', ${resolution})`
      })
      .where(eq(memories.id, memory1Id));
  }

  // Mock embedding generation (replace with Vertex AI in production)
  private generateMockEmbedding(text: string): number[] {
    const cached = this.embeddingCache.get(text);
    if (cached) return cached;
    
    // Generate deterministic embedding based on text
    const embedding = new Array(768).fill(0).map((_, i) => {
      const charSum = text.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return Math.sin(charSum * (i + 1)) * Math.cos(text.length * (i + 1));
    });
    
    this.embeddingCache.set(text, embedding);
    return embedding;
  }

  private calculateMagnitude(vector: number[]): number {
    return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = this.calculateMagnitude(a);
    const magnitudeB = this.calculateMagnitude(b);
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Merge duplicate memories
  async mergeDuplicateMemories(userId: string) {
    const allMemories = await db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId));
    
    const duplicates: Map<number, number[]> = new Map();
    
    // Find duplicates using similarity threshold
    for (let i = 0; i < allMemories.length; i++) {
      for (let j = i + 1; j < allMemories.length; j++) {
        const similarity = this.cosineSimilarity(
          allMemories[i].embedding as number[],
          allMemories[j].embedding as number[]
        );
        
        if (similarity > 0.9) {
          const key = allMemories[i].id;
          if (!duplicates.has(key)) {
            duplicates.set(key, []);
          }
          duplicates.get(key)!.push(allMemories[j].id);
        }
      }
    }
    
    // Merge duplicates
    for (const [primaryId, duplicateIds] of duplicates.entries()) {
      for (const duplicateId of duplicateIds) {
        await this.resolveMemoryConflict(primaryId, duplicateId, 'auto-merged due to high similarity');
      }
    }
    
    return duplicates.size;
  }
}

export const memoryService = new MemoryService();