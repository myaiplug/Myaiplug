/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Configure API routes
  experimental: {
    // Set body size limit to 10MB for API routes
    // This prevents FUNCTION_PAYLOAD_TOO_LARGE errors
    bodySizeLimit: '10mb',
  },
  webpack: (config) => {
    // Allow loading audio files
    config.module.rules.push({
      test: /\.(mp3|wav)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/sounds/',
          outputPath: 'static/sounds/',
          name: '[name].[ext]',
          esModule: false,
        },
      },
    });
    return config;
  },
};

module.exports = nextConfig;
