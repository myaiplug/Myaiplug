// Utility functions for formatting and calculations

// Format time saved in human-readable format (days, hours, minutes, seconds)
export function formatTimeSaved(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0 || days > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }
  
  // Return most significant units (max 2 units for readability)
  return parts.slice(0, 2).join(' ');
}

// Format time saved with full details (days, hours, minutes, seconds)
export function formatTimeSavedDetailed(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
}

// Format time saved as a compact counter
export function formatTimeSavedCounter(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Format large numbers with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Format credit amount
export function formatCredits(credits: number): string {
  return `${credits.toLocaleString()} credits`;
}

// Generate avatar placeholder based on handle
export function getAvatarPlaceholder(handle: string): string {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  
  const hash = handle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % colors.length;
  
  return colors[colorIndex];
}

// Get initials from handle or name
export function getInitials(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// Calculate progress percentage
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 100;
  return Math.min(Math.floor((current / target) * 100), 100);
}

// Generate signed referral link (mock implementation)
export function generateReferralLink(userId: string): string {
  // In real implementation, use HMAC with secret
  const timestamp = Date.now();
  const mockHmac = btoa(`${userId}:${timestamp}`);
  return `/signup?r=${mockHmac}`;
}

// Validate referral code (mock implementation)
export function validateReferralCode(code: string): { valid: boolean; userId?: string } {
  try {
    const decoded = atob(code);
    const [userId, timestamp] = decoded.split(':');
    
    // Check if code is not expired (30 days)
    const codeAge = Date.now() - parseInt(timestamp);
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    
    if (codeAge > maxAge) {
      return { valid: false };
    }
    
    return { valid: true, userId };
  } catch {
    return { valid: false };
  }
}

// Format date relative to now
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  
  return date.toLocaleDateString();
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Generate QR code data URL (simplified mock)
export function generateQRCode(data: string): string {
  // In real implementation, use a QR code library
  return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="10" y="100">${data}</text></svg>`)}`;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitMs);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastRun = 0;
  
  return function(...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastRun >= limitMs) {
      func(...args);
      lastRun = now;
    }
  };
}
