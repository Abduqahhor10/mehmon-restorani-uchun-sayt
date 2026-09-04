import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, FolderPlus, Languages, Loader2, X } from 'lucide-react';
import { createCategory, describeApiError, updateCategory } from '../services/api';
import { formatTitleCase } from '../utils/textUtils';

const EMPTY_FORM = {
  name: '',
  name_ru: '',
  name_en: '',
  sort_order: 1,
  is_active: true,
};

export default function CategoryModal({ isOpen, onClose, categoryToEdit, onSaved }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showTranslations, setShowTranslations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialNameRef = useRef('');

  useEffect(() => {
    if (!isOpen) return;

    if (categoryToEdit) {
      const name =
        categoryToEdit.name_uz || categoryToEdit.name_ru || categoryToEdit.name_en || '';
      initialNameRef.current = name;
      setFormData({
        name,
        name_ru: categoryToEdit.name_ru || '',
        name_en: categoryToEdit.name_en || '',
        sort_order: categoryToEdit.sort_order ?? 1,
        is_active: categoryToEdit.is_active ?? true,
      });
    } else {
      initialNameRef.current = '';
      setFormData(EMPTY_FORM);
    }
    setShowTranslations(false);
    setError(null);
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const setField = (field) => (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedName = formatTitleCase(formData.name);
    if (!formattedName) {
      setError(t('admin.category_name_required'));
      return;
    }

    const payload = {
      name_uz: formattedName,
      sort_order: Math.max(0, Math.round(Number(formData.sort_order) || 0)),
      is_active: formData.is_active,
    };

    // Only ask the backend to re-translate when the primary name actually changed,
    // so a manually corrected RU/EN name is not thrown away by an unrelated edit.
    const manualRu = formData.name_ru.trim();
    const manualEn = formData.name_en.trim();
    const nameChanged = formattedName !== formatTitleCase(initialNameRef.current);

    if (manualRu || manualEn) {
      payload.name_ru = manualRu;
      payload.name_en = manualEn;
    } else if (nameChanged || !categoryToEdit) {
      payload.name_ru = '';
      payload.name_en = '';
    }

    setLoading(true);
    setError(null);
    try {
      const saved = categoryToEdit
        ? await updateCategory(categoryToEdit.id, payload)
        : await createCategory(payload);
      onSaved?.(saved, Boolean(categoryToEdit));
      onClose();
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-mehmon-input text-mehmon-text text-sm px-3.5 py-2.5 rounded-xl border border-mehmon-border focus:border-mehmon-gold focus:outline-none placeholder-mehmon-muted/50 shadow-inner';
  const labelClass = 'block text-xs font-semibold text-mehmon-gold mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-mehmon-card border border-mehmon-border w-full max-w-lg rounded-2xl p-6 shadow-2xl relative my-8">

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
            type="button"
            onClick={onClose}
            aria-label={t('admin.cancel')}
            className="text-mehmon-muted hover:text-mehmon-text transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-950/20 border border-red-500/40 rounded-xl text-xs text-red-500"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
            <label className={labelClass} htmlFor="category-name">
              {t('admin.category_name')} *
            </label>
            <input
              id="category-name"
              type="text"
              required
              value={formData.name}
              onChange={setField('name')}
              onBlur={() => setFormData((prev) => ({ ...prev, name: formatTitleCase(prev.name) }))}
              placeholder="Masalan: Asosiy Taomlar yoki Горячие блюда"
              className={inputClass}
              autoFocus
            />
            <p className="text-[11px] text-mehmon-muted">
              ✨ {t('admin.auto_translate_hint')}
            </p>
          </div>

          {/* Manual translation override */}
          <div>
            <button
              type="button"
              onClick={() => setShowTranslations((prev) => !prev)}
              aria-expanded={showTranslations}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-mehmon-gold hover:opacity-80 transition-opacity"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{t('admin.manual_translation')}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showTranslations ? 'rotate-180' : ''}`}
              />
            </button>

            {showTranslations && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-mehmon-border pt-3">
                <div>
                  <label className={labelClass} htmlFor="category-name-ru">RU</label>
                  <input
                    id="category-name-ru"
                    type="text"
                    value={formData.name_ru}
                    onChange={setField('name_ru')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="category-name-en">EN</label>
                  <input
                    id="category-name-en"
                    type="text"
                    value={formData.name_en}
                    onChange={setField('name_en')}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sort order: the menu lists categories in this order, not alphabetically. */}
          <div>
            <label className={labelClass} htmlFor="category-sort-order">
              {t('admin.sort_order')}
            </label>
            <input
              id="category-sort-order"
              type="number"
              min="0"
              step="1"
              value={formData.sort_order}
              onChange={setField('sort_order')}
              className={inputClass}
            />
            <p className="text-[11px] text-mehmon-muted mt-1">{t('admin.sort_order_hint')}</p>
          </div>

          {/* Active status */}
          <div className="pt-1">
            <label className="flex items-center gap-3 cursor-pointer py-3 px-3.5 rounded-xl bg-mehmon-subtle border border-mehmon-border hover:border-mehmon-gold/40 transition-colors">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={setField('is_active')}
                className="w-4 h-4 rounded bg-mehmon-card border-mehmon-border focus:ring-0 accent-[#D4A359]"
              />
              <span className="text-xs font-semibold text-mehmon-text">{t('admin.active')}</span>
            </label>
          </div>

          {/* Actions */}
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{t('admin.save')}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
