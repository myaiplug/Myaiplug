import { NextResponse } from 'next/server';
import { generateDemoUsers, getDemoLeaderboard } from '@/lib/services/seedDataService';

export async function GET() {
  try {
    const demoUsers = generateDemoUsers();
    const leaderboard = getDemoLeaderboard();

    return NextResponse.json({
      success: true,
      users: demoUsers,
      count: demoUsers.length,
      leaderboard,
      message: 'Demo users generated successfully',
    });
  } catch (error) {
    console.error('Demo users generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate demo users' },
      { status: 500 }
    );
  }
}
