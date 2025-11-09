// Job processing system
import type { Job, JobStatus, JobType, UserTier } from '../types';
import { calculateTimeSaved, TIME_SAVED_BASELINES } from '../constants/gamification';
import { calculateJobCost } from '../constants/pricing';
import { awardPoints, calculateJobPoints } from './pointsEngine';
import { generateSecureId } from '../utils/secureId';
import { randomInt } from 'crypto';

export interface CreateJobParams {
  userId: string;
  type: JobType;
  inputDurationSec: number;
  tier: UserTier;
  inputUrl?: string;
}

export interface JobResult {
  job: Job;
  pointsAwarded: number;
}

// In-memory job storage
const jobsStore = new Map<string, Job[]>();

/**
 * Create a new job
 */
export async function createJob(params: CreateJobParams): Promise<Job> {
  const { userId, type, inputDurationSec, tier, inputUrl } = params;

  // Calculate credits cost
  const creditsCharged = calculateJobCost(type, inputDurationSec);

  // Create job
  const job: Job = {
    id: generateSecureId('job_'),
    userId,
    type,
    inputDurationSec,
    creditsCharged,
    cpuSec: 0,
    status: 'queued',
    resultUrl: null,
    qcReport: null,
    baselineMin: TIME_SAVED_BASELINES[type],
    effFactor: 0,
    procMin: 0,
    timeSavedSec: 0,
    createdAt: new Date(),
  };

  // Store job
  const userJobs = jobsStore.get(userId) || [];
  userJobs.push(job);
  jobsStore.set(userId, userJobs);

  return job;
}

/**
 * Update job status
 */
export async function updateJobStatus(jobId: string, status: JobStatus): Promise<Job | null> {
  const job = findJobById(jobId);
  if (!job) {
    return null;
  }

  job.status = status;
  return job;
}

/**
 * Complete a job (simulate processing)
 */
export async function completeJob(
  jobId: string,
  processingSeconds: number
): Promise<JobResult | null> {
  const job = findJobById(jobId);
  if (!job) {
    return null;
  }

  // Update job with processing results
  job.status = 'done';
  job.cpuSec = processingSeconds;
  job.procMin = processingSeconds / 60;
  
  // Calculate time saved
  const tier = getUserTier(job.userId); // Would get from user store
  job.timeSavedSec = calculateTimeSaved(job.type, tier, job.procMin);
  
  // Generate mock result URL
  job.resultUrl = `https://cdn.myaiplug.com/results/${job.id}.wav`;
  
  // Generate QC report (simplified)
  job.qcReport = generateQCReport(job);

  // Award points for job completion
  const pointsEntry = await awardPoints({
    userId: job.userId,
    eventType: 'job_complete',
    jobId: job.id,
    metadata: { processingSeconds },
  });

  // Check for Pro Chain bonus (if job type is audio_pro)
  if (job.type === 'audio_pro') {
    await awardPoints({
      userId: job.userId,
      eventType: 'pro_chain_bonus',
      jobId: job.id,
    });
  }

  return {
    job,
    pointsAwarded: pointsEntry?.points || 0,
  };
}

/**
 * Fail a job
 */
export async function failJob(jobId: string, errorMessage: string): Promise<Job | null> {
  const job = findJobById(jobId);
  if (!job) {
    return null;
  }

  job.status = 'failed';
  job.qcReport = {
    hasIssues: true,
    error: errorMessage,
  };

  return job;
}

/**
 * Get jobs for a user
 */
export function getUserJobs(userId: string, limit?: number): Job[] {
  const jobs = jobsStore.get(userId) || [];
  const sortedJobs = [...jobs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return limit ? sortedJobs.slice(0, limit) : sortedJobs;
}

/**
 * Get a specific job
 */
export function getJob(jobId: string): Job | null {
  return findJobById(jobId);
}

/**
 * Get job statistics for a user
 */
export function getUserJobStats(userId: string): {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalTimeSaved: number;
  totalCreditsUsed: number;
} {
  const jobs = jobsStore.get(userId) || [];
  
  return {
    totalJobs: jobs.length,
    completedJobs: jobs.filter(j => j.status === 'done').length,
    failedJobs: jobs.filter(j => j.status === 'failed').length,
    totalTimeSaved: jobs.reduce((sum, j) => sum + j.timeSavedSec, 0),
    totalCreditsUsed: jobs.reduce((sum, j) => sum + j.creditsCharged, 0),
  };
}

/**
 * Simulate job processing (for demo purposes)
 */
export async function simulateJobProcessing(jobId: string): Promise<JobResult | null> {
  const job = findJobById(jobId);
  if (!job) {
    return null;
  }

  // Update status to running
  job.status = 'running';

  // Simulate processing delay (in real system, this would be actual processing)
  const processingSeconds = randomInt(30, 151); // 30-150 seconds

  // Complete the job
  return await completeJob(jobId, processingSeconds);
}

// Helper functions

function findJobById(jobId: string): Job | null {
  for (const jobs of jobsStore.values()) {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      return job;
    }
  }
  return null;
}

function getUserTier(userId: string): UserTier {
  // In production, this would fetch from user store
  // For now, return 'free' as default
  return 'free';
}

function generateQCReport(job: Job): Record<string, any> {
  // Generate a mock QC report
  const hasIssues = randomInt(0, 10) === 0; // 10% chance of issues

  return {
    hasIssues,
    peaks: {
      max: -0.3,
      clipping: false,
    },
    lufs: {
      integrated: -14.2,
      range: 8.5,
    },
    spectral: {
      lowEnd: 'Good',
      highEnd: 'Good',
    },
    issues: hasIssues ? ['Minor phase issues detected'] : [],
    overall: hasIssues ? 'Warning' : 'Passed',
  };
}

/**
 * Initialize jobs for a user (for loading from DB)
 */
export function initializeUserJobs(userId: string, jobs: Job[]): void {
  jobsStore.set(userId, jobs);
}

/**
 * Get all jobs (admin function)
 */
export function getAllJobs(): Job[] {
  const allJobs: Job[] = [];
  for (const jobs of jobsStore.values()) {
    allJobs.push(...jobs);
  }
  return allJobs;
}
