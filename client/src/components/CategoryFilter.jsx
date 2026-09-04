import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

export default function CategoryFilter({ categories, activeCategoryId, onSelectCategory }) {
  const { t, i18n } = useTranslation();

  const getCategoryName = (cat) => {
    if (!cat) return '';
    const lang = (i18n.language || 'uz').toLowerCase();
    if (lang.startsWith('ru') && cat.name_ru) return cat.name_ru;
    if (lang.startsWith('en') && cat.name_en) return cat.name_en;
    return cat.name_uz || cat.name_ru || cat.name_en;
  };

  // Categories arrive already ordered by sort_order, which is what the restaurant
  // set in the admin panel. Re-sorting alphabetically here put desserts before soups.

  return (
    <div className="py-2 overflow-x-auto no-scrollbar scroll-smooth">
      <div className="flex items-center gap-2.5 min-w-max px-1">
        {/* All Categories Option */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
            activeCategoryId === null
              ? 'bg-gradient-to-r from-[#D4A359] to-[#B8863B] text-[#1F1915] font-bold shadow-[0_4px_15px_rgba(212,163,89,0.35)] scale-[1.03]'
              : 'bg-mehmon-card text-mehmon-text/85 hover:text-mehmon-gold hover:bg-mehmon-card-hover border border-mehmon-border'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('nav.all_categories')}</span>
        </button>

        {/* Dynamic Alphabetically Sorted Category List */}
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#D4A359] to-[#B8863B] text-[#1F1915] font-bold shadow-[0_4px_15px_rgba(212,163,89,0.35)] scale-[1.03]'
                  : 'bg-mehmon-card text-mehmon-text/85 hover:text-mehmon-gold hover:bg-mehmon-card-hover border border-mehmon-border'
              }`}
            >
              {getCategoryName(cat)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
