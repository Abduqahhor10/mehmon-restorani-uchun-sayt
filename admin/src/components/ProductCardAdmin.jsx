import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Copy, Trash2, Flame, Scale, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { duplicateProduct, deleteProduct } from '../services/api';

export default function ProductCardAdmin({ product, onEdit, onRefresh }) {
  const { t, i18n } = useTranslation();
  const [loadingAction, setLoadingAction] = useState(false);
  const [imgError, setImgError] = useState(false);

  const getLocalized = (uz, ru, en) => {
    const lang = i18n.language;
    if (lang === 'ru' && ru) return ru;
    if (lang === 'en' && en) return en;
    return uz || en || ru;
  };

  const name = getLocalized(product.name_uz, product.name_ru, product.name_en);
  const desc = getLocalized(product.description_uz, product.description_ru, product.description_en);
  const catName = getLocalized(product.category_name_uz, product.category_name_ru, product.category_name_en);

  const handleDuplicate = async () => {
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

  const handleDelete = async () => {
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
  };

  const imageUrl = (!imgError && (product.effective_image_url || product.image || product.image_url))
    ? (product.effective_image_url || product.image || product.image_url)
    : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-[#2B231D] rounded-2xl overflow-hidden border border-[#3D332B] hover:border-[#D4A359]/40 transition-all duration-200 flex flex-col justify-between group">
      
      <div>
        {/* Image & Status Badge */}
        <div className="relative aspect-[16/10] bg-[#1F1915] overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            {catName && (
              <span className="bg-[#1F1915]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#D4A359]/30 text-[10px] font-bold text-[#D4A359]">
                {catName}
              </span>
            )}
          </div>

          <div className="absolute top-2.5 right-2.5">
            {product.is_active ? (
              <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{t('admin.active')}</span>
              </span>
            ) : (
              <span className="bg-rose-950/90 text-rose-300 border border-rose-700/60 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                <span>{t('admin.inactive')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="font-serif font-bold text-base text-[#F5EBE0] mb-1 line-clamp-1">
            {name}
          </h4>
          
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-[#D4A359] font-bold text-lg font-sans">
              {Number(product.price).toLocaleString()} UZS
            </span>
            <span className="text-xs text-[#A89F91] flex items-center gap-1">
              <Scale className="w-3 h-3 text-[#D4A359]" />
              {product.portion_weight}g
            </span>
          </div>

          {/* Quick Nutritional Chips */}
          <div className="grid grid-cols-4 gap-1 text-[10px] bg-[#1F1915] p-2 rounded-xl border border-[#3D332B] text-center mb-3">
            <div>
              <span className="text-[#A89F91] block">kcal</span>
              <span className="font-bold text-[#D4A359]">{product.calories || 0}</span>
            </div>
            <div>
              <span className="text-[#A89F91] block">Oqsil</span>
              <span className="font-semibold text-[#F5EBE0]">{product.protein || 0}g</span>
            </div>
            <div>
              <span className="text-[#A89F91] block">Yog'</span>
              <span className="font-semibold text-[#F5EBE0]">{product.fat || 0}g</span>
            </div>
            <div>
              <span className="text-[#A89F91] block">Uglevod</span>
              <span className="font-semibold text-[#F5EBE0]">{product.carbs || 0}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: Edit, Duplicate, Delete */}
      <div className="p-3 bg-[#1F1915]/60 border-t border-[#3D332B] flex items-center justify-between gap-2">
        
        {/* Edit Button */}
        <button
          onClick={() => onEdit(product)}
          disabled={loadingAction}
          className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#2B231D] hover:bg-[#352C25] text-[#F5EBE0] hover:text-[#D4A359] border border-[#3D332B] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          title={t('admin.edit')}
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{t('admin.edit')}</span>
        </button>

        {/* Duplicate Button */}
        <button
          onClick={handleDuplicate}
          disabled={loadingAction}
          className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#2B231D] hover:bg-[#352C25] text-[#D4A359] border border-[#3D332B] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
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
          className="py-1.5 px-2.5 rounded-lg bg-[#2B231D] hover:bg-red-950/70 text-rose-400 border border-[#3D332B] hover:border-red-800 text-xs font-semibold flex items-center justify-center transition-colors"
          title={t('admin.delete')}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

      </div>

    </div>
  );
}
