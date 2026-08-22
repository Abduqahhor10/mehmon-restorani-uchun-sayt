import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Flame, Scale, Activity, ShieldAlert } from 'lucide-react';

export default function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Multilingual helper
  const getLocalized = (fieldUz, fieldRu, fieldEn) => {
    const lang = i18n.language;
    if (lang === 'ru' && fieldRu) return fieldRu;
    if (lang === 'en' && fieldEn) return fieldEn;
    return fieldUz || fieldEn || fieldRu;
  };

  const name = getLocalized(product.name_uz, product.name_ru, product.name_en);
  const description = getLocalized(product.description_uz, product.description_ru, product.description_en);
  const categoryName = getLocalized(product.category_name_uz, product.category_name_ru, product.category_name_en);

  // Format currency with spaces
  const formatPrice = (price) => {
    if (!price) return '0';
    return Number(price).toLocaleString('uz-UZ');
  };

  const imageUrl = (!imgError && (product.effective_image_url || product.image || product.image_url))
    ? (product.effective_image_url || product.image || product.image_url)
    : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-[#2B231D] rounded-2xl overflow-hidden border border-[#3D332B] hover:border-[#D4A359]/50 transition-all duration-300 flex flex-col group hover:shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
      
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#1F1915]">
        <img
          src={imageUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Category Pill Overlay */}
        {categoryName && (
          <div className="absolute top-3 left-3 bg-[#1F1915]/85 backdrop-blur-md px-3 py-1 rounded-full border border-[#D4A359]/30 text-[11px] font-semibold text-[#D4A359] tracking-wide">
            {categoryName}
          </div>
        )}

        {/* Portion Badge Overlay */}
        {product.portion_weight > 0 && (
          <div className="absolute bottom-3 right-3 bg-[#1F1915]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#3D332B] text-[11px] font-medium text-[#F5EBE0] flex items-center gap-1 shadow-md">
            <Scale className="w-3 h-3 text-[#D4A359]" />
            <span>{product.portion_weight} g</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Price Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-serif font-bold text-lg text-[#F5EBE0] group-hover:text-[#D4A359] transition-colors leading-snug">
              {name}
            </h3>
          </div>

          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="font-sans font-bold text-xl text-[#D4A359]">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-[#A89F91] font-medium uppercase">
              {t('nav.price_currency')}
            </span>
          </div>

          {/* Short Description preview */}
          {description && (
            <p className="text-xs text-[#A89F91] leading-relaxed line-clamp-2 mb-4">
              {description}
            </p>
          )}
        </div>

        {/* Details Toggle Button */}
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2 px-3 rounded-xl bg-[#1F1915]/60 hover:bg-[#1F1915] border border-[#3D332B] hover:border-[#D4A359]/40 text-xs font-semibold text-[#F5EBE0] flex items-center justify-between transition-all"
            aria-expanded={isExpanded}
          >
            <span className="flex items-center gap-1.5 text-[#D4A359]">
              <Flame className="w-3.5 h-3.5" />
              <span>{isExpanded ? t('nav.hide_details') : t('nav.nutritional_value')}</span>
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#A89F91]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#A89F91]" />
            )}
          </button>

          {/* Collapsible Nutritional Details Section */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-[#3D332B]/80 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Full Description if expanded */}
              {description && (
                <p className="text-xs text-[#F5EBE0]/90 mb-3 bg-[#1F1915]/40 p-2.5 rounded-lg border border-[#3D332B]/40 leading-relaxed">
                  {description}
                </p>
              )}

              {/* Nutrition Grid */}
              <div className="grid grid-cols-4 gap-2 text-center bg-[#1F1915] p-2.5 rounded-xl border border-[#3D332B]">
                {/* Calories */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-[#A89F91] font-medium">{t('nav.calories')}</span>
                  <span className="text-xs font-bold text-[#D4A359] mt-0.5">
                    {product.calories || 0}
                  </span>
                  <span className="text-[9px] text-[#A89F91]">kcal</span>
                </div>

                {/* Protein */}
                <div className="flex flex-col items-center border-l border-[#3D332B]">
                  <span className="text-[10px] text-[#A89F91] font-medium">{t('nav.protein')}</span>
                  <span className="text-xs font-bold text-[#F5EBE0] mt-0.5">
                    {product.protein || 0}g
                  </span>
                </div>

                {/* Fat */}
                <div className="flex flex-col items-center border-l border-[#3D332B]">
                  <span className="text-[10px] text-[#A89F91] font-medium">{t('nav.fat')}</span>
                  <span className="text-xs font-bold text-[#F5EBE0] mt-0.5">
                    {product.fat || 0}g
                  </span>
                </div>

                {/* Carbs */}
                <div className="flex flex-col items-center border-l border-[#3D332B]">
                  <span className="text-[10px] text-[#A89F91] font-medium">{t('nav.carbs')}</span>
                  <span className="text-xs font-bold text-[#F5EBE0] mt-0.5">
                    {product.carbs || 0}g
                  </span>
                </div>
              </div>

              {/* Portion note */}
              <div className="mt-2 flex items-center justify-between text-[10px] text-[#A89F91] px-1">
                <span>{t('nav.portion')}:</span>
                <span className="font-semibold text-[#F5EBE0]">{product.portion_weight || 0} gramm</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
