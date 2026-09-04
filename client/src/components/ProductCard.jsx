import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

export default function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsId = useId();

  // The stored translations are the source of truth. A hard-coded client-side
  // dictionary used to override them here, so a name corrected in the admin panel
  // was silently replaced by the dictionary entry on every render.
  const getLocalized = (fieldUz, fieldRu, fieldEn) => {
    const lang = (i18n.language || 'uz').toLowerCase();
    if (lang.startsWith('ru')) return fieldRu || fieldUz || fieldEn;
    if (lang.startsWith('en')) return fieldEn || fieldUz || fieldRu;
    return fieldUz || fieldRu || fieldEn;
  };

  const name = getLocalized(product.name_uz, product.name_ru, product.name_en);
  const description = getLocalized(
    product.description_uz,
    product.description_ru,
    product.description_en
  );
  const categoryName = getLocalized(
    product.category_name_uz,
    product.category_name_ru,
    product.category_name_en
  );

  const formatPrice = (price) => Number(price || 0).toLocaleString('uz-UZ');

  const formatMacro = (value) => {
    const num = Number(value || 0);
    return Number.isInteger(num) ? String(num) : num.toFixed(1);
  };

  const rawImage = product.effective_image_url || product.image_url;
  const imageUrl = !imgError && rawImage ? rawImage : FALLBACK_IMAGE;

  const macros = [
    { key: 'portion', label: t('nav.portion'), value: `${product.portion_weight ?? 0} g` },
    { key: 'calories', label: t('nav.calories'), value: `${product.calories ?? 0} kcal` },
    { key: 'protein', label: t('nav.protein'), value: `${formatMacro(product.protein)} g` },
    { key: 'fat', label: t('nav.fat'), value: `${formatMacro(product.fat)} g` },
    { key: 'carbs', label: t('nav.carbs'), value: `${formatMacro(product.carbs)} g` },
  ];

  // Only offer the drawer when there is something worth revealing.
  const hasNutrition = macros.some((macro) => parseFloat(macro.value) > 0);
  const hasDetails = Boolean(description) || hasNutrition;

  return (
    <div
      className={`bg-mehmon-card rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col group hover:shadow-card-custom ${
        product.is_recommended
          ? 'border-mehmon-gold/70 shadow-gold-glow'
          : 'border-mehmon-border hover:border-mehmon-gold/50'
      }`}
    >

      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-mehmon-subtle">
        <img
          src={imageUrl}
          alt={name || ''}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {categoryName && (
          <div className="absolute top-3 left-3 bg-mehmon-dark/85 backdrop-blur-md px-3 py-1 rounded-full border border-mehmon-gold/30 text-[11px] font-semibold text-mehmon-gold tracking-wide shadow-sm">
            {categoryName}
          </div>
        )}

        {product.is_recommended && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-[#D4A359] to-[#B8863B] text-[#1F1915] font-black text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
            <span aria-hidden="true">⭐</span>
            <span>{t('nav.recommended')}</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-serif font-bold text-lg text-mehmon-text group-hover:text-mehmon-gold transition-colors leading-snug mb-2">
          {name}
        </h3>

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="font-sans font-bold text-xl text-mehmon-gold">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs text-mehmon-muted font-medium uppercase">
            {t('nav.price_currency')}
          </span>
        </div>

        {description && (
          <p
            className={`text-xs text-mehmon-muted leading-relaxed mb-3 ${
              detailsOpen ? '' : 'line-clamp-2'
            }`}
          >
            {description}
          </p>
        )}

        {hasDetails && (
          <div className="mt-auto pt-2">
            <button
              type="button"
              onClick={() => setDetailsOpen((prev) => !prev)}
              aria-expanded={detailsOpen}
              aria-controls={detailsId}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-mehmon-gold hover:opacity-80 transition-opacity"
            >
              <span>{detailsOpen ? t('nav.hide_details') : t('nav.details')}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  detailsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {detailsOpen && hasNutrition && (
              <div
                id={detailsId}
                className="mt-3 rounded-xl border border-mehmon-border bg-mehmon-subtle p-3"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-mehmon-gold mb-2">
                  {t('nav.nutritional_value')}
                </p>
                <dl className="grid grid-cols-3 gap-x-3 gap-y-2">
                  {macros.map((macro) => (
                    <div key={macro.key}>
                      <dt className="text-[10px] text-mehmon-muted">{macro.label}</dt>
                      <dd className="text-xs font-semibold text-mehmon-text">{macro.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
