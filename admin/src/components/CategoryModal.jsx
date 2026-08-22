import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FolderPlus, Check, Loader2 } from 'lucide-react';
import { createCategory, updateCategory } from '../services/api';

export default function CategoryModal({ isOpen, onClose, categoryToEdit, onSaved }) {
  const { t } = useTranslation();
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
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name_uz.trim()) {
      setError('O\'zbekcha nom kiritilishi shart!');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (categoryToEdit) {
        await updateCategory(categoryToEdit.id, formData);
      } else {
        await createCategory(formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data
        ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data))
        : err.message;
      setError('Xatolik yuz berdi: ' + errMsg);
    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#2B231D] border border-[#3D332B] w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3D332B] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1F1915] border border-[#D4A359]/40 flex items-center justify-center text-[#D4A359]">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#F5EBE0]">
              {categoryToEdit ? t('admin.edit_category') : t('admin.add_category')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#A89F91] hover:text-[#F5EBE0] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name UZ */}
          <div>
            <label className="block text-xs font-semibold text-[#D4A359] mb-1.5">
              {t('admin.name_uz')} *
            </label>
            <input
              type="text"
              required
              value={formData.name_uz}
              onChange={(e) => setFormData({ ...formData, name_uz: e.target.value })}
              placeholder="Masalan: Asosiy Taomlar"
              className="w-full bg-[#1F1915] text-[#F5EBE0] text-sm px-3.5 py-2.5 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none"
            />
          </div>

          {/* Name RU */}
          <div>
            <label className="block text-xs font-semibold text-[#A89F91] mb-1.5">
              {t('admin.name_ru')}
            </label>
            <input
              type="text"
              value={formData.name_ru}
              onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
              placeholder="Например: Главные Блюда"
              className="w-full bg-[#1F1915] text-[#F5EBE0] text-sm px-3.5 py-2.5 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none"
            />
          </div>

          {/* Name EN */}
          <div>
            <label className="block text-xs font-semibold text-[#A89F91] mb-1.5">
              {t('admin.name_en')}
            </label>
            <input
              type="text"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              placeholder="Example: Main Courses"
              className="w-full bg-[#1F1915] text-[#F5EBE0] text-sm px-3.5 py-2.5 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Sort Order */}
            <div>
              <label className="block text-xs font-semibold text-[#A89F91] mb-1.5">
                {t('admin.sort_order')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#1F1915] text-[#F5EBE0] text-sm px-3.5 py-2.5 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none"
              />
            </div>

            {/* Active Status Toggle */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer py-2.5 px-3 rounded-xl bg-[#1F1915] border border-[#3D332B]">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#D4A359] rounded bg-[#2B231D] border-[#3D332B] focus:ring-0 accent-[#D4A359]"
                />
                <span className="text-xs font-semibold text-[#F5EBE0]">
                  {t('admin.active')}
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#3D332B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#1F1915] hover:bg-[#16120F] text-[#A89F91] hover:text-[#F5EBE0] text-xs font-semibold border border-[#3D332B] transition-colors"
            >
              {t('admin.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#D4A359] hover:bg-[#B8863B] text-[#1F1915] font-bold text-xs flex items-center gap-2 shadow-[0_4px_15px_rgba(212,163,89,0.3)] disabled:opacity-50 transition-all"
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
