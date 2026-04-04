'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/lib/contexts/AuthContext';

type TabType = 'account' | 'privacy' | 'notifications' | 'integrations';

export default function SettingsPage() {
  const { user, profile, updateProfile, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [formData, setFormData] = useState({
    handle: '',
    bio: '',
    avatarUrl: '',
    privacyOptOut: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      setFormData({
        handle: user.handle,
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        privacyOptOut: profile.privacyOptOut,
      });
    }
  }, [user, profile]);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      await updateProfile(formData);
      setSaveMessage('Settings saved successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      setSaveMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !user || !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block size-8 rounded-full border-2 border-white/30 border-t-white animate-spin mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="flex border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-white bg-myai-bg-dark/50 border-b-2 border-myai-accent'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Handle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                    <input
                      type="text"
                      value={formData.handle}
                      onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg focus:outline-none focus:border-myai-accent transition-colors text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Your unique username visible to everyone
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    disabled
                    className="w-full px-4 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed. Used for login and notifications.
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    maxLength={160}
                    className="w-full px-4 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg focus:outline-none focus:border-myai-accent transition-colors text-white resize-none"
                    placeholder="Tell others about yourself..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.bio.length}/160 characters
                  </p>
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg focus:outline-none focus:border-myai-accent transition-colors text-white"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Link to your profile picture
                  </p>
                </div>
              </motion.div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Leaderboard Opt-Out */}
                <div className="flex items-start justify-between p-5 bg-myai-bg-dark/50 rounded-lg border border-white/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white">Hide from Leaderboards</h3>
                      <span className="text-xl">🏆</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Remove your profile from public leaderboard rankings. You&apos;ll still earn points and badges.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={formData.privacyOptOut}
                      onChange={(e) => setFormData({ ...formData, privacyOptOut: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-myai-primary peer-checked:to-myai-accent"></div>
                  </label>
                </div>

                {/* Profile Visibility */}
                <div className="flex items-start justify-between p-5 bg-myai-bg-dark/50 rounded-lg border border-white/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white">Public Profile</h3>
                      <span className="text-xl">👁️</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Allow others to view your profile, stats, and portfolio
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => {}}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-myai-primary peer-checked:to-myai-accent"></div>
                  </label>
                </div>

                {/* Portfolio Visibility */}
                <div className="flex items-start justify-between p-5 bg-myai-bg-dark/50 rounded-lg border border-white/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white">Show Portfolio</h3>
                      <span className="text-xl">🎨</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Display your public creations on your profile
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => {}}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-myai-primary peer-checked:to-myai-accent"></div>
                  </label>
                </div>

                {/* Data Privacy Notice */}
                <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                      <h3 className="font-medium text-blue-200 mb-1">Privacy Notice</h3>
                      <p className="text-sm text-blue-300/80">
                        We take your privacy seriously. Your email is never shared publicly. 
                        View our <a href="#" className="underline hover:text-blue-200">Privacy Policy</a> for more details.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-start justify-between p-5 bg-myai-bg-dark/50 rounded-lg border border-white/5">
                  <div className="flex-1">
                    <h3 className="font-medium text-white mb-1">Job Completion</h3>
                    <p className="text-sm text-gray-400">
                      Get notified when your jobs are processed
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" checked={true} onChange={() => {}} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-myai-primary peer-checked:to-myai-accent"></div>
                  </label>
                </div>

                <div className="flex items-start justify-between p-5 bg-myai-bg-dark/50 rounded-lg border border-white/5">
                  <div className="flex-1">
                    <h3 className="font-medium text-white mb-1">Badges & Achievements</h3>
                    <p className="text-sm text-gray-400">
                      Be notified when you earn new badges
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" checked={true} onChange={() => {}} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-myai-primary peer-checked:to-myai-accent"></div>
                  </label>
                </div>

                <div className="flex items-start justify-between p-5 bg-myai-bg-dark/50 rounded-lg border border-white/5">
                  <div className="flex-1">
                    <h3 className="font-medium text-white mb-1">Referral Updates</h3>
                    <p className="text-sm text-gray-400">
                      Get notified when someone uses your referral link
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" checked={true} onChange={() => {}} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-myai-primary peer-checked:to-myai-accent"></div>
                  </label>
                </div>

                <div className="flex items-start justify-between p-5 bg-myai-bg-dark/50 rounded-lg border border-white/5">
                  <div className="flex-1">
                    <h3 className="font-medium text-white mb-1">Marketing Emails</h3>
                    <p className="text-sm text-gray-400">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" checked={false} onChange={() => {}} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-myai-primary peer-checked:to-myai-accent"></div>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Shopify */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🛍️</span>
                    <div>
                      <h3 className="font-semibold text-white">Shopify</h3>
                      <p className="text-sm text-gray-400">Connect your Shopify store to sell products directly.</p>
                    </div>
                  </div>
                  <div className="space-y-4 pl-0">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Store Domain
                      </label>
                      <input
                        type="text"
                        disabled
                        placeholder="your-store.myshopify.com"
                        className="w-full px-4 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Set via <code className="text-myai-accent">SHOPIFY_STORE_DOMAIN</code> environment variable.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Admin API Token
                      </label>
                      <input
                        type="password"
                        disabled
                        placeholder="••••••••••••••••"
                        className="w-full px-4 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Set via <code className="text-myai-accent">SHOPIFY_ADMIN_API_KEY</code> environment variable.{' '}
                        <a
                          href="https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/admin-api-access-tokens"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-myai-accent"
                        >
                          How to get your token ↗
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-white/10" />

                {/* Printify */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🖨️</span>
                    <div>
                      <h3 className="font-semibold text-white">Printify</h3>
                      <p className="text-sm text-gray-400">Connect Printify to create and fulfill print-on-demand products.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        disabled
                        placeholder="••••••••••••••••"
                        className="w-full px-4 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Set via <code className="text-myai-accent">PRINTIFY_API_KEY</code> environment variable.{' '}
                        <a
                          href="https://printify.com/app/account/connections"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-myai-accent"
                        >
                          Get your API key ↗
                        </a>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Shop ID
                      </label>
                      <input
                        type="text"
                        disabled
                        placeholder="e.g. 12345678"
                        className="w-full px-4 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Set via <code className="text-myai-accent">PRINTIFY_SHOP_ID</code> environment variable.
                        Your Shop ID is visible in your Printify dashboard URL.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">ℹ️</span>
                    <p className="text-sm text-blue-300/80">
                      Credentials are managed via environment variables for security.
                      Once configured, visit the{' '}
                      <a href="/dashboard/store" className="underline hover:text-blue-200">
                        Store dashboard
                      </a>{' '}
                      to sync and publish products.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 bg-myai-bg-dark/30 border-t border-white/10">
            {saveMessage && (
              <div className={`mb-3 p-3 rounded-lg text-sm ${
                saveMessage.includes('success') 
                  ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                  : 'bg-red-500/10 border border-red-500/30 text-red-300'
              }`}>
                {saveMessage}
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Changes will be saved to your account
              </p>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-myai-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
