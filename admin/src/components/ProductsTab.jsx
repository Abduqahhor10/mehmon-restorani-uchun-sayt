import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusCircle, Search, Trash2, Loader2 } from 'lucide-react';
import ProductCardAdmin from './ProductCardAdmin';
import { deleteAllProducts } from '../services/api';

export default function ProductsTab({
  products,
  categories,
  onAddProductClick,
  onEditProduct,
  onRefresh,
}) {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const getCatName = (cat) => {
    const lang = i18n.language;
    if (lang === 'ru' && cat.name_ru) return cat.name_ru;
    if (lang === 'en' && cat.name_en) return cat.name_en;
    return cat.name_uz || cat.name_en || cat.name_ru;
  };

  const handleDeleteAll = async () => {
    if (products.length === 0) return;
    if (window.confirm(t('admin.confirm_delete_all_products'))) {
      setIsDeletingAll(true);
      try {
        await deleteAllProducts();
        onRefresh();
      } catch (err) {
        alert('Taomlarni o\'chirishda xatolik: ' + err.message);
      } finally {
        setIsDeletingAll(false);
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCatId !== null && p.category !== selectedCatId) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchUz = p.name_uz?.toLowerCase().includes(q) || p.description_uz?.toLowerCase().includes(q);
      const matchRu = p.name_ru?.toLowerCase().includes(q) || p.description_ru?.toLowerCase().includes(q);
      const matchEn = p.name_en?.toLowerCase().includes(q) || p.description_en?.toLowerCase().includes(q);
      return matchUz || matchRu || matchEn;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#2B231D] p-4 rounded-2xl border border-[#3D332B]">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#A89F91]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.search_products')}
            className="w-full bg-[#1F1915] text-[#F5EBE0] text-xs pl-10 pr-4 py-2.5 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none"
          />
        </div>

        {/* Action Buttons: Delete All & Add Product */}
        <div className="flex items-center gap-3 shrink-0">
          {products.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
              className="px-3.5 py-2.5 rounded-xl bg-red-950/70 hover:bg-red-900/80 text-red-300 border border-red-800/80 hover:border-red-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              title={t('admin.delete_all_products')}
            >
              {isDeletingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{t('admin.delete_all')}</span>
            </button>
          )}

          <button
            onClick={onAddProductClick}
            className="px-4 py-2.5 rounded-xl bg-[#D4A359] hover:bg-[#B8863B] text-[#1F1915] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(212,163,89,0.3)] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('admin.add_product')}</span>
          </button>
        </div>

      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCatId(null)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCatId === null
              ? 'bg-[#D4A359] text-[#1F1915]'
              : 'bg-[#2B231D] text-[#A89F91] hover:text-[#F5EBE0] border border-[#3D332B]'
          }`}
        >
          Barchasi ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCatId(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCatId === c.id
                ? 'bg-[#D4A359] text-[#1F1915]'
                : 'bg-[#2B231D] text-[#A89F91] hover:text-[#F5EBE0] border border-[#3D332B]'
            }`}
          >
            {getCatName(c)} ({products.filter(p => p.category === c.id).length})
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCardAdmin
              key={product.id}
              product={product}
              onEdit={onEditProduct}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#2B231D] p-12 rounded-2xl border border-[#3D332B] text-center">
          <p className="text-sm text-[#A89F91] mb-4">{t('admin.no_products')}</p>
          <button
            onClick={onAddProductClick}
            className="px-4 py-2 bg-[#D4A359] text-[#1F1915] font-bold rounded-xl text-xs"
          >
            {t('admin.add_product')}
          </button>
        </div>
      )}
    </div>
  );
}
