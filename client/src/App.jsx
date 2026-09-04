import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';
import { getCategories, getProducts } from './services/api';
import { ChefHat, Loader2, Utensils, WifiOff } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';

const SYNC_INTERVAL_MS = 15000;

function MenuContent() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  // Live sync with the backend / admin panel.
  const fetchLiveData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [catsRes, prodsRes] = await Promise.all([getCategories(), getProducts()]);
      setCategories(catsRes);
      setProducts(prodsRes);
      setOffline(false);
    } catch (err) {
      // Keep whatever is already on screen: a dropped poll must never blank the menu.
      console.warn('Menu sync failed:', err.message);
      setOffline(true);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveData(true);

    const backgroundSync = () => {
      if (document.visibilityState === 'visible') fetchLiveData(false);
    };

    const interval = setInterval(backgroundSync, SYNC_INTERVAL_MS);
    window.addEventListener('focus', backgroundSync);

    // Cross-tab broadcast listener (instant live sync when admin adds/modifies data)
    let bc;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('mehmon_sync_channel');
        bc.onmessage = backgroundSync;
      }
    } catch {
      // BroadcastChannel unavailable: polling and the storage event still cover us.
    }

    const handleStorage = (e) => {
      if (e.key === 'mehmon_menu_update') fetchLiveData(false);
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', backgroundSync);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, [fetchLiveData]);

  // Only show categories that still have at least one visible dish.
  const visibleCategories = useMemo(() => {
    const withProducts = new Set(products.map((p) => p.category));
    return categories.filter((c) => withProducts.has(c.id));
  }, [categories, products]);

  // A category that was filtered away must not leave the menu stuck on an empty view.
  useEffect(() => {
    if (activeCategoryId !== null && !visibleCategories.some((c) => c.id === activeCategoryId)) {
      setActiveCategoryId(null);
    }
  }, [visibleCategories, activeCategoryId]);

  // Filter and sort products (recommended dishes always on top)
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const list = products.filter((p) => {
      if (p.is_active === false) return false;
      if (activeCategoryId !== null && p.category !== activeCategoryId) return false;

      if (query) {
        const haystack = [
          p.name_uz, p.name_ru, p.name_en,
          p.description_uz, p.description_ru, p.description_en,
        ];
        return haystack.some((field) => field?.toLowerCase().includes(query));
      }
      return true;
    });

    return list.sort((a, b) => Number(b.is_recommended) - Number(a.is_recommended));
  }, [products, activeCategoryId, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-mehmon-bg text-mehmon-text transition-colors duration-300">

      {/* Header with Official Logo & Theme Switcher */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {offline && !loading && (
        <div
          role="status"
          className="flex items-center justify-center gap-2 py-2 px-4 bg-mehmon-card border-b border-mehmon-border text-[11px] text-mehmon-muted"
        >
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>{t('nav.offline_notice')}</span>
        </div>
      )}

      {/* Hero Atmosphere Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-mehmon-card via-mehmon-card/60 to-mehmon-bg border-b border-mehmon-border py-10 sm:py-14 transition-colors duration-300">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4A359_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mehmon-bg/80 border border-mehmon-gold/30 text-xs font-semibold text-mehmon-gold mb-4 shadow-sm">
            <ChefHat className="w-4 h-4" />
            <span>{t('brand.restaurant')}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-mehmon-text mb-3">
            {t('brand.name')} <span className="text-mehmon-gold">{t('brand.restaurant')}</span>
          </h1>

          <p className="text-sm sm:text-base text-mehmon-muted max-w-xl mx-auto font-light leading-relaxed">
            {t('brand.slogan')}
          </p>
        </div>
      </div>

      {/* Main Menu Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">

        {/* Sticky Category Tabs */}
        {visibleCategories.length > 0 && (
          <div className="sticky top-20 z-30 bg-mehmon-bg/95 backdrop-blur-md pb-3 pt-1 border-b border-mehmon-border mb-8 transition-colors duration-300">
            <CategoryFilter
              categories={visibleCategories}
              activeCategoryId={activeCategoryId}
              onSelectCategory={setActiveCategoryId}
            />
          </div>
        )}

        {/* Counter Info */}
        <div className="flex items-center justify-between mb-6 px-1">
          <span className="text-xs font-medium text-mehmon-muted">
            {t('nav.items_count', { count: filteredProducts.length })}
          </span>
          {searchQuery && (
            <span className="text-xs text-mehmon-gold italic font-semibold">
              &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        {/* Product Grid or Empty State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-mehmon-gold animate-spin" />
            <span className="text-xs text-mehmon-muted">{t('nav.loading')}</span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-mehmon-card/60 rounded-3xl border border-mehmon-border px-4 my-8 shadow-card-custom">
            <div className="w-14 h-14 rounded-full bg-mehmon-subtle border border-mehmon-gold/30 flex items-center justify-center mx-auto mb-4 text-mehmon-gold">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-mehmon-text mb-1">
              {searchQuery ? t('nav.no_products_found') : t('nav.empty_menu_title')}
            </h3>
            <p className="text-xs text-mehmon-muted max-w-md mx-auto">
              {searchQuery ? t('nav.try_other_search') : t('nav.empty_menu_hint')}
            </p>
          </div>
        )}
      </main>

      {/* Minimalist Required Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MenuContent />
    </ThemeProvider>
  );
}
