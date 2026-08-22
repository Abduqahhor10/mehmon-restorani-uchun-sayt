import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, FolderPlus, X } from 'lucide-react';

export default function GuardModal({ isOpen, onClose, onGoToCreateCategory }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#2B231D] border border-[#D4A359]/40 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A89F91] hover:text-[#F5EBE0] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-full bg-[#D4A359]/15 border border-[#D4A359]/40 flex items-center justify-center mx-auto mb-4 text-[#D4A359]">
          <AlertTriangle className="w-7 h-7" />
        </div>

        {/* Header Title */}
        <h3 className="font-serif text-xl font-bold text-center text-[#F5EBE0] mb-2">
          {t('admin.guard_warning')}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#A89F91] text-center mb-6 leading-relaxed">
          {t('admin.guard_desc')}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#1F1915] text-[#A89F91] hover:text-[#F5EBE0] hover:bg-[#16120F] border border-[#3D332B] text-xs font-semibold transition-all"
          >
            {t('admin.cancel')}
          </button>
          
          <button
            onClick={() => {
              onClose();
              onGoToCreateCategory();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#D4A359] text-[#1F1915] hover:bg-[#B8863B] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(212,163,89,0.3)] transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            <span>{t('admin.go_create_category')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
