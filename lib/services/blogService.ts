/**
 * Blog Service
 * Manages blog posts, auto-generation, and content
 */

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  category: string;
  tags: string[];
  publishedAt: Date;
  updatedAt?: Date;
  readTimeMin: number;
  status: 'draft' | 'published' | 'archived';
  viewCount: number;
  gradient: string;
  aiGenerated?: boolean;
}

// In-memory storage (replace with database in production)
const blogPosts = new Map<string, BlogPost>();

// Initialize with some default posts
const defaultPosts: BlogPost[] = [
  {
    id: '1',
    title: "The Rise of AI in Music Production: A New Era of Creativity",
    excerpt: "Discover how AI-powered tools are revolutionizing the music production landscape, empowering creators to produce studio-quality tracks without expensive hardware or years of training.",
    content: "Full article content here...",
    author: "Sarah Mitchell",
    authorRole: "Audio Engineer & AI Specialist",
    category: "AI & Innovation",
    tags: ["AI", "Music Production", "Technology"],
    publishedAt: new Date('2025-01-15'),
    readTimeMin: 5,
    status: 'published',
    viewCount: 0,
    gradient: "from-purple-500/20 to-blue-500/20",
  },
  {
    id: '2',
    title: "From Bedroom to Billboard: Success Stories of Independent Artists",
    excerpt: "Learn how modern creators are leveraging AI audio tools to compete with major labels. Real stories from artists who transformed their bedroom setups into chart-topping production studios.",
    content: "Full article content here...",
    author: "Marcus Chen",
    authorRole: "Music Producer & Industry Analyst",
    category: "Success Stories",
    tags: ["Success", "Independent Artists", "Case Studies"],
    publishedAt: new Date('2025-01-12'),
    readTimeMin: 7,
    status: 'published',
    viewCount: 0,
    gradient: "from-pink-500/20 to-orange-500/20",
  },
  {
    id: '3',
    title: "Mastering the Art of Social Media for Musicians",
    excerpt: "A comprehensive guide to building your online presence, growing your fanbase, and maximizing engagement across Instagram, TikTok, YouTube, and beyond. Learn the strategies that work in 2025.",
    content: "Full article content here...",
    author: "Zara Johnson",
    authorRole: "Social Media Strategist",
    category: "Marketing & Growth",
    tags: ["Social Media", "Marketing", "Growth"],
    publishedAt: new Date('2025-01-10'),
    readTimeMin: 6,
    status: 'published',
    viewCount: 0,
    gradient: "from-green-500/20 to-teal-500/20",
  },
  {
    id: '4',
    title: "Quality Control in the Age of AI: Ensuring Professional Sound",
    excerpt: "Dive deep into the world of audio QC. Understand LUFS, peak detection, clipping prevention, and how AI-powered quality control ensures your tracks meet industry standards every time.",
    content: "Full article content here...",
    author: "Dr. Alex Rodriguez",
    authorRole: "Audio Technology Researcher",
    category: "Technical Deep-Dive",
    tags: ["Quality Control", "Audio Engineering", "Technical"],
    publishedAt: new Date('2025-01-08'),
    readTimeMin: 8,
    status: 'published',
    viewCount: 0,
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
];

// Initialize default posts
defaultPosts.forEach(post => blogPosts.set(post.id, post));

export const blogService = {
  /**
   * Get all published blog posts
   */
  getAllPosts: async (includeUnpublished: boolean = false): Promise<BlogPost[]> => {
    const posts = Array.from(blogPosts.values());
    
    if (!includeUnpublished) {
      return posts
        .filter(p => p.status === 'published')
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    }
    
    return posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  },

  /**
   * Get a single blog post by ID
   */
  getPostById: async (id: string): Promise<BlogPost | null> => {
    const post = blogPosts.get(id);
    if (post) {
      // Increment view count
      post.viewCount += 1;
      blogPosts.set(id, post);
    }
    return post || null;
  },

  /**
   * Get posts by category
   */
  getPostsByCategory: async (category: string): Promise<BlogPost[]> => {
    return Array.from(blogPosts.values())
      .filter(p => p.status === 'published' && p.category === category)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  },

  /**
   * Get posts by tag
   */
  getPostsByTag: async (tag: string): Promise<BlogPost[]> => {
    return Array.from(blogPosts.values())
      .filter(p => p.status === 'published' && p.tags.includes(tag))
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  },

  /**
   * Create a new blog post
   */
  createPost: async (postData: Omit<BlogPost, 'id' | 'publishedAt' | 'viewCount'>): Promise<BlogPost> => {
    const id = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newPost: BlogPost = {
      ...postData,
      id,
      publishedAt: new Date(),
      viewCount: 0,
    };
    
    blogPosts.set(id, newPost);
    return newPost;
  },

  /**
   * Update an existing blog post
   */
  updatePost: async (id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> => {
    const post = blogPosts.get(id);
    if (!post) return null;

    const updatedPost: BlogPost = {
      ...post,
      ...updates,
      id: post.id, // Preserve ID
      publishedAt: post.publishedAt, // Preserve original publish date
      updatedAt: new Date(),
    };

    blogPosts.set(id, updatedPost);
    return updatedPost;
  },

  /**
   * Delete a blog post
   */
  deletePost: async (id: string): Promise<boolean> => {
    return blogPosts.delete(id);
  },

  /**
   * AI-powered blog post generation
   * This is a placeholder for future AI integration
   */
  generatePostWithAI: async (topic: string, category: string, author: string = "AI Writer"): Promise<BlogPost> => {
    // TODO: Integrate with OpenAI or similar API for actual content generation
    // For now, create a template post
    
    const gradients = [
      "from-purple-500/20 to-blue-500/20",
      "from-pink-500/20 to-orange-500/20",
      "from-green-500/20 to-teal-500/20",
      "from-blue-500/20 to-indigo-500/20",
    ];

    const newPost = await blogService.createPost({
      title: `AI-Generated: ${topic}`,
      excerpt: `An in-depth exploration of ${topic} in the context of modern music production and AI technology.`,
      content: `# ${topic}\n\nThis is an AI-generated post about ${topic}. In a production environment, this would be generated by an AI language model with rich, engaging content.\n\n## Key Points\n\n- Point 1 about ${topic}\n- Point 2 about ${topic}\n- Point 3 about ${topic}\n\n## Conclusion\n\nThis concludes our exploration of ${topic}.`,
      author,
      authorRole: "AI Content Generator",
      category,
      tags: [topic, "AI-Generated", category],
      readTimeMin: 5,
      status: 'draft', // Start as draft for review
      gradient: gradients[Math.floor(Math.random() * gradients.length)],
      aiGenerated: true,
    });

    return newPost;
  },

  /**
   * Get blog statistics
   */
  getStats: async (): Promise<{
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    categories: { [key: string]: number };
  }> => {
    const posts = Array.from(blogPosts.values());
    
    const categories: { [key: string]: number } = {};
    posts.forEach(post => {
      if (post.status === 'published') {
        categories[post.category] = (categories[post.category] || 0) + 1;
      }
    });

    return {
      totalPosts: posts.length,
      publishedPosts: posts.filter(p => p.status === 'published').length,
      draftPosts: posts.filter(p => p.status === 'draft').length,
      totalViews: posts.reduce((sum, p) => sum + p.viewCount, 0),
      categories,
    };
  },
};
