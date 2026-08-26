import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FolderPlus, Check, Loader2, Globe } from 'lucide-react';
import { createCategory, updateCategory } from '../services/api';

export default function CategoryModal({ isOpen, onClose, categoryToEdit, onSaved }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'uz';

  const [activeLangTab, setActiveLangTab] = useState(currentLang);
  const [formData, setFormData] = useState({
    name_uz: '',
    name_ru: '',
    name_en: '',
    sort_order: 1,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setActiveLangTab(i18n.language || 'uz');
    if (categoryToEdit) {
      setFormData({
        name_uz: categoryToEdit.name_uz || '',
        name_ru: categoryToEdit.name_ru || '',
        name_en: categoryToEdit.name_en || '',
        sort_order: categoryToEdit.sort_order ?? 1,
        is_active: categoryToEdit.is_active ?? true,
      });
    } else {
      setFormData({
        name_uz: '',
        name_ru: '',
        name_en: '',
        sort_order: 1,
        is_active: true,
      });
    }
    setError(null);
  }, [categoryToEdit, isOpen, i18n.language]);

  if (!isOpen) return null;

  const handleNameChange = (val) => {
    setFormData((prev) => {
      const updated = { ...prev };
      if (activeLangTab === 'uz') updated.name_uz = val;
      else if (activeLangTab === 'ru') updated.name_ru = val;
      else if (activeLangTab === 'en') updated.name_en = val;
      return updated;
    });
  };

  const currentNameValue =
    activeLangTab === 'uz'
      ? formData.name_uz
      : activeLangTab === 'ru'
      ? formData.name_ru
      : formData.name_en;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const hasAnyName =
      (formData.name_uz && formData.name_uz.trim()) ||
      (formData.name_ru && formData.name_ru.trim()) ||
      (formData.name_en && formData.name_en.trim());

    if (!hasAnyName) {
      setError('Iltimos, kategoriya nomini kiriting!');
      return;
    }

    const payload = {
      name_uz: formData.name_uz ? formData.name_uz.trim() : '',
      name_ru: formData.name_ru ? formData.name_ru.trim() : '',
      name_en: formData.name_en ? formData.name_en.trim() : '',
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
          
          {/* Multilingual Category Name Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-mehmon-gold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Kategoriya nomi *</span>
              </label>

              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1 bg-mehmon-input p-1 rounded-lg border border-mehmon-border">
                <button
                  type="button"
                  onClick={() => setActiveLangTab('uz')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    activeLangTab === 'uz'
                      ? 'bg-mehmon-gold text-[#1F1915] shadow-sm'
                      : 'text-mehmon-muted hover:text-mehmon-text'
                  }`}
                >
                  UZ {formData.name_uz ? '✓' : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('ru')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    activeLangTab === 'ru'
                      ? 'bg-mehmon-gold text-[#1F1915] shadow-sm'
                      : 'text-mehmon-muted hover:text-mehmon-text'
                  }`}
                >
                  RU {formData.name_ru ? '✓' : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('en')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    activeLangTab === 'en'
                      ? 'bg-mehmon-gold text-[#1F1915] shadow-sm'
                      : 'text-mehmon-muted hover:text-mehmon-text'
                  }`}
                >
                  EN {formData.name_en ? '✓' : ''}
                </button>
              </div>
            </div>

            <input
              type="text"
              required
              value={currentNameValue}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={
                activeLangTab === 'ru'
                  ? "Например: Главные Блюда"
                  : activeLangTab === 'en'
                  ? "Example: Main Courses"
                  : "Masalan: Asosiy Taomlar"
              }
              className="w-full bg-mehmon-input text-mehmon-text text-sm px-3.5 py-2.5 rounded-xl border border-mehmon-border focus:border-mehmon-gold focus:outline-none placeholder-mehmon-muted/50 shadow-inner"
              autoFocus
            />

            <p className="text-[11px] text-mehmon-muted">
              💡 Bitta tilda kiritsangiz, qolgan tillarga avtomatik tarjima qilinadi.
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
