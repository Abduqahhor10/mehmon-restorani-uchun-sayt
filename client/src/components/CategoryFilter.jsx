import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

export default function CategoryFilter({ categories, activeCategoryId, onSelectCategory }) {
  const { t, i18n } = useTranslation();

  const getCategoryName = (cat) => {
    if (!cat) return '';
    const lang = i18n.language;
    if (lang === 'ru' && cat.name_ru) return cat.name_ru;
    if (lang === 'en' && cat.name_en) return cat.name_en;
    return cat.name_uz || cat.name_en || cat.name_ru;
  };

  return (
    <div className="py-4 overflow-x-auto no-scrollbar scroll-smooth">
      <div className="flex items-center gap-2.5 min-w-max px-1">
        {/* All Categories Option */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
            activeCategoryId === null
              ? 'bg-[#D4A359] text-[#1F1915] font-bold shadow-[0_0_15px_rgba(212,163,89,0.35)] scale-[1.03]'
              : 'bg-[#2B231D] text-[#F5EBE0]/85 hover:text-[#D4A359] hover:bg-[#352C25] border border-[#3D332B]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('nav.all_categories')}</span>
        </button>

        {/* Dynamic Category List */}
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-[#D4A359] text-[#1F1915] font-bold shadow-[0_0_15px_rgba(212,163,89,0.35)] scale-[1.03]'
                  : 'bg-[#2B231D] text-[#F5EBE0]/85 hover:text-[#D4A359] hover:bg-[#352C25] border border-[#3D332B]'
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
