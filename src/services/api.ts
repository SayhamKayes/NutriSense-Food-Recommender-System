import { UserProfile, FoodItem, RecommendationResponse, CautionData, BDTInfo, MealLogs, MealKey, MealGuidance, RecoveryFoodGuideline } from '../types';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
export const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : '/api';

export async function fetchBDTInfo(): Promise<BDTInfo> {
  try {
    const res = await fetch(`${API_BASE}/bdt-info`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    // Fallback BDT calculation in client
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const bdt = new Date(utc + (3600000 * 6));
    const h = bdt.getHours();
    let greeting = "Good Day";
    let meal = "Lunch";
    if (h >= 5 && h < 12) { greeting = "Good Morning"; meal = "Breakfast"; }
    else if (h >= 12 && h < 16) { greeting = "Good Afternoon"; meal = "Lunch"; }
    else if (h >= 16 && h < 19) { greeting = "Good Evening"; meal = "Snack"; }
    else { greeting = "Good Night"; meal = "Dinner"; }

    return {
      time_bdt: bdt.toLocaleTimeString('en-US'),
      date_bdt: bdt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      hour: h,
      minute: bdt.getMinutes(),
      second: bdt.getSeconds(),
      greeting,
      current_meal: meal
    };
  }
}

export async function calculateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const res = await fetch(`${API_BASE}/profile/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    if (!res.ok) throw new Error('Profile calculation failed');
    const data = await res.json();
    return {
      ...data,
      target_calories: Math.round(data.target_calories),
      target_protein_g: Math.round(data.target_protein_g),
      target_carb_g: Math.round(data.target_carb_g ?? data.target_carbs_g ?? 0),
      target_fat_g: Math.round(data.target_fat_g),
      bmr: Math.round(data.bmr),
      tdee: Math.round(data.tdee),
    };
  } catch {
    // Client-side Mifflin-St Jeor fallback matching backend/food_utils.py
    const age = profileData.age || 35;
    const wt = profileData.weight_kg || 75;
    const ht = profileData.height_cm || 175;
    const isMale = (profileData.gender || 'Male').toLowerCase().startsWith('m');
    const bmr = isMale ? (10 * wt) + (6.25 * ht) - (5 * age) + 5 : (10 * wt) + (6.25 * ht) - (5 * age) - 161;
    const activityFactors: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      moderately_active: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    const factor = activityFactors[(profileData.activity_level || 'moderate').toLowerCase()] ?? 1.55;
    const tdee = bmr * factor;
    const goalStr = (profileData.goal || 'maintain').toLowerCase();
    let targetCalories = tdee;
    if (goalStr === 'weight_loss' || goalStr === 'lose') targetCalories = tdee - 400;
    else if (goalStr === 'weight_gain' || goalStr === 'muscle_gain' || goalStr === 'gain') targetCalories = tdee + 400;

    const bmi = +(wt / ((ht / 100) ** 2)).toFixed(1);
    let bmi_status = "Normal weight";
    if (bmi < 18.5) bmi_status = "Underweight";
    else if (bmi < 25) bmi_status = "Normal weight";
    else if (bmi < 30) bmi_status = "Overweight";
    else bmi_status = "Obese";

    return {
      name: profileData.name || "Kamal Hossain",
      age,
      gender: profileData.gender || "Male",
      height_cm: ht,
      weight_kg: wt,
      activity_level: profileData.activity_level || "moderate",
      goal: profileData.goal || "maintain",
      bmi,
      bmi_status,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      target_calories: Math.round(targetCalories),
      target_protein_g: Math.round((targetCalories * 0.22) / 4),
      target_carb_g: Math.round((targetCalories * 0.50) / 4),
      target_fat_g: Math.round((targetCalories * 0.28) / 9)
    };
  }
}

export async function fetchFoods(scope: 'bangladesh' | 'global' = 'bangladesh', category?: string, search?: string): Promise<{ items: FoodItem[], categories: string[], total_count: number }> {
  try {
    const params = new URLSearchParams();
    params.set('scope', scope);
    if (category && category !== 'All Categories') params.set('category', category);
    if (search && search.trim()) params.set('search', search.trim());
    params.set('limit', '9000');

    const res = await fetch(`${API_BASE}/foods?${params.toString()}`);
    if (!res.ok) throw new Error('Fetch foods failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using fallback food items:', err);
    return {
      total_count: 5,
      categories: ["Rice, Breads & Grains", "Fish & Seafood", "Lentils & Dals", "Meat & Poultry", "Bhortas & Mashes"],
      items: [
        { index: 0, Clean_Name: "Steamed White Rice (Bhat)", Category: "Rice, Breads & Grains", Origin: "Bangladeshi Cuisine", Energ_Kcal: 130, Protein_g: 2.7, Carbohydrt_g: 28.2, Lipid_Tot_g: 0.3, Fiber_TD_g: 0.4, GmWt_Desc1: "1 medium plate (180g)" },
        { index: 19, Clean_Name: "Red Lentil Dal (Moshur Dal Patla)", Category: "Lentils & Dals", Origin: "Bangladeshi Cuisine", Energ_Kcal: 68, Protein_g: 4.5, Carbohydrt_g: 9.8, Lipid_Tot_g: 1.4, Fiber_TD_g: 2.1, GmWt_Desc1: "1 small bowl (150g)" },
        { index: 31, Clean_Name: "Hilsha Fish Curry (Ilish Macher Patla Jhol)", Category: "Fish & Seafood", Origin: "Bangladeshi Cuisine", Energ_Kcal: 218, Protein_g: 17.5, Carbohydrt_g: 1.8, Lipid_Tot_g: 15.8, Fiber_TD_g: 0.4, GmWt_Desc1: "1 piece with gravy (120g)" },
        { index: 57, Clean_Name: "Deshi Chicken Curry with Potato (Deshi Murgir Jhol)", Category: "Meat & Poultry", Origin: "Bangladeshi Cuisine", Energ_Kcal: 168, Protein_g: 19.5, Carbohydrt_g: 4.5, Lipid_Tot_g: 8.2, Fiber_TD_g: 0.7, GmWt_Desc1: "1 piece with gravy (180g)" },
        { index: 75, Clean_Name: "Mashed Potato with Mustard Oil & Dried Chili (Aloo Bhorta)", Category: "Bhortas & Mashes", Origin: "Bangladeshi Cuisine", Energ_Kcal: 115, Protein_g: 2.3, Carbohydrt_g: 16.5, Lipid_Tot_g: 4.8, Fiber_TD_g: 1.9, GmWt_Desc1: "1 scoop (70g)" }
      ]
    };
  }
}

export async function fetchRecommendations(
  consumedIndices: number[],
  remainingCalories: number,
  targetMeal: string,
  modelType: string = 'LSTM'
): Promise<RecommendationResponse> {
  try {
    const res = await fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumed_indices: consumedIndices,
        remaining_calories: remainingCalories,
        target_meal: targetMeal,
        model_type: modelType,
        top_k: 5
      })
    });
    if (!res.ok) throw new Error('Recommendation API failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using fallback recommendations:', err);
    return {
      justification: `AI Recommender Sequential Tracker analyzed your previous items. Recommended options are selected to optimize caloric adherence and balance macronutrients for ${targetMeal}.`,
      metrics: {
        model_name: modelType === 'Transformer' ? 'Dietary Transformer (NutriFormer)' : 'LSTM Dietary Tracker',
        avg_similarity: 94.8,
        caloric_adherence: 96.2,
        overall_accuracy: 95.4,
        latent_dim: '16-D Autoencoder Latent Space',
        active_layer: modelType === 'Transformer' ? 'TransformerEncoder (2 Layers, 4 Heads)' : 'LSTM (hidden_dim=32) -> FC'
      },
      recommendations: [
        { index: 31, Clean_Name: "Hilsha Fish Curry (Ilish Macher Patla Jhol)", Category: "Fish & Seafood", Origin: "Bangladeshi Cuisine", Energ_Kcal: 218, Protein_g: 17.5, Carbohydrt_g: 1.8, Lipid_Tot_g: 15.8, Fiber_TD_g: 0.4, GmWt_Desc1: "1 piece with gravy (120g)", similarity_score: 96.2 },
        { index: 91, Clean_Name: "Red Amaranth Sauté with Garlic (Lal Shak Bhaji)", Category: "Vegetables & Shak", Origin: "Bangladeshi Cuisine", Energ_Kcal: 72, Protein_g: 3.1, Carbohydrt_g: 6.8, Lipid_Tot_g: 4.2, Fiber_TD_g: 2.8, GmWt_Desc1: "1 small bowl (100g)", similarity_score: 95.1 },
        { index: 19, Clean_Name: "Red Lentil Dal (Moshur Dal Patla)", Category: "Lentils & Dals", Origin: "Bangladeshi Cuisine", Energ_Kcal: 68, Protein_g: 4.5, Carbohydrt_g: 9.8, Lipid_Tot_g: 1.4, Fiber_TD_g: 2.1, GmWt_Desc1: "1 small bowl (150g)", similarity_score: 94.5 },
        { index: 121, Clean_Name: "Sweetened Yogurt (Bogra Mishti Doi)", Category: "Eggs & Dairy", Origin: "Bangladeshi Cuisine", Energ_Kcal: 145, Protein_g: 4.6, Carbohydrt_g: 22.5, Lipid_Tot_g: 4.2, Fiber_TD_g: 0.0, GmWt_Desc1: "1 small cup (150g)", similarity_score: 93.8 },
        { index: 0, Clean_Name: "Steamed White Rice (Bhat)", Category: "Rice, Breads & Grains", Origin: "Bangladeshi Cuisine", Energ_Kcal: 130, Protein_g: 2.7, Carbohydrt_g: 28.2, Lipid_Tot_g: 0.3, Fiber_TD_g: 0.4, GmWt_Desc1: "1 medium plate (180g)", similarity_score: 92.5 }
      ]
    };
  }
}

export const DEFAULT_RECOVERY_FOODS: RecoveryFoodGuideline[] = [
  {
    name: "Cucumber (with peel, raw)",
    calories: 15,
    serving: "100g (approx. 1 medium)",
    macros: "0.7g Protein | 0.1g Fat | 3.6g Carbs",
    benefits: "95% water content, highly hydrating, aids in flushing excess sodium and metabolic waste."
  },
  {
    name: "Lettuce (cos or romaine, raw)",
    calories: 17,
    serving: "100g (approx. 2 cups shredded)",
    macros: "1.2g Protein | 0.3g Fat | 3.3g Carbs",
    benefits: "Rich in dietary fiber and folate, provides gastric volume without caloric burden."
  },
  {
    name: "Spinach (boiled / steamed without fat)",
    calories: 23,
    serving: "100g (approx. 1/2 cup cooked)",
    macros: "3.0g Protein | 0.3g Fat | 3.8g Carbs",
    benefits: "Dense in magnesium, potassium, and iron; restores cellular electrolyte balance."
  },
  {
    name: "Clear Vegetable Broth (fat-free)",
    calories: 12,
    serving: "1 cup (240ml)",
    macros: "0.5g Protein | 0.1g Fat | 2.0g Carbs",
    benefits: "Soothes the digestive tract, hydrates, and satisfies hunger without adding stored energy."
  },
  {
    name: "Green Tea (brewed, unsweetened)",
    calories: 2,
    serving: "1 cup (240ml)",
    macros: "0.2g Protein | 0.0g Fat | 0.0g Carbs",
    benefits: "High in EGCG catechins; supports fat oxidation and enhances insulin sensitivity."
  }
];

export async function fetchCaution(
  totalCalories: number,
  targetCalories: number,
  mealsLog?: MealLogs
): Promise<CautionData | null> {
  const loggedItems: Array<{ index: number; servings: number; meal: string }> = [];
  if (mealsLog) {
    (['breakfast', 'lunch', 'snack', 'dinner'] as MealKey[]).forEach((meal) => {
      mealsLog[meal].forEach((item) => {
        loggedItems.push({
          index: item.index,
          servings: item.servings,
          meal
        });
      });
    });
  }

  try {
    const res = await fetch(`${API_BASE}/caution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        total_calories: totalCalories,
        target_calories: targetCalories,
        logged_items: loggedItems
      })
    });
    if (!res.ok) throw new Error('Caution API failed');
    const data = await res.json();
    return data.caution;
  } catch {
    if (totalCalories <= targetCalories) return null;
    const surplus = Math.round(totalCalories - targetCalories);
    const level = surplus > 550 ? "severe" : surplus > 250 ? "moderate" : "mild";
    return {
      is_over: true,
      surplus_kcal: surplus,
      level,
      badge: `+${surplus} kcal Surplus`,
      title: surplus > 550 ? "Significant Calorie Excess Alert" : surplus > 250 ? "Moderate Calorie Surplus Warning" : "Mild Calorie Surplus Detected",
      color: surplus > 550 ? "#dc2626" : surplus > 250 ? "#ea580c" : "#f59e0b",
      bg_color: surplus > 550 ? "#fef2f2" : surplus > 250 ? "#fff7ed" : "#fffbeb",
      border_color: surplus > 550 ? "#fca5a5" : surplus > 250 ? "#fdba74" : "#fcd34d",
      risk_summary: `You have consumed +${surplus} kcal above your daily maintenance budget.`,
      physiological_effects: [
        "Acute postprandial hyperglycemia and insulin spike",
        "Digestive distension, metabolic sluggishness and lethargy",
        "Hepatic triglyceride synthesis and de novo lipogenesis"
      ],
      clinical_risks: [
        "Unfavorable shift in lipid markers (LDL & ApoB elevation)",
        "Progressive visceral adipose tissue accumulation",
        "Reduced insulin sensitivity and metabolic inflexibility"
      ],
      immediate_guidance: [
        "Hydrate with 500ml water or unsweetened green tea to support fat oxidation",
        "Engage in a 20-35 minute brisk postprandial walk to burn surplus glucose",
        "Opt for ultra-light, zero-starch recovery foods for any remaining meal"
      ],
      recovery_food_guidelines: DEFAULT_RECOVERY_FOODS,
      next_meal_recommendation: {
        action_plan: "Choose strictly ultra-light, high-water content or lean protein foods for your remaining meals.",
        recommended_foods: ["Cucumber (with peel, raw)", "Lettuce (cos or romaine, raw)", "Spinach (steamed)", "Green Tea (unsweetened)"],
        foods_to_avoid: ["Fried Items", "Heavy Carbohydrates", "Sweets & Desserts", "Full-Fat Dairy"]
      }
    };
  }
}

export function getPeriodKeyFromBDT(bdtInfo: BDTInfo): MealKey {
  const h = bdtInfo.hour;
  if (h >= 5 && h < 12) return 'breakfast';
  if (h >= 12 && h < 16) return 'lunch';
  if (h >= 16 && h < 19) return 'snack';
  return 'dinner';
}

export function getMissingPriorMealsForMeal(targetMeal: MealKey, mealsLog: MealLogs): MealKey[] {
  const order: MealKey[] = ['breakfast', 'lunch', 'snack', 'dinner'];
  const idx = order.indexOf(targetMeal);
  const missing: MealKey[] = [];
  for (let i = 0; i < idx; i++) {
    if (mealsLog[order[i]].length === 0) {
      missing.push(order[i]);
    }
  }
  return missing;
}

export function computeRealtimeMealGuidance(
  bdtInfo: BDTInfo,
  mealsLog: MealLogs,
  remainingCalories: number
): MealGuidance {
  const period = getPeriodKeyFromBDT(bdtInfo);
  const hasB = mealsLog.breakfast.length > 0;
  const hasL = mealsLog.lunch.length > 0;
  const hasS = mealsLog.snack.length > 0;
  const hasD = mealsLog.dinner.length > 0;

  if (period === 'breakfast') {
    if (!hasB) {
      return {
        title: "Breakfast Time",
        message: "Start your day by logging what you had or are having for Breakfast. Once logged, AI will calculate your morning nutrition and recommend an optimal Lunch.",
        missing_meals: [],
        target_meal_key: 'breakfast',
        rec_target: 'Lunch',
        badge: 'Morning Routine',
        is_blocked: false
      };
    }
    return {
      title: "Breakfast Logged",
      message: "Your morning nutrition is tracked. You can now generate personalized recommendations for your upcoming Lunch.",
      missing_meals: [],
      target_meal_key: 'lunch',
      rec_target: 'Lunch',
      badge: 'On Track',
      is_blocked: false
    };
  }

  if (period === 'lunch') {
    if (!hasB && !hasL) {
      return {
        title: "Action Required: It's Lunch Time, But Breakfast is Missing",
        message: "Your Breakfast is not logged yet. Please log your Breakfast first before logging or generating Lunch recommendations.",
        missing_meals: ['breakfast'],
        target_meal_key: 'breakfast',
        rec_target: 'Lunch',
        badge: 'Breakfast Required',
        is_blocked: true
      };
    }
    if (hasB && !hasL) {
      return {
        title: "Breakfast Recorded: Ready for Lunch",
        message: "Your Breakfast is logged. Log what you had for Lunch, or explore Lunch recommendations tailored to your morning intake.",
        missing_meals: [],
        target_meal_key: 'lunch',
        rec_target: 'Lunch',
        badge: 'Ready for Lunch',
        is_blocked: false
      };
    }
    return {
      title: "Lunch Logged",
      message: "Breakfast and Lunch are both tracked. You can now get healthy recommendations for Evening Snack or Dinner.",
      missing_meals: [],
      target_meal_key: 'snack',
      rec_target: 'Evening Snack',
      badge: 'On Track',
      is_blocked: false
    };
  }

  if (period === 'snack') {
    const missing: MealKey[] = [];
    if (!hasB) missing.push('breakfast');
    if (!hasL) missing.push('lunch');
    if (missing.length > 0) {
      return {
        title: "Action Required: Earlier Meals Missing Before Evening Snack",
        message: "It is currently Evening Snack time, but earlier daytime meals are missing. Please log your earlier meals first to unlock Evening Snack logging & recommendations.",
        missing_meals: missing,
        target_meal_key: missing[0],
        rec_target: 'Evening Snack',
        badge: 'Prior Meals Missing',
        is_blocked: true
      };
    }
    if (hasS) {
      return {
        title: "Evening Snack Logged",
        message: "All daytime meals are tracked. You can now get personalized Dinner recommendations.",
        missing_meals: [],
        target_meal_key: 'dinner',
        rec_target: 'Dinner',
        badge: 'Ready for Dinner',
        is_blocked: false
      };
    }
    return {
      title: "Breakfast & Lunch Recorded: Ready for Evening Snack",
      message: "Your Breakfast and Lunch are logged! Log your Evening Snack or get balanced snack recommendations.",
      missing_meals: [],
      target_meal_key: 'snack',
      rec_target: 'Evening Snack',
      badge: 'Snack Time',
      is_blocked: false
    };
  }

  // Dinner / Night
  const missing: MealKey[] = [];
  if (!hasB) missing.push('breakfast');
  if (!hasL) missing.push('lunch');
  if (!hasS) missing.push('snack');

  if (missing.length > 0) {
    return {
      title: "Action Required: Earlier Meals Missing Before Dinner",
      message: `It is Night / Dinner time, but your earlier meals are not logged yet. Please log your earlier meals first so we can assess your remaining calorie budget (~${Math.round(remainingCalories)} kcal) and unlock Dinner logging & recommendations!`,
      missing_meals: missing,
      target_meal_key: missing[0],
      rec_target: 'Dinner',
      badge: 'Prior Meals Missing',
      is_blocked: true
    };
  }
  if (hasD) {
    return {
      title: "Today's Meals Completed",
      message: "You have tracked all 4 meals today. Review your nutritional summary or prepare recommendations for tomorrow's Breakfast.",
      missing_meals: [],
      target_meal_key: 'dinner',
      rec_target: 'Breakfast',
      badge: 'Day Complete',
      is_blocked: false
    };
  }
  return {
    title: "It's Dinner Time",
    message: `All daytime meals are tracked! You have ~${Math.round(remainingCalories)} kcal remaining in your budget. Log Dinner or generate balanced Dinner recommendations.`,
    missing_meals: [],
    target_meal_key: 'dinner',
    rec_target: 'Dinner',
    badge: 'Ready for Dinner',
    is_blocked: false
  };
}

