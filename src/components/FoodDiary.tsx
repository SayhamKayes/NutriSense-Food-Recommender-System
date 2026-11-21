import React from 'react';
import { MealLogs, MealKey } from '../types';
import { Trash2, RotateCcw } from 'lucide-react';

interface FoodDiaryProps {
  mealsLog: MealLogs;
  onDeleteItem: (meal: MealKey, id: string) => void;
  onResetLog: () => void;
}

const MEAL_ORDER: MealKey[] = ['breakfast', 'lunch', 'snack', 'dinner'];
const MEAL_TITLES: Record<MealKey, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Evening Snack',
  dinner: 'Dinner'
};

export const FoodDiary: React.FC<FoodDiaryProps> = ({
  mealsLog,
  onDeleteItem,
  onResetLog
}) => {
  let totalCals = 0;
  let totalProt = 0;
  let totalCarb = 0;
  let totalFat = 0;
  let totalCount = 0;

  MEAL_ORDER.forEach((m) => {
    mealsLog[m].forEach((item) => {
      const s = item.servings;
      totalCals += item.food.Energ_Kcal * s;
      totalProt += item.food.Protein_g * s;
      totalCarb += item.food.Carbohydrt_g * s;
      totalFat += item.food.Lipid_Tot_g * s;
      totalCount++;
    });
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs h-full min-h-0 flex flex-col">
      {/* Pinned Diary Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Daily Food Diary &amp; Intake Log
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Review logged food items and their nutrient breakdown.
          </p>
        </div>
        {totalCount > 0 && (
          <button
            type="button"
            onClick={onResetLog}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer border border-red-200"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Log
          </button>
        )}
      </div>

      {/* Scrollable Meal Entries Container */}
      {totalCount === 0 ? (
        <div className="flex-1 min-h-0 flex items-start pt-3">
          <div className="text-center py-5 px-4 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 w-full">
            No food items logged yet today. Use the logging controls on the left to add your meals.
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-3 pr-1 space-y-3">
            {MEAL_ORDER.map((meal) => {
              const items = mealsLog[meal];
              if (items.length === 0) return null;

              return (
                <div key={meal} className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/60">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1.5 flex items-center justify-between">
                    <span>{MEAL_TITLES[meal]}</span>
                    <span className="text-slate-400 font-medium">({items.length} items)</span>
                  </div>

                  <div className="divide-y divide-slate-200/60">
                    {items.map((it) => {
                      const cals = Math.round(it.food.Energ_Kcal * it.servings);
                      const prot = (it.food.Protein_g * it.servings).toFixed(1);
                      const carb = (it.food.Carbohydrt_g * it.servings).toFixed(1);
                      const fat = (it.food.Lipid_Tot_g * it.servings).toFixed(1);

                      return (
                        <div
                          key={it.id}
                          className="py-2 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 truncate">
                              {it.food.Clean_Name}
                            </div>
                            <div className="text-[0.68rem] text-slate-500 truncate">
                              {it.servings}x ({it.food.GmWt_Desc1}) • {it.food.Category}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <div className="font-extrabold text-slate-900">{cals} kcal</div>
                              <div className="text-[0.65rem] text-slate-400">
                                P:{prot}g C:{carb}g F:{fat}g
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => onDeleteItem(meal, it.id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete food entry"
                              aria-label={`Remove ${it.food.Clean_Name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pinned Diary Day Summary Bar */}
          <div className="pt-2.5 border-t border-slate-100 shrink-0">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-slate-800">
              <span className="text-slate-500 font-semibold">Total Tracked Today:</span>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-amber-600">{Math.round(totalCals)} kcal</span>
                <span className="text-emerald-600">{totalProt.toFixed(1)}g P</span>
                <span className="text-blue-600">{totalCarb.toFixed(1)}g C</span>
                <span className="text-amber-700">{totalFat.toFixed(1)}g F</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
