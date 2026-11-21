import React from 'react';
import { UserProfile } from '../types';

interface MetricCardsProps {
  user: UserProfile;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  user,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat
}) => {
  const targetCalories = user.target_calories;
  const isCalsOver = totalCalories > targetCalories;
  const remainingCalories = Math.max(0, targetCalories - totalCalories);
  const surplusAmt = isCalsOver ? Math.round(totalCalories - targetCalories) : 0;

  const remLabel = isCalsOver ? "Calorie Surplus" : "Remaining Budget";
  const remVal = isCalsOver ? `+${surplusAmt} kcal over` : `${Math.round(remainingCalories)} kcal`;
  const remColor = isCalsOver ? "text-red-600" : "text-blue-600";

  return (
    <div className="mb-3">
      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Target TDEE */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 text-center shadow-xs hover:border-blue-400 transition-all">
          <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider">
            Daily Target (TDEE)
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
            {Math.round(targetCalories)}{' '}
            <span className="text-xs font-semibold text-slate-500">kcal</span>
          </div>
        </div>

        {/* Card 2: Calories Consumed */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 text-center shadow-xs hover:border-blue-400 transition-all">
          <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider">
            Calories Consumed
          </div>
          <div className={`text-lg sm:text-xl font-extrabold mt-0.5 ${isCalsOver ? 'text-red-600' : 'text-slate-900'}`}>
            {Math.round(totalCalories)}{' '}
            <span className="text-xs font-semibold text-slate-500">kcal</span>
          </div>
        </div>

        {/* Card 3: Remaining / Surplus */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 text-center shadow-xs hover:border-blue-400 transition-all">
          <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider">
            {remLabel}
          </div>
          <div className={`text-lg sm:text-xl font-extrabold mt-0.5 ${remColor}`}>
            {remVal}
          </div>
        </div>

        {/* Card 4: Protein Consumed */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 text-center shadow-xs hover:border-emerald-400 transition-all">
          <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider">
            Protein Consumed
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-600 mt-0.5">
            {totalProtein.toFixed(1)}g{' '}
            <span className="text-xs font-semibold text-slate-400">
              / {user.target_protein_g}g
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Macronutrient Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 mt-2.5 shadow-xs flex items-center justify-between flex-wrap gap-3 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Protein: <b>{totalProtein.toFixed(1)}g</b> / {user.target_protein_g}g</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Carbohydrates: <b>{totalCarbs.toFixed(1)}g</b> / {user.target_carb_g}g</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Fats: <b>{totalFat.toFixed(1)}g</b> / {user.target_fat_g}g</span>
        </div>
        <div className="text-slate-400 font-medium hidden sm:inline">
          BMI: <b className="text-slate-700">{user.bmi}</b> ({user.bmi_status})
        </div>
      </div>
    </div>
  );
};

