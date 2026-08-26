import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusCircle, Search, Trash2, CheckSquare, X, CheckCheck } from 'lucide-react';
import ProductCardAdmin from './ProductCardAdmin';
import ConfirmModal from './ConfirmModal';
import { deleteAllProducts, deleteSelectedProducts, deleteProduct } from '../services/api';

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

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Confirm Modal States
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    description: '',
    actionType: '', // 'all' | 'selected' | 'single'
    targetId: null,
    loading: false,
  });

  const getCatName = (cat) => {
    const lang = (i18n.language || 'uz').toLowerCase();
    if (lang.startsWith('ru') && cat.name_ru) return cat.name_ru;
    if (lang.startsWith('en') && cat.name_en) return cat.name_en;
    return cat.name_uz || cat.name_ru || cat.name_en;
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

  // Toggle selection for a single product
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all visible
  const handleToggleSelectAll = () => {
    const visibleIds = filteredProducts.map((p) => p.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Start selection mode
  const handleStartSelection = () => {
    setIsSelectionMode(true);
    setSelectedIds([]);
  };

  // Cancel selection mode
  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  // Trigger modal for Delete All
  const handleOpenDeleteAllModal = () => {
    setConfirmModal({
      isOpen: true,
      title: "Aniq barcha taomlarni o'chirmoqchimisiz?",
      description: "Diqqat! Barcha taomlar butunlay o'chiriladi. Ushbu amalni ortga qaytarib bo'lmaydi!",
      actionType: 'all',
      targetId: null,
      loading: false,
    });
  };

  // Trigger modal for Delete Selected
  const handleOpenDeleteSelectedModal = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: `Aniq tanlangan ${selectedIds.length} ta taomni o'chirmoqchimisiz?`,
      description: "Tanlangan taomlar menyudan butunlay o'chiriladi. Ushbu amalni ortga qaytarib bo'lmaydi.",
      actionType: 'selected',
      targetId: null,
      loading: false,
    });
  };

  // Trigger modal for Delete Single Product
  const handleOpenDeleteSingleModal = (product) => {
    setConfirmModal({
      isOpen: true,
      title: `"${product.name_uz || product.name_ru || 'Ushbu taom'}"ni o'chirmoqchimisiz?`,
      description: "Ushbu taom menyudan o'chiriladi.",
      actionType: 'single',
      targetId: product.id,
      loading: false,
    });
  };

  // Execute confirm action
  const handleConfirmAction = async () => {
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      if (confirmModal.actionType === 'all') {
        await deleteAllProducts();
        handleCancelSelection();
      } else if (confirmModal.actionType === 'selected') {
        await deleteSelectedProducts(selectedIds);
        handleCancelSelection();
      } else if (confirmModal.actionType === 'single') {
        await deleteProduct(confirmModal.targetId);
      }
      onRefresh();
      setConfirmModal({ isOpen: false, title: '', description: '', actionType: '', targetId: null, loading: false });
    } catch (err) {
      alert('Xatolik yuz berdi: ' + err.message);
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const isAllVisibleSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Top Filter & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-mehmon-card p-4 rounded-2xl border border-mehmon-border shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-mehmon-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.search_products')}
            className="w-full bg-mehmon-input text-mehmon-text text-xs pl-10 pr-4 py-2.5 rounded-xl border border-mehmon-border focus:border-mehmon-gold focus:outline-none placeholder-mehmon-muted/70 shadow-inner"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          
          {/* Normal Mode Buttons */}
          {!isSelectionMode ? (
            <>
              {products.length > 0 && (
                <>
                  {/* Belgilash Tugmasi */}
                  <button
                    onClick={handleStartSelection}
                    className="px-3.5 py-2.5 rounded-xl bg-mehmon-input hover:bg-mehmon-subtle text-mehmon-text border border-mehmon-border hover:border-mehmon-gold font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    title={t('admin.select_mode')}
                  >
                    <CheckSquare className="w-4 h-4 text-mehmon-gold" />
                    <span>{t('admin.select_mode')}</span>
                  </button>

                  {/* Barchasini o'chirish */}
                  <button
                    onClick={handleOpenDeleteAllModal}
                    className="px-3.5 py-2.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 text-red-500 border border-red-500/30 hover:border-red-500/60 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    title={t('admin.delete_all_products')}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t('admin.delete_all')}</span>
                  </button>
                </>
              )}

              {/* Taom qo'shish */}
              <button
                onClick={onAddProductClick}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B8863B] hover:opacity-95 text-[#1F1915] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(212,163,89,0.3)] transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('admin.add_product')}</span>
              </button>
            </>
          ) : (
            /* Selection Mode Controls */
            <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
              
              {/* Barchasini tanlash / bekor qilish */}
              <button
                onClick={handleToggleSelectAll}
                className="px-3 py-2 rounded-xl bg-mehmon-input hover:bg-mehmon-subtle text-mehmon-text border border-mehmon-border text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <CheckCheck className="w-4 h-4 text-mehmon-gold" />
                <span>{isAllVisibleSelected ? t('admin.unselect_all') : t('admin.select_all')}</span>
              </button>

              {/* Tanlanganlar soni ko'rsatkichi */}
              <span className="px-3 py-2 rounded-xl bg-mehmon-gold/15 border border-mehmon-gold/40 text-mehmon-gold text-xs font-bold">
                {t('admin.selected_count', { count: selectedIds.length })}
              </span>

              {/* Tanlanganlarni o'chirish tugmasi */}
              <button
                onClick={handleOpenDeleteSelectedModal}
                disabled={selectedIds.length === 0}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_4px_15px_rgba(220,38,38,0.4)] transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('admin.delete_selected', { count: selectedIds.length })}</span>
              </button>

              {/* Belgilashni bekor qilish */}
              <button
                onClick={handleCancelSelection}
                className="px-3 py-2 rounded-xl bg-mehmon-input hover:bg-mehmon-subtle text-mehmon-muted hover:text-mehmon-text border border-mehmon-border text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <X className="w-4 h-4" />
                <span>{t('admin.cancel')}</span>
              </button>

            </div>
          )}

        </div>

      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCatId(null)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCatId === null
              ? 'bg-gradient-to-r from-[#D4A359] to-[#B8863B] text-[#1F1915] font-bold shadow-[0_2px_10px_rgba(212,163,89,0.25)]'
              : 'bg-mehmon-card text-mehmon-muted hover:text-mehmon-text border border-mehmon-border'
          }`}
        >
          {t('admin.all')} ({products.length})
        </button>
        {[...categories]
          .sort((a, b) => (getCatName(a) || '').localeCompare(getCatName(b) || '', i18n.language || 'uz', { sensitivity: 'base' }))
          .map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCatId(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCatId === c.id
                  ? 'bg-gradient-to-r from-[#D4A359] to-[#B8863B] text-[#1F1915] font-bold shadow-[0_2px_10px_rgba(212,163,89,0.25)]'
                  : 'bg-mehmon-card text-mehmon-muted hover:text-mehmon-text border border-mehmon-border'
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
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.includes(product.id)}
              onToggleSelect={handleToggleSelect}
              onDeleteSingle={handleOpenDeleteSingleModal}
            />
          ))}
        </div>
      ) : (
        <div className="bg-mehmon-card p-12 rounded-2xl border border-mehmon-border text-center shadow-card-custom">
          <p className="text-sm text-mehmon-muted mb-4">{t('admin.no_products')}</p>
          <button
            onClick={onAddProductClick}
            className="px-4 py-2 bg-gradient-to-r from-[#D4A359] to-[#B8863B] text-[#1F1915] font-bold rounded-xl text-xs shadow-md"
          >
            {t('admin.add_product')}
          </button>
        </div>
      )}

      {/* Centered Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        description={confirmModal.description}
        loading={confirmModal.loading}
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
}
