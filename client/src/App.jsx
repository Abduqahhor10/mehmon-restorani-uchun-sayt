import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';
import { getCategories, getProducts } from './services/api';
import { Utensils, ChefHat, Loader2 } from 'lucide-react';

export default function App() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Live Sync with Backend / Admin Panel
  const fetchLiveData = async () => {
    try {
      const [catsRes, prodsRes] = await Promise.all([
        getCategories(),
        getProducts(),
      ]);
      
      // Directly set the database state (if empty in DB, it becomes empty on menu)
      if (Array.isArray(catsRes)) {
        setCategories(catsRes);
      }
      if (Array.isArray(prodsRes)) {
        setProducts(prodsRes);
      }
    } catch (err) {
      console.warn('Sync error with backend:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLiveData();

    // Auto-refresh polling every 3 seconds for live sync with Admin Panel
    const interval = setInterval(fetchLiveData, 3000);

    // Refresh immediately when window / browser tab gains focus
    const handleFocus = () => fetchLiveData();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Filter products based on search and selected category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Must be active
      if (p.is_active === false) return false;

      // Category filter
      if (activeCategoryId !== null && p.category !== activeCategoryId) {
        return false;
      }

      // Search query filter across all multilingual fields
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchUz = p.name_uz?.toLowerCase().includes(q) || p.description_uz?.toLowerCase().includes(q);
        const matchRu = p.name_ru?.toLowerCase().includes(q) || p.description_ru?.toLowerCase().includes(q);
        const matchEn = p.name_en?.toLowerCase().includes(q) || p.description_en?.toLowerCase().includes(q);
        return matchUz || matchRu || matchEn;
      }

      return true;
    });
  }, [products, activeCategoryId, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#1F1915] text-[#F5EBE0] selection:bg-[#D4A359] selection:text-[#1F1915]">
      
      {/* Header with Official Logo */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Hero Atmosphere Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#2B231D] to-[#1F1915] border-b border-[#3D332B]/50 py-10 sm:py-14">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4A359_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F1915]/80 border border-[#D4A359]/30 text-xs font-semibold text-[#D4A359] mb-4">
            <ChefHat className="w-4 h-4" />
            <span>{t('brand.restaurant')}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#F5EBE0] mb-3">
            {t('brand.name')} <span className="text-[#D4A359]">{t('brand.restaurant')}</span>
          </h1>

          <p className="text-sm sm:text-base text-[#A89F91] max-w-xl mx-auto font-light leading-relaxed">
            {t('brand.slogan')}
          </p>
        </div>
      </div>

      {/* Main Menu Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* Sticky Category Tabs */}
        {categories.length > 0 && (
          <div className="sticky top-20 z-30 bg-[#1F1915]/95 backdrop-blur-md pb-3 pt-1 border-b border-[#3D332B]/40 mb-8">
            <CategoryFilter
              categories={categories}
              activeCategoryId={activeCategoryId}
              onSelectCategory={setActiveCategoryId}
            />
          </div>
        )}

        {/* Counter Info */}
        <div className="flex items-center justify-between mb-6 px-1">
          <span className="text-xs font-medium text-[#A89F91]">
            {filteredProducts.length} {t('nav.items_count')}
          </span>
          {searchQuery && (
            <span className="text-xs text-[#D4A359] italic">
              "{searchQuery}"
            </span>
          )}
        </div>

        {/* Product Grid or Empty State */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#D4A359] animate-spin" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#2B231D]/40 rounded-3xl border border-[#3D332B] px-4 my-8">
            <div className="w-14 h-14 rounded-full bg-[#2B231D] border border-[#D4A359]/30 flex items-center justify-center mx-auto mb-4 text-[#D4A359]">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#F5EBE0] mb-1">
              {searchQuery ? t('nav.no_products_found') : 'Menyuda hozircha taomlar mavjud emas'}
            </h3>
            <p className="text-xs text-[#A89F91] max-w-md mx-auto">
              {searchQuery
                ? t('nav.try_other_search')
                : 'Admin panel orqali yangi kategoriya va taomlar qo\'shishingiz mumkin.'}
            </p>
          </div>
        )}
      </main>

      {/* Minimalist Required Footer */}
      <Footer />
    </div>
  );
}
