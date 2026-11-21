import React, { useState } from 'react';
import { MealKey, FoodItem, RecommendationResponse } from '../types';
import { fetchRecommendations } from '../services/api';
import { Brain, Plus, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

interface AIRecommendationsProps {
  consumedIndices: number[];
  remainingCalories: number;
  chosenMeal: MealKey;
  onQuickAdd: (meal: MealKey, food: FoodItem) => void;
  isLocked: boolean;
  missingMeals: MealKey[];
  guidanceMessage: string;
  defaultTargetMeal: string;
  onJumpToMeal: (meal: MealKey) => void;
}

const MEAL_LABELS: Record<MealKey, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Evening Snack',
  dinner: 'Dinner'
};

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  consumedIndices,
  remainingCalories,
  chosenMeal,
  onQuickAdd,
  isLocked,
  missingMeals,
  guidanceMessage,
  defaultTargetMeal,
  onJumpToMeal
}) => {
  const [modelType, setModelType] = useState<'LSTM' | 'Transformer'>('LSTM');
  const [selectedTargetMeal, setSelectedTargetMeal] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [recsData, setRecsData] = useState<RecommendationResponse | null>(null);

  const targetMeal = selectedTargetMeal ?? (defaultTargetMeal || 'Lunch');

  const handleGenerate = async () => {
    if (isLocked) return;
    setLoading(true);
    try {
      const res = await fetchRecommendations(
        consumedIndices,
        remainingCalories,
        targetMeal,
        modelType
      );
      setRecsData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs h-full min-h-0 flex flex-col">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3 pb-3 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            AI Sequential Meal Recommender
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Personalized neural recommendations matching your sequential intake history.
          </p>
        </div>

        {/* Model Architecture Radio */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setModelType('LSTM')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              modelType === 'LSTM' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            LSTM Tracker
          </button>
          <button
            type="button"
            onClick={() => setModelType('Transformer')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              modelType === 'Transformer' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dietary Transformer
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
        {isLocked ? (
          <div className="bg-red-50 border-2 border-dashed border-red-200 rounded-2xl p-6 text-center my-2">
            <Lock className="w-9 h-9 text-red-500 mx-auto mb-2.5" />
            <h4 className="font-extrabold text-base text-red-700 mb-1.5">
              Sequential Recommendation Engine Locked
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mb-4">
              {guidanceMessage ||
                `To provide accurate, personalized suggestions for ${defaultTargetMeal}, please log your earlier daytime meals first (${missingMeals
                  .map((m) => MEAL_LABELS[m])
                  .join(', ')}).`}
            </p>

            {missingMeals.length > 0 && (
              <div className="flex items-center justify-center flex-wrap gap-2">
                {missingMeals.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onJumpToMeal(m)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Log {MEAL_LABELS[m]} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Controls Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 items-end bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <label htmlFor="rec-target-meal" className="text-xs font-bold text-slate-700 block mb-1">
                  Recommendation Target Meal:
                </label>
                <select
                  id="rec-target-meal"
                  value={targetMeal}
                  onChange={(e) => setSelectedTargetMeal(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-800 cursor-pointer"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Evening Snack">Evening Snack</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 font-medium pb-2">
                Remaining TDEE budget:{' '}
                <b className="text-blue-600 font-extrabold">{Math.round(remainingCalories)} kcal</b>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-2 px-3 rounded-lg text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                >
                  <Brain className="w-4 h-4" /> {loading ? 'Analyzing Neural Sequences...' : 'Generate Recommendations'}
                </button>
              </div>
            </div>

            {!recsData && (
              <div className="text-center py-8 px-4 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Your earlier meals are logged! Select a target meal and click <b>Generate Recommendations</b> to get personalized PyTorch ({modelType}) dietary suggestions.
              </div>
            )}

            {/* Recommendations Display */}
            {recsData && (
              <div className="space-y-4">
                <div className="bg-blue-50/70 border-l-4 border-l-blue-600 rounded-r-xl p-3 text-xs text-slate-700 leading-relaxed">
                  {recsData.justification}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recsData.recommendations.map((food) => (
                    <div
                      key={food.index}
                      className="border border-slate-200 rounded-xl p-3 bg-white shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[0.68rem] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            {food.Category}
                          </span>
                          {food.similarity_score && (
                            <span className="text-[0.68rem] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {food.similarity_score}% Match
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900 leading-tight mb-1">
                          {food.Clean_Name}
                        </h4>
                        <p className="text-[0.7rem] text-slate-500 mb-2">
                          Serving: {food.GmWt_Desc1}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs">
                          <span className="font-black text-slate-900">{Math.round(food.Energ_Kcal)} kcal</span>
                          <span className="text-slate-400 text-[0.68rem] ml-1.5">
                            P: {food.Protein_g}g | C: {food.Carbohydrt_g}g | F: {food.Lipid_Tot_g}g
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onQuickAdd(chosenMeal, food)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-slate-900 hover:bg-blue-600 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Quick Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Internal Model Telemetry Card */}
                {recsData.metrics && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                    <div className="font-bold text-blue-700 mb-1.5 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5" /> AI Model Internal Telemetry &amp; Accuracy Validation
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[0.72rem]">
                      <div>
                        <span className="text-slate-400 block">Active Model:</span>
                        <span className="font-bold text-slate-800">{recsData.metrics.model_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Avg Cosine Sim:</span>
                        <span className="font-bold text-emerald-600">{recsData.metrics.avg_similarity}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Caloric Adherence:</span>
                        <span className="font-bold text-blue-600">{recsData.metrics.caloric_adherence}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Latent Embedding:</span>
                        <span className="font-bold text-slate-800">{recsData.metrics.latent_dim}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
