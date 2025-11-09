'use client';

import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { mockJobs } from '@/lib/utils/mockData';
import { formatTimeSaved } from '@/lib/utils/helpers';

export default function JobsPage() {
  const jobs = mockJobs;

  const statusStyles = {
    done: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      text: 'text-green-300',
      icon: '✅',
    },
    running: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      text: 'text-blue-300',
      icon: '⏳',
    },
    queued: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/30',
      text: 'text-yellow-300',
      icon: '⏰',
    },
    failed: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      text: 'text-red-300',
      icon: '❌',
    },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold mb-2">Jobs History</h1>
          <p className="text-gray-400">
            View all your processed files and their status
          </p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-4"
        >
          <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📊</span>
              <span className="text-gray-400 text-sm">Total Jobs</span>
            </div>
            <div className="text-2xl font-bold text-white">{jobs.length}</div>
          </div>

          <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">✅</span>
              <span className="text-gray-400 text-sm">Completed</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {jobs.filter(j => j.status === 'done').length}
            </div>
          </div>

          <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⏱️</span>
              <span className="text-gray-400 text-sm">Time Saved</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatTimeSaved(jobs.reduce((sum, j) => sum + j.timeSavedSec, 0))}
            </div>
          </div>

          <div className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">💰</span>
              <span className="text-gray-400 text-sm">Credits Used</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {jobs.reduce((sum, j) => sum + j.creditsCharged, 0)}
            </div>
          </div>
        </motion.div>

        {/* Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="p-6">
            <h2 className="font-display text-xl font-bold mb-4">Recent Jobs</h2>
            
            <div className="space-y-3">
              {jobs.map((job) => {
                const style = statusStyles[job.status];
                return (
                  <div
                    key={job.id}
                    className="p-5 bg-myai-bg-dark/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Job Info */}
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg ${style.bg} border ${style.border} flex items-center justify-center text-2xl flex-shrink-0`}>
                          {style.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-white mb-1 capitalize">
                            {job.type.replace(/_/g, ' ')}
                          </div>
                          <div className="text-sm text-gray-400 space-y-1">
                            <div className="flex items-center gap-4">
                              <span>📅 {new Date(job.createdAt).toLocaleString()}</span>
                              <span>⏱️ {Math.floor(job.inputDurationSec / 60)}m {job.inputDurationSec % 60}s</span>
                            </div>
                            {job.status === 'done' && (
                              <div className="text-green-400">
                                💾 Saved {formatTimeSaved(job.timeSavedSec)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border} mb-2 inline-block`}>
                            {job.status.toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-400">
                            {job.creditsCharged} credits
                          </div>
                        </div>

                        {job.status === 'done' && (
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-myai-bg-dark/50 border border-white/10 rounded-lg hover:border-white/20 transition-colors text-sm font-medium">
                              ⬇️ Download
                            </button>
                            <button className="px-4 py-2 bg-myai-bg-dark/50 border border-white/10 rounded-lg hover:border-white/20 transition-colors text-sm font-medium">
                              📊 View Report
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* QC Report (if available) */}
                    {job.qcReport && job.status === 'done' && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="text-sm text-gray-400 mb-2">Quality Check Report:</div>
                        <div className="flex flex-wrap gap-3">
                          {Object.entries(job.qcReport).map(([key, value]) => (
                            <div
                              key={key}
                              className="px-3 py-1 bg-white/5 rounded text-xs"
                            >
                              <span className="text-gray-400 capitalize">{key}:</span>{' '}
                              <span className="text-white font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {jobs.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">📂</div>
              <h3 className="text-xl font-bold text-white mb-2">No Jobs Yet</h3>
              <p className="text-gray-400 mb-6">
                Upload your first file to get started
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
