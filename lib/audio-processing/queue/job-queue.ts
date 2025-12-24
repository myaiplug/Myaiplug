/**
 * PHASE 1: Simple In-Process FIFO Job Queue
 * 
 * Features:
 * - FIFO ordering within priority levels
 * - Free tier: CPU-only, lowest priority
 * - Pro tier: higher priority
 * - No autoscaling
 * - Queue growth allowed; cost growth NOT allowed
 */

export enum JobPriority {
  LOW = 0,     // Free tier
  NORMAL = 1,  // Pro tier
  HIGH = 2,    // VIP tier (future)
}

export enum JobStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface QueuedJob<T = any> {
  id: string;
  priority: JobPriority;
  tier: 'free' | 'pro' | 'vip';
  userId: string;
  capabilityKey: string;
  data: T;
  status: JobStatus;
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

/**
 * Simple in-process FIFO job queue with priority
 */
export class JobQueue {
  private queue: QueuedJob[] = [];
  private running: QueuedJob | null = null;
  private maxConcurrent: number = 1; // Phase 1: Single job at a time

  /**
   * Add a job to the queue
   */
  enqueue<T>(
    id: string,
    tier: 'free' | 'pro' | 'vip',
    userId: string,
    capabilityKey: string,
    data: T
  ): QueuedJob<T> {
    const priority = this.getPriorityForTier(tier);
    
    const job: QueuedJob<T> = {
      id,
      priority,
      tier,
      userId,
      capabilityKey,
      data,
      status: JobStatus.QUEUED,
      queuedAt: new Date(),
    };

    this.queue.push(job);
    
    // Sort by priority (high to low), then by queue time (FIFO within priority)
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.queuedAt.getTime() - b.queuedAt.getTime(); // FIFO within same priority
    });

    console.log(`[JobQueue] Enqueued job ${id} (${tier} tier, priority ${priority})`);
    console.log(`[JobQueue] Queue size: ${this.queue.length}`);

    return job;
  }

  /**
   * Get the next job to process (highest priority, oldest first)
   */
  dequeue(): QueuedJob | null {
    if (this.running !== null) {
      return null; // Already processing a job
    }

    const job = this.queue.shift();
    if (job) {
      job.status = JobStatus.RUNNING;
      job.startedAt = new Date();
      this.running = job;
      console.log(`[JobQueue] Dequeued job ${job.id} (${job.tier} tier)`);
    }

    return job || null;
  }

  /**
   * Mark the current job as completed
   */
  complete(jobId: string, result: any): void {
    if (this.running?.id === jobId) {
      this.running.status = JobStatus.COMPLETED;
      this.running.completedAt = new Date();
      this.running.result = result;
      
      const duration = this.running.completedAt.getTime() - (this.running.startedAt?.getTime() || 0);
      console.log(`[JobQueue] Completed job ${jobId} in ${(duration / 1000).toFixed(2)}s`);
      
      this.running = null;
    }
  }

  /**
   * Mark the current job as failed
   */
  fail(jobId: string, error: string): void {
    if (this.running?.id === jobId) {
      this.running.status = JobStatus.FAILED;
      this.running.completedAt = new Date();
      this.running.error = error;
      
      console.log(`[JobQueue] Failed job ${jobId}: ${error}`);
      
      this.running = null;
    }
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): QueuedJob | null {
    if (this.running?.id === jobId) {
      return this.running;
    }
    return this.queue.find(j => j.id === jobId) || null;
  }

  /**
   * Get queue status
   */
  getStatus(): {
    queueSize: number;
    running: boolean;
    currentJob: string | null;
    queuedJobs: Array<{ id: string; tier: string; priority: number }>;
  } {
    return {
      queueSize: this.queue.length,
      running: this.running !== null,
      currentJob: this.running?.id || null,
      queuedJobs: this.queue.map(j => ({
        id: j.id,
        tier: j.tier,
        priority: j.priority,
      })),
    };
  }

  /**
   * Get priority for tier
   */
  private getPriorityForTier(tier: 'free' | 'pro' | 'vip'): JobPriority {
    switch (tier) {
      case 'free':
        return JobPriority.LOW;
      case 'pro':
        return JobPriority.NORMAL;
      case 'vip':
        return JobPriority.HIGH;
      default:
        return JobPriority.LOW;
    }
  }

  /**
   * Clear completed jobs older than N hours
   */
  clearOldJobs(hoursOld: number = 24): number {
    const cutoffTime = Date.now() - (hoursOld * 60 * 60 * 1000);
    const initialSize = this.queue.length;
    
    this.queue = this.queue.filter(job => {
      if (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) {
        return (job.completedAt?.getTime() || 0) > cutoffTime;
      }
      return true;
    });

    const cleared = initialSize - this.queue.length;
    if (cleared > 0) {
      console.log(`[JobQueue] Cleared ${cleared} old jobs`);
    }
    
    return cleared;
  }
}

// Singleton instance for Phase 1
let jobQueueInstance: JobQueue | null = null;

/**
 * Get the global job queue instance
 */
export function getJobQueue(): JobQueue {
  if (!jobQueueInstance) {
    jobQueueInstance = new JobQueue();
  }
  return jobQueueInstance;
}
