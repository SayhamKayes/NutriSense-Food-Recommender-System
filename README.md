# NutriSense - AI-Powered Sequential Dietary Health & Metabolic Nutrition Recommender

This repository contains the **React 19 + TypeScript + Vite 8 + Tailwind CSS 4** frontend application for **NutriSense**, an intelligent dietary management and sequential meal recommendation platform powered by a **FastAPI + PyTorch** neural backend.

---

## Key Highlights & Recent Updates (v2.0)

1. **Multi-Architecture Neural Meal Recommender (`AIRecommendations.tsx`)**:
   - **Unified NutriEnsemble (`Ensemble` — Default)**: Soft-voting latent ensemble fusing **Pre-Trained Dietary Transformer (`60%`)** and **LSTM Sequential Tracker (`40%`)** embeddings with L2 normalization and dual-cluster metabolic regime calibration (`RF + SVM-2C-RF + Pre-Trained Transformer`).
   - **Pre-Trained Dietary Transformer (`NutriFormer`)**: 2-layer, 4-head Multi-Head Self-Attention encoder (`dietary_transformer.pth`) modeling inter-meal nutrient dependencies.
   - **LSTM Dietary Sequential Tracker**: Recurrent neural network (`lstm_dietary_tracker.pth`) capturing sequential meal transitions (`Breakfast -> Lunch -> Evening Snack -> Dinner`).
   - **Personalized Food Choice-List Input**: Comma-separated food preference filter (`e.g., Rice, Fish, Chicken, Dal, Yogurt, Vegetable, Fruit`) that boosts matching items (`+0.45`) in the 16-D latent similarity pipeline.
   - **100% Clinical Caution-Free Guardrail**: Ensures all AI-recommended meals exclude non-meal ingredients and high-caution foods (fried items, high sugar, excess sodium, high saturated fat) while adhering to the target meal's calorie budget.
   - **Live AI Telemetry HUD**: Displays active model architecture, average cosine similarity (%), caloric adherence (%), and 16-D latent regime metadata.

2. **Dual Nutrition Database (8,980 Verified Items)**:
   - **Bangladeshi Everyday Staples (190 Items)**: Authentic local dishes and staples with standard household serving descriptions and verified macronutrients.
   - **Global USDA Database (8,790 Items)**: Full USDA nutritional dataset cleaned with natural English title expansion and strict unique name deduplication.

3. **Chronological Meal Locking & Real-Time BDT Wall Clock**:
   - **Sapling SVG Analog Clock (`AnalogClock.tsx`)**: Real-time synchronization with Bangladesh Standard Time (UTC+6) and smooth sweeping hands.
   - **Sequential Meal Guidance (`MealLogger.tsx`)**: Enforces chronological logging (`Breakfast -> Lunch -> Evening Snack -> Dinner`). Later meals and AI recommendations remain locked until prior daytime meals are recorded, with instant one-click jump buttons.

4. **Per-Item Clinical Cautions & Dynamic Recovery Foods Modal (`CautionBanner.tsx`)**:
   - Evaluates every logged food across saturated fat, total lipids, simple sugars, refined carbs, sodium, cholesterol, and caloric density.
   - Automatically triggers a native `<dialog>` popup when daily caloric intake exceeds the user's TDEE target.
   - Provides a personalized **Burn Activity Plan** (brisk walk & cycling minutes) and 5 dynamically selected low-calorie recovery foods from the 8,980-item database tailored to offset the user's exact macro/sodium excesses.

5. **Responsive Executive Desktop & Mobile Touch Experience**:
   - **Desktop (`md:h-dvh`)**: Zero-scroll single-screen executive layout with persistent header, BDT clock, 4 macro metric cards, and tabbed workspace (`Meal Tracker`, `Meal Recommender`, `Cautions`).
   - **Mobile**: Native-feel sticky bottom navigation (`Overview`, `Meal Tracker`, `Diary`, `Recommender`, `Cautions`) with locked-viewport `Overview` and smooth vertical touch-scrolling (`pan-y`) on data-entry and recommendation tabs.
   - **Initial Onboarding Modal (`ProfileModal.tsx`)**: Native HTML `<dialog>` onboarding calculating BMI, BMR, TDEE, and daily macro targets via the Mifflin-St Jeor equation.

---

## Neural Model Architecture & Recommendation Workflow

```
Consumed Food Indices [i_1, i_2, ..., i_t]
          │
          ▼
┌──────────────────────────────────────────────────────────┐
│ 1. Nutritional Autoencoder (nutritional_autoencoder.pth) │
│    46 Nutrient Features ──► 32 (ReLU) ──► 16-D Latent    │
└─────────────────────────┬────────────────────────────────┘
                          │ Sequence Tensor: (1, seq_len, 16)
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│ 2A. Dietary Transformer   │   │ 2B. LSTM Dietary Tracker  │
│     (NutriFormer)         │   │     (UserDietaryTracker)  │
│  2 Layers, 4 Attn Heads   │   │  LSTM(16 -> 32) -> FC(16) │
│  dietary_transformer.pth  │   │  lstm_dietary_tracker.pth │
└─────────────┬─────────────┘   └─────────────┬─────────────┘
              │ (0.60 Weight)                 │ (0.40 Weight)
              └───────────────┬───────────────┘
                              ▼
┌──────────────────────────────────────────────────────────┐
│ 3. Unified NutriEnsemble Latent Fusion & Regime Cluster  │
│    e_target = L2Normalize(0.60 * e_tr + 0.40 * e_lstm)   │
│    - Cluster 1: High-Energy Regime (target >= 380 kcal)  │
│    - Cluster 0: Low/Mod-Calorie Regime (< 380 kcal)      │
└─────────────────────────┬────────────────────────────────┘
                          │ Cosine Similarity vs 8,980 Items
                          ▼
┌──────────────────────────────────────────────────────────┐
│ 4. Clinical Guardrails & Multi-Objective Re-Ranking      │
│    - Mask already consumed items (-2.0)                  │
│    - 100% Caution-Free Guardrail (kcal<=360, fat<15g,    │
│      sat_fat<5g, sugar<12g, sodium<450mg, chol<100mg)    │
│    - User Choice-List Regex Match Boost (+0.45)          │
│    - Caloric Proximity Penalty & BD Staple Bonus (+0.08) │
└──────────────────────────────────────────────────────────┘
```

### Selecting a Model in the Frontend UI
In the **Meal Recommender** tab (`src/components/AIRecommendations.tsx`):
1. Choose the active architecture toggle in the top-right header:
   - **Unified Ensemble** (`modelType = 'Ensemble'` — Default)
   - **Dietary Transformer** (`modelType = 'Transformer'`)
   - **LSTM Tracker** (`modelType = 'LSTM'`)
2. Select your **Recommendation Target Meal** (`Breakfast`, `Lunch`, `Evening Snack`, or `Dinner`).
3. Customize **Your Food Choice List** (comma-separated keywords such as `Rice, Fish, Chicken, Dal, Yogurt, Vegetable, Fruit`).
4. Click **Generate Recommendations** to fetch top-5 caution-free meals and inspect real-time model telemetry.
5. Click **+ Quick Add** on any recommendation card to log it directly into your active meal diary.

---

## Frontend Project Structure

```text
frontend/
├── public/
│   └── NutriSenseLogo.png              # Brand identity asset
├── src/
│   ├── components/
│   │   ├── AnalogClock.tsx             # Sapling SVG Analog Clock (BDT UTC+6)
│   │   ├── Header.tsx                  # Dynamic BDT greeting, meal window & profile trigger
│   │   ├── MetricCards.tsx             # 4 Primary calorie/BMI cards & macro progress bars
│   │   ├── CautionBanner.tsx           # Clinical caution report, burn plan & recovery foods dialog
│   │   ├── MealLogger.tsx              # Chronological meal logger, database toggle & search
│   │   ├── FoodDiary.tsx               # Daily logged foods table with per-item delete & reset
│   │   ├── AIRecommendations.tsx       # Neural model selector, choice list input & telemetry HUD
│   │   ├── DatabaseExplorer.tsx        # Interactive 8,980-item food database viewer
│   │   ├── ProfileModal.tsx            # Native <dialog> onboarding & Mifflin-St Jeor editor
│   │   └── MobileStickyNav.tsx         # Mobile bottom navigation bar with live diary badge
│   ├── services/
│   │   └── api.ts                      # Backend API service with X-Client-Key & offline fallbacks
│   ├── types/
│   │   └── index.ts                    # TypeScript interfaces for profiles, foods, cautions & recs
│   ├── App.tsx                         # Main application state, BDT sync & responsive layout
│   ├── main.tsx                        # React 19 root mount
│   └── index.css                       # Tailwind CSS 4 styles, dialog backdrops & scroll utilities
├── .env.example                        # Environment variable template (VITE_API_URL, VITE_API_KEY)
├── vercel.json                         # Vercel deployment headers & SPA rewrites
├── package.json                        # Scripts & dependencies
└── vite.config.ts                      # Vite bundler & dev proxy configuration
```

---

## Local Development & Build

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
VITE_API_URL=http://127.0.0.1:8000
VITE_API_KEY=your-shared-secret-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Production Type-Check & Build
```bash
npm run build
npm run lint
```

---

## Deployment (Vercel)

This frontend is pre-configured for **Vercel** via `vercel.json` (including SPA rewrite rules and `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` security headers).

Configure the following environment variables in **Vercel Project Settings -> Environment Variables**:
- `VITE_API_URL`: Your deployed FastAPI backend URL (e.g., `https://nutrisense-backend.onrender.com`)
- `VITE_API_KEY`: Must match the `API_ACCESS_KEY` configured on the backend service.
