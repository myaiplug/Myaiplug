/**
 * Printify Publish API
 * POST /api/printify/publish
 * Body: { productId: string, options?: { title, description, images, variants, tags } }
 *
 * Publishes an existing Printify product to the connected Shopify store.
 */

import { NextRequest, NextResponse } from 'next/server';
import { publishPrintifyProduct } from '@/lib/services/printify';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, options } = body as {
      productId: string;
      options?: {
        title: boolean;
        description: boolean;
        images: boolean;
        variants: boolean;
        tags: boolean;
      };
    };

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const defaultOptions = { title: true, description: true, images: true, variants: true, tags: true };
    const result = await publishPrintifyProduct(productId, options ?? defaultOptions);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[Printify Publish]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish Printify product' },
      { status: 500 }
    );
  }
}
