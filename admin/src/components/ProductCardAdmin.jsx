import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Copy, Trash2, CheckCircle2, XCircle, Loader2, Check } from 'lucide-react';
import { duplicateProduct, deleteProduct } from '../services/api';

export default function ProductCardAdmin({
  product,
  onEdit,
  onRefresh,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
  onDeleteSingle,
}) {
  const { t, i18n } = useTranslation();
  const [loadingAction, setLoadingAction] = useState(false);
  const [imgError, setImgError] = useState(false);

  const FOOD_FALLBACKS = {
    'чечевичный суп': { uz: "Yasmiq sho'rva", ru: "Чечевичный суп", en: "Lentil Soup" },
    'yasmiq sho\'rva': { uz: "Yasmiq sho'rva", ru: "Чечевичный суп", en: "Lentil Soup" },
    'lentil soup': { uz: "Yasmiq sho'rva", ru: "Чечевичный суп", en: "Lentil Soup" },
    'плов': { uz: "Osh", ru: "Плов", en: "Pilaf" },
    'osh': { uz: "Osh", ru: "Плов", en: "Pilaf" },
    'суп': { uz: "Sho'rva", ru: "Суп", en: "Soup" },
    'sho\'rva': { uz: "Sho'rva", ru: "Суп", en: "Soup" },
    'лагман': { uz: "Lag'mon", ru: "Лагман", en: "Lagman" },
    'lag\'mon': { uz: "Lag'mon", ru: "Лагман", en: "Lagman" },
    'шашлык': { uz: "Shashlik", ru: "Шашлык", en: "Kebab" },
    'shashlik': { uz: "Shashlik", ru: "Шашлык", en: "Kebab" },
    'салат': { uz: "Salat", ru: "Салат", en: "Salad" },
    'salat': { uz: "Salat", ru: "Салат", en: "Salad" },
    'манты': { uz: "Manti", ru: "Манты", en: "Mantu" },
    'manti': { uz: "Manti", ru: "Манты", en: "Mantu" },
    'самса': { uz: "Somsa", ru: "Самса", en: "Samosa" },
    'somsa': { uz: "Somsa", ru: "Самса", en: "Samosa" },
  };

  const getLocalized = (uz, ru, en) => {
    const lang = (i18n.language || 'uz').toLowerCase();
    
    // Check fallback dictionary
    const key = (uz || ru || en || '').toLowerCase().trim();
    if (FOOD_FALLBACKS[key]) {
      if (lang.startsWith('ru')) return FOOD_FALLBACKS[key].ru;
      if (lang.startsWith('en')) return FOOD_FALLBACKS[key].en;
      return FOOD_FALLBACKS[key].uz;
    }

    if (lang.startsWith('ru')) return ru || uz || en;
    if (lang.startsWith('en')) return en || uz || ru;
    return uz || ru || en;
  };

  const name = getLocalized(product.name_uz, product.name_ru, product.name_en);
  const catName = getLocalized(product.category_name_uz, product.category_name_ru, product.category_name_en);

  const handleDuplicate = async (e) => {
    e.stopPropagation();
    setLoadingAction(true);
    try {
      await duplicateProduct(product.id);
      onRefresh();
    } catch (err) {
      alert('Nusxa olishda xatolik: ' + err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (onDeleteSingle) {
      onDeleteSingle(product);
    } else {
      if (window.confirm(t('admin.confirm_delete_product'))) {
        setLoadingAction(true);
        try {
          await deleteProduct(product.id);
          onRefresh();
        } catch (err) {
          alert('O\'chirishda xatolik: ' + err.message);
        } finally {
          setLoadingAction(false);
        }
      }
    }
  };

  const imageUrl = (!imgError && (product.effective_image_url || product.image || product.image_url))
    ? (product.effective_image_url || product.image || product.image_url)
    : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      onClick={isSelectionMode ? () => onToggleSelect(product.id) : undefined}
      className={`bg-mehmon-card rounded-2xl overflow-hidden border shadow-card-custom transition-all duration-200 flex flex-col justify-between group ${
        isSelectionMode ? 'cursor-pointer select-none' : ''
      } ${
        isSelected
          ? 'border-mehmon-gold ring-2 ring-mehmon-gold shadow-gold-glow scale-[1.01]'
          : 'border-mehmon-border hover:border-mehmon-gold/50'
      }`}
    >
      <div>
        {/* Image & Status Badge */}
        <div className="relative aspect-[16/10] bg-mehmon-subtle overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Selection Checkbox Overlay */}
          {isSelectionMode && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all shadow-md ${
                  isSelected
                    ? 'bg-mehmon-gold border-mehmon-gold text-[#1F1915]'
                    : 'bg-black/60 border-white/80 text-transparent'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          )}
          
          <div className={`absolute top-2.5 ${isSelectionMode ? 'left-11' : 'left-2.5'} flex flex-wrap items-center gap-1.5 transition-all`}>
            {product.is_recommended && (
              <span className="bg-gradient-to-r from-[#D4A359] to-[#B8863B] text-[#1F1915] font-black text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                ⭐ {t('admin.recommended_badge')}
              </span>
            )}
            {catName && (
              <span className="bg-mehmon-sidebar/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-mehmon-gold/30 text-[10px] font-bold text-mehmon-gold shadow-sm">
                {catName}
              </span>
            )}
          </div>

          <div className="absolute top-2.5 right-2.5">
            {product.is_active ? (
              <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{t('admin.active')}</span>
              </span>
            ) : (
              <span className="bg-rose-950/80 text-rose-300 border border-rose-700/60 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                <span>{t('admin.inactive')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="font-serif font-bold text-base text-mehmon-text mb-1 line-clamp-1">
            {name}
          </h4>
          
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-mehmon-gold font-bold text-lg font-sans">
              {Number(product.price).toLocaleString()} UZS
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Edit, Duplicate, Delete (Hidden in Selection Mode) */}
      {!isSelectionMode && (
        <div className="p-3 bg-mehmon-subtle/70 border-t border-mehmon-border flex items-center justify-between gap-2 mt-2">
          
          {/* Edit Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
            disabled={loadingAction}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-mehmon-card hover:bg-mehmon-card-hover text-mehmon-text hover:text-mehmon-gold border border-mehmon-border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            title={t('admin.edit')}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{t('admin.edit')}</span>
          </button>

          {/* Duplicate Button */}
          <button
            onClick={handleDuplicate}
            disabled={loadingAction}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-mehmon-card hover:bg-mehmon-card-hover text-mehmon-gold border border-mehmon-border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            title={t('admin.duplicate')}
          >
            {loadingAction ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{t('admin.duplicate')}</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={loadingAction}
            className="py-1.5 px-2.5 rounded-lg bg-mehmon-card hover:bg-red-500/15 text-rose-500 border border-mehmon-border hover:border-red-500/40 text-xs font-semibold flex items-center justify-center transition-colors shadow-sm"
            title={t('admin.delete')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

        </div>
      )}

      {/* When in selection mode, show a small click hint bar */}
      {isSelectionMode && (
        <div className={`p-2.5 text-center text-xs font-semibold border-t transition-colors ${
          isSelected
            ? 'bg-mehmon-gold/15 text-mehmon-gold border-mehmon-gold/40'
            : 'bg-mehmon-subtle/50 text-mehmon-muted border-mehmon-border'
        }`}>
          {isSelected ? 'Tanlangan ✓' : 'Tanlash uchun bosing'}
        </div>
      )}

    </div>
  );
}
