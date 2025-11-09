'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/lib/contexts/AuthContext';
import { creationApi } from '@/lib/services/api';
import type { Creation } from '@/lib/types';

export default function PortfolioPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [creations, setCreations] = useState<Creation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Creation>>({});

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadCreations();
    }
  }, [authLoading, isAuthenticated]);

  const loadCreations = async () => {
    try {
      setIsLoading(true);
      const response = await creationApi.list({});
      setCreations(response.creations);
    } catch (error) {
      console.error('Failed to load creations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (creation: Creation) => {
    setEditingId(creation.id);
    setEditForm(creation);
  };

  const handleSave = async () => {
    if (!editingId) return;
    
    try {
      await creationApi.update(editingId, {
        title: editForm.title,
        tags: editForm.tags,
        public: editForm.public,
      });
      await loadCreations();
      setEditingId(null);
      setEditForm({});
    } catch (error: any) {
      alert(error.message || 'Failed to save changes');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this creation?')) {
      try {
        await creationApi.delete(id);
        await loadCreations();
      } catch (error: any) {
        alert(error.message || 'Failed to delete creation');
      }
    }
  };

  const handleTogglePublic = async (id: string, currentPublic: boolean) => {
    try {
      await creationApi.update(id, { public: !currentPublic });
      await loadCreations();
    } catch (error: any) {
      alert(error.message || 'Failed to update creation');
    }
  };

  if (authLoading || isLoading) {
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
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-3xl font-bold">Portfolio</h1>
            <button className="px-4 py-2 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-myai-accent/30 transition-all text-sm">
              + Add Creation
            </button>
          </div>
          <p className="text-gray-400">
            Manage your public creations and portfolio
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎨</span>
              <span className="text-gray-400 text-sm">Total Creations</span>
            </div>
            <div className="text-2xl font-bold text-white">{creations.length}</div>
          </div>

          <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">👁️</span>
              <span className="text-gray-400 text-sm">Total Views</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {creations.reduce((sum, c) => sum + c.views, 0)}
            </div>
          </div>

          <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⬇️</span>
              <span className="text-gray-400 text-sm">Total Downloads</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {creations.reduce((sum, c) => sum + c.downloads, 0)}
            </div>
          </div>
        </motion.div>

        {/* Creations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {creations.map((creation) => (
            <div
              key={creation.id}
              className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
            >
              {editingId === creation.id ? (
                // Edit Mode
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-4 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg focus:outline-none focus:border-myai-accent transition-colors text-white"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={editForm.tags?.join(', ') || ''}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                        })}
                        className="w-full px-4 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg focus:outline-none focus:border-myai-accent transition-colors text-white"
                        placeholder="podcast, audio, master"
                      />
                    </div>

                    {/* Public Toggle */}
                    <div className="flex items-center justify-between p-4 bg-myai-bg-dark/50 rounded-lg">
                      <div>
                        <div className="font-medium text-white mb-1">Public Visibility</div>
                        <div className="text-sm text-gray-400">
                          Make this creation visible on your public profile
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          checked={editForm.public || false}
                          onChange={(e) => setEditForm({ ...editForm, public: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-myai-primary peer-checked:to-myai-accent"></div>
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSave}
                        className="flex-1 py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-myai-accent/30 transition-all"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-6 py-3 bg-myai-bg-dark/50 border border-white/10 rounded-lg hover:border-white/20 transition-colors text-white font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail */}
                  <div className="md:w-48 h-32 md:h-auto bg-gradient-to-br from-myai-primary/20 to-myai-accent/20 flex items-center justify-center text-5xl">
                    🎵
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {creation.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {creation.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        creation.public
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      }`}>
                        {creation.public ? '👁️ Public' : '🔒 Private'}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <span>👁️</span>
                        <span>{creation.views} views</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>⬇️</span>
                        <span>{creation.downloads} downloads</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📅</span>
                        <span>{new Date(creation.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(creation)}
                        className="px-4 py-2 bg-myai-bg-dark/50 border border-white/10 rounded-lg hover:border-white/20 transition-colors text-sm font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleTogglePublic(creation.id, creation.public)}
                        className="px-4 py-2 bg-myai-bg-dark/50 border border-white/10 rounded-lg hover:border-white/20 transition-colors text-sm font-medium"
                      >
                        {creation.public ? '🔒 Make Private' : '👁️ Make Public'}
                      </button>
                      <button
                        onClick={() => handleDelete(creation.id)}
                        className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium text-red-300"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {creations.length === 0 && (
            <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-white mb-2">No Creations Yet</h3>
              <p className="text-gray-400 mb-6">
                Start by uploading and processing your first file
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-myai-accent/30 transition-all">
                Upload File
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
