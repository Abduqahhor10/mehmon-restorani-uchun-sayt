import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Globe, X } from 'lucide-react';

export default function Header({ searchQuery, setSearchQuery }) {
  const { t, i18n } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const languages = [
    { code: 'uz', label: 'UZ', full: 'O\'zbekcha' },
    { code: 'ru', label: 'RU', full: 'Русский' },
    { code: 'en', label: 'EN', full: 'English' }
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('mehmon_lang', code);
    setLangMenuOpen(false);
  };

  // Dynamic logo based on active language
  const getLogoSrc = () => {
    if (i18n.language === 'ru') return '/logo_ru.png';
    if (i18n.language === 'en') return '/logo_en.png';
    return '/logo_uz.png';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1F1915]/95 backdrop-blur-md border-b border-[#3D332B]/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo - Transparent & Dynamic by Language */}
          <div
            className="flex items-center cursor-pointer select-none shrink-0"
            onClick={() => { setSearchQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <img
              src={getLogoSrc()}
              alt="Mehmon Restaurant"
              className="h-12 sm:h-14 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </div>

          {/* Integrated Search Bar */}
          <div className={`relative flex-1 max-w-md transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-[#A89F91] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder={t('nav.search_placeholder')}
                className="w-full bg-[#2B231D] text-[#F5EBE0] text-sm pl-10 pr-9 py-2.5 rounded-full border border-[#3D332B] focus:outline-none focus:border-[#D4A359] focus:ring-1 focus:ring-[#D4A359] placeholder-[#A89F91]/70 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-[#A89F91] hover:text-[#D4A359] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Language Switcher */}
          <div className="relative shrink-0">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 bg-[#2B231D] hover:bg-[#352C25] text-[#F5EBE0] px-3 py-2 rounded-full border border-[#3D332B] hover:border-[#D4A359]/60 transition-all text-xs font-semibold tracking-wider"
              aria-label="Language selector"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>{currentLang.label}</span>
            </button>

            {langMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-36 bg-[#2B231D] border border-[#3D332B] rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between transition-colors ${
                      i18n.language === lang.code
                        ? 'bg-[#D4A359]/15 text-[#D4A359] font-bold'
                        : 'text-[#F5EBE0] hover:bg-[#352C25] hover:text-[#D4A359]'
                    }`}
                  >
                    <span>{lang.full}</span>
                    <span className="text-[10px] text-[#A89F91]">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
