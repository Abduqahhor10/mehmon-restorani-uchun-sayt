import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ShieldCheck } from 'lucide-react';

export default function AdminHeader() {
  const { t, i18n } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages = [
    { code: 'uz', label: 'UZ', full: 'O\'zbekcha' },
    { code: 'ru', label: 'RU', full: 'Русский' },
    { code: 'en', label: 'EN', full: 'English' }
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('mehmon_admin_lang', code);
    setLangMenuOpen(false);
  };

  const getLogoSrc = () => {
    if (i18n.language === 'ru') return '/logo_ru.png';
    if (i18n.language === 'en') return '/logo_en.png';
    return '/logo_uz.png';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#16120F]/95 backdrop-blur-md border-b border-[#3D332B] h-20 flex items-center px-4 sm:px-6 lg:px-8">
      <div className="w-full flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo - Transparent & Dynamic by Language */}
        <div className="flex items-center gap-3 cursor-pointer select-none">
          <img
            src={getLogoSrc()}
            alt="Mehmon Restaurant"
            className="h-12 sm:h-13 w-auto object-contain hover:opacity-90 transition-opacity"
          />
          <div className="hidden sm:flex flex-col border-l border-[#3D332B] pl-3 py-1">
            <span className="text-[10px] tracking-[0.25em] font-bold text-[#D4A359] uppercase">
              ADMIN PORTAL
            </span>
          </div>
        </div>

        {/* Middle: Welcome Admin Banner */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2B231D] border border-[#3D332B] shadow-inner">
          <ShieldCheck className="w-4 h-4 text-[#D4A359]" />
          <span className="text-sm font-medium text-[#F5EBE0]">
            {t('admin.welcome')}
          </span>
        </div>

        {/* Right: 3-Language Selector */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-2 bg-[#2B231D] hover:bg-[#352C25] text-[#F5EBE0] px-3.5 py-2 rounded-full border border-[#3D332B] hover:border-[#D4A359]/60 transition-all text-xs font-semibold"
          >
            <Globe className="w-4 h-4 text-[#D4A359]" />
            <span>{currentLang.label}</span>
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-[#2B231D] border border-[#3D332B] rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between transition-colors ${
                    i18n.language === lang.code
                      ? 'bg-[#D4A359]/20 text-[#D4A359] font-bold'
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
    </header>
  );
}
