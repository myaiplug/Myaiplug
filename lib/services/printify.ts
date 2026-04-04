/**
 * Printify API Service
 * Handles product creation and publishing via the Printify REST API.
 * Docs: https://developers.printify.com/
 */

import { env } from '@/lib/config/env';

export interface PrintifyShop {
  id: number;
  title: string;
  sales_channel: string;
}

export interface PrintifyBlueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: string[];
}

export interface PrintifyVariant {
  id: number;
  title: string;
  options: Record<string, string>;
  placeholders: { position: string; images: { id: string }[] }[];
  is_enabled: boolean;
  price: number;
}

export interface PrintifyProduct {
  id?: string;
  title: string;
  description: string;
  blueprint_id: number;
  print_provider_id: number;
  variants: PrintifyVariant[];
  print_areas: PrintifyPrintArea[];
}

export interface PrintifyPrintArea {
  variant_ids: number[];
  placeholders: { position: string; images: { id: string; x: number; y: number; scale: number; angle: number }[] }[];
}

export interface PrintifyProductResponse {
  id: string;
  title: string;
  description: string;
  blueprint_id: number;
  print_provider_id: number;
  variants: PrintifyVariant[];
  images: { src: string; variant_ids: number[]; is_default: boolean }[];
  created_at: string;
  updated_at: string;
}

const PRINTIFY_BASE_URL = 'https://api.printify.com/v1';

/**
 * Validates that a Printify resource ID contains only safe characters.
 * Printify uses numeric or UUID-style IDs. Reject anything unexpected.
 */
function validateResourceId(id: string, label: string): void {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error(`Invalid ${label}: must contain only alphanumeric characters, hyphens, or underscores.`);
  }
}

/**
 * Common headers for Printify API requests.
 */
function printifyHeaders(): Record<string, string> {
  const token = env.printifyApiKey;
  if (!token) {
    throw new Error('PRINTIFY_API_KEY is not configured.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Get the configured Printify shop ID.
 */
function getShopId(): string {
  const shopId = env.printifyShopId;
  if (!shopId) {
    throw new Error('PRINTIFY_SHOP_ID is not configured.');
  }
  validateResourceId(shopId, 'shopId');
  return shopId;
}

/**
 * List all shops connected to the Printify account.
 */
export async function listPrintifyShops(): Promise<PrintifyShop[]> {
  const response = await fetch(`${PRINTIFY_BASE_URL}/shops.json`, {
    headers: printifyHeaders(),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Printify listShops failed (${response.status}): ${text}`);
  }
  return response.json() as Promise<PrintifyShop[]>;
}

/**
 * List products in the configured Printify shop.
 */
export async function listPrintifyProducts(
  page = 1,
  limit = 20
): Promise<{ data: PrintifyProductResponse[]; total: number; last_page: number }> {
  const shopId = getShopId();
  const response = await fetch(
    `${PRINTIFY_BASE_URL}/shops/${shopId}/products.json?page=${page}&limit=${limit}`,
    { headers: printifyHeaders() }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Printify listProducts failed (${response.status}): ${text}`);
  }
  return response.json() as Promise<{ data: PrintifyProductResponse[]; total: number; last_page: number }>;
}

/**
 * Get a single Printify product by ID.
 */
export async function getPrintifyProduct(productId: string): Promise<PrintifyProductResponse> {
  validateResourceId(productId, 'productId');
  const shopId = getShopId();
  const response = await fetch(
    `${PRINTIFY_BASE_URL}/shops/${shopId}/products/${productId}.json`,
    { headers: printifyHeaders() }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Printify getProduct failed (${response.status}): ${text}`);
  }
  return response.json() as Promise<PrintifyProductResponse>;
}

/**
 * Create a new product in the configured Printify shop.
 */
export async function createPrintifyProduct(
  product: PrintifyProduct
): Promise<PrintifyProductResponse> {
  const shopId = getShopId();
  const response = await fetch(`${PRINTIFY_BASE_URL}/shops/${shopId}/products.json`, {
    method: 'POST',
    headers: printifyHeaders(),
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Printify createProduct failed (${response.status}): ${text}`);
  }
  return response.json() as Promise<PrintifyProductResponse>;
}

/**
 * Publish a Printify product to the connected Shopify store.
 * This triggers Printify to push the product to Shopify automatically.
 */
export async function publishPrintifyProduct(
  productId: string,
  options: { title: boolean; description: boolean; images: boolean; variants: boolean; tags: boolean } = {
    title: true,
    description: true,
    images: true,
    variants: true,
    tags: true,
  }
): Promise<{ id: string }> {
  validateResourceId(productId, 'productId');
  const shopId = getShopId();
  const response = await fetch(
    `${PRINTIFY_BASE_URL}/shops/${shopId}/products/${productId}/publish.json`,
    {
      method: 'POST',
      headers: printifyHeaders(),
      body: JSON.stringify(options),
    }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Printify publishProduct failed (${response.status}): ${text}`);
  }
  return response.json() as Promise<{ id: string }>;
}

/**
 * Upload an image to Printify's image library.
 * Returns the uploaded image ID to use in product creation.
 */
export async function uploadPrintifyImage(
  fileName: string,
  contents: string // base64-encoded image content
): Promise<{ id: string; file_name: string; preview_url: string }> {
  const response = await fetch(`${PRINTIFY_BASE_URL}/uploads/images.json`, {
    method: 'POST',
    headers: printifyHeaders(),
    body: JSON.stringify({ file_name: fileName, contents }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Printify uploadImage failed (${response.status}): ${text}`);
  }
  return response.json() as Promise<{ id: string; file_name: string; preview_url: string }>;
}

/**
 * Verify that the Printify credentials are valid by fetching the shop list.
 */
export async function verifyPrintifyConnection(): Promise<PrintifyShop[]> {
  return listPrintifyShops();
}
