/**
 * Agent Orchestration System
 * Manages automated workflows and agent tasks
 */

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'blog' | 'social' | 'email' | 'content' | 'analysis';
  status: 'idle' | 'running' | 'paused' | 'error';
  schedule?: string; // Cron format
  lastRun?: Date;
  nextRun?: Date;
  config: Record<string, any>;
}

export interface AgentTask {
  id: string;
  agentId: string;
  type: string;
  payload: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

// In-memory storage (replace with database in production)
const agents = new Map<string, Agent>();
const tasks = new Map<string, AgentTask>();

// Initialize default agents
const defaultAgents: Agent[] = [
  {
    id: 'auto-blog-weekly',
    name: 'Weekly Blog Writer',
    description: 'Automatically generates a blog post every week about music production trends',
    type: 'blog',
    status: 'idle',
    schedule: '0 9 * * 1', // Every Monday at 9 AM
    config: {
      categories: ['AI & Innovation', 'Music Production', 'Industry Trends'],
      minLength: 800,
      maxLength: 1500,
      autoPublish: false, // Keep as draft for review
    },
  },
  {
    id: 'auto-blog-news',
    name: 'News Digest Agent',
    description: 'Generates blog posts about latest AI and music tech news',
    type: 'blog',
    status: 'idle',
    schedule: '0 10 * * 3,5', // Wednesday and Friday at 10 AM
    config: {
      categories: ['Tech News', 'AI Updates'],
      autoPublish: false,
    },
  },
  {
    id: 'newsletter-weekly',
    name: 'Weekly Newsletter Compiler',
    description: 'Compiles weekly newsletter with top blog posts and updates',
    type: 'email',
    status: 'idle',
    schedule: '0 15 * * 5', // Friday at 3 PM
    config: {
      includeTopPosts: 5,
      includeStats: true,
    },
  },
];

defaultAgents.forEach(agent => agents.set(agent.id, agent));

export const agentService = {
  /**
   * Get all agents
   */
  getAllAgents: async (): Promise<Agent[]> => {
    return Array.from(agents.values());
  },

  /**
   * Get agent by ID
   */
  getAgent: async (id: string): Promise<Agent | null> => {
    return agents.get(id) || null;
  },

  /**
   * Create a new agent
   */
  createAgent: async (agentData: Omit<Agent, 'id' | 'status'>): Promise<Agent> => {
    const id = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAgent: Agent = {
      ...agentData,
      id,
      status: 'idle',
    };
    
    agents.set(id, newAgent);
    return newAgent;
  },

  /**
   * Update agent configuration
   */
  updateAgent: async (id: string, updates: Partial<Agent>): Promise<Agent | null> => {
    const agent = agents.get(id);
    if (!agent) return null;

    const updatedAgent: Agent = {
      ...agent,
      ...updates,
      id: agent.id, // Preserve ID
    };

    agents.set(id, updatedAgent);
    return updatedAgent;
  },

  /**
   * Delete an agent
   */
  deleteAgent: async (id: string): Promise<boolean> => {
    return agents.delete(id);
  },

  /**
   * Run an agent manually
   */
  runAgent: async (id: string, payload: Record<string, any> = {}): Promise<AgentTask> => {
    const agent = agents.get(id);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Create task
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const task: AgentTask = {
      id: taskId,
      agentId: id,
      type: agent.type,
      payload,
      status: 'pending',
      createdAt: new Date(),
    };

    tasks.set(taskId, task);

    // Update agent status
    agent.status = 'running';
    agent.lastRun = new Date();
    agents.set(id, agent);

    // Execute task asynchronously
    setTimeout(() => agentService.executeTask(taskId), 100);

    return task;
  },

  /**
   * Execute a task
   */
  executeTask: async (taskId: string): Promise<void> => {
    const task = tasks.get(taskId);
    if (!task) return;

    const agent = agents.get(task.agentId);
    if (!agent) return;

    task.status = 'running';
    tasks.set(taskId, task);

    try {
      let result: any;

      // Execute based on agent type
      switch (agent.type) {
        case 'blog':
          result = await agentService.executeBlogAgent(agent, task.payload);
          break;
        case 'social':
          result = await agentService.executeSocialAgent(agent, task.payload);
          break;
        case 'email':
          result = await agentService.executeEmailAgent(agent, task.payload);
          break;
        default:
          throw new Error(`Unknown agent type: ${agent.type}`);
      }

      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;
      tasks.set(taskId, task);

      agent.status = 'idle';
      agents.set(agent.id, agent);
    } catch (error: any) {
      task.status = 'failed';
      task.completedAt = new Date();
      task.error = error.message;
      tasks.set(taskId, task);

      agent.status = 'error';
      agents.set(agent.id, agent);
    }
  },

  /**
   * Execute blog agent
   */
  executeBlogAgent: async (agent: Agent, payload: Record<string, any>): Promise<any> => {
    // Import blog service dynamically to avoid circular dependencies
    const { blogService } = await import('./blogService');
    
    // Generate topic based on agent config
    const categories = agent.config.categories || ['General'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const topics = [
      'AI-Powered Mixing Techniques',
      'The Future of Music Distribution',
      'Mastering for Streaming Platforms',
      'Building Your Producer Brand',
      'Social Media Strategy for Musicians',
      'Understanding Audio Quality Standards',
    ];
    
    const topic = payload.topic || topics[Math.floor(Math.random() * topics.length)];
    
    // Generate blog post
    const post = await blogService.generatePostWithAI(topic, category, agent.name);
    
    return {
      postId: post.id,
      title: post.title,
      category: post.category,
      status: post.status,
      message: 'Blog post generated successfully',
    };
  },

  /**
   * Execute social media agent
   */
  executeSocialAgent: async (agent: Agent, payload: Record<string, any>): Promise<any> => {
    // TODO: Implement social media posting logic
    return {
      message: 'Social media agent executed (not implemented)',
    };
  },

  /**
   * Execute email agent
   */
  executeEmailAgent: async (agent: Agent, payload: Record<string, any>): Promise<any> => {
    // TODO: Implement email sending logic
    return {
      message: 'Email agent executed (not implemented)',
    };
  },

  /**
   * Get all tasks
   */
  getAllTasks: async (agentId?: string): Promise<AgentTask[]> => {
    const allTasks = Array.from(tasks.values());
    
    if (agentId) {
      return allTasks.filter(t => t.agentId === agentId);
    }
    
    return allTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  /**
   * Get task by ID
   */
  getTask: async (id: string): Promise<AgentTask | null> => {
    return tasks.get(id) || null;
  },

  /**
   * Get agent statistics
   */
  getAgentStats: async (agentId: string): Promise<{
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    lastRun?: Date;
    averageRunTime?: number;
  }> => {
    const agentTasks = Array.from(tasks.values()).filter(t => t.agentId === agentId);
    
    const completed = agentTasks.filter(t => t.status === 'completed');
    const failed = agentTasks.filter(t => t.status === 'failed');
    
    const runTimes = completed
      .filter(t => t.completedAt && t.createdAt)
      .map(t => t.completedAt!.getTime() - t.createdAt.getTime());
    
    const averageRunTime = runTimes.length > 0
      ? runTimes.reduce((sum, time) => sum + time, 0) / runTimes.length
      : undefined;
    
    const agent = agents.get(agentId);
    
    return {
      totalRuns: agentTasks.length,
      successfulRuns: completed.length,
      failedRuns: failed.length,
      lastRun: agent?.lastRun,
      averageRunTime,
    };
  },
};
