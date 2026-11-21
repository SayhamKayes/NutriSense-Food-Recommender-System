import React, { useState, useEffect } from 'react';
import { MealKey, FoodItem, MealLogs, MealGuidance } from '../types';
import { fetchFoods, getMissingPriorMealsForMeal } from '../services/api';
import { Plus, ArrowRight, Search, Filter, AlertCircle, Lock, Info, AlertTriangle } from 'lucide-react';

interface MealLoggerProps {
  activeMeal: MealKey;
  currentPeriod: MealKey;
  mealsLog: MealLogs;
  guidance: MealGuidance;
  isOverBudget: boolean;
  surplusKcal?: number;
  onOpenCautions: () => void;
  onSelectMeal: (meal: MealKey) => void;
  onAddFood: (meal: MealKey, food: FoodItem, servings: number) => void;
}

const MEAL_LABELS: Record<MealKey, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Evening Snack',
  dinner: 'Dinner'
};

const NEXT_CYCLE: Record<MealKey, MealKey> = {
  breakfast: 'lunch',
  lunch: 'snack',
  snack: 'dinner',
  dinner: 'breakfast'
};

export const MealLogger: React.FC<MealLoggerProps> = ({
  activeMeal,
  currentPeriod,
  mealsLog,
  guidance,
  isOverBudget,
  surplusKcal = 0,
  onOpenCautions,
  onSelectMeal,
  onAddFood
}) => {
  const [scope, setScope] = useState<'bangladesh' | 'global'>('bangladesh');
  const [category, setCategory] = useState<string>('All Categories');
  const [search, setSearch] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [servings, setServings] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(false);

  const missingPriorForActive = getMissingPriorMealsForMeal(activeMeal, mealsLog);
  const missingPriorForNow = getMissingPriorMealsForMeal(currentPeriod, mealsLog);
  const isActiveMealLocked = missingPriorForActive.length > 0;

  // Load foods whenever scope, category, or search changes
  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(() => {
      if (!isMounted) return;
      setLoading(true);
      fetchFoods(scope, category, search)
        .then((res) => {
          if (!isMounted) return;
          setCategories(res.categories);
          setFoods(res.items);
          if (res.items.length > 0) {
            setSelectedIdx(res.items[0].index);
          } else {
            setSelectedIdx(null);
          }
          setLoading(false);
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [scope, category, search]);

  const handleAdd = () => {
    if (isActiveMealLocked || selectedIdx === null) return;
    const food = foods.find((f) => f.index === selectedIdx);
    if (!food) return;
    onAddFood(activeMeal, food, servings);
  };

  const handleNext = () => {
    const nextMeal = NEXT_CYCLE[activeMeal];
    onSelectMeal(nextMeal);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs md:h-full md:min-h-0 flex flex-col md:overflow-y-auto custom-scrollbar">
      {/* Real-Time Sequential Guidance Message Box (Always visible in this position) */}
      {isActiveMealLocked ? (
        <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-600 rounded-xl p-3 mb-3 shrink-0">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <div className="flex items-center gap-1.5 text-red-800 font-extrabold text-xs sm:text-sm">
              <Lock className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                {MEAL_LABELS[activeMeal]} Requires Earlier Meals First
              </span>
            </div>
            <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
              Sequential Lock
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed mb-2">
            Please log your earlier daytime meals (<b>{missingPriorForActive.map((m) => MEAL_LABELS[m]).join(', ')}</b>) before logging <b>{MEAL_LABELS[activeMeal]}</b>.
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {missingPriorForActive.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onSelectMeal(m)}
                className="px-2.5 py-1 text-[0.7rem] font-bold bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors cursor-pointer"
              >
                Log {MEAL_LABELS[m]}
              </button>
            ))}
          </div>
        </div>
      ) : missingPriorForNow.length > 0 ? (
        <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-xl p-3 mb-3 shrink-0">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{guidance.title}</span>
            </div>
            <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {guidance.badge}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed mb-2">
            {guidance.message}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {missingPriorForNow.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onSelectMeal(m)}
                className={`px-2.5 py-1 text-[0.7rem] font-bold rounded-md transition-colors cursor-pointer ${
                  activeMeal === m
                    ? 'bg-amber-700 text-white ring-2 ring-amber-300'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                Log {MEAL_LABELS[m]}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50/80 border border-blue-200 border-l-4 border-l-blue-600 rounded-xl p-3 mb-3 shrink-0">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
            <div className="flex items-center gap-1.5 text-blue-900 font-extrabold text-xs sm:text-sm">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{guidance.title}</span>
            </div>
            <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {guidance.badge}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {guidance.message}
          </p>
        </div>
      )}

      {/* Calorie Overconsumption Short Caution Note inside Guidance Area */}
      {isOverBudget && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3 flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-2 text-xs text-red-800 font-semibold">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <b>Caution (+{surplusKcal} kcal over):</b> You have exceeded your daily calorie target. Please choose light recovery foods from our Cautions guide to prevent extra health strain.
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenCautions}
            className="px-2.5 py-1 text-[0.7rem] font-bold bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors cursor-pointer shrink-0"
          >
            View Cautions
          </button>
        </div>
      )}

      {/* Meal Occasion Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3 border-b border-slate-100 pb-2.5 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['breakfast', 'lunch', 'snack', 'dinner'] as MealKey[]).map((key) => {
            const isActive = activeMeal === key;
            const locked = getMissingPriorMealsForMeal(key, mealsLog).length > 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectMeal(key)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? locked
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-blue-600 text-white shadow-xs'
                    : locked
                    ? 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={locked ? `Log earlier meals before ${MEAL_LABELS[key]}` : MEAL_LABELS[key]}
              >
                {locked && <Lock className="w-3 h-3" />}
                <span>{MEAL_LABELS[key]}</span>
              </button>
            );
          })}
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          Active Logging:{' '}
          <span className={isActiveMealLocked ? 'text-red-600 font-bold' : 'text-blue-600 font-bold'}>
            {MEAL_LABELS[activeMeal]}
          </span>
        </div>
      </div>

      {/* Database Scope Toggle (Stacked cleanly to fill box width) */}
      <div className="mb-3 shrink-0">
        <label className="text-xs font-bold text-slate-700 block mb-1.5">
          Select Food Database / Scope:
        </label>
        <div className="flex flex-col gap-2 w-full">
          <button
            type="button"
            onClick={() => { setScope('bangladesh'); setCategory('All Categories'); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              scope === 'bangladesh'
                ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Bangladeshi Everyday Staples (190+)
          </button>
          <button
            type="button"
            onClick={() => { setScope('global'); setCategory('All Categories'); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              scope === 'global'
                ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Global / USDA Database (8,790 Items)
          </button>
        </div>
      </div>

      {/* Category Filter & Keyword Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 shrink-0">
        <div>
          <label htmlFor="logger-category" className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Browse by Category:
          </label>
          <select
            id="logger-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer text-slate-800"
          >
            <option value="All Categories">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="logger-search" className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Search className="w-3 h-3 text-slate-400" /> Search Food or Ingredient:
          </label>
          <input
            id="logger-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={scope === 'bangladesh' ? "e.g. rice, dal, ilish, bhorta, tea..." : "e.g. oats, salmon, chicken, coffee..."}
            className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          />
        </div>
      </div>

      {/* Food Item Selection Dropdown */}
      <div className="mb-3 shrink-0">
        <label htmlFor="logger-food-item" className="text-xs font-bold text-slate-700 block mb-1">
          Select Food Item ({foods.length.toLocaleString()} items available):
        </label>
        {loading ? (
          <div className="text-xs text-slate-400 py-2">Loading foods...</div>
        ) : foods.length === 0 ? (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
            No items found matching your filter criteria.
          </div>
        ) : (
          <select
            id="logger-food-item"
            value={selectedIdx ?? ''}
            onChange={(e) => setSelectedIdx(Number(e.target.value))}
            className="w-full text-xs sm:text-sm font-semibold bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer text-slate-800 truncate"
          >
            {foods.map((f) => (
              <option key={f.index} value={f.index}>
                {f.Clean_Name} — {Math.round(f.Energ_Kcal)} kcal/100g [Serving: {f.GmWt_Desc1}, {f.Protein_g}g Protein]
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 3-Way Action Control Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-3 border-t border-slate-100 shrink-0">
        <div>
          <label htmlFor="logger-servings" className="text-xs font-bold text-slate-700 block mb-1">
            Portion / Serving Multiplier:
          </label>
          <input
            id="logger-servings"
            type="number"
            min="0.5"
            max="10.0"
            step="0.5"
            value={servings}
            onChange={(e) => setServings(Math.max(0.5, parseFloat(e.target.value) || 1.0))}
            className="w-full text-xs sm:text-sm font-bold bg-white border border-slate-300 rounded-lg p-2 text-center text-slate-800"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isActiveMealLocked || selectedIdx === null}
            className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded-lg text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            {isActiveMealLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" /> Log Earlier First
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add to {MEAL_LABELS[activeMeal]}
              </>
            )}
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-3 rounded-lg text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            Next: {MEAL_LABELS[NEXT_CYCLE[activeMeal]]} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
