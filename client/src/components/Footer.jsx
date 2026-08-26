import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-mehmon-border bg-mehmon-bg py-6 px-4 text-center mt-auto transition-colors duration-300">
      <p className="text-xs sm:text-sm text-mehmon-muted tracking-wide font-medium">
        Created by{' '}
        <a
          href="https://t.me/sunnatal1yev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-mehmon-gold font-semibold hover:underline hover:opacity-80 transition-all inline-block"
        >
          @Sunnatal1yev
        </a>{' '}
        and{' '}
        <a
          href="https://t.me/AnakinSkaywalker"
          target="_blank"
          rel="noopener noreferrer"
          className="text-mehmon-gold font-semibold hover:underline hover:opacity-80 transition-all inline-block"
        >
          @AnakinSkaywalker
        </a>
      </p>
    </footer>
  );
}
