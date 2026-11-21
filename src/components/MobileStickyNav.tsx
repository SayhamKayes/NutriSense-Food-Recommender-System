import React from 'react';
import { LayoutDashboard, PlusCircle, BookOpen, ChefHat, AlertTriangle } from 'lucide-react';

export type ActiveTab = 'overview' | 'logger' | 'diary' | 'recommendations';

interface MobileStickyNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenCautions: () => void;
  loggedCount: number;
  hasCaution: boolean;
}

export const MobileStickyNav: React.FC<MobileStickyNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenCautions,
  loggedCount,
  hasCaution
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'logger', label: 'Meal Tracker', icon: PlusCircle },
    { id: 'diary', label: `Diary (${loggedCount})`, icon: BookOpen },
    { id: 'recommendations', label: 'Recommender', icon: ChefHat },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1.5 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id as ActiveTab)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-[0.62rem] font-bold transition-all cursor-pointer ${
                isActive
                  ? 'text-blue-600 scale-105'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-blue-600 stroke-[2.5]' : 'stroke-2'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onOpenCautions}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-[0.62rem] font-bold transition-all cursor-pointer relative ${
            hasCaution ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <AlertTriangle className="w-5 h-5 mb-0.5 stroke-2" />
          <span>Cautions</span>
          {hasCaution && (
            <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-red-600" />
          )}
        </button>
      </div>
    </nav>
  );
};
