export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  activity_level: string;
  goal: string;
  bmi: number;
  bmi_status: string;
  bmr: number;
  tdee: number;
  target_calories: number;
  target_protein_g: number;
  target_carb_g: number;
  target_fat_g: number;
}

export interface FoodItem {
  index: number;
  NDB_No?: number;
  Clean_Name: string;
  Category: string;
  Origin: string;
  Energ_Kcal: number;
  Protein_g: number;
  Carbohydrt_g: number;
  Lipid_Tot_g: number;
  Fiber_TD_g: number;
  GmWt_Desc1: string;
  GmWt_1?: number;
  similarity_score?: number;
}

export interface LoggedItem {
  index: number;
  servings: number;
  food: FoodItem;
  id: string;
}

export type MealKey = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type MealLogs = Record<MealKey, LoggedItem[]>;

export type DesktopNavTab = 'tracker' | 'recommender' | 'database';

export interface RecoveryFoodGuideline {
  index?: number;
  name: string;
  calories: number;
  serving: string;
  macros: string;
  origin?: string;
  category?: string;
  benefits: string;
}

export interface ItemCaution {
  index: number;
  name: string;
  category: string;
  origin: string;
  servings: number;
  meals: string[];
  calories: number;
  risk_level: 'high' | 'moderate' | 'low';
  flags: string[];
  caution_note: string;
  burn_tip: string;
}

export interface BurnActivityPlan {
  surplus_kcal: number;
  brisk_walk_minutes: number;
  cycling_minutes: number;
}

export interface CautionData {
  is_over?: boolean;
  surplus_kcal?: number;
  level: string;
  badge?: string;
  title: string;
  color: string;
  bg_color: string;
  border_color: string;
  risk_summary: string;
  physiological_effects: string[];
  clinical_risks: string[];
  immediate_guidance: string[];
  item_cautions?: ItemCaution[];
  recovery_food_guidelines?: RecoveryFoodGuideline[];
  burn_activity_plan?: BurnActivityPlan;
  next_meal_recommendation: {
    recommended_foods: string[];
    foods_to_avoid: string[];
    action_plan: string;
  };
}

export interface MealGuidance {
  title: string;
  message: string;
  missing_meals: MealKey[];
  target_meal_key: MealKey;
  rec_target: string;
  badge: string;
  is_blocked: boolean;
}

export interface RecommendationResponse {
  recommendations: FoodItem[];
  justification: string;
  metrics: {
    model_name: string;
    avg_similarity: number;
    caloric_adherence: number;
    overall_accuracy: number;
    latent_dim: string;
    active_layer: string;
  };
}

export interface BDTInfo {
  time_bdt: string;
  date_bdt: string;
  hour: number;
  minute: number;
  second: number;
  greeting: string;
  current_meal: string;
}

