// Authentication API - Logout
import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/services/userService';

export async function POST(request: NextRequest) {
  try {
    // Get session token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No session token provided' },
        { status: 401 }
      );
    }

    const sessionToken = authHeader.substring(7);

    // Logout (invalidate session)
    logout(sessionToken);

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
