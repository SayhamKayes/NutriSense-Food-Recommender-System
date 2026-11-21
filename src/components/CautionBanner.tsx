import React, { useEffect, useRef } from 'react';
import { CautionData } from '../types';
import { DEFAULT_RECOVERY_FOODS } from '../services/api';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  X,
  Flame,
  Leaf,
  Footprints,
  Activity
} from 'lucide-react';

interface CautionModalProps {
  isOpen: boolean;
  onClose: () => void;
  caution: CautionData | null;
  totalCalories: number;
  targetCalories: number;
}

export const CautionModal: React.FC<CautionModalProps> = ({
  isOpen,
  onClose,
  caution,
  totalCalories,
  targetCalories
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Light-dismiss fallback for browsers without native closedby="any"
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    let pressedOutside = false;
    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) dialog.close();
      pressedOutside = false;
    };
    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const isOver = Boolean(caution?.is_over);
  const itemCautions = caution?.item_cautions || [];
  const recoveryFoods =
    caution?.recovery_food_guidelines && caution.recovery_food_guidelines.length > 0
      ? caution.recovery_food_guidelines
      : DEFAULT_RECOVERY_FOODS;

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as Record<string, string>)}
      aria-labelledby="caution-dialog-title"
      onClose={onClose}
      className="dialog-subtle-backdrop m-auto p-0 bg-transparent border-0 max-w-5xl w-[calc(100%-2rem)] max-h-[90dvh] rounded-2xl shadow-2xl overflow-visible"
    >
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-h-[90dvh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div
          style={{
            backgroundColor: isOver ? caution?.bg_color || '#fef2f2' : '#ecfdf5',
            borderBottomColor: isOver ? caution?.border_color || '#fca5a5' : '#a7f3d0'
          }}
          className="flex items-center justify-between gap-3 px-5 py-4 border-b shrink-0"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {isOver ? (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <div className="min-w-0">
              <h3
                id="caution-dialog-title"
                className={`font-extrabold text-base sm:text-lg tracking-tight truncate ${
                  isOver ? 'text-red-700' : 'text-emerald-800'
                }`}
              >
                {caution?.title || 'Caloric Balance & Food Caution Report'}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {isOver
                  ? `Consumed ${Math.round(totalCalories)} kcal vs ${Math.round(targetCalories)} kcal target`
                  : `Within daily budget (${Math.round(totalCalories)} / ${Math.round(targetCalories)} kcal)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {caution?.badge && (
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white border ${
                  isOver ? 'text-red-700 border-red-200' : 'text-emerald-700 border-emerald-200'
                }`}
              >
                {caution.badge}
              </span>
            )}
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close caution dialog"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar space-y-4 text-xs">
          {/* Overall Surplus Alert + Burn Activity Plan */}
          {isOver && caution ? (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3 bg-red-50/70 border border-red-100 rounded-xl p-3">
                <p className="text-xs sm:text-sm font-semibold text-slate-700 flex-1 min-w-[240px]">
                  {caution.risk_summary}
                </p>
                {caution.burn_activity_plan && caution.burn_activity_plan.surplus_kcal > 0 && (
                  <div className="flex items-center gap-2 shrink-0 bg-white border border-red-200 rounded-lg px-3 py-1.5 text-xs font-bold text-red-700">
                    <Footprints className="w-4 h-4 text-red-600 shrink-0" />
                    <span>
                      Burn +{caution.burn_activity_plan.surplus_kcal} kcal:{' '}
                      {caution.burn_activity_plan.brisk_walk_minutes}m brisk walk or{' '}
                      {caution.burn_activity_plan.cycling_minutes}m cycling
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-red-100">
                  <div className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Immediate Health Impacts
                  </div>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    {caution.physiological_effects.map((e, idx) => (
                      <li key={idx} className="leading-snug">{e}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-red-100">
                  <div className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                    Long-Term Clinical Risks
                  </div>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    {caution.clinical_risks.map((r, idx) => (
                      <li key={idx} className="leading-snug">{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-50/40 rounded-xl p-3 border border-emerald-200">
                  <div className="font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-emerald-600" />
                    Actionable Remedies &amp; Burn Plan
                  </div>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    {caution.immediate_guidance.map((g, idx) => (
                      <li key={idx} className="leading-snug">{g}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-900">
              <div className="font-extrabold text-sm mb-0.5">No Calorie Overconsumption Detected</div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Your total intake ({Math.round(totalCalories)} kcal) is within your daily target ({Math.round(targetCalories)} kcal). Below are item-specific nutritional cautions for the foods you logged today and dynamic balancing suggestions.
              </p>
            </div>
          )}

          {/* Per-Item Clinical Food Cautions (Dynamic for all 190 BD + 8,790 Global foods) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600 shrink-0" />
                <h4 className="font-extrabold text-sm text-slate-900">
                  Food-Specific Clinical Cautions ({itemCautions.length} Logged {itemCautions.length === 1 ? 'Item' : 'Items'})
                </h4>
              </div>
              <span className="text-[0.68rem] text-slate-500 font-semibold">
                Evaluated per-item across saturated fat, sugar, sodium, cholesterol &amp; fiber
              </span>
            </div>

            {itemCautions.length === 0 ? (
              <div className="text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3 text-center">
                Log any food from the Bangladeshi (190) or Global USDA (8,790) database to see item-specific clinical cautions and burn tips here.
              </div>
            ) : (
              <div className="space-y-2.5">
                {itemCautions.map((item) => {
                  const badgeStyle =
                    item.risk_level === 'high'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : item.risk_level === 'moderate'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  const riskLabel =
                    item.risk_level === 'high'
                      ? 'High Caution'
                      : item.risk_level === 'moderate'
                      ? 'Moderate Caution'
                      : 'Balanced';

                  return (
                    <div
                      key={item.index}
                      className="border border-slate-200 rounded-xl p-3 bg-slate-50/70"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {item.name}
                          </div>
                          <div className="text-[0.68rem] text-slate-500 font-medium">
                            {item.servings}x serving • {item.calories} kcal • {item.category} ({item.origin})
                            {item.meals.length > 0 ? ` • ${item.meals.join(', ')}` : ''}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[0.68rem] font-bold border shrink-0 ${badgeStyle}`}>
                          {riskLabel}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {item.flags.map((flag, fIdx) => (
                          <span
                            key={fIdx}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[0.66rem] font-bold text-slate-700"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-slate-700 leading-snug mb-1">
                        <b>Caution:</b> {item.caution_note}
                      </p>
                      <p className="text-[0.7rem] text-emerald-800 font-semibold leading-snug">
                        <b>Mitigation &amp; Burn:</b> {item.burn_tip}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dynamic Recovery & Fat-Oxidation Foods */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
              <h4 className="font-extrabold text-sm text-slate-900">
                Dynamic Calorie-Balancing &amp; Recovery Foods (Matched to Your Intake)
              </h4>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              {isOver
                ? 'Selected dynamically from the 8,980-item nutrition database to offset your specific logged fats, sugars, sodium, and calorie surplus:'
                : 'Selected dynamically from the 8,980-item database based on your logged meals to maintain metabolic balance:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {recoveryFoods.map((item, idx) => (
                <div
                  key={item.index ?? idx}
                  className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    {item.category && (
                      <div className="text-[0.62rem] font-bold uppercase tracking-wider text-blue-600 mb-0.5 truncate">
                        {item.category}
                      </div>
                    )}
                    <div className="font-bold text-slate-900 text-xs leading-snug mb-1">
                      {item.name}
                    </div>
                    <div className="text-lg font-black text-emerald-600 mb-0.5">
                      {item.calories} kcal
                    </div>
                    <div className="text-[0.68rem] font-semibold text-slate-500 mb-1">
                      {item.serving}
                    </div>
                    <div className="text-[0.65rem] text-slate-400 mb-1.5">
                      {item.macros}
                    </div>
                  </div>
                  <div className="text-[0.68rem] text-slate-600 pt-1.5 border-t border-slate-100 leading-tight">
                    {item.benefits}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Meal Action Plan */}
          {caution?.next_meal_recommendation && (
            <div className="bg-white rounded-xl p-3.5 border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">
                Recommended Food Selection Strategy for Your Remaining Meal:
              </div>
              <div className="text-slate-600 mb-2">
                {caution.next_meal_recommendation.action_plan}
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    <b>Prioritize:</b> {caution.next_meal_recommendation.recommended_foods.join(', ')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-red-700">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    <b>Strictly Avoid:</b> {caution.next_meal_recommendation.foods_to_avoid.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </dialog>
  );
};
