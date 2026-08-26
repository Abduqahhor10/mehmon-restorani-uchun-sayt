import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Globe, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Header({ searchQuery, setSearchQuery }) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, isLight } = useTheme();
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
    <header className="sticky top-0 z-40 bg-mehmon-bg/95 backdrop-blur-md border-b border-mehmon-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-4">
          
          {/* Brand Logo - Transparent & Dynamic by Language */}
          <div
            className="flex items-center cursor-pointer select-none shrink-0"
            onClick={() => { setSearchQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <img
              src={getLogoSrc()}
              alt="Mehmon Restaurant"
              className="h-11 sm:h-14 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </div>

          {/* Integrated Search Bar */}
          <div className={`relative flex-1 max-w-md transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-mehmon-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder={t('nav.search_placeholder')}
                className="w-full bg-mehmon-input text-mehmon-text text-sm pl-10 pr-9 py-2.5 rounded-full border border-mehmon-border focus:outline-none focus:border-mehmon-gold focus:ring-1 focus:ring-mehmon-gold placeholder-mehmon-muted/70 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-mehmon-muted hover:text-mehmon-gold transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Controls: Theme Switcher & Language Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Day / Night Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all duration-300 text-xs font-semibold ${
                isLight
                  ? 'bg-mehmon-card text-mehmon-gold border-mehmon-border hover:border-mehmon-gold shadow-sm'
                  : 'bg-mehmon-card text-[#D4A359] border-mehmon-border hover:border-[#D4A359]/60'
              }`}
              title={isLight ? t('nav.theme_night') : t('nav.theme_day')}
              aria-label="Toggle theme mode"
            >
              {isLight ? (
                <>
                  <Sun className="w-4 h-4 text-amber-600 animate-in spin-in-180 duration-300" />
                  <span className="hidden sm:inline text-[11px] font-medium text-mehmon-gold">
                    {t('nav.theme_day')}
                  </span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#D4A359] animate-in zoom-in-75 duration-300" />
                  <span className="hidden sm:inline text-[11px] font-medium text-[#D4A359]">
                    {t('nav.theme_night')}
                  </span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 bg-mehmon-card hover:bg-mehmon-card-hover text-mehmon-text px-3 py-2 rounded-full border border-mehmon-border hover:border-mehmon-gold transition-all text-xs font-semibold tracking-wider"
                aria-label="Language selector"
              >
                <Globe className="w-3.5 h-3.5 text-mehmon-gold" />
                <span>{currentLang.label}</span>
              </button>

              {langMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-36 bg-mehmon-card border border-mehmon-border rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between transition-colors ${
                        i18n.language === lang.code
                          ? 'bg-mehmon-gold/15 text-mehmon-gold font-bold'
                          : 'text-mehmon-text hover:bg-mehmon-card-hover hover:text-mehmon-gold'
                      }`}
                    >
                      <span>{lang.full}</span>
                      <span className="text-[10px] text-mehmon-muted">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
