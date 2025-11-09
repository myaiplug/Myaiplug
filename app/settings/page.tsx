'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { mockUser, mockProfile } from '@/lib/utils/mockData';

type TabType = 'account' | 'privacy' | 'notifications';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [user, setUser] = useState(mockUser);
  const [profile, setProfile] = useState(mockProfile);
  const [isSaving, setIsSaving] = useState(false);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Mock save - in production, this would call an API
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved! (Mock - no backend yet)');
    }, 1000);
  };

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
                      value={user.handle}
                      onChange={(e) => setUser({ ...user, handle: e.target.value })}
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
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="w-full px-4 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg focus:outline-none focus:border-myai-accent transition-colors text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for login and notifications
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={user.bio || ''}
                    onChange={(e) => setUser({ ...user, bio: e.target.value })}
                    rows={4}
                    maxLength={160}
                    className="w-full px-4 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg focus:outline-none focus:border-myai-accent transition-colors text-white resize-none"
                    placeholder="Tell others about yourself..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {user.bio?.length || 0}/160 characters
                  </p>
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={user.avatarUrl || ''}
                    onChange={(e) => setUser({ ...user, avatarUrl: e.target.value })}
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
                      checked={profile.privacyOptOut}
                      onChange={(e) => setProfile({ ...profile, privacyOptOut: e.target.checked })}
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
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 bg-myai-bg-dark/30 border-t border-white/10">
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
