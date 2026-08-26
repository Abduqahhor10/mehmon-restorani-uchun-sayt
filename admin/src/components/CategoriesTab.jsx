import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderPlus, Search, Edit2, Trash2, CheckCircle2, XCircle, CheckSquare, X, CheckCheck, Check } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { deleteCategory, deleteAllCategories, deleteSelectedCategories } from '../services/api';

export default function CategoriesTab({ categories, onAddCategory, onEditCategory, onRefresh }) {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    description: '',
    actionType: '', // 'all' | 'selected' | 'single'
    targetId: null,
    loading: false,
  });

  const getCategoryName = (c) => {
    const lang = i18n.language;
    if (lang === 'ru' && c.name_ru) return c.name_ru;
    if (lang === 'en' && c.name_en) return c.name_en;
    return c.name_uz || c.name_ru || c.name_en;
  };

  const filteredCategories = categories
    .filter((c) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        c.name_uz?.toLowerCase().includes(q) ||
        c.name_ru?.toLowerCase().includes(q) ||
        c.name_en?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const nameA = getCategoryName(a) || '';
      const nameB = getCategoryName(b) || '';
      return nameA.localeCompare(nameB, i18n.language || 'uz', { sensitivity: 'base' });
    });

  // Toggle selection for a single category
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all visible
  const handleToggleSelectAll = () => {
    const visibleIds = filteredCategories.map((c) => c.id);
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
      title: "Aniq barcha kategoriyalarni o'chirmoqchimisiz?",
      description: "Diqqat! Barcha kategoriyalar va ularga tegishli barcha taomlar butunlay o'chiriladi. Ushbu amalni ortga qaytarib bo'lmaydi!",
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
      title: `Aniq tanlangan ${selectedIds.length} ta kategoriyani o'chirmoqchimisiz?`,
      description: "Tanlangan kategoriyalar va ularga tegishli barcha taomlar butunlay o'chiriladi.",
      actionType: 'selected',
      targetId: null,
      loading: false,
    });
  };

  // Trigger modal for Single Category Delete
  const handleOpenDeleteSingleModal = (category) => {
    setConfirmModal({
      isOpen: true,
      title: `"${getCategoryName(category)}" kategoriyasini o'chirmoqchimisiz?`,
      description: "Ushbu kategoriya va unga tegishli barcha taomlar menyudan o'chiriladi.",
      actionType: 'single',
      targetId: category.id,
      loading: false,
    });
  };

  // Execute confirm action
  const handleConfirmAction = async () => {
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      if (confirmModal.actionType === 'all') {
        await deleteAllCategories();
        handleCancelSelection();
      } else if (confirmModal.actionType === 'selected') {
        await deleteSelectedCategories(selectedIds);
        handleCancelSelection();
      } else if (confirmModal.actionType === 'single') {
        await deleteCategory(confirmModal.targetId);
      }
      onRefresh();
      setConfirmModal({ isOpen: false, title: '', description: '', actionType: '', targetId: null, loading: false });
    } catch (err) {
      alert('Xatolik yuz berdi: ' + err.message);
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const isAllVisibleSelected =
    filteredCategories.length > 0 &&
    filteredCategories.every((c) => selectedIds.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-mehmon-card p-4 rounded-2xl border border-mehmon-border shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-mehmon-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.search_categories')}
            className="w-full bg-mehmon-input text-mehmon-text text-xs pl-10 pr-4 py-2.5 rounded-xl border border-mehmon-border focus:border-mehmon-gold focus:outline-none placeholder-mehmon-muted/70 shadow-inner"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          
          {/* Normal Mode Controls */}
          {!isSelectionMode ? (
            <>
              {categories.length > 0 && (
                <>
                  {/* Belgilash */}
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
                    title={t('admin.delete_all_categories')}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t('admin.delete_all')}</span>
                  </button>
                </>
              )}

              {/* Kategoriya qo'shish */}
              <button
                onClick={onAddCategory}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B8863B] hover:opacity-95 text-[#1F1915] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(212,163,89,0.3)] transition-all"
              >
                <FolderPlus className="w-4 h-4" />
                <span>{t('admin.add_category')}</span>
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

              {/* Tanlanganlarni o'chirish */}
              <button
                onClick={handleOpenDeleteSelectedModal}
                disabled={selectedIds.length === 0}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_4px_15px_rgba(220,38,38,0.4)] transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('admin.delete_selected', { count: selectedIds.length })}</span>
              </button>

              {/* Bekor qilish */}
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

      {/* Categories Table / List */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => {
            const isSelected = selectedIds.includes(category.id);
            return (
              <div
                key={category.id}
                onClick={isSelectionMode ? () => handleToggleSelect(category.id) : undefined}
                className={`bg-mehmon-card p-5 rounded-2xl border shadow-card-custom transition-all flex flex-col justify-between relative ${
                  isSelectionMode ? 'cursor-pointer select-none' : ''
                } ${
                  isSelected
                    ? 'border-mehmon-gold ring-2 ring-mehmon-gold shadow-gold-glow scale-[1.01]'
                    : 'border-mehmon-border hover:border-mehmon-gold/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      {isSelectionMode && (
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-mehmon-gold border-mehmon-gold text-[#1F1915]'
                              : 'bg-mehmon-input border-mehmon-border text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                      <h4 className="font-serif font-bold text-base text-mehmon-text">
                        {getCategoryName(category)}
                      </h4>
                    </div>

                    {category.is_active ? (
                      <span className="text-emerald-500 text-[11px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('admin.active')}
                      </span>
                    ) : (
                      <span className="text-rose-500 text-[11px] font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        {t('admin.inactive')}
                      </span>
                    )}
                  </div>

                  {/* Multilingual names preview */}
                  <div className="space-y-1 text-xs text-mehmon-muted bg-mehmon-subtle p-3 rounded-xl border border-mehmon-border mb-4">
                    <p><span className="text-mehmon-gold font-semibold">UZ:</span> {category.name_uz || '—'}</p>
                    <p><span className="text-mehmon-gold font-semibold">RU:</span> {category.name_ru || '—'}</p>
                    <p><span className="text-mehmon-gold font-semibold">EN:</span> {category.name_en || '—'}</p>
                  </div>
                </div>

                {/* Actions (Hidden in Selection Mode) */}
                {!isSelectionMode ? (
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-mehmon-border">
                    <span className="text-[11px] text-mehmon-muted font-medium">
                      {category.products_count ?? 0} ta taom
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditCategory(category); }}
                        className="p-2 rounded-lg bg-mehmon-subtle hover:bg-mehmon-card text-mehmon-text hover:text-mehmon-gold border border-mehmon-border transition-colors shadow-sm"
                        title={t('admin.edit')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenDeleteSingleModal(category); }}
                        className="p-2 rounded-lg bg-mehmon-subtle hover:bg-red-500/15 text-rose-500 border border-mehmon-border hover:border-red-500/40 transition-colors shadow-sm"
                        title={t('admin.delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-2 text-center text-xs font-semibold rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-mehmon-gold/15 text-mehmon-gold border-mehmon-gold/30'
                      : 'bg-mehmon-subtle/50 text-mehmon-muted border-mehmon-border'
                  }`}>
                    {isSelected ? 'Tanlangan ✓' : 'Tanlash uchun bosing'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-mehmon-card p-12 rounded-2xl border border-mehmon-border text-center shadow-card-custom">
          <p className="text-sm text-mehmon-muted mb-4">{t('admin.no_categories')}</p>
          <button
            onClick={onAddCategory}
            className="px-4 py-2 bg-gradient-to-r from-[#D4A359] to-[#B8863B] text-[#1F1915] font-bold rounded-xl text-xs shadow-md"
          >
            {t('admin.add_category')}
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
