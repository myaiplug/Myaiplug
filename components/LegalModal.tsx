"use client";

import { motion, AnimatePresence } from 'framer-motion';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms' | 'refund';
}

const legalContent = {
  privacy: {
    title: 'Privacy Policy',
    content: (
      <>
        <p><strong>Effective Date:</strong> November 9, 2025</p>
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Overview</h2>
        <p>MyAiPlug™ respects your privacy. This policy describes how we handle data collected from users.</p>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Data We Collect</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Account details (name, email)</li>
          <li>Uploaded files for processing</li>
          <li>Usage analytics and performance metrics</li>
          <li>Payment information (handled securely by Stripe)</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">How We Use Data</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>To operate and improve our services</li>
          <li>To communicate with users</li>
          <li>To process payments securely</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Data Retention</h2>
        <p>Uploaded files are deleted after processing. Account and billing data are retained as required by law.</p>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Cookies</h2>
        <p>Cookies are used for authentication and analytics. You may disable them in your browser settings.</p>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Contact</h2>
        <p>Email: <a href="mailto:support@myaiplug.com" className="text-myai-accent hover:underline">support@myaiplug.com</a></p>
      </>
    )
  },
  terms: {
    title: 'Terms of Service',
    content: (
      <>
        <p><strong>Effective Date:</strong> November 9, 2025</p>
        <p className="mt-2">Welcome to <strong>MyAiPlug™</strong> — an AI-powered creative platform providing tools for audio, video, and image processing.</p>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Overview</h2>
        <p>By using MyAiPlug, you agree to these Terms of Service which govern your use of our site and applications.</p>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Eligibility</h2>
        <p>Users must be at least 13 years old and legally able to form a contract.</p>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Use of Services</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Upload only content you own or have rights to use.</li>
          <li>Do not upload illegal or harmful content.</li>
          <li>Outputs remain your property; we retain processing rights for service operation.</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Accounts & Security</h2>
        <p>You are responsible for your login credentials and all activity on your account.</p>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Payments & Subscriptions</h2>
        <p>Subscriptions and credits are processed securely via Stripe and renew automatically unless canceled prior to renewal.</p>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Refund Policy</h2>
        <p>Refunds are limited to verified technical failures or duplicate billing. See our Refund Policy for details.</p>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Delivery Policy</h2>
        <p>All services are digital and delivered instantly through our platform.</p>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Intellectual Property</h2>
        <p>All software, design, and branding remain the property of MyAiPlug.</p>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Contact</h2>
        <p>Email: <a href="mailto:support@myaiplug.com" className="text-myai-accent hover:underline">support@myaiplug.com</a></p>
      </>
    )
  },
  refund: {
    title: 'Refund & Delivery Policy',
    content: (
      <>
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Refunds</h2>
        <p>All purchases and subscriptions are digital and processed instantly. Refunds are issued only for duplicate charges, technical errors, or billing mistakes reported within 7 days.</p>
        
        <h2 className="text-xl font-bold mt-4 mb-2 text-myai-accent">Delivery</h2>
        <p>Services are delivered digitally. Files are available for download immediately after processing. No physical items are shipped.</p>
        
        <p className="mt-4">Contact: <a href="mailto:support@myaiplug.com" className="text-myai-accent hover:underline">support@myaiplug.com</a></p>
      </>
    )
  }
};

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  if (!isOpen) return null;

  const { title, content } = legalContent[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-51 w-full max-w-2xl max-h-[80vh] bg-myai-bg-panel/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="sticky top-0 bg-myai-bg-panel/95 border-b border-white/10 p-6 pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold gradient-text">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)] text-gray-300 space-y-2">
            {content}
          </div>
          
          <div className="sticky bottom-0 bg-myai-bg-panel/95 border-t border-white/10 p-4">
            <button
              onClick={onClose}
              className="w-full px-5 py-2 rounded-lg bg-gradient-to-r from-myai-primary to-myai-accent text-white font-semibold hover:scale-105 transition-transform"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
