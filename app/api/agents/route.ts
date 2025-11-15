import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/services/agentService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (agentId) {
      // Get specific agent with stats
      const agent = await agentService.getAgent(agentId);
      if (!agent) {
        return NextResponse.json(
          { success: false, error: 'Agent not found' },
          { status: 404 }
        );
      }

      const stats = await agentService.getAgentStats(agentId);
      const tasks = await agentService.getAllTasks(agentId);

      return NextResponse.json({
        success: true,
        agent,
        stats,
        recentTasks: tasks.slice(0, 10), // Last 10 tasks
      });
    }

    // Get all agents
    const agents = await agentService.getAllAgents();

    return NextResponse.json({
      success: true,
      agents,
    });
  } catch (error) {
    console.error('Agents fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, agentId, agentData, payload } = body;

    if (action === 'run') {
      // Run an agent
      if (!agentId) {
        return NextResponse.json(
          { success: false, error: 'Agent ID is required' },
          { status: 400 }
        );
      }

      const task = await agentService.runAgent(agentId, payload || {});

      return NextResponse.json({
        success: true,
        task,
        message: 'Agent task started',
      });
    }

    if (action === 'create') {
      // Create new agent
      if (!agentData) {
        return NextResponse.json(
          { success: false, error: 'Agent data is required' },
          { status: 400 }
        );
      }

      const newAgent = await agentService.createAgent(agentData);

      return NextResponse.json({
        success: true,
        agent: newAgent,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Agent action error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, ...updates } = body;

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const updatedAgent = await agentService.updateAgent(agentId, updates);

    if (!updatedAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      agent: updatedAgent,
    });
  } catch (error) {
    console.error('Agent update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const deleted = await agentService.deleteAgent(agentId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully',
    });
  } catch (error) {
    console.error('Agent deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
