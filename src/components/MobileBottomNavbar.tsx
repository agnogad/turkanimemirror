import React from 'react';
import { Search, Film, History, Heart } from 'lucide-react';

interface MobileBottomNavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onFocusSearch: () => void;
}

export const MobileBottomNavbar: React.FC<MobileBottomNavbarProps> = ({
  currentView,
  onNavigate,
}) => {
  const navItems = [
    {
      id: 'home',
      label: 'Arama',
      icon: Search,
      action: () => onNavigate('home'),
    },
    {
      id: 'all-animes',
      label: 'Katalog',
      icon: Film,
      action: () => onNavigate('all-animes'),
    },
    {
      id: 'history',
      label: 'Geçmiş',
      icon: History,
      action: () => onNavigate('history'),
    },
    {
      id: 'favorites',
      label: 'Favoriler',
      icon: Heart,
      action: () => onNavigate('favorites'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#000000]/95 backdrop-blur-xl border-t border-[#1f1f1f] md:hidden px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isFav = item.id === 'favorites';

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isFav && isActive
                    ? 'text-rose-500 fill-rose-500'
                    : isFav
                    ? 'text-rose-400'
                    : ''
                }`}
              />
              <span className="text-[10px] font-mono mt-0.5">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
