'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: '📊', label: 'Overview' },
  { href: '/dashboard/jobs', icon: '🎵', label: 'Jobs' },
  { href: '/dashboard/portfolio', icon: '🎨', label: 'Portfolio' },
  { href: '/blog', icon: '📝', label: 'Blog' },
  { href: '/profile', icon: '👤', label: 'Profile' },
  { href: '/dashboard/referrals', icon: '🤝', label: 'Referrals' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                isActive
                  ? 'text-white bg-gradient-to-r from-myai-primary/20 to-myai-accent/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-myai-primary/20 to-myai-accent/20 rounded-lg"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
              <span className="text-xl relative z-10">{item.icon}</span>
              <span className="font-medium relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Logout */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </Link>
      </div>
    </nav>
  );
}
