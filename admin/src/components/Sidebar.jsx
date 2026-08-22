import React from 'react';
import { useTranslation } from 'react-i18next';
import { Utensils, FolderTree, Sparkles } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, productsCount, categoriesCount }) {
  const { t } = useTranslation();

  const navItems = [
    {
      id: 'products',
      label: t('admin.products_tab'),
      icon: Utensils,
      count: productsCount
    },
    {
      id: 'categories',
      label: t('admin.categories_tab'),
      icon: FolderTree,
      count: categoriesCount
    }
  ];

  return (
    <>
      {/* Desktop Sidebar (20% Screen Width) */}
      <aside className="hidden md:flex flex-col w-1/5 min-w-[220px] max-w-[300px] bg-[#16120F] border-r border-[#3D332B] p-4 shrink-0 min-h-[calc(100vh-80px)]">
        <div className="space-y-2 flex-1">
          <p className="text-[11px] font-bold text-[#A89F91] uppercase tracking-wider px-3 py-2">
            {t('admin.title')}
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#D4A359] text-[#1F1915] font-bold shadow-[0_4px_15px_rgba(212,163,89,0.3)]'
                    : 'text-[#F5EBE0]/80 hover:bg-[#2B231D] hover:text-[#D4A359]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#1F1915]' : 'text-[#D4A359]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-[#1F1915] text-[#D4A359]'
                        : 'bg-[#2B231D] text-[#A89F91]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Hint */}
        <div className="p-3 rounded-xl bg-[#2B231D]/40 border border-[#3D332B]/50 mt-auto">
          <div className="flex items-center gap-2 text-xs text-[#D4A359] font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mehmon OS</span>
          </div>
          <p className="text-[11px] text-[#A89F91]">
            DRF API Live Sync
          </p>
        </div>
      </aside>

      {/* Mobile/Tablet Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#16120F]/95 backdrop-blur-lg border-t border-[#3D332B] px-4 py-2 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-[#D4A359] font-bold scale-105'
                  : 'text-[#A89F91] hover:text-[#F5EBE0]'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[11px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
