'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import DashboardNav from './DashboardNav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-myai-bg-dark">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-myai-bg-dark/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-myai-primary to-myai-accent flex items-center justify-center font-bold text-white text-lg">
                M
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-myai-primary to-myai-accent opacity-50 blur-md group-hover:opacity-75 transition-opacity" />
            </div>
            <span className="font-display text-xl font-bold">
              MyAiPlug<span className="text-myai-accent">™</span>
            </span>
          </Link>

          {/* Quick Actions */}
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-myai-accent/30 transition-all text-sm">
              + Upload
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-lg">
              <span className="text-yellow-400">💰</span>
              <span className="text-white font-medium">1,000</span>
              <span className="text-gray-400 text-sm">credits</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <DashboardNav />
          </aside>

          {/* Content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
