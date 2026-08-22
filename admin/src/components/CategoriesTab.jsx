import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderPlus, Search, Edit2, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { deleteCategory, deleteAllCategories } from '../services/api';

export default function CategoriesTab({ categories, onAddCategory, onEditCategory, onRefresh }) {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.confirm_delete_category'))) {
      try {
        await deleteCategory(id);
        onRefresh();
      } catch (err) {
        alert('Kategoriyani o\'chirishda xatolik: ' + err.message);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (categories.length === 0) return;
    if (window.confirm(t('admin.confirm_delete_all_categories'))) {
      setIsDeletingAll(true);
      try {
        await deleteAllCategories();
        onRefresh();
      } catch (err) {
        alert('Kategoriyalarni o\'chirishda xatolik: ' + err.message);
      } finally {
        setIsDeletingAll(false);
      }
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      c.name_uz?.toLowerCase().includes(q) ||
      c.name_ru?.toLowerCase().includes(q) ||
      c.name_en?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#2B231D] p-4 rounded-2xl border border-[#3D332B]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#A89F91]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.search_categories')}
            className="w-full bg-[#1F1915] text-[#F5EBE0] text-xs pl-10 pr-4 py-2.5 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none"
          />
        </div>

        {/* Action Buttons: Delete All & Add Category */}
        <div className="flex items-center gap-3 shrink-0">
          {categories.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
              className="px-3.5 py-2.5 rounded-xl bg-red-950/70 hover:bg-red-900/80 text-red-300 border border-red-800/80 hover:border-red-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              title={t('admin.delete_all_categories')}
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
            onClick={onAddCategory}
            className="px-4 py-2.5 rounded-xl bg-[#D4A359] hover:bg-[#B8863B] text-[#1F1915] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(212,163,89,0.3)] transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            <span>{t('admin.add_category')}</span>
          </button>
        </div>
      </div>

      {/* Categories Table / List */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-[#2B231D] p-5 rounded-2xl border border-[#3D332B] hover:border-[#D4A359]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#1F1915] border border-[#3D332B] flex items-center justify-center text-xs font-bold text-[#D4A359]">
                      #{category.sort_order || category.id}
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#F5EBE0]">
                      {category.name_uz}
                    </h4>
                  </div>
                  {category.is_active ? (
                    <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('admin.active')}
                    </span>
                  ) : (
                    <span className="text-rose-400 text-[11px] font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      {t('admin.inactive')}
                    </span>
                  )}
                </div>

                {/* Multilingual names preview */}
                <div className="space-y-1 text-xs text-[#A89F91] bg-[#1F1915] p-3 rounded-xl border border-[#3D332B]/50 mb-4">
                  <p><span className="text-[#D4A359]">RU:</span> {category.name_ru || '—'}</p>
                  <p><span className="text-[#D4A359]">EN:</span> {category.name_en || '—'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#3D332B]">
                <span className="text-[11px] text-[#A89F91]">
                  {category.products_count ?? 0} ta taom
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditCategory(category)}
                    className="p-2 rounded-lg bg-[#1F1915] hover:bg-[#352C25] text-[#F5EBE0] hover:text-[#D4A359] border border-[#3D332B] transition-colors"
                    title={t('admin.edit')}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 rounded-lg bg-[#1F1915] hover:bg-red-950 text-rose-400 border border-[#3D332B] hover:border-red-800 transition-colors"
                    title={t('admin.delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#2B231D] p-12 rounded-2xl border border-[#3D332B] text-center">
          <p className="text-sm text-[#A89F91] mb-4">{t('admin.no_categories')}</p>
          <button
            onClick={onAddCategory}
            className="px-4 py-2 bg-[#D4A359] text-[#1F1915] font-bold rounded-xl text-xs"
          >
            {t('admin.add_category')}
          </button>
        </div>
      )}
    </div>
  );
}
