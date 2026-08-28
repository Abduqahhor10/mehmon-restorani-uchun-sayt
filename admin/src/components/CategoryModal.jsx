import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FolderPlus, Check, Loader2 } from 'lucide-react';
import { createCategory, updateCategory } from '../services/api';
import { formatTitleCase } from '../utils/textUtils';

export default function CategoryModal({ isOpen, onClose, categoryToEdit, onSaved }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    sort_order: 1,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name_uz || categoryToEdit.name_ru || categoryToEdit.name_en || '',
        sort_order: categoryToEdit.sort_order ?? 1,
        is_active: categoryToEdit.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        sort_order: 1,
        is_active: true,
      });
    }
    setError(null);
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formattedName = formatTitleCase(formData.name);
    if (!formattedName) {
      setError('Iltimos, kategoriya nomini kiriting!');
      return;
    }

    const payload = {
      name_uz: formattedName,
      name_ru: '',
      name_en: '',
      sort_order: formData.sort_order || 1,
      is_active: formData.is_active,
    };

    setLoading(true);
    setError(null);
    try {
      if (categoryToEdit) {
        await updateCategory(categoryToEdit.id, payload);
      } else {
        await createCategory(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data
        ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data))
        : err.message;
      setError('Xatolik: ' + errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-mehmon-card border border-mehmon-border w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-mehmon-border mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-mehmon-subtle border border-mehmon-gold/40 flex items-center justify-center text-mehmon-gold">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-lg font-bold text-mehmon-text">
              {categoryToEdit ? t('admin.edit_category') : t('admin.add_category')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-mehmon-muted hover:text-mehmon-text transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/20 border border-red-500/40 rounded-xl text-xs text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Single Name Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-mehmon-gold">
              Kategoriya nomi *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onBlur={() => setFormData((prev) => ({ ...prev, name: formatTitleCase(prev.name) }))}
              placeholder="Masalan: Asosiy Taomlar yoki Горячие блюда"
              className="w-full bg-mehmon-input text-mehmon-text text-sm px-3.5 py-2.5 rounded-xl border border-mehmon-border focus:border-mehmon-gold focus:outline-none placeholder-mehmon-muted/50 shadow-inner"
              autoFocus
            />
            <p className="text-[11px] text-mehmon-muted">
              ✨ O'zbekcha yoki Ruscha yozsangiz, tizim avtomatik aniqlab barcha tillarga to'g'irlaydi.
            </p>
          </div>

          {/* Active Status Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer py-3 px-3.5 rounded-xl bg-mehmon-subtle border border-mehmon-border hover:border-mehmon-gold/40 transition-colors">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-[#D4A359] rounded bg-mehmon-card border-mehmon-border focus:ring-0 accent-[#D4A359]"
              />
              <span className="text-xs font-semibold text-mehmon-text">
                {t('admin.active')}
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-mehmon-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-mehmon-input hover:bg-mehmon-subtle text-mehmon-muted hover:text-mehmon-text text-xs font-semibold border border-mehmon-border transition-colors"
            >
              {t('admin.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B8863B] hover:opacity-95 text-[#1F1915] font-bold text-xs flex items-center gap-2 shadow-[0_4px_15px_rgba(212,163,89,0.3)] disabled:opacity-50 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{t('admin.save')}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
