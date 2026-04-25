/**
 * HIVE Mind — Queen Orchestrator
 * Coordinates all worker agents, enforces quality gates, manages task delegation.
 * Architecture inspired by Claude Code leak: coordinator-worker model with atomic claims.
 */

import { MemoryOS, MemoryTier } from './memory-os';
import { WorkerPool, WorkerType } from './workers';

export interface Task {
  id: string;
  type: WorkerType;
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  files: string[];
  claimedBy?: string;
  claimedAt?: Date;
  completedAt?: Date;
  result?: TaskResult;
}

export interface TaskResult {
  success: boolean;
  output: string;
  filesChanged: string[];
  testsRun: string[];
  testsPassed: boolean;
  insights?: string[];
}

export interface HiveMindConfig {
  vaultPath: string;
  workBoardPath: string;
  maxConcurrentWorkers: number;
  qualityGateEnabled: boolean;
}

export class QueenOrchestrator {
  private memory: MemoryOS;
  private workers: WorkerPool;
  private activeTasks: Map<string, Task> = new Map();
  private config: HiveMindConfig;

  constructor(config: HiveMindConfig) {
    this.config = config;
    this.memory = new MemoryOS(config.vaultPath);
    this.workers = new WorkerPool(config.maxConcurrentWorkers);
  }

  /**
   * Main orchestration loop — runs continuously.
   * OBSERVE → PLAN → DELEGATE → VERIFY → LEARN → COMPRESS
   */
  async run(): Promise<void> {
    await this.memory.initialize();
    console.log('[Queen] HIVE Mind initialized. Standing by.');

    while (true) {
      try {
        // OBSERVE: sync shared memory
        const hiveState = await this.memory.read(MemoryTier.PROJECT, 'HIVE.md');
        const board = await this.memory.read(MemoryTier.PROJECT, 'WORK_BOARD.md');

        // PLAN: find highest-priority unclaimed task
        const nextTask = await this.selectNextTask(board);
        if (!nextTask) {
          await this.sleep(5000);
          continue;
        }

        // DELEGATE: assign to appropriate worker
        const worker = await this.workers.acquire(nextTask.type);
        if (!worker) {
          await this.sleep(2000);
          continue;
        }

        // EXECUTE (non-blocking — track active tasks)
        this.activeTasks.set(nextTask.id, nextTask);
        this.executeTask(nextTask, worker).catch(err => {
          console.error(`[Queen] Task ${nextTask.id} failed:`, err);
        });

      } catch (err) {
        console.error('[Queen] Orchestration loop error:', err);
        await this.sleep(10000);
      }
    }
  }

  private async executeTask(task: Task, workerName: string): Promise<void> {
    console.log(`[Queen] Delegating ${task.id} to ${workerName}`);

    // Claim the task atomically
    await this.claimTask(task, workerName);

    const result = await this.workers.execute(task, workerName);

    // Quality gate — do not rubber-stamp weak work
    if (this.config.qualityGateEnabled) {
      const approved = await this.qualityCheck(task, result);
      if (!approved) {
        console.warn(`[Queen] Quality gate FAILED for ${task.id}. Requeuing.`);
        await this.releaseTask(task);
        return;
      }
    }

    // Write back to HIVE
    await this.writeBack(task, result);
    this.activeTasks.delete(task.id);
    console.log(`[Queen] Task ${task.id} complete ✓`);
  }

  private async qualityCheck(task: Task, result: TaskResult): Promise<boolean> {
    if (!result.success) return false;
    if (!result.testsPassed) return false;
    if (result.filesChanged.length === 0 && task.type !== 'testing') return false;
    return true;
  }

  private async writeBack(task: Task, result: TaskResult): Promise<void> {
    // Write insights to long-term memory
    if (result.insights?.length) {
      for (const insight of result.insights) {
        await this.memory.write(MemoryTier.GLOBAL, '09-Learnings/README.md', insight);
      }
    }

    // Compress current session notes (MicroCompact)
    await this.memory.microCompact(task.id, result.output);
  }

  private async claimTask(task: Task, agent: string): Promise<void> {
    task.claimedBy = agent;
    task.claimedAt = new Date();
    // Update WORK_BOARD.md with claim
    await this.memory.write(MemoryTier.PROJECT, 'WORK_BOARD.md',
      `\n| ${task.id} | ${task.description} | ${agent} | ${new Date().toISOString()} |`
    );
  }

  private async releaseTask(task: Task): Promise<void> {
    task.claimedBy = undefined;
    task.claimedAt = undefined;
    this.activeTasks.delete(task.id);
  }

  private async selectNextTask(board: string): Promise<Task | null> {
    // Parse WORK_BOARD.md for open CRITICAL tasks first
    const criticalPattern = /\| (C\d+) \|.*\| — \| 🔴 OPEN \|/g;
    const match = criticalPattern.exec(board);
    if (!match) return null;

    return {
      id: match[1],
      type: 'backend',
      priority: 'critical',
      description: `Fix ${match[1]}`,
      files: [],
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async autoDream(): Promise<void> {
    console.log('[Queen] AutoDream starting — compressing session memory...');
    await this.memory.autoCompact();
    console.log('[Queen] AutoDream complete.');
  }
}
