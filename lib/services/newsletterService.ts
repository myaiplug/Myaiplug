/**
 * Newsletter Service
 * Handles newsletter subscriptions and email list management
 */

interface NewsletterSubscriber {
  email: string;
  subscribedAt: Date;
  source: string; // e.g., "homepage", "blog", "vault"
  status: 'active' | 'unsubscribed';
  tags?: string[];
}

// In-memory storage (replace with database in production)
const subscribers = new Map<string, NewsletterSubscriber>();

export const newsletterService = {
  /**
   * Subscribe a new email to the newsletter
   */
  subscribe: async (email: string, source: string = 'homepage', tags: string[] = []): Promise<{ success: boolean; message: string }> => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email address' };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const existing = subscribers.get(normalizedEmail);
    if (existing) {
      if (existing.status === 'active') {
        return { success: false, message: 'Email already subscribed' };
      } else {
        // Reactivate subscription
        existing.status = 'active';
        existing.subscribedAt = new Date();
        existing.tags = [...new Set([...(existing.tags || []), ...tags])];
        subscribers.set(normalizedEmail, existing);
        return { success: true, message: 'Welcome back! Subscription reactivated.' };
      }
    }

    // Add new subscriber
    subscribers.set(normalizedEmail, {
      email: normalizedEmail,
      subscribedAt: new Date(),
      source,
      status: 'active',
      tags,
    });

    return { success: true, message: 'Successfully subscribed to newsletter!' };
  },

  /**
   * Unsubscribe an email from the newsletter
   */
  unsubscribe: async (email: string): Promise<{ success: boolean; message: string }> => {
    const normalizedEmail = email.toLowerCase().trim();
    const subscriber = subscribers.get(normalizedEmail);

    if (!subscriber) {
      return { success: false, message: 'Email not found' };
    }

    subscriber.status = 'unsubscribed';
    subscribers.set(normalizedEmail, subscriber);

    return { success: true, message: 'Successfully unsubscribed' };
  },

  /**
   * Get subscriber count
   */
  getSubscriberCount: async (): Promise<number> => {
    return Array.from(subscribers.values()).filter(s => s.status === 'active').length;
  },

  /**
   * Get all subscribers (admin only)
   */
  getAllSubscribers: async (): Promise<NewsletterSubscriber[]> => {
    return Array.from(subscribers.values());
  },

  /**
   * Check if email is subscribed
   */
  isSubscribed: async (email: string): Promise<boolean> => {
    const normalizedEmail = email.toLowerCase().trim();
    const subscriber = subscribers.get(normalizedEmail);
    return subscriber?.status === 'active' || false;
  },
};
