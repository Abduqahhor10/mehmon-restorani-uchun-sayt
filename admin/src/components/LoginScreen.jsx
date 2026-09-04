import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, Lock, LogIn, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { describeApiError } from '../services/api';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login, sessionExpired } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError(t('auth.fill_all_fields'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(describeApiError(err, t('auth.login_failed')));
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-mehmon-bg text-mehmon-text transition-colors duration-300">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <img
            src="/logo_uz.png"
            alt="Mehmon Restaurant"
            className="h-16 w-auto object-contain mx-auto mb-4"
          />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mehmon-card border border-mehmon-gold/30 text-[11px] font-bold text-mehmon-gold uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('auth.admin_portal')}</span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-mehmon-card border border-mehmon-border rounded-2xl p-6 shadow-card-custom space-y-5"
        >
          <div>
            <h1 className="font-serif text-xl font-bold text-mehmon-text">
              {t('auth.sign_in')}
            </h1>
            <p className="text-xs text-mehmon-muted mt-1">{t('auth.sign_in_hint')}</p>
          </div>

          {sessionExpired && !error && (
            <div className="p-3 bg-mehmon-gold/10 border border-mehmon-gold/40 rounded-xl text-xs text-mehmon-gold">
              {t('auth.session_expired')}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="p-3 bg-red-950/20 border border-red-500/40 rounded-xl text-xs text-red-500"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-semibold text-mehmon-gold mb-1.5"
            >
              {t('auth.username')}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-mehmon-muted pointer-events-none" />
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-mehmon-input text-mehmon-text text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-mehmon-border focus:border-mehmon-gold focus:outline-none shadow-inner"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-mehmon-gold mb-1.5"
            >
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-mehmon-muted pointer-events-none" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-mehmon-input text-mehmon-text text-sm pl-10 pr-11 py-2.5 rounded-xl border border-mehmon-border focus:border-mehmon-gold focus:outline-none shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}
                className="absolute right-3 top-2.5 text-mehmon-muted hover:text-mehmon-gold transition-colors p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B8863B] hover:opacity-95 text-[#1F1915] font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(212,163,89,0.3)] disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? t('auth.signing_in') : t('auth.sign_in')}</span>
          </button>
        </form>

        <p className="text-[11px] text-mehmon-muted text-center mt-5 leading-relaxed">
          {t('auth.create_account_hint')}
        </p>
      </div>
    </div>
  );
}
