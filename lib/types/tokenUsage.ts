// Shared token usage types for API endpoints
export interface TokenUsageEntry {
  userId: string;
  action: string;
  tokensUsed: number;
  timestamp: Date;
  jobId?: string;
  details?: Record<string, unknown>;
}
