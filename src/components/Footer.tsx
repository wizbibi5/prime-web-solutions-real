'use client';

import { useLanguage } from '@/lib/i18n';

export function Footer() {
  const { t } = useLanguage();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-cyan-950 to-purple-950 text-white py-12 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <span className="text-lg font-bold text-white">
              PRIME WEB SOLUTIONS
            </span>
            <p className="text-gray-400 text-sm text-center md:text-left">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Copyright */}
          <div className="text-gray-400 text-sm text-center">
            {t('footer.rights').replace('2024', currentYear.toString())}
          </div>
        </div>
      </div>
    </footer>
  );
}
