'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "MyAiPlug has completely transformed my workflow. The audio quality rivals my expensive hardware plugins.",
    author: "Alex Chen",
    role: "Music Producer",
    rating: 5,
  },
  {
    quote: "Finally, professional audio tools that work directly in the browser. The A/B comparison feature is a game-changer.",
    author: "Jordan Taylor",
    role: "Audio Engineer",
    rating: 5,
  },
  {
    quote: "The Warmth module alone is worth the price. It adds that vintage character I've been searching for.",
    author: "Sam Rivera",
    role: "Mixing Engineer",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Trusted by <span className="gradient-text">Creators</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Join thousands of producers, engineers, and artists using MyAiPlug
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="group relative bg-myai-bg-panel/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 transition-all duration-500 overflow-hidden hover:border-myai-primary/40 hover:shadow-2xl hover:shadow-myai-primary/20"
            >
              {/* gradient sheen */}
              <div className="pointer-events-none absolute inset-0 rounded-xl border border-transparent group-hover:border-myai-primary/30">
                <div className="absolute inset-[-1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-full h-full animate-[spin_10s_linear_infinite] bg-[conic-gradient(from_0deg,var(--tw-gradient-stops))] from-myai-primary via-transparent to-myai-accent opacity-25 blur-sm" />
                </div>
              </div>
              {/* soft background glow on hover */}
              <div className="pointer-events-none absolute -inset-8 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-3xl bg-gradient-to-br from-myai-primary/20 via-myai-accent/10 to-transparent" />
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-myai-accent-warm"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-300 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="border-t border-white/10 pt-4">
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-sm text-gray-400">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-12"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-myai-primary mb-1">10k+</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-myai-accent mb-1">4.9/5</div>
            <div className="text-sm text-gray-400">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-myai-accent-warm mb-1">50k+</div>
            <div className="text-sm text-gray-400">Tracks Processed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-1">24/7</div>
            <div className="text-sm text-gray-400">Support Available</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
