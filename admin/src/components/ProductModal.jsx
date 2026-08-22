import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Check, Loader2, Image as ImageIcon, Flame, Scale } from 'lucide-react';
import { createProduct, updateProduct } from '../services/api';

export default function ProductModal({ isOpen, onClose, productToEdit, categories, onSaved }) {
  const { t, i18n } = useTranslation();
  
  const [activeLangTab, setActiveLangTab] = useState('uz'); // 'uz', 'ru', 'en'
  const [formData, setFormData] = useState({
    category: '',
    name_uz: '',
    name_ru: '',
    name_en: '',
    description_uz: '',
    description_ru: '',
    description_en: '',
    price: '',
    portion_weight: 300,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    image_url: '',
    is_active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        category: productToEdit.category || (categories[0]?.id || ''),
        name_uz: productToEdit.name_uz || '',
        name_ru: productToEdit.name_ru || '',
        name_en: productToEdit.name_en || '',
        description_uz: productToEdit.description_uz || '',
        description_ru: productToEdit.description_ru || '',
        description_en: productToEdit.description_en || '',
        price: productToEdit.price || '',
        portion_weight: productToEdit.portion_weight ?? 300,
        calories: productToEdit.calories ?? 0,
        protein: productToEdit.protein ?? 0,
        fat: productToEdit.fat ?? 0,
        carbs: productToEdit.carbs ?? 0,
        image_url: productToEdit.image_url || '',
        is_active: productToEdit.is_active ?? true,
      });
      setImagePreview(productToEdit.effective_image_url || productToEdit.image || productToEdit.image_url || null);
    } else {
      setFormData({
        category: categories[0]?.id || '',
        name_uz: '',
        name_ru: '',
        name_en: '',
        description_uz: '',
        description_ru: '',
        description_en: '',
        price: '',
        portion_weight: 300,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        image_url: '',
        is_active: true,
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setError(null);
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name_uz.trim()) {
      setError('Taom nomi (O\'zbekcha) kiritilishi shart!');
      setActiveLangTab('uz');
      return;
    }
    if (!formData.category) {
      setError('Iltimos, kategoriyani tanlang!');
      return;
    }
    if (!formData.price) {
      setError('Iltimos, narxni kiriting!');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = new FormData();
    payload.append('category', formData.category);
    payload.append('name_uz', formData.name_uz.trim());
    payload.append('name_ru', formData.name_ru ? formData.name_ru.trim() : '');
    payload.append('name_en', formData.name_en ? formData.name_en.trim() : '');
    payload.append('description_uz', formData.description_uz ? formData.description_uz.trim() : '');
    payload.append('description_ru', formData.description_ru ? formData.description_ru.trim() : '');
    payload.append('description_en', formData.description_en ? formData.description_en.trim() : '');
    payload.append('price', formData.price);
    payload.append('portion_weight', formData.portion_weight || 0);
    payload.append('calories', formData.calories || 0);
    payload.append('protein', formData.protein || 0);
    payload.append('fat', formData.fat || 0);
    payload.append('carbs', formData.carbs || 0);
    payload.append('is_active', formData.is_active);

    if (imageFile) {
      payload.append('image', imageFile);
    }
    if (formData.image_url && formData.image_url.trim()) {
      payload.append('image_url', formData.image_url.trim());
    }


    try {
      if (productToEdit) {
        await updateProduct(productToEdit.id, payload);
      } else {
        await createProduct(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Xatolik yuz berdi: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#2B231D] border border-[#3D332B] w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3D332B] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1F1915] border border-[#D4A359]/40 flex items-center justify-center text-[#D4A359]">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#F5EBE0]">
              {productToEdit ? t('admin.edit_product') : t('admin.add_product')}
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
          <div className="mt-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 shrink-0">
            {error}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 mt-4 space-y-5 flex-1">
          
          {/* Category & Price & Portion */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-[#D4A359] mb-1.5">
                {t('admin.category_select')} *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#1F1915] text-[#F5EBE0] text-sm px-3.5 py-2.5 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_uz} {cat.name_en ? `(${cat.name_en})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-[#D4A359] mb-1.5">
                {t('admin.price')} *
              </label>
              <input
                type="number"
                required
                min="0"
                step="500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="68000"
                className="w-full bg-[#1F1915] text-[#F5EBE0] text-sm px-3.5 py-2.5 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none"
              />
            </div>

            {/* Portion Weight */}
            <div>
              <label className="block text-xs font-semibold text-[#A89F91] mb-1.5">
                {t('admin.portion')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.portion_weight}
                onChange={(e) => setFormData({ ...formData, portion_weight: parseInt(e.target.value) || 0 })}
                placeholder="350"
                className="w-full bg-[#1F1915] text-[#F5EBE0] text-sm px-3.5 py-2.5 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none"
              />
            </div>
          </div>

          {/* Multilingual Tabs Switcher */}
          <div className="bg-[#1F1915] p-1 rounded-xl border border-[#3D332B] flex gap-1">
            {[
              { key: 'uz', label: '🇺🇿 O\'zbekcha' },
              { key: 'ru', label: '🇷🇺 Русский' },
              { key: 'en', label: '🇬🇧 English' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveLangTab(tab.key)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeLangTab === tab.key
                    ? 'bg-[#D4A359] text-[#1F1915]'
                    : 'text-[#A89F91] hover:text-[#F5EBE0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Multilingual Text Inputs */}
          {activeLangTab === 'uz' && (
            <div className="space-y-3 bg-[#1F1915]/50 p-4 rounded-xl border border-[#3D332B]/60 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-[#D4A359] mb-1">
                  {t('admin.name_uz')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_uz}
                  onChange={(e) => setFormData({ ...formData, name_uz: e.target.value })}
                  placeholder="Masalan: To'y Oshi 'Mehmon Maxsus'"
                  className="w-full bg-[#1F1915] text-[#F5EBE0] text-sm px-3.5 py-2 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A89F91] mb-1">
                  {t('admin.desc_uz')}
                </label>
                <textarea
                  rows={2}
                  value={formData.description_uz}
                  onChange={(e) => setFormData({ ...formData, description_uz: e.target.value })}
                  placeholder="Taom tarkibi, masalliqlari va xususiyatlari..."
                  className="w-full bg-[#1F1915] text-[#F5EBE0] text-sm px-3.5 py-2 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {activeLangTab === 'ru' && (
            <div className="space-y-3 bg-[#1F1915]/50 p-4 rounded-xl border border-[#3D332B]/60 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-[#D4A359] mb-1">
                  {t('admin.name_ru')}
                </label>
                <input
                  type="text"
                  value={formData.name_ru}
                  onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                  placeholder="Например: Праздничный Плов 'Мехмон'"
                  className="w-full bg-[#1F1915] text-[#F5EBE0] text-sm px-3.5 py-2 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A89F91] mb-1">
                  {t('admin.desc_ru')}
                </label>
                <textarea
                  rows={2}
                  value={formData.description_ru}
                  onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                  placeholder="Состав блюда, ингредиенты и особенности..."
                  className="w-full bg-[#1F1915] text-[#F5EBE0] text-sm px-3.5 py-2 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {activeLangTab === 'en' && (
            <div className="space-y-3 bg-[#1F1915]/50 p-4 rounded-xl border border-[#3D332B]/60 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-[#D4A359] mb-1">
                  {t('admin.name_en')}
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Example: Royal Festive Pilaf 'Mehmon'"
                  className="w-full bg-[#1F1915] text-[#F5EBE0] text-sm px-3.5 py-2 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A89F91] mb-1">
                  {t('admin.desc_en')}
                </label>
                <textarea
                  rows={2}
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Ingredients, preparation and serving details..."
                  className="w-full bg-[#1F1915] text-[#F5EBE0] text-sm px-3.5 py-2 rounded-xl border border-[#3D332B] focus:border-[#D4A359] focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Nutritional Values Grid */}
          <div className="p-4 bg-[#1F1915]/60 rounded-xl border border-[#3D332B]">
            <p className="text-xs font-bold text-[#D4A359] uppercase tracking-wider mb-3">
              ⚡ Ozuqaviy Qiymati (Nutritional Values)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-[#A89F91] mb-1">{t('admin.calories')}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#1F1915] text-[#F5EBE0] text-xs px-3 py-2 rounded-lg border border-[#3D332B] focus:border-[#D4A359]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#A89F91] mb-1">{t('admin.protein')}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#1F1915] text-[#F5EBE0] text-xs px-3 py-2 rounded-lg border border-[#3D332B] focus:border-[#D4A359]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#A89F91] mb-1">{t('admin.fat')}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#1F1915] text-[#F5EBE0] text-xs px-3 py-2 rounded-lg border border-[#3D332B] focus:border-[#D4A359]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#A89F91] mb-1">{t('admin.carbs')}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#1F1915] text-[#F5EBE0] text-xs px-3 py-2 rounded-lg border border-[#3D332B] focus:border-[#D4A359]"
                />
              </div>
            </div>
          </div>

          {/* Image Upload & URL */}
          <div className="p-4 bg-[#1F1915]/60 rounded-xl border border-[#3D332B] space-y-3">
            <p className="text-xs font-bold text-[#D4A359] uppercase tracking-wider">
              📷 {t('admin.image_upload')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Image Preview Box */}
              <div className="w-28 h-20 bg-[#1F1915] rounded-xl border border-[#3D332B] overflow-hidden flex items-center justify-center shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[#A89F91]/40" />
                )}
              </div>

              {/* File Input */}
              <div className="flex-1 w-full">
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#3D332B] hover:border-[#D4A359] rounded-xl cursor-pointer bg-[#1F1915] text-center transition-colors">
                  <Upload className="w-5 h-5 text-[#D4A359] mb-1" />
                  <span className="text-xs text-[#F5EBE0] font-medium">{t('admin.drag_image')}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#A89F91] mb-1">{t('admin.image_url')}</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => {
                  setFormData({ ...formData, image_url: e.target.value });
                  if (!imageFile && e.target.value) setImagePreview(e.target.value);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#1F1915] text-[#F5EBE0] text-xs px-3 py-2 rounded-lg border border-[#3D332B] focus:border-[#D4A359]"
              />
            </div>
          </div>

          {/* Active Status Toggle */}
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
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3D332B] shrink-0 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#1F1915] hover:bg-[#16120F] text-[#A89F91] hover:text-[#F5EBE0] text-xs font-semibold border border-[#3D332B] transition-colors"
          >
            {t('admin.cancel')}
          </button>
          <button
            onClick={handleSubmit}
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

      </div>
    </div>
  );
}
