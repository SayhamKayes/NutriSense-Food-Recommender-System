import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, FoodItem, MealKey, MealLogs, CautionData, BDTInfo, DesktopNavTab } from './types';
import {
  fetchBDTInfo,
  calculateProfile,
  fetchCaution,
  computeRealtimeMealGuidance,
  getPeriodKeyFromBDT
} from './services/api';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { CautionModal } from './components/CautionBanner';
import { MealLogger } from './components/MealLogger';
import { FoodDiary } from './components/FoodDiary';
import { AIRecommendations } from './components/AIRecommendations';
import { DatabaseExplorer } from './components/DatabaseExplorer';
import { ProfileModal } from './components/ProfileModal';
import { MobileStickyNav, ActiveTab } from './components/MobileStickyNav';
import {
  CheckCircle2,
  HeartPulse,
  Utensils,
  ChefHat,
  // Database,
  AlertTriangle,
  Lock
} from 'lucide-react';

const INITIAL_USER: UserProfile = {
  name: "Kamal Hossain",
  age: 35,
  gender: "Male",
  height_cm: 175,
  weight_kg: 75,
  activity_level: "moderate",
  goal: "maintain",
  bmi: 24.5,
  bmi_status: "Normal weight",
  bmr: 1674,
  tdee: 2594,
  target_calories: 2594,
  target_protein_g: 143,
  target_carb_g: 324,
  target_fat_g: 81
};

const INITIAL_MEALS: MealLogs = {
  breakfast: [],
  lunch: [],
  snack: [],
  dinner: []
};

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nutrisense_user_v2');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [hasSavedProfile, setHasSavedProfile] = useState<boolean>(() => {
    return localStorage.getItem('nutrisense_profile_configured_v2') === '1';
  });

  const [mealsLog, setMealsLog] = useState<MealLogs>(() => {
    const saved = localStorage.getItem('nutrisense_meals_v2');
    return saved ? JSON.parse(saved) : INITIAL_MEALS;
  });

  const [activeDesktopTab, setActiveDesktopTab] = useState<DesktopNavTab>('tracker');
  const [activeMobileTab, setActiveMobileTab] = useState<ActiveTab>('overview');
  const [activeMeal, setActiveMeal] = useState<MealKey>('breakfast');
  const [bdtInfo, setBdtInfo] = useState<BDTInfo>(() => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const bdt = new Date(utc + 3600000 * 6);
    const h = bdt.getHours();
    let greeting = 'Good Morning';
    let current_meal = 'Breakfast';
    if (h >= 12 && h < 16) {
      greeting = 'Good Afternoon';
      current_meal = 'Lunch';
    } else if (h >= 16 && h < 19) {
      greeting = 'Good Evening';
      current_meal = 'Evening Snack';
    } else if (h >= 19 || h < 5) {
      greeting = 'Good Night';
      current_meal = 'Dinner';
    }
    return {
      time_bdt: bdt.toLocaleTimeString('en-US'),
      date_bdt: bdt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      hour: h,
      minute: bdt.getMinutes(),
      second: bdt.getSeconds(),
      greeting,
      current_meal
    };
  });

  const [caution, setCaution] = useState<CautionData | null>(null);
  const [isCautionOpen, setIsCautionOpen] = useState<boolean>(false);
  // Open Edit Health & Nutrition Profile popup on startup with opaque white background
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(true);
  const [isInitialPopup, setIsInitialPopup] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  const prevTotalCaloriesRef = useRef<number>(0);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nutrisense_user_v2', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nutrisense_meals_v2', JSON.stringify(mealsLog));
  }, [mealsLog]);

  // Fetch BDT Info & initialize starting meal sequentially
  useEffect(() => {
    fetchBDTInfo().then((info) => {
      setBdtInfo(info);
      const initialGuidance = computeRealtimeMealGuidance(info, mealsLog, user.target_calories);
      setActiveMeal(initialGuidance.target_meal_key);
    });

    const timer = setInterval(() => {
      fetchBDTInfo().then(setBdtInfo).catch(() => { });
    }, 60000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute daily totals
  const { totalCalories, totalProtein, totalCarbs, totalFat, totalCount, consumedIndices } = useMemo(() => {
    let cals = 0;
    let prot = 0;
    let carbs = 0;
    let fat = 0;
    let count = 0;
    const indices: number[] = [];

    const keys: MealKey[] = ['breakfast', 'lunch', 'snack', 'dinner'];
    keys.forEach((key) => {
      const items = mealsLog[key];
      items.forEach((item) => {
        cals += item.food.Energ_Kcal * item.servings;
        prot += item.food.Protein_g * item.servings;
        carbs += item.food.Carbohydrt_g * item.servings;
        fat += item.food.Lipid_Tot_g * item.servings;
        indices.push(item.food.index);
        count++;
      });
    });

    return {
      totalCalories: Math.round(cals),
      totalProtein: Math.round(prot * 10) / 10,
      totalCarbs: Math.round(carbs * 10) / 10,
      totalFat: Math.round(fat * 10) / 10,
      totalCount: count,
      consumedIndices: indices
    };
  }, [mealsLog]);

  const remainingBudget = Math.max(0, user.target_calories - totalCalories);
  const currentPeriod = useMemo(() => getPeriodKeyFromBDT(bdtInfo), [bdtInfo]);
  const guidance = useMemo(
    () => computeRealtimeMealGuidance(bdtInfo, mealsLog, remainingBudget),
    [bdtInfo, mealsLog, remainingBudget]
  );

  // Monitor item-specific cautions & calorie surplus; pop up automatically when overloaded
  useEffect(() => {
    let active = true;
    const wasOver = prevTotalCaloriesRef.current > user.target_calories;
    const isNowOver = totalCalories > user.target_calories;
    const increasedWhileOver = isNowOver && totalCalories > prevTotalCaloriesRef.current;

    if (totalCount > 0 || isNowOver) {
      fetchCaution(totalCalories, user.target_calories, mealsLog).then((data) => {
        if (!active) return;
        setCaution(data);
        if (isNowOver && (!wasOver || increasedWhileOver)) {
          setIsCautionOpen(true);
        }
      });
    } else {
      setCaution(null);
    }

    prevTotalCaloriesRef.current = totalCalories;
    return () => {
      active = false;
    };
  }, [totalCalories, user.target_calories, mealsLog, totalCount]);

  // Handlers
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  const handleAddFood = (meal: MealKey, food: FoodItem, servings: number) => {
    const newItem = {
      index: food.index,
      servings,
      food,
      id: `${food.index}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };

    setMealsLog((prev) => ({
      ...prev,
      [meal]: [...prev[meal], newItem]
    }));

    showToast(`Added ${servings}x ${food.Clean_Name.substring(0, 32)} to ${meal.toUpperCase()}`);
  };

  const handleDeleteItem = (meal: MealKey, id: string) => {
    setMealsLog((prev) => ({
      ...prev,
      [meal]: prev[meal].filter((item) => item.id !== id)
    }));
    showToast(`Removed item from ${meal.toUpperCase()}`);
  };

  const handleResetLog = () => {
    if (window.confirm("Are you sure you want to clear all logged meals for today?")) {
      setMealsLog(INITIAL_MEALS);
      setIsCautionOpen(false);
      const resetGuidance = computeRealtimeMealGuidance(bdtInfo, INITIAL_MEALS, user.target_calories);
      setActiveMeal(resetGuidance.target_meal_key);
      showToast("All daily meal logs have been reset.");
    }
  };

  const handleQuickAdd = (meal: MealKey, food: FoodItem) => {
    handleAddFood(meal, food, 1);
  };

  const handleSaveProfile = async (updated: Partial<UserProfile>) => {
    try {
      const calculated = await calculateProfile({ ...user, ...updated });
      setUser(calculated);
      setHasSavedProfile(true);
      localStorage.setItem('nutrisense_profile_configured_v2', '1');
      setIsInitialPopup(false);
      setIsProfileOpen(false);
      showToast("Profile & dietary targets updated successfully!");
    } catch (err) {
      console.error(err);
      setUser((prev) => ({ ...prev, ...updated }));
      setHasSavedProfile(true);
      localStorage.setItem('nutrisense_profile_configured_v2', '1');
      setIsInitialPopup(false);
      setIsProfileOpen(false);
    }
  };

  const handleCloseProfile = () => {
    setIsInitialPopup(false);
    setIsProfileOpen(false);
  };

  const handleOpenEditProfile = () => {
    setIsInitialPopup(false);
    setIsProfileOpen(true);
  };

  const handleJumpToMeal = (meal: MealKey) => {
    setActiveMeal(meal);
    setActiveDesktopTab('tracker');
    setActiveMobileTab('logger');
  };

  const isOverBudget = Boolean(caution?.is_over);

  return (
    <div className="min-h-dvh md:h-dvh md:overflow-hidden bg-slate-50 text-slate-900 pb-20 md:pb-0 flex flex-col">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2.5 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-3 flex-1 min-h-0 flex flex-col">
        {/* Top Navigation Bar: Left Brand (clean NutriSense only), Center Menu, Right Metabolic Target */}
        <header className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-200 shrink-0 flex-wrap">
          <div className="flex items-center">
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              NutriSense
            </span>
          </div>

          {/* Center: Navigation Menu */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200"
          >
            <button
              type="button"
              onClick={() => setActiveDesktopTab('tracker')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeDesktopTab === 'tracker'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Meal Tracker</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDesktopTab('recommender')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeDesktopTab === 'recommender'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {guidance.is_blocked ? (
                <Lock className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <ChefHat className="w-3.5 h-3.5" />
              )}
              <span>Meal Recommender</span>
            </button>

            {/* <button
              type="button"
              onClick={() => setActiveDesktopTab('database')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDesktopTab === 'database'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Database</span>
            </button> */}

            <button
              type="button"
              onClick={() => setIsCautionOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isOverBudget
                  ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${isOverBudget ? 'text-red-600' : ''}`} />
              <span>Cautions</span>
              {isOverBudget && caution?.surplus_kcal ? (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[0.65rem] font-extrabold">
                  +{caution.surplus_kcal}
                </span>
              ) : null}
            </button>
          </nav>

          {/* Right: Metabolic Target */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              <span>Metabolic Target: {Math.round(user.target_calories)} kcal</span>
            </span>
          </div>
        </header>

        {/* Desktop Always-Still Top Section: Executive Header + 4 Metric Cards + Macro Bar */}
        <div className="hidden md:block shrink-0">
          <Header
            user={user}
            greetingText={bdtInfo.greeting}
            mealWindow={bdtInfo.current_meal}
            onEditProfile={handleOpenEditProfile}
          />

          <MetricCards
            user={user}
            totalCalories={totalCalories}
            totalProtein={totalProtein}
            totalCarbs={totalCarbs}
            totalFat={totalFat}
          />
        </div>

        {/* Desktop Lower Workspace: Strictly fits inside 100dvh */}
        <main className="hidden md:flex flex-1 min-h-0 flex-col">
          {activeDesktopTab === 'tracker' && (
            <div className="grid grid-cols-12 gap-4 flex-1 min-h-0 items-stretch">
              {/* Left Column (7 columns): Meal Logger */}
              <div className="col-span-7 h-full min-h-0">
                <MealLogger
                  activeMeal={activeMeal}
                  currentPeriod={currentPeriod}
                  mealsLog={mealsLog}
                  guidance={guidance}
                  isOverBudget={isOverBudget}
                  surplusKcal={caution?.surplus_kcal ?? Math.max(0, totalCalories - Math.round(user.target_calories))}
                  onOpenCautions={() => setIsCautionOpen(true)}
                  onSelectMeal={setActiveMeal}
                  onAddFood={handleAddFood}
                />
              </div>

              {/* Right Column (5 columns): Fixed Daily Food Diary with Internal Scrollbar */}
              <div className="col-span-5 h-full min-h-0">
                <FoodDiary
                  mealsLog={mealsLog}
                  onDeleteItem={handleDeleteItem}
                  onResetLog={handleResetLog}
                />
              </div>
            </div>
          )}

          {activeDesktopTab === 'recommender' && (
            <div className="flex-1 min-h-0">
              <AIRecommendations
                consumedIndices={consumedIndices}
                remainingCalories={remainingBudget}
                chosenMeal={activeMeal}
                onQuickAdd={handleQuickAdd}
                isLocked={guidance.is_blocked}
                missingMeals={guidance.missing_meals}
                guidanceMessage={guidance.message}
                defaultTargetMeal={guidance.rec_target}
                onJumpToMeal={handleJumpToMeal}
              />
            </div>
          )}

          {activeDesktopTab === 'database' && (
            <div className="flex-1 min-h-0">
              <DatabaseExplorer />
            </div>
          )}
        </main>

        {/* Mobile View: Controlled by Sticky Bottom Bar */}
        <div className="md:hidden space-y-3">
          {activeMobileTab === 'overview' && (
            <>
              <Header
                user={user}
                greetingText={bdtInfo.greeting}
                mealWindow={bdtInfo.current_meal}
                onEditProfile={handleOpenEditProfile}
                largeClockOnMobile
              />
              <MetricCards
                user={user}
                totalCalories={totalCalories}
                totalProtein={totalProtein}
                totalCarbs={totalCarbs}
                totalFat={totalFat}
              />
            </>
          )}

          {activeMobileTab === 'logger' && (
            <>
              <Header
                user={user}
                greetingText={bdtInfo.greeting}
                mealWindow={bdtInfo.current_meal}
                onEditProfile={handleOpenEditProfile}
              />
              <MetricCards
                user={user}
                totalCalories={totalCalories}
                totalProtein={totalProtein}
                totalCarbs={totalCarbs}
                totalFat={totalFat}
              />
              <MealLogger
                activeMeal={activeMeal}
                currentPeriod={currentPeriod}
                mealsLog={mealsLog}
                guidance={guidance}
                isOverBudget={isOverBudget}
                surplusKcal={caution?.surplus_kcal ?? Math.max(0, totalCalories - Math.round(user.target_calories))}
                onOpenCautions={() => setIsCautionOpen(true)}
                onSelectMeal={setActiveMeal}
                onAddFood={handleAddFood}
              />
            </>
          )}

          {activeMobileTab === 'diary' && (
            <>
              <MetricCards
                user={user}
                totalCalories={totalCalories}
                totalProtein={totalProtein}
                totalCarbs={totalCarbs}
                totalFat={totalFat}
              />
              <FoodDiary
                mealsLog={mealsLog}
                onDeleteItem={handleDeleteItem}
                onResetLog={handleResetLog}
              />
            </>
          )}

          {activeMobileTab === 'recommendations' && (
            <>
              <MetricCards
                user={user}
                totalCalories={totalCalories}
                totalProtein={totalProtein}
                totalCarbs={totalCarbs}
                totalFat={totalFat}
              />
              <AIRecommendations
                consumedIndices={consumedIndices}
                remainingCalories={remainingBudget}
                chosenMeal={activeMeal}
                onQuickAdd={handleQuickAdd}
                isLocked={guidance.is_blocked}
                missingMeals={guidance.missing_meals}
                guidanceMessage={guidance.message}
                defaultTargetMeal={guidance.rec_target}
                onJumpToMeal={handleJumpToMeal}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileStickyNav
        activeTab={activeMobileTab}
        onChangeTab={setActiveMobileTab}
        onOpenCautions={() => setIsCautionOpen(true)}
        loggedCount={totalCount}
        hasCaution={isOverBudget}
      />

      {/* Item-Specific Health Cautions & Dynamic Recovery Foods Popup Modal */}
      <CautionModal
        isOpen={isCautionOpen}
        onClose={() => setIsCautionOpen(false)}
        caution={caution}
        totalCalories={totalCalories}
        targetCalories={user.target_calories}
      />

      {/* Profile & Metabolic Goal Settings Modal (Solid White Backdrop on Initial Open, Clear Backdrop on Edit) */}
      <ProfileModal
        isOpen={isProfileOpen}
        isInitialOnboarding={isInitialPopup || !hasSavedProfile}
        onClose={handleCloseProfile}
        currentProfile={user}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default App;
