/**
 * Resource Vault Service
 * Manages digital resources, templates, guides, and downloadable content
 */

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'template' | 'guide' | 'code' | 'prompt' | 'workflow' | 'cheatsheet' | 'ebook' | 'video';
  category: string;
  isPro: boolean;
  downloadUrl?: string;
  fileSize?: string;
  format?: string;
  downloadCount: number;
  viewCount: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt?: Date;
}

// In-memory storage (replace with database in production)
const resources = new Map<string, Resource>();

// Initialize default resources
const defaultResources: Resource[] = [
  {
    id: 'res-1',
    title: 'Album Launch Template',
    description: 'Complete checklist and timeline for launching your album. Includes social media schedule, press release templates, and promotional strategies.',
    type: 'template',
    category: 'Marketing',
    isPro: false,
    downloadUrl: '/resources/album-launch-template.pdf',
    fileSize: '2.3 MB',
    format: 'PDF',
    downloadCount: 1247,
    viewCount: 3521,
    rating: 4.8,
    ratingCount: 89,
    tags: ['album', 'launch', 'marketing', 'checklist'],
    createdAt: new Date('2024-12-01'),
  },
  {
    id: 'res-2',
    title: 'Social Media Calendar',
    description: 'Pre-built 90-day posting schedule with content ideas for Instagram, Twitter, TikTok, and YouTube.',
    type: 'template',
    category: 'Social Media',
    isPro: false,
    downloadUrl: '/resources/social-media-calendar.xlsx',
    fileSize: '850 KB',
    format: 'Excel',
    downloadCount: 2134,
    viewCount: 5892,
    rating: 4.6,
    ratingCount: 156,
    tags: ['social media', 'content', 'schedule'],
    createdAt: new Date('2024-11-15'),
  },
  {
    id: 'res-3',
    title: 'EPK Template',
    description: 'Professional Electronic Press Kit template with customizable sections for bio, photos, music links, and press coverage.',
    type: 'template',
    category: 'Promotion',
    isPro: true,
    downloadUrl: '/resources/epk-template.docx',
    fileSize: '1.5 MB',
    format: 'Word',
    downloadCount: 892,
    viewCount: 2341,
    rating: 4.9,
    ratingCount: 67,
    tags: ['epk', 'press kit', 'promotion'],
    createdAt: new Date('2024-10-20'),
  },
  {
    id: 'res-4',
    title: 'Pro Mixing Guide',
    description: 'Comprehensive 50-page guide covering EQ, compression, reverb, and mastering techniques used by professional engineers.',
    type: 'guide',
    category: 'Audio Engineering',
    isPro: true,
    downloadUrl: '/resources/mixing-guide.pdf',
    fileSize: '12 MB',
    format: 'PDF',
    downloadCount: 3421,
    viewCount: 8934,
    rating: 4.9,
    ratingCount: 234,
    tags: ['mixing', 'audio', 'engineering', 'professional'],
    createdAt: new Date('2024-09-10'),
  },
  {
    id: 'res-5',
    title: 'Playlist Pitching Guide',
    description: 'Step-by-step guide to getting your music on Spotify, Apple Music, and YouTube Music playlists.',
    type: 'guide',
    category: 'Distribution',
    isPro: false,
    downloadUrl: '/resources/playlist-pitching.pdf',
    fileSize: '3.2 MB',
    format: 'PDF',
    downloadCount: 4567,
    viewCount: 12345,
    rating: 4.7,
    ratingCount: 312,
    tags: ['playlist', 'spotify', 'distribution'],
    createdAt: new Date('2024-08-05'),
  },
  {
    id: 'res-6',
    title: 'API Integration Code Samples',
    description: 'Sample code for integrating MyAiPlug API into your applications. Includes examples in Python, JavaScript, and cURL.',
    type: 'code',
    category: 'Development',
    isPro: true,
    downloadUrl: '/resources/api-samples.zip',
    fileSize: '456 KB',
    format: 'ZIP',
    downloadCount: 234,
    viewCount: 892,
    rating: 4.8,
    ratingCount: 45,
    tags: ['api', 'code', 'integration', 'developer'],
    createdAt: new Date('2024-07-12'),
  },
  {
    id: 'res-7',
    title: 'ChatGPT Music Prompts Pack',
    description: '100+ carefully crafted prompts for music production, songwriting, marketing, and social media content generation.',
    type: 'prompt',
    category: 'AI Tools',
    isPro: true,
    downloadUrl: '/resources/chatgpt-prompts.pdf',
    fileSize: '890 KB',
    format: 'PDF',
    downloadCount: 1892,
    viewCount: 4523,
    rating: 4.7,
    ratingCount: 178,
    tags: ['chatgpt', 'ai', 'prompts', 'productivity'],
    createdAt: new Date('2024-06-20'),
  },
  {
    id: 'res-8',
    title: 'Release Workflow',
    description: 'Step-by-step workflow for preparing and releasing your music, from final mix to distribution.',
    type: 'workflow',
    category: 'Production',
    isPro: false,
    downloadUrl: '/resources/release-workflow.pdf',
    fileSize: '1.8 MB',
    format: 'PDF',
    downloadCount: 3245,
    viewCount: 7821,
    rating: 4.6,
    ratingCount: 201,
    tags: ['release', 'workflow', 'distribution'],
    createdAt: new Date('2024-05-15'),
  },
  {
    id: 'res-9',
    title: 'Audio Settings Cheatsheet',
    description: 'Quick reference guide for common audio settings including sample rates, bit depths, and export formats.',
    type: 'cheatsheet',
    category: 'Audio Engineering',
    isPro: false,
    downloadUrl: '/resources/audio-settings.pdf',
    fileSize: '520 KB',
    format: 'PDF',
    downloadCount: 5678,
    viewCount: 15234,
    rating: 4.8,
    ratingCount: 423,
    tags: ['audio', 'settings', 'reference'],
    createdAt: new Date('2024-04-10'),
  },
  {
    id: 'res-10',
    title: 'Mastering Cheatsheet',
    description: 'Professional mastering settings and techniques for different genres and streaming platforms.',
    type: 'cheatsheet',
    category: 'Mastering',
    isPro: true,
    downloadUrl: '/resources/mastering-cheatsheet.pdf',
    fileSize: '1.1 MB',
    format: 'PDF',
    downloadCount: 2891,
    viewCount: 6745,
    rating: 4.9,
    ratingCount: 267,
    tags: ['mastering', 'audio', 'professional'],
    createdAt: new Date('2024-03-05'),
  },
];

defaultResources.forEach(resource => resources.set(resource.id, resource));

export const resourceService = {
  /**
   * Get all resources
   */
  getAllResources: async (includeProOnly: boolean = false): Promise<Resource[]> => {
    const allResources = Array.from(resources.values());
    
    if (includeProOnly) {
      return allResources.filter(r => r.isPro);
    }
    
    return allResources.sort((a, b) => b.downloadCount - a.downloadCount);
  },

  /**
   * Get resource by ID
   */
  getResourceById: async (id: string): Promise<Resource | null> => {
    const resource = resources.get(id);
    if (resource) {
      // Increment view count
      resource.viewCount += 1;
      resources.set(id, resource);
    }
    return resource || null;
  },

  /**
   * Get resources by category
   */
  getResourcesByCategory: async (category: string): Promise<Resource[]> => {
    return Array.from(resources.values())
      .filter(r => r.category === category)
      .sort((a, b) => b.downloadCount - a.downloadCount);
  },

  /**
   * Get resources by type
   */
  getResourcesByType: async (type: Resource['type']): Promise<Resource[]> => {
    return Array.from(resources.values())
      .filter(r => r.type === type)
      .sort((a, b) => b.downloadCount - a.downloadCount);
  },

  /**
   * Search resources
   */
  searchResources: async (query: string): Promise<Resource[]> => {
    const lowerQuery = query.toLowerCase();
    return Array.from(resources.values())
      .filter(r =>
        r.title.toLowerCase().includes(lowerQuery) ||
        r.description.toLowerCase().includes(lowerQuery) ||
        r.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => b.downloadCount - a.downloadCount);
  },

  /**
   * Increment download count
   */
  recordDownload: async (id: string): Promise<void> => {
    const resource = resources.get(id);
    if (resource) {
      resource.downloadCount += 1;
      resources.set(id, resource);
    }
  },

  /**
   * Get resource statistics
   */
  getStats: async (): Promise<{
    totalResources: number;
    totalDownloads: number;
    totalViews: number;
    freeResources: number;
    proResources: number;
    categoryCounts: { [key: string]: number };
  }> => {
    const allResources = Array.from(resources.values());
    
    const categoryCounts: { [key: string]: number } = {};
    allResources.forEach(r => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });

    return {
      totalResources: allResources.length,
      totalDownloads: allResources.reduce((sum, r) => sum + r.downloadCount, 0),
      totalViews: allResources.reduce((sum, r) => sum + r.viewCount, 0),
      freeResources: allResources.filter(r => !r.isPro).length,
      proResources: allResources.filter(r => r.isPro).length,
      categoryCounts,
    };
  },
};
