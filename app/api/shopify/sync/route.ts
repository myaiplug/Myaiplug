/**
 * Shopify Sync API
 * POST /api/shopify/sync
 * Verifies the Shopify connection and returns store info.
 * Can also be used as a health-check for the integration.
 */

import { NextResponse } from 'next/server';
import { verifyShopifyConnection } from '@/lib/services/shopify';
import { env } from '@/lib/config/env';

export async function GET() {
  const configured = Boolean(env.shopifyStoreDomain && env.shopifyAdminApiKey);
  if (!configured) {
    return NextResponse.json({
      connected: false,
      message: 'Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_KEY.',
    });
  }

  try {
    const shop = await verifyShopifyConnection();
    return NextResponse.json({ connected: true, shop });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Shopify',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const shop = await verifyShopifyConnection();
    return NextResponse.json({ connected: true, shop });
  } catch (error) {
    console.error('[Shopify Sync]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Shopify sync failed' },
      { status: 500 }
    );
  }
}
