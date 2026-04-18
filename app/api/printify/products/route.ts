/**
 * Printify Products API
 * GET  /api/printify/products          — list products from the configured Printify shop
 * GET  /api/printify/products?shops=1  — list connected Printify shops
 */

import { NextRequest, NextResponse } from 'next/server';
import { listPrintifyProducts, listPrintifyShops, verifyPrintifyConnection } from '@/lib/services/printify';
import { env } from '@/lib/config/env';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Return shop list when ?shops=1 is set (used to verify credentials)
  if (searchParams.get('shops') === '1') {
    const configured = Boolean(env.printifyApiKey);
    if (!configured) {
      return NextResponse.json({
        connected: false,
        message: 'Printify is not configured. Set PRINTIFY_API_KEY.',
      });
    }
    try {
      const shops = await listPrintifyShops();
      return NextResponse.json({ connected: true, shops });
    } catch (error) {
      return NextResponse.json(
        { connected: false, error: error instanceof Error ? error.message : 'Failed to connect to Printify' },
        { status: 500 }
      );
    }
  }

  // Default: return products for the configured shop
  try {
    await verifyPrintifyConnection();
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const data = await listPrintifyProducts(page, limit);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('[Printify Products GET]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Printify products' },
      { status: 500 }
    );
  }
}
