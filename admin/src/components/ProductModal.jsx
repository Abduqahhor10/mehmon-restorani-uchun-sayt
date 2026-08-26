import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Check, Loader2, Image as ImageIcon, Flame } from 'lucide-react';
import { createProduct, updateProduct } from '../services/api';

export default function ProductModal({ isOpen, onClose, productToEdit, categories, onSaved }) {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    price: '',
    portion_weight: 0,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    image_url: '',
    is_recommended: false,
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
        name: productToEdit.name_uz || productToEdit.name_ru || productToEdit.name_en || '',
        price: productToEdit.price || '',
        portion_weight: 0,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        image_url: productToEdit.image_url || '',
        is_recommended: productToEdit.is_recommended ?? false,
        is_active: productToEdit.is_active ?? true,
      });
      setImagePreview(productToEdit.effective_image_url || productToEdit.image || productToEdit.image_url || null);
    } else {
      setFormData({
        category: categories[0]?.id || '',
        name: '',
        price: '',
        portion_weight: 0,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        image_url: '',
        is_recommended: false,
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
    
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setError('Iltimos, taom nomini kiriting!');
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
    payload.append('name_uz', trimmedName);
    payload.append('name_ru', '');
    payload.append('name_en', '');
    payload.append('price', formData.price);
    payload.append('portion_weight', 0);
    payload.append('calories', 0);
    payload.append('protein', 0);
    payload.append('fat', 0);
    payload.append('carbs', 0);
    payload.append('is_recommended', formData.is_recommended);
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
      <div className="bg-mehmon-card border border-mehmon-border w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-mehmon-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-mehmon-subtle border border-mehmon-gold/40 flex items-center justify-center text-mehmon-gold">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-lg font-bold text-mehmon-text">
              {productToEdit ? t('admin.edit_product') : t('admin.add_product')}
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
          <div className="mt-4 p-3 bg-red-950/20 border border-red-500/40 rounded-xl text-xs text-red-500 shrink-0">
            {error}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 mt-4 space-y-5 flex-1">
          
          {/* Category & Price Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-mehmon-gold mb-1.5">
                {t('admin.category_select')} *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-mehmon-input text-mehmon-text text-sm px-3.5 py-2.5 rounded-xl border border-mehmon-border focus:border-mehmon-gold focus:outline-none shadow-inner"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-mehmon-card text-mehmon-text">
                    {cat.name_uz || cat.name_ru || cat.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-mehmon-gold mb-1.5">
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
                className="w-full bg-mehmon-input text-mehmon-text text-sm px-3.5 py-2.5 rounded-xl border border-mehmon-border focus:border-mehmon-gold focus:outline-none shadow-inner"
              />
            </div>
          </div>

          {/* Simple Single Name Input */}
          <div className="bg-mehmon-subtle p-4 rounded-xl border border-mehmon-border space-y-2">
            <label className="block text-xs font-semibold text-mehmon-gold">
              Taom nomi *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masalan: To'y Oshi yoki Праздничный Плов"
              className="w-full bg-mehmon-input text-mehmon-text text-sm px-3.5 py-2.5 rounded-xl border border-mehmon-border focus:border-mehmon-gold focus:outline-none shadow-inner"
            />
            <p className="text-[11px] text-mehmon-muted">
              ✨ O'zbekcha yoki Ruscha yozsangiz, tizim avtomatik aniqlab barcha tillarga to'g'irlaydi.
            </p>
          </div>

          {/* Image Upload & URL */}
          <div className="p-4 bg-mehmon-subtle rounded-xl border border-mehmon-border space-y-3">
            <p className="text-xs font-bold text-mehmon-gold uppercase tracking-wider">
              📷 {t('admin.image_upload')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Image Preview Box */}
              <div className="w-28 h-20 bg-mehmon-input rounded-xl border border-mehmon-border overflow-hidden flex items-center justify-center shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-mehmon-muted/40" />
                )}
              </div>

              {/* File Input */}
              <div className="flex-1 w-full">
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-mehmon-border hover:border-mehmon-gold rounded-xl cursor-pointer bg-mehmon-input text-center transition-colors">
                  <Upload className="w-5 h-5 text-mehmon-gold mb-1" />
                  <span className="text-xs text-mehmon-text font-medium">{t('admin.drag_image')}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-mehmon-muted mb-1">{t('admin.image_url')}</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => {
                  setFormData({ ...formData, image_url: e.target.value });
                  if (!imageFile && e.target.value) setImagePreview(e.target.value);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-mehmon-input text-mehmon-text text-xs px-3 py-2 rounded-lg border border-mehmon-border focus:border-mehmon-gold shadow-inner"
              />
            </div>
          </div>

          {/* Recommended & Active Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-mehmon-subtle border border-mehmon-border hover:border-mehmon-gold/40 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.is_recommended}
                onChange={(e) => setFormData({ ...formData, is_recommended: e.target.checked })}
                className="w-4 h-4 text-[#D4A359] rounded bg-mehmon-card border-mehmon-border focus:ring-0 accent-[#D4A359]"
              />
              <span className="text-xs font-semibold text-mehmon-text">
                ⭐ {t('admin.is_recommended')}
              </span>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-mehmon-subtle border border-mehmon-border hover:border-mehmon-gold/40 cursor-pointer transition-colors">
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
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-mehmon-border">
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
