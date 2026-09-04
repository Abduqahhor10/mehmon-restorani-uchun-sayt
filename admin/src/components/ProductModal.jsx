import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check,
  ChevronDown,
  Flame,
  Image as ImageIcon,
  Languages,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { createProduct, describeApiError, updateProduct } from '../services/api';
import { formatTitleCase } from '../utils/textUtils';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const EMPTY_FORM = {
  category: '',
  name: '',
  name_ru: '',
  name_en: '',
  description: '',
  description_ru: '',
  description_en: '',
  price: '',
  portion_weight: 300,
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  image_url: '',
  is_recommended: false,
  is_active: true,
};

export default function ProductModal({ isOpen, onClose, productToEdit, categories, onSaved }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // The parent re-fetches categories every few seconds, handing down a brand new
  // array each time. Depending on it here used to reset the form mid-typing, so the
  // list is read through a ref and kept out of the effect's dependencies.
  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  // Remembers what the product looked like when the modal opened, so we only ask the
  // backend to re-translate the fields the user actually edited.
  const initialRef = useRef({ name: '', description: '' });
  const objectUrlRef = useRef(null);

  const revokePreview = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    revokePreview();
    const firstCategoryId = categoriesRef.current?.[0]?.id ?? '';

    if (productToEdit) {
      const name = productToEdit.name_uz || productToEdit.name_ru || productToEdit.name_en || '';
      const description =
        productToEdit.description_uz ||
        productToEdit.description_ru ||
        productToEdit.description_en ||
        '';

      initialRef.current = { name, description };
      setFormData({
        category: productToEdit.category ?? firstCategoryId,
        name,
        name_ru: productToEdit.name_ru || '',
        name_en: productToEdit.name_en || '',
        description,
        description_ru: productToEdit.description_ru || '',
        description_en: productToEdit.description_en || '',
        price: productToEdit.price ?? '',
        // Nutrition used to be hard-coded to 0 here, silently wiping these values on
        // every edit. They are now round-tripped from the product being edited.
        portion_weight: productToEdit.portion_weight ?? 300,
        calories: productToEdit.calories ?? 0,
        protein: productToEdit.protein ?? 0,
        fat: productToEdit.fat ?? 0,
        carbs: productToEdit.carbs ?? 0,
        image_url: productToEdit.image_url || '',
        is_recommended: productToEdit.is_recommended ?? false,
        is_active: productToEdit.is_active ?? true,
      });
      setImagePreview(productToEdit.effective_image_url || productToEdit.image_url || null);
    } else {
      initialRef.current = { name: '', description: '' };
      setFormData({ ...EMPTY_FORM, category: firstCategoryId });
      setImagePreview(null);
    }

    setImageFile(null);
    setRemoveImage(false);
    setShowTranslations(false);
    setError(null);
  }, [productToEdit, isOpen]);

  useEffect(() => revokePreview, []);

  if (!isOpen) return null;

  const setField = (field) => (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError(t('admin.image_type_error'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t('admin.image_size_error', { max: MAX_IMAGE_BYTES / (1024 * 1024) }));
      return;
    }

    revokePreview();
    objectUrlRef.current = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(objectUrlRef.current);
    setRemoveImage(false);
    setError(null);
  };

  const handleClearImage = () => {
    revokePreview();
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(Boolean(productToEdit?.image));
    setFormData((prev) => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedName = formatTitleCase(formData.name);
    if (!formattedName) {
      setError(t('admin.name_required'));
      return;
    }
    const catId = formData.category || categoriesRef.current?.[0]?.id;
    if (!catId) {
      setError(t('admin.category_required'));
      return;
    }
    const price = Number(formData.price);
    if (formData.price === '' || Number.isNaN(price) || price < 0) {
      setError(t('admin.price_required'));
      return;
    }

    setLoading(true);
    setError(null);

    const payload = new FormData();
    payload.append('category', catId);
    payload.append('price', String(price));

    const numeric = {
      portion_weight: Math.max(0, Math.round(Number(formData.portion_weight) || 0)),
      calories: Math.max(0, Math.round(Number(formData.calories) || 0)),
      protein: Math.max(0, Number(formData.protein) || 0),
      fat: Math.max(0, Number(formData.fat) || 0),
      carbs: Math.max(0, Number(formData.carbs) || 0),
    };
    Object.entries(numeric).forEach(([key, value]) => payload.append(key, String(value)));

    payload.append('is_recommended', String(formData.is_recommended));
    payload.append('is_active', String(formData.is_active));

    // Names: only clear the other languages when the primary text changed, so a
    // manually corrected RU/EN translation survives an unrelated price edit.
    const manualRu = formData.name_ru.trim();
    const manualEn = formData.name_en.trim();
    const nameChanged = formattedName !== formatTitleCase(initialRef.current.name);

    payload.append('name_uz', formattedName);
    if (manualRu || manualEn) {
      payload.append('name_ru', manualRu);
      payload.append('name_en', manualEn);
    } else if (nameChanged || !productToEdit) {
      payload.append('name_ru', '');
      payload.append('name_en', '');
    }

    const description = formData.description.trim();
    const manualDescRu = formData.description_ru.trim();
    const manualDescEn = formData.description_en.trim();
    const descChanged = description !== (initialRef.current.description || '').trim();

    payload.append('description_uz', description);
    if (manualDescRu || manualDescEn) {
      payload.append('description_ru', manualDescRu);
      payload.append('description_en', manualDescEn);
    } else if (descChanged || !productToEdit) {
      payload.append('description_ru', '');
      payload.append('description_en', '');
    }

    if (imageFile) {
      payload.append('image', imageFile);
    } else if (removeImage) {
      payload.append('image', '');
    }
    // Always sent, so clearing the field actually removes the external link.
    payload.append('image_url', formData.image_url.trim());

    try {
      const saved = productToEdit
        ? await updateProduct(productToEdit.id, payload)
        : await createProduct(payload);
      onSaved?.(saved, Boolean(productToEdit));
      onClose();
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-mehmon-input text-mehmon-text text-sm px-3.5 py-2.5 rounded-xl border border-mehmon-border focus:border-mehmon-gold focus:outline-none shadow-inner';
  const labelClass = 'block text-xs font-semibold text-mehmon-gold mb-1.5';

  const nutritionFields = [
    { key: 'portion_weight', label: t('admin.portion_weight'), step: '10', unit: 'g' },
    { key: 'calories', label: t('admin.calories'), step: '10', unit: 'kcal' },
    { key: 'protein', label: t('admin.protein'), step: '0.1', unit: 'g' },
    { key: 'fat', label: t('admin.fat'), step: '0.1', unit: 'g' },
    { key: 'carbs', label: t('admin.carbs'), step: '0.1', unit: 'g' },
  ];

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
            className="mt-4 p-3 bg-red-950/20 border border-red-500/40 rounded-xl text-xs text-red-500 shrink-0"
          >
            {error}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 mt-4 space-y-5 flex-1">

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="product-category">
                {t('admin.category_select')} *
              </label>
              <select
                id="product-category"
                required
                value={formData.category}
                onChange={setField('category')}
                className={inputClass}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-mehmon-card text-mehmon-text">
                    {cat.name_uz || cat.name_ru || cat.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="product-price">
                {t('admin.price')} *
              </label>
              <input
                id="product-price"
                type="number"
                required
                min="0"
                step="500"
                value={formData.price}
                onChange={setField('price')}
                placeholder="68000"
                className={inputClass}
              />
            </div>
          </div>

          {/* Name & description (auto-translated) */}
          <div className="bg-mehmon-subtle p-4 rounded-xl border border-mehmon-border space-y-3">
            <div>
              <label className={labelClass} htmlFor="product-name">
                {t('admin.product_name')} *
              </label>
              <input
                id="product-name"
                type="text"
                required
                value={formData.name}
                onChange={setField('name')}
                onBlur={() => setFormData((prev) => ({ ...prev, name: formatTitleCase(prev.name) }))}
                placeholder="Masalan: To'y Oshi yoki Праздничный Плов"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="product-description">
                {t('admin.description')}
              </label>
              <textarea
                id="product-description"
                rows={3}
                value={formData.description}
                onChange={setField('description')}
                placeholder={t('admin.description_placeholder')}
                className={`${inputClass} resize-y`}
              />
            </div>

            <p className="text-[11px] text-mehmon-muted">
              ✨ {t('admin.auto_translate_hint')}
            </p>

            {/* Manual translation override */}
            <div className="pt-1">
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
                <div className="mt-3 space-y-3 border-t border-mehmon-border pt-3">
                  <p className="text-[11px] text-mehmon-muted">
                    {t('admin.manual_translation_hint')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} htmlFor="product-name-ru">RU</label>
                      <input
                        id="product-name-ru"
                        type="text"
                        value={formData.name_ru}
                        onChange={setField('name_ru')}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="product-name-en">EN</label>
                      <input
                        id="product-name-en"
                        type="text"
                        value={formData.name_en}
                        onChange={setField('name_en')}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} htmlFor="product-desc-ru">
                        {t('admin.description')} RU
                      </label>
                      <textarea
                        id="product-desc-ru"
                        rows={2}
                        value={formData.description_ru}
                        onChange={setField('description_ru')}
                        className={`${inputClass} resize-y`}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="product-desc-en">
                        {t('admin.description')} EN
                      </label>
                      <textarea
                        id="product-desc-en"
                        rows={2}
                        value={formData.description_en}
                        onChange={setField('description_en')}
                        className={`${inputClass} resize-y`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nutrition */}
          <div className="p-4 bg-mehmon-subtle rounded-xl border border-mehmon-border space-y-3">
            <p className="text-xs font-bold text-mehmon-gold uppercase tracking-wider">
              🥗 {t('admin.nutritional_value')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {nutritionFields.map(({ key, label, step, unit }) => (
                <div key={key}>
                  <label className="block text-[11px] text-mehmon-muted mb-1" htmlFor={`product-${key}`}>
                    {label} ({unit})
                  </label>
                  <input
                    id={`product-${key}`}
                    type="number"
                    min="0"
                    step={step}
                    value={formData[key]}
                    onChange={setField(key)}
                    className="w-full bg-mehmon-input text-mehmon-text text-sm px-3 py-2 rounded-lg border border-mehmon-border focus:border-mehmon-gold focus:outline-none shadow-inner"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Image upload & URL */}
          <div className="p-4 bg-mehmon-subtle rounded-xl border border-mehmon-border space-y-3">
            <p className="text-xs font-bold text-mehmon-gold uppercase tracking-wider">
              📷 {t('admin.image_upload')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="w-28 h-20 bg-mehmon-input rounded-xl border border-mehmon-border overflow-hidden flex items-center justify-center shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-mehmon-muted/40" />
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-mehmon-border hover:border-mehmon-gold rounded-xl cursor-pointer bg-mehmon-input text-center transition-colors">
                  <Upload className="w-5 h-5 text-mehmon-gold mb-1" />
                  <span className="text-xs text-mehmon-text font-medium">{t('admin.drag_image')}</span>
                  <input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {(imagePreview || formData.image_url) && (
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="w-full py-1.5 rounded-lg bg-mehmon-card hover:bg-red-500/15 text-rose-500 border border-mehmon-border hover:border-red-500/40 text-[11px] font-semibold transition-colors"
                  >
                    {t('admin.remove_image')}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-mehmon-muted mb-1" htmlFor="product-image-url">
                {t('admin.image_url')}
              </label>
              <input
                id="product-image-url"
                type="url"
                value={formData.image_url}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, image_url: value }));
                  if (!imageFile) setImagePreview(value || null);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-mehmon-input text-mehmon-text text-xs px-3 py-2 rounded-lg border border-mehmon-border focus:border-mehmon-gold shadow-inner"
              />
            </div>
          </div>

          {/* Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-mehmon-subtle border border-mehmon-border hover:border-mehmon-gold/40 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.is_recommended}
                onChange={setField('is_recommended')}
                className="w-4 h-4 rounded bg-mehmon-card border-mehmon-border focus:ring-0 accent-[#D4A359]"
              />
              <span className="text-xs font-semibold text-mehmon-text">
                ⭐ {t('admin.is_recommended')}
              </span>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-mehmon-subtle border border-mehmon-border hover:border-mehmon-gold/40 cursor-pointer transition-colors">
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{t('admin.save')}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
