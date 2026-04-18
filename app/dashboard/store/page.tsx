'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface ShopifyProduct {
  id: number;
  title: string;
  status: string;
  product_type: string;
  vendor: string;
  images: { src: string }[];
  variants: { price: string }[];
}

interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  images: { src: string; is_default: boolean }[];
  variants: { price: number; is_enabled: boolean }[];
}

type ActiveTab = 'shopify' | 'printify';

export default function StorePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('shopify');

  // Shopify state
  const [shopifyConnected, setShopifyConnected] = useState<boolean | null>(null);
  const [shopifyShop, setShopifyShop] = useState<{ name: string; domain: string } | null>(null);
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [shopifyLoading, setShopifyLoading] = useState(false);
  const [shopifyError, setShopifyError] = useState<string | null>(null);

  // Printify state
  const [printifyConnected, setPrintifyConnected] = useState<boolean | null>(null);
  const [printifyProducts, setPrintifyProducts] = useState<PrintifyProduct[]>([]);
  const [printifyLoading, setPrintifyLoading] = useState(false);
  const [printifyError, setPrintifyError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const checkShopify = useCallback(async () => {
    setShopifyLoading(true);
    setShopifyError(null);
    try {
      const res = await fetch('/api/shopify/sync');
      const data = await res.json();
      setShopifyConnected(data.connected ?? false);
      setShopifyShop(data.shop ?? null);
      if (data.connected) {
        const productsRes = await fetch('/api/shopify/products');
        const productsData = await productsRes.json();
        setShopifyProducts(productsData.products ?? []);
      }
    } catch {
      setShopifyConnected(false);
      setShopifyError('Unable to reach Shopify. Check your credentials in Settings → Integrations.');
    } finally {
      setShopifyLoading(false);
    }
  }, []);

  const checkPrintify = useCallback(async () => {
    setPrintifyLoading(true);
    setPrintifyError(null);
    try {
      const shopsRes = await fetch('/api/printify/products?shops=1');
      const shopsData = await shopsRes.json();
      setPrintifyConnected(shopsData.connected ?? false);
      if (shopsData.connected) {
        const productsRes = await fetch('/api/printify/products');
        const productsData = await productsRes.json();
        setPrintifyProducts(productsData.data ?? []);
      }
    } catch {
      setPrintifyConnected(false);
      setPrintifyError('Unable to reach Printify. Check your credentials in Settings → Integrations.');
    } finally {
      setPrintifyLoading(false);
    }
  }, []);

  useEffect(() => {
    checkShopify();
    checkPrintify();
  }, [checkShopify, checkPrintify]);

  const publishToShopify = async (productId: string) => {
    setPublishingId(productId);
    try {
      const res = await fetch('/api/printify/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Publish failed');
      // Refresh Shopify products after publishing
      await checkShopify();
    } catch (err) {
      setShopifyError(err instanceof Error ? err.message : 'Failed to publish product');
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">Store</h1>
          <p className="text-gray-400">
            Manage your Shopify store and Printify print-on-demand products in one place.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-myai-bg-panel/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="flex border-b border-white/10">
            {(['shopify', 'printify'] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-white bg-myai-bg-dark/50 border-b-2 border-myai-accent'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-xl">{tab === 'shopify' ? '🛍️' : '🖨️'}</span>
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ── Shopify Tab ─────────────────────────────────────────── */}
            {activeTab === 'shopify' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Connection status */}
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    shopifyConnected
                      ? 'bg-green-500/10 border-green-500/30'
                      : shopifyConnected === false
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className="text-2xl">
                    {shopifyConnected ? '✅' : shopifyConnected === false ? '❌' : '⏳'}
                  </span>
                  <div>
                    <p className="font-medium text-white">
                      {shopifyConnected
                        ? `Connected — ${shopifyShop?.name ?? shopifyShop?.domain}`
                        : shopifyConnected === false
                        ? 'Not connected'
                        : 'Checking connection…'}
                    </p>
                    {!shopifyConnected && shopifyConnected !== null && (
                      <p className="text-sm text-gray-400 mt-0.5">
                        Add your Shopify credentials in{' '}
                        <a href="/settings" className="underline text-myai-accent">
                          Settings → Integrations
                        </a>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={checkShopify}
                    disabled={shopifyLoading}
                    className="ml-auto px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {shopifyLoading ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>

                {shopifyError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                    {shopifyError}
                  </div>
                )}

                {/* Product grid */}
                {shopifyConnected && (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">
                        Products{' '}
                        <span className="text-sm text-gray-400 font-normal">
                          ({shopifyProducts.length})
                        </span>
                      </h2>
                    </div>

                    {shopifyProducts.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <span className="text-4xl block mb-3">🛒</span>
                        <p>No products found in your Shopify store.</p>
                        <p className="text-sm mt-1">Publish a Printify product to get started.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shopifyProducts.map((product) => (
                          <div
                            key={product.id}
                            className="bg-myai-bg-dark/50 border border-white/5 rounded-xl overflow-hidden"
                          >
                            {product.images?.[0]?.src ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.images[0].src}
                                alt={product.title}
                                className="w-full h-40 object-cover"
                              />
                            ) : (
                              <div className="w-full h-40 bg-white/5 flex items-center justify-center text-4xl">
                                🖼️
                              </div>
                            )}
                            <div className="p-4">
                              <p className="font-medium text-white truncate">{product.title}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    product.status === 'active'
                                      ? 'bg-green-500/20 text-green-300'
                                      : 'bg-yellow-500/20 text-yellow-300'
                                  }`}
                                >
                                  {product.status}
                                </span>
                                <span className="text-sm text-gray-400">
                                  ${product.variants?.[0]?.price ?? '—'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ── Printify Tab ─────────────────────────────────────────── */}
            {activeTab === 'printify' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Connection status */}
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    printifyConnected
                      ? 'bg-green-500/10 border-green-500/30'
                      : printifyConnected === false
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className="text-2xl">
                    {printifyConnected ? '✅' : printifyConnected === false ? '❌' : '⏳'}
                  </span>
                  <div>
                    <p className="font-medium text-white">
                      {printifyConnected
                        ? 'Connected to Printify'
                        : printifyConnected === false
                        ? 'Not connected'
                        : 'Checking connection…'}
                    </p>
                    {!printifyConnected && printifyConnected !== null && (
                      <p className="text-sm text-gray-400 mt-0.5">
                        Add your Printify credentials in{' '}
                        <a href="/settings" className="underline text-myai-accent">
                          Settings → Integrations
                        </a>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={checkPrintify}
                    disabled={printifyLoading}
                    className="ml-auto px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {printifyLoading ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>

                {printifyError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                    {printifyError}
                  </div>
                )}

                {/* Product grid */}
                {printifyConnected && (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">
                        Printify Products{' '}
                        <span className="text-sm text-gray-400 font-normal">
                          ({printifyProducts.length})
                        </span>
                      </h2>
                    </div>

                    {printifyProducts.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <span className="text-4xl block mb-3">🖨️</span>
                        <p>No products found in your Printify shop.</p>
                        <p className="text-sm mt-1">
                          Create products in{' '}
                          <a
                            href="https://printify.com/app/products"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-myai-accent"
                          >
                            Printify
                          </a>{' '}
                          and they&apos;ll appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {printifyProducts.map((product) => {
                          const defaultImage = product.images?.find((i) => i.is_default) ?? product.images?.[0];
                          const enabledVariants = product.variants?.filter((v) => v.is_enabled) ?? [];
                          const minPrice = enabledVariants.length
                            ? Math.min(...enabledVariants.map((v) => v.price)) / 100
                            : null;

                          return (
                            <div
                              key={product.id}
                              className="bg-myai-bg-dark/50 border border-white/5 rounded-xl overflow-hidden"
                            >
                              {defaultImage?.src ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={defaultImage.src}
                                  alt={product.title}
                                  className="w-full h-40 object-cover"
                                />
                              ) : (
                                <div className="w-full h-40 bg-white/5 flex items-center justify-center text-4xl">
                                  🖼️
                                </div>
                              )}
                              <div className="p-4">
                                <p className="font-medium text-white truncate">{product.title}</p>
                                <div className="flex items-center justify-between mt-2 mb-3">
                                  <span className="text-sm text-gray-400">
                                    {minPrice !== null ? `From $${minPrice.toFixed(2)}` : '—'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {enabledVariants.length} variant
                                    {enabledVariants.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <button
                                  onClick={() => publishToShopify(product.id)}
                                  disabled={publishingId === product.id}
                                  className="w-full py-2 text-sm font-medium bg-gradient-to-r from-myai-primary to-myai-accent rounded-lg hover:shadow-lg hover:shadow-myai-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {publishingId === product.id
                                    ? 'Publishing…'
                                    : 'Publish to Shopify'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-4"
        >
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-medium text-blue-200 mb-1">How it works</h3>
            <ol className="text-sm text-blue-300/80 list-decimal list-inside space-y-1">
              <li>
                Add your Shopify and Printify credentials in{' '}
                <a href="/settings" className="underline">
                  Settings → Integrations
                </a>
                .
              </li>
              <li>Create designs and products inside Printify.</li>
              <li>
                Click <strong>Publish to Shopify</strong> to push a Printify product directly to
                your Shopify store.
              </li>
              <li>Orders placed on Shopify are fulfilled automatically by Printify.</li>
            </ol>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
