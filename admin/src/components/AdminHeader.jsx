import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, LogOut, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function AdminHeader() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, isLight } = useTheme();
  const { user, logout } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  // Close the language dropdown on an outside click or Escape; it used to stay
  // open until the user happened to click the toggle again.
  useEffect(() => {
    if (!langMenuOpen) return undefined;
    const handlePointerDown = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setLangMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [langMenuOpen]);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

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
    <header className="sticky top-0 z-40 bg-mehmon-sidebar border-b border-mehmon-border h-20 flex items-center px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="w-full flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo - Transparent & Dynamic by Language */}
        <div className="flex items-center gap-3 cursor-pointer select-none">
          <img
            src={getLogoSrc()}
            alt="Mehmon Restaurant"
            className="h-11 sm:h-13 w-auto object-contain hover:opacity-90 transition-opacity"
          />
          <div className="hidden sm:flex flex-col border-l border-mehmon-border pl-3 py-1">
            <span className="text-[10px] tracking-[0.25em] font-bold text-mehmon-gold uppercase">
              ADMIN PORTAL
            </span>
          </div>
        </div>

        {/* Middle: Welcome Admin Banner */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-mehmon-card border border-mehmon-border shadow-inner">
          <ShieldCheck className="w-4 h-4 text-mehmon-gold" />
          <span className="text-sm font-medium text-mehmon-text">
            {user?.username ? t('admin.welcome_user', { username: user.username }) : t('admin.welcome')}
          </span>
        </div>

        {/* Right: Theme Switcher & 3-Language Selector */}
        <div className="flex items-center gap-2">
          
          {/* Day / Night Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all duration-300 text-xs font-semibold ${
              isLight
                ? 'bg-mehmon-card text-mehmon-gold border-mehmon-border hover:border-mehmon-gold shadow-sm'
                : 'bg-mehmon-card text-[#D4A359] border-mehmon-border hover:border-[#D4A359]/60'
            }`}
            title={isLight ? t('admin.theme_night') : t('admin.theme_day')}
            aria-label="Toggle theme mode"
          >
            {isLight ? (
              <>
                <Sun className="w-4 h-4 text-amber-600 animate-in spin-in-180 duration-300" />
                <span className="hidden sm:inline text-[11px] font-medium text-mehmon-gold">
                  {t('admin.theme_day')}
                </span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#D4A359] animate-in zoom-in-75 duration-300" />
                <span className="hidden sm:inline text-[11px] font-medium text-[#D4A359]">
                  {t('admin.theme_night')}
                </span>
              </>
            )}
          </button>

          {/* Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              aria-haspopup="listbox"
              aria-expanded={langMenuOpen}
              className="flex items-center gap-2 bg-mehmon-card hover:bg-mehmon-card-hover text-mehmon-text px-3.5 py-2 rounded-full border border-mehmon-border hover:border-mehmon-gold transition-all text-xs font-semibold"
            >
              <Globe className="w-4 h-4 text-mehmon-gold" />
              <span>{currentLang.label}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-mehmon-card border border-mehmon-border rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between transition-colors ${
                      i18n.language === lang.code
                        ? 'bg-mehmon-gold/20 text-mehmon-gold font-bold'
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

          {/* Sign out */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title={t('auth.sign_out')}
            aria-label={t('auth.sign_out')}
            className="flex items-center gap-1.5 bg-mehmon-card hover:bg-red-500/15 text-rose-500 px-3 py-2 rounded-full border border-mehmon-border hover:border-red-500/40 transition-all text-xs font-semibold disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t('auth.sign_out')}</span>
          </button>

        </div>

      </div>
    </header>
  );
}
