/**
 * Environment Configuration Validation
 * Validates required environment variables and provides helpful error messages
 */

export interface EnvConfig {
  // Google Gemini (Primary AI)
  geminiApiKey?: string;
  geminiModel: string;
  
  // Supabase
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
  
  // Stripe
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  
  // Replicate
  replicateApiKey?: string;
  
  // Imagen
  imagenApiKey?: string;
  imagenModel: string;
  
  // Shopify
  shopifyStoreDomain?: string;
  shopifyAdminApiKey?: string;
  shopifyAdminApiVersion: string;

  // Printify
  printifyApiKey?: string;
  printifyShopId?: string;

  // Optional
  openaiApiKey?: string;
  youtubeApiKey?: string;
  sendgridApiKey?: string;
  
  // App
  appUrl: string;
  nodeEnv: string;
}

export const env: EnvConfig = {
  // Gemini
  geminiApiKey: process.env.GOOGLE_GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
  
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Stripe
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Replicate
  replicateApiKey: process.env.REPLICATE_API_KEY,
  
  // Imagen
  imagenApiKey: process.env.GOOGLE_IMAGEN_API_KEY || process.env.GOOGLE_GEMINI_API_KEY,
  imagenModel: process.env.IMAGEN_MODEL || 'imagen-3.0-generate-001',
  
  // Shopify
  shopifyStoreDomain: process.env.SHOPIFY_STORE_DOMAIN,
  shopifyAdminApiKey: process.env.SHOPIFY_ADMIN_API_KEY,
  shopifyAdminApiVersion: process.env.SHOPIFY_ADMIN_API_VERSION || '2024-10',

  // Printify
  printifyApiKey: process.env.PRINTIFY_API_KEY,
  printifyShopId: process.env.PRINTIFY_SHOP_ID,

  // Optional
  openaiApiKey: process.env.OPENAI_API_KEY,
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  
  // App
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
};

/**
 * Validates that required environment variables are present
 * Returns an array of missing required variables
 */
export function validateRequiredEnv(): string[] {
  const missing: string[] = [];
  
  // Check critical AI services
  if (!env.geminiApiKey) {
    missing.push('GOOGLE_GEMINI_API_KEY (required for AI content generation)');
  }
  
  // Supabase is optional for now but recommended
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    console.warn('⚠️  Supabase not configured. Database features will be limited.');
  }
  
  // Stripe is optional for now but recommended for payments
  if (!env.stripeSecretKey || !env.stripePublishableKey) {
    console.warn('⚠️  Stripe not configured. Payment features will be disabled.');
  }
  
  return missing;
}

/**
 * Prints configuration status to console
 */
export function printEnvStatus(): void {
  console.log('\n🔧 Environment Configuration Status:');
  console.log('=====================================');
  
  // AI Services
  console.log('\n🤖 AI Services:');
  console.log(`  Gemini API: ${env.geminiApiKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`  Gemini Model: ${env.geminiModel}`);
  console.log(`  Replicate API: ${env.replicateApiKey ? '✅ Configured' : '⚠️  Optional'}`);
  console.log(`  Imagen API: ${env.imagenApiKey ? '✅ Configured' : '⚠️  Optional'}`);
  
  // Database
  console.log('\n💾 Database:');
  console.log(`  Supabase: ${env.supabaseUrl && env.supabaseAnonKey ? '✅ Configured' : '⚠️  Optional'}`);
  
  // Payments
  console.log('\n💳 Payments:');
  console.log(`  Stripe: ${env.stripeSecretKey && env.stripePublishableKey ? '✅ Configured' : '⚠️  Optional'}`);
  
  // E-Commerce
  console.log('\n🛍️  E-Commerce:');
  console.log(`  Shopify: ${env.shopifyStoreDomain && env.shopifyAdminApiKey ? '✅ Configured' : '⚠️  Optional'}`);
  console.log(`  Printify: ${env.printifyApiKey && env.printifyShopId ? '✅ Configured' : '⚠️  Optional'}`);

  // Optional Services
  console.log('\n🔌 Optional Services:');
  console.log(`  OpenAI: ${env.openaiApiKey ? '✅ Configured' : '⚠️  Not configured'}`);
  console.log(`  YouTube API: ${env.youtubeApiKey ? '✅ Configured' : '⚠️  Not configured'}`);
  console.log(`  SendGrid: ${env.sendgridApiKey ? '✅ Configured' : '⚠️  Not configured'}`);
  
  console.log('\n=====================================\n');
  
  // Check for missing required variables
  const missing = validateRequiredEnv();
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(variable => console.error(`   - ${variable}`));
    console.error('\nPlease add these to your .env file.\n');
  }
}

// Auto-print status in development
if (env.nodeEnv === 'development' && typeof window === 'undefined') {
  printEnvStatus();
}
