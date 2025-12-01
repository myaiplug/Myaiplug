// Centralized API client for all backend communication
import type { User, Profile, Job, Creation, LeaderboardEntry, Badge } from '../types';

const API_BASE = typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api';

// API Response types
export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}

export interface AuthResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    handle: string;
    tier: string;
    avatarUrl: string | null;
    bio: string | null;
  };
  profile: {
    level: number;
    pointsTotal: number;
    timeSavedSecTotal: number;
    badges: Badge[];
    privacyOptOut?: boolean;
  };
  sessionToken: string;
}

export interface ProfileResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    handle: string;
    avatarUrl: string | null;
    bio: string | null;
    tier: string;
  };
  profile: {
    level: number;
    pointsTotal: number;
    timeSavedSecTotal: number;
    badges: Badge[];
    privacyOptOut: boolean;
  };
}

export interface StatsResponse {
  success: boolean;
  jobs: {
    total: number;
    completed: number;
    failed: number;
    creditsUsed: number;
    timeSavedSec: number;
  };
  creations: {
    total: number;
    public: number;
    totalViews: number;
    totalDownloads: number;
  };
  referrals: {
    total: number;
    signedUp: number;
    paid: number;
    creditsEarned: number;
  };
  badgeProgress: Array<{
    badgeId: string;
    name: string;
    progress: number;
    target: number;
    earned: boolean;
  }>;
}

export interface ReferralResponse {
  success: boolean;
  referralCode: string;
  referralUrl: string;
  stats: {
    total: number;
    signedUp: number;
    paid: number;
    creditsEarned: number;
  };
  history: Array<{
    id: string;
    status: string;
    createdAt: Date;
    signedUpAt: Date | null;
    paidAt: Date | null;
  }>;
  milestones: Array<{
    threshold: number;
    reward: string;
    claimed: boolean;
  }>;
}

// Helper to get session token from localStorage
function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sessionToken');
}

// Helper to set session token in localStorage
function setSessionToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sessionToken', token);
}

// Helper to clear session token
function clearSessionToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sessionToken');
}

// Helper to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// Authentication APIs
export const authApi = {
  async signup(email: string, password: string, handle: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, handle }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    if (data.success && data.sessionToken) {
      setSessionToken(data.sessionToken);
    }

    return data;
  },

  async signin(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Signin failed');
    }

    if (data.success && data.sessionToken) {
      setSessionToken(data.sessionToken);
    }

    return data;
  },

  async checkSession(): Promise<ProfileResponse | null> {
    try {
      const response = await fetchWithAuth(`${API_BASE}/auth/session`);
      
      if (!response.ok) {
        clearSessionToken();
        return null;
      }

      return await response.json();
    } catch (error) {
      clearSessionToken();
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetchWithAuth(`${API_BASE}/auth/logout`, { method: 'POST' });
    } finally {
      clearSessionToken();
    }
  },
};

// User Profile APIs
export const userApi = {
  async getProfile(): Promise<ProfileResponse> {
    const response = await fetchWithAuth(`${API_BASE}/user/profile`);
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch profile');
    }

    return await response.json();
  },

  async updateProfile(updates: {
    handle?: string;
    bio?: string;
    avatarUrl?: string;
    privacyOptOut?: boolean;
  }): Promise<ProfileResponse> {
    const response = await fetchWithAuth(`${API_BASE}/user/profile`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update profile');
    }

    return await response.json();
  },

  async getStats(): Promise<StatsResponse> {
    const response = await fetchWithAuth(`${API_BASE}/user/stats`);
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch stats');
    }

    return await response.json();
  },
};

// Job APIs
export const jobApi = {
  async list(limit?: number): Promise<{ success: boolean; jobs: Job[] }> {
    const url = limit 
      ? `${API_BASE}/jobs?limit=${limit}`
      : `${API_BASE}/jobs`;
    
    const response = await fetchWithAuth(url);
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch jobs');
    }

    return await response.json();
  },

  async create(type: string, inputDurationSec: number, inputUrl: string): Promise<{ success: boolean; job: Job }> {
    const response = await fetchWithAuth(`${API_BASE}/jobs`, {
      method: 'POST',
      body: JSON.stringify({ type, inputDurationSec, inputUrl }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create job');
    }

    return await response.json();
  },
};

// Creation/Portfolio APIs
export const creationApi = {
  async list(options?: { userId?: string; public?: boolean; limit?: number }): Promise<{ success: boolean; creations: Creation[] }> {
    const params = new URLSearchParams();
    if (options?.userId) params.append('userId', options.userId);
    if (options?.public !== undefined) params.append('public', String(options.public));
    if (options?.limit) params.append('limit', String(options.limit));

    const url = params.toString() 
      ? `${API_BASE}/creations?${params}`
      : `${API_BASE}/creations`;

    const response = await fetchWithAuth(url);
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch creations');
    }

    return await response.json();
  },

  async create(creation: {
    jobId: string;
    title: string;
    tags: string[];
    mediaUrl: string;
    thumbnailUrl?: string;
    public: boolean;
  }): Promise<{ success: boolean; creation: Creation }> {
    const response = await fetchWithAuth(`${API_BASE}/creations`, {
      method: 'POST',
      body: JSON.stringify(creation),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create creation');
    }

    return await response.json();
  },

  async update(creationId: string, updates: {
    title?: string;
    tags?: string[];
    public?: boolean;
  }): Promise<{ success: boolean }> {
    const response = await fetchWithAuth(`${API_BASE}/creations`, {
      method: 'PUT',
      body: JSON.stringify({ creationId, ...updates }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update creation');
    }

    return await response.json();
  },

  async delete(creationId: string): Promise<{ success: boolean }> {
    const response = await fetchWithAuth(`${API_BASE}/creations?id=${creationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete creation');
    }

    return await response.json();
  },
};

// Referral APIs
export const referralApi = {
  async get(): Promise<ReferralResponse> {
    const response = await fetchWithAuth(`${API_BASE}/referrals`);
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch referrals');
    }

    return await response.json();
  },
};

// Leaderboard APIs
export const leaderboardApi = {
  async get(options?: {
    type?: 'time_saved' | 'referrals' | 'popularity';
    period?: 'weekly' | 'alltime';
    limit?: number;
    userId?: string;
  }): Promise<{
    success: boolean;
    type: string;
    period: string;
    entries: LeaderboardEntry[];
    userRank?: number;
  }> {
    const params = new URLSearchParams();
    if (options?.type) params.append('type', options.type);
    if (options?.period) params.append('period', options.period);
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.userId) params.append('userId', options.userId);

    const url = params.toString()
      ? `${API_BASE}/leaderboard?${params}`
      : `${API_BASE}/leaderboard`;

    const response = await fetch(url); // Public endpoint, no auth needed
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch leaderboard');
    }

    return await response.json();
  },
};

// Audio Processing APIs
export interface AudioProcessResponse {
  success: boolean;
  job?: {
    id: string;
    status: string;
    preset: string;
    modules: string[];
  };
  processing?: {
    tokensUsed: number;
    remainingCredits: number;
    estimatedDuration: string;
    timeSaved: string;
  };
  download?: {
    url: string;
    fileName: string;
    expiresIn: string;
  };
  points?: number;
  message?: string;
  error?: string;
}

export interface AudioAnalysisResponse {
  success: boolean;
  audioAnalysis?: {
    title: string;
    genre: string;
    mood: string;
    duration: string;
    bpm: number;
    key: string;
  };
  generatedContent?: Array<{
    platform: string;
    content: string;
    hashtags?: string[];
  }>;
  job?: {
    id: string;
    status: string;
  };
  download?: {
    url: string;
    fileName: string;
    expiresIn: string;
  };
  tokens?: {
    used: number;
    credits?: {
      used: number;
      remaining: number;
    };
  };
  message?: string;
  error?: string;
}

export interface PresetInfo {
  id: string;
  name: string;
  description: string;
  jobType: string;
  modules: string[];
  tokenCost: number;
}

export const audioApi = {
  /**
   * Upload and analyze audio file
   */
  async upload(file: File): Promise<AudioAnalysisResponse> {
    const formData = new FormData();
    formData.append('audio', file);

    const token = getSessionToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/audio/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload audio');
    }

    return data;
  },

  /**
   * Process audio with a specific preset
   */
  async process(file: File, preset: string = 'warmth-master'): Promise<AudioProcessResponse> {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('preset', preset);

    const token = getSessionToken();
    if (token) {
      formData.append('sessionToken', token);
    }

    const response = await fetch(`${API_BASE}/audio/process`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to process audio');
    }

    return data;
  },

  /**
   * Get available presets with token costs
   */
  async getPresets(durationSec: number = 180): Promise<{ success: boolean; presets: PresetInfo[] }> {
    const response = await fetch(`${API_BASE}/audio/process?duration=${durationSec}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get presets');
    }

    return data;
  },

  /**
   * Get download URL for processed file
   */
  async getDownload(fileId: string): Promise<{ success: boolean; url: string; fileName: string }> {
    const response = await fetch(`${API_BASE}/audio/download/${fileId}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get download');
    }

    return data;
  },

  /**
   * Transcribe audio and optionally analyze lyrics
   */
  async transcribe(audioFileName: string, options: { useGenAI?: boolean; enableAnalysis?: boolean } = {}): Promise<any> {
    const response = await fetch(`${API_BASE}/audio/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioFileName,
        useGenAI: options.useGenAI ?? false,
        enableAnalysis: options.enableAnalysis ?? false,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to transcribe audio');
    }

    return data;
  },
};

// Export helper for checking if user is authenticated
export function isAuthenticated(): boolean {
  return getSessionToken() !== null;
}

// Export all APIs as a single object
export const api = {
  auth: authApi,
  user: userApi,
  jobs: jobApi,
  creations: creationApi,
  referrals: referralApi,
  leaderboard: leaderboardApi,
  audio: audioApi,
  isAuthenticated,
};

export default api;
