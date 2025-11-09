// Jobs API
import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession } from '@/lib/services/userService';
import { createJob, getUserJobs, getJob, simulateJobProcessing } from '@/lib/services/jobService';
import { checkRateLimit, RATE_LIMITS } from '@/lib/services/antiAbuseService';
import { getUserCredits } from '@/lib/services/referralService';
import type { JobType, UserTier } from '@/lib/types';

// GET - List user's jobs
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionToken = authHeader.substring(7);
    const result = await getUserBySession(sessionToken);

    if (!result) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Get user's jobs
    const jobs = getUserJobs(result.user.id, limit);

    return NextResponse.json({
      success: true,
      jobs,
      total: jobs.length,
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new job
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionToken = authHeader.substring(7);
    const result = await getUserBySession(sessionToken);

    if (!result) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = checkRateLimit(
      `job_create_${result.user.id}`,
      RATE_LIMITS.JOB_CREATE.max,
      RATE_LIMITS.JOB_CREATE.window
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many job creation requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type, inputDurationSec, inputUrl } = body;

    // Validate required fields
    if (!type || !inputDurationSec) {
      return NextResponse.json(
        { error: 'Job type and input duration are required' },
        { status: 400 }
      );
    }

    // Check credits balance
    const credits = getUserCredits(result.user.id);
    // In production, would calculate actual cost and check balance
    // For now, just create the job

    // Create job
    const job = await createJob({
      userId: result.user.id,
      type: type as JobType,
      inputDurationSec,
      tier: result.user.tier as UserTier,
      inputUrl,
    });

    // Simulate processing (in production, would queue for actual processing)
    // We'll do this asynchronously
    simulateJobProcessing(job.id).catch(err => {
      console.error('Job processing error:', err);
    });

    return NextResponse.json({
      success: true,
      job,
      message: 'Job created and queued for processing',
    });

  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
