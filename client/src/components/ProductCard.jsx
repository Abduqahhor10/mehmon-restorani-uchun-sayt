import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const [imgError, setImgError] = useState(false);

  // Multilingual helper
  const getLocalized = (fieldUz, fieldRu, fieldEn) => {
    const lang = (i18n.language || 'uz').toLowerCase();
    if (lang.startsWith('ru')) return fieldRu || fieldUz || fieldEn;
    if (lang.startsWith('en')) return fieldEn || fieldUz || fieldRu;
    return fieldUz || fieldRu || fieldEn;
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
    <div className={`bg-mehmon-card rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col group hover:shadow-card-custom ${
      product.is_recommended
        ? 'border-mehmon-gold/70 shadow-gold-glow'
        : 'border-mehmon-border hover:border-mehmon-gold/50'
    }`}>
      
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-mehmon-subtle">
        <img
          src={imageUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Category Pill Overlay */}
        {categoryName && (
          <div className="absolute top-3 left-3 bg-mehmon-dark/85 backdrop-blur-md px-3 py-1 rounded-full border border-mehmon-gold/30 text-[11px] font-semibold text-mehmon-gold tracking-wide shadow-sm">
            {categoryName}
          </div>
        )}

        {/* Recommended Badge Overlay */}
        {product.is_recommended && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-[#D4A359] to-[#B8863B] text-[#1F1915] font-black text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
            <span>⭐</span>
            <span>{t('nav.recommended')}</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Price Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-serif font-bold text-lg text-mehmon-text group-hover:text-mehmon-gold transition-colors leading-snug">
              {name}
            </h3>
          </div>

          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="font-sans font-bold text-xl text-mehmon-gold">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-mehmon-muted font-medium uppercase">
              {t('nav.price_currency')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
