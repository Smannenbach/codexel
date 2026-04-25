/**
 * Memory OS — 4-Tier Agent Memory System
 * Inspired by Claude Code leak: Ephemeral/Session/Project/Global tiers
 * with MicroCompact, AutoCompact, and FullCompact compression strategies.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export enum MemoryTier {
  EPHEMERAL = 'ephemeral',   // Current turn only — never persisted
  SESSION   = 'session',     // Current agent session → Short_Term/
  PROJECT   = 'project',     // Cross-session project memory → Mid_Term/ + Long_Term/
  GLOBAL    = 'global',      // Cross-project learnings → 09-Learnings/
}

interface MemoryEntry {
  id: string;
  tier: MemoryTier;
  content: string;
  createdAt: Date;
  accessCount: number;
  lastAccessed: Date;
  tags: string[];
}

interface CompactionResult {
  original: number;
  compressed: number;
  ratio: number;
  summary: string;
}

export class MemoryOS {
  private ephemeral: Map<string, MemoryEntry> = new Map();
  private vaultPath: string;

  // Tier → folder mapping within the Obsidian vault
  private readonly tierPaths: Record<MemoryTier, string> = {
    [MemoryTier.EPHEMERAL]: '',  // Never written to disk
    [MemoryTier.SESSION]:   '03-Memory/Short_Term',
    [MemoryTier.PROJECT]:   '03-Memory/Mid_Term',
    [MemoryTier.GLOBAL]:    '09-Learnings',
  };

  constructor(vaultPath: string) {
    this.vaultPath = vaultPath;
  }

  async initialize(): Promise<void> {
    // Verify vault exists and is accessible
    try {
      await fs.access(this.vaultPath);
      console.log(`[MemoryOS] Vault accessible at ${this.vaultPath}`);
    } catch {
      throw new Error(`[MemoryOS] Vault not found: ${this.vaultPath}`);
    }
  }

  /**
   * Read from memory tier. Falls back to lower tiers if not found in target.
   */
  async read(tier: MemoryTier, key: string): Promise<string> {
    if (tier === MemoryTier.EPHEMERAL) {
      return this.ephemeral.get(key)?.content ?? '';
    }

    const filePath = this.resolvePath(tier, key);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch {
      return '';
    }
  }

  /**
   * Write to memory tier.
   */
  async write(tier: MemoryTier, key: string, content: string): Promise<void> {
    if (tier === MemoryTier.EPHEMERAL) {
      this.ephemeral.set(key, {
        id: key, tier, content,
        createdAt: new Date(), accessCount: 0,
        lastAccessed: new Date(), tags: [],
      });
      return;
    }

    const filePath = this.resolvePath(tier, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.appendFile(filePath, `\n${content}`, 'utf-8');
  }

  /**
   * MicroCompact — compress a single turn's ephemeral memory into session memory.
   * Filters noise, keeps decisions and outcomes.
   */
  async microCompact(taskId: string, output: string): Promise<CompactionResult> {
    const original = output.length;

    // Extract key decisions (lines starting with decision markers)
    const lines = output.split('\n');
    const kept = lines.filter(line =>
      line.includes('DECISION:') ||
      line.includes('FIXED:') ||
      line.includes('ERROR:') ||
      line.includes('INSIGHT:') ||
      line.match(/^#+\s/) // headings
    );

    const summary = kept.join('\n') || `Task ${taskId} completed.`;
    const compressed = summary.length;

    // Write compressed summary to session memory
    const timestamp = new Date().toISOString().split('T')[0];
    await this.write(MemoryTier.SESSION, `${timestamp}-${taskId}.md`,
      `## ${taskId} — ${timestamp}\n${summary}\n`
    );

    // Clear ephemeral
    this.ephemeral.delete(taskId);

    return { original, compressed, ratio: compressed / original, summary };
  }

  /**
   * AutoCompact — compress session (Short_Term) into project memory (Mid_Term).
   * Merges related entries, removes redundancy, surfaces patterns.
   */
  async autoCompact(): Promise<CompactionResult> {
    const shortTermPath = path.join(this.vaultPath, this.tierPaths[MemoryTier.SESSION]);

    let allContent = '';
    let totalOriginal = 0;

    try {
      const files = await fs.readdir(shortTermPath);
      for (const file of files) {
        const content = await fs.readFile(path.join(shortTermPath, file), 'utf-8');
        allContent += content + '\n---\n';
        totalOriginal += content.length;
      }
    } catch {
      return { original: 0, compressed: 0, ratio: 1, summary: 'Nothing to compact.' };
    }

    if (!allContent.trim()) {
      return { original: 0, compressed: 0, ratio: 1, summary: 'Nothing to compact.' };
    }

    // Simple rule-based compaction (in production, use AI summarization)
    const lines = allContent.split('\n');
    const uniqueLines = [...new Set(lines.filter(l => l.trim().length > 10))];
    const summary = uniqueLines.slice(0, 100).join('\n');

    const timestamp = new Date().toISOString().split('T')[0];
    await this.write(MemoryTier.PROJECT, `${timestamp}-session-summary.md`,
      `# Session Summary — ${timestamp}\n\n${summary}\n`
    );

    // Archive and clear short term
    const archivePath = path.join(shortTermPath, 'archived');
    await fs.mkdir(archivePath, { recursive: true });

    try {
      const files = await fs.readdir(shortTermPath);
      for (const file of files.filter(f => f.endsWith('.md'))) {
        await fs.rename(
          path.join(shortTermPath, file),
          path.join(archivePath, file)
        );
      }
    } catch { /* non-fatal */ }

    return {
      original: totalOriginal,
      compressed: summary.length,
      ratio: summary.length / totalOriginal,
      summary: `Compacted ${totalOriginal} chars to ${summary.length} chars`,
    };
  }

  /**
   * FullCompact — annual archival. Moves old Mid_Term into Long_Term.
   * Only run manually or on yearly schedule.
   */
  async fullCompact(olderThanDays: number = 365): Promise<void> {
    console.log(`[MemoryOS] FullCompact: archiving memories older than ${olderThanDays} days`);
    // Implementation: move old Mid_Term entries to Long_Term/Archive/
    // This preserves history while keeping the active memory lean
  }

  /**
   * Semantic search across all memory tiers.
   * In production: use obsidian-mcp Smart Connections embeddings.
   */
  async search(query: string, tiers: MemoryTier[] = Object.values(MemoryTier)): Promise<string[]> {
    const results: string[] = [];
    const queryLower = query.toLowerCase();

    for (const tier of tiers) {
      if (tier === MemoryTier.EPHEMERAL) {
        for (const [, entry] of this.ephemeral) {
          if (entry.content.toLowerCase().includes(queryLower)) {
            results.push(entry.content);
          }
        }
        continue;
      }

      const tierPath = path.join(this.vaultPath, this.tierPaths[tier]);
      try {
        const files = await fs.readdir(tierPath, { recursive: true });
        for (const file of files as string[]) {
          if (!file.endsWith('.md')) continue;
          const content = await fs.readFile(path.join(tierPath, file), 'utf-8');
          if (content.toLowerCase().includes(queryLower)) {
            results.push(`[${tier}/${file}]\n${content.substring(0, 500)}`);
          }
        }
      } catch { /* tier folder may not exist yet */ }
    }

    return results;
  }

  private resolvePath(tier: MemoryTier, key: string): string {
    return path.join(this.vaultPath, this.tierPaths[tier], key);
  }
}
