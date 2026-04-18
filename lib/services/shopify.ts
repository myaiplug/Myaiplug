/**
 * Shopify Admin API Service
 * Handles product creation, sync, and management via Shopify's Admin REST API.
 */

import { env } from '@/lib/config/env';

export interface ShopifyProduct {
  id?: number;
  title: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  status?: 'active' | 'archived' | 'draft';
  variants?: ShopifyVariant[];
  images?: ShopifyImage[];
}

export interface ShopifyVariant {
  id?: number;
  title?: string;
  price: string;
  sku?: string;
  inventory_quantity?: number;
  requires_shipping?: boolean;
}

export interface ShopifyImage {
  id?: number;
  src: string;
  alt?: string;
}

export interface ShopifyProductResponse {
  product: ShopifyProduct & { id: number };
}

export interface ShopifyProductsResponse {
  products: (ShopifyProduct & { id: number })[];
}

/**
 * Build the base URL for Shopify Admin API requests.
 */
function shopifyApiUrl(path: string): string {
  const domain = env.shopifyStoreDomain;
  const version = env.shopifyAdminApiVersion;
  if (!domain) {
    throw new Error('SHOPIFY_STORE_DOMAIN is not configured.');
  }
  return `https://${domain}/admin/api/${version}${path}`;
}

/**
 * Common headers for Shopify Admin API requests.
 */
function shopifyHeaders(): Record<string, string> {
  const token = env.shopifyAdminApiKey;
  if (!token) {
    throw new Error('SHOPIFY_ADMIN_API_KEY is not configured.');
  }
  return {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': token,
  };
}

/**
 * Fetch all products from the connected Shopify store.
 */
export async function listShopifyProducts(limit = 50): Promise<ShopifyProductsResponse> {
  const response = await fetch(
    shopifyApiUrl(`/products.json?limit=${limit}&status=any`),
    { headers: shopifyHeaders() }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify listProducts failed (${response.status}): ${text}`);
  }
  return response.json() as Promise<ShopifyProductsResponse>;
}

/**
 * Create a new product in the connected Shopify store.
 */
export async function createShopifyProduct(
  product: ShopifyProduct
): Promise<ShopifyProductResponse> {
  const response = await fetch(shopifyApiUrl('/products.json'), {
    method: 'POST',
    headers: shopifyHeaders(),
    body: JSON.stringify({ product }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify createProduct failed (${response.status}): ${text}`);
  }
  return response.json() as Promise<ShopifyProductResponse>;
}

/**
 * Update an existing product in the connected Shopify store.
 */
export async function updateShopifyProduct(
  productId: number,
  product: Partial<ShopifyProduct>
): Promise<ShopifyProductResponse> {
  const response = await fetch(shopifyApiUrl(`/products/${productId}.json`), {
    method: 'PUT',
    headers: shopifyHeaders(),
    body: JSON.stringify({ product }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify updateProduct failed (${response.status}): ${text}`);
  }
  return response.json() as Promise<ShopifyProductResponse>;
}

/**
 * Verify that the Shopify credentials are valid by fetching the shop info.
 */
export async function verifyShopifyConnection(): Promise<{ name: string; domain: string }> {
  const response = await fetch(shopifyApiUrl('/shop.json'), {
    headers: shopifyHeaders(),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify connection failed (${response.status}): ${text}`);
  }
  const data = (await response.json()) as { shop: { name: string; domain: string } };
  return { name: data.shop.name, domain: data.shop.domain };
}
