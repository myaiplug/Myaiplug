/**
 * Shopify Products API
 * GET  /api/shopify/products  — list products from the connected Shopify store
 * POST /api/shopify/products  — create a new product in Shopify
 */

import { NextRequest, NextResponse } from 'next/server';
import { listShopifyProducts, createShopifyProduct, verifyShopifyConnection } from '@/lib/services/shopify';

export async function GET() {
  try {
    // Verify connection first so we surface a clear error when unconfigured.
    await verifyShopifyConnection();
    const data = await listShopifyProducts(50);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('[Shopify Products GET]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Shopify products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, body_html, vendor, product_type, tags, status, variants, images } = body;

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const result = await createShopifyProduct({
      title,
      body_html,
      vendor,
      product_type,
      tags,
      status: status ?? 'draft',
      variants: variants ?? [{ price: '0.00' }],
      images,
    });

    return NextResponse.json({ success: true, product: result.product });
  } catch (error) {
    console.error('[Shopify Products POST]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Shopify product' },
      { status: 500 }
    );
  }
}
