import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/services/agentService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const agentId = searchParams.get('agentId');

    if (taskId) {
      // Get specific task
      const task = await agentService.getTask(taskId);
      
      if (!task) {
        return NextResponse.json(
          { success: false, error: 'Task not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        task,
      });
    }

    // Get all tasks (optionally filtered by agent)
    const tasks = await agentService.getAllTasks(agentId || undefined);

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error('Tasks fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
