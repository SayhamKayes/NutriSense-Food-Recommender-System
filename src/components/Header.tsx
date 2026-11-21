import React from 'react';
import { AnalogClock } from './AnalogClock';
import { UserProfile } from '../types';
import { Edit3 } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  greetingText: string;
  mealWindow: string;
  onEditProfile: () => void;
  largeClockOnMobile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  greetingText,
  mealWindow,
  onEditProfile,
  largeClockOnMobile = false
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-stretch mb-3">
      {/* Greeting Card - 3 columns on large screens */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col justify-center min-h-[112px] lg:h-[116px] box-border relative">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
              {greetingText}, {user.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Personalized dietary nutrition &amp; metabolic health assistant.
            </p>
          </div>
          <button
            type="button"
            onClick={onEditProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Edit Demographics & Goals"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Profile</span>
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-0.5 rounded-full">
            Current Meal Window: {mealWindow}
          </span>
          <span className="text-xs text-slate-500 font-semibold hidden md:inline">
            Target TDEE: {Math.round(user.target_calories)} kcal • Goal: {user.goal.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Analog Wall Clock - 1 column */}
      <div className="lg:col-span-1">
        <AnalogClock largeMobile={largeClockOnMobile} />
      </div>
    </div>
  );
};
