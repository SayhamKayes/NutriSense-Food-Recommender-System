import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { X, Check, HeartPulse } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  isInitialOnboarding?: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
}

interface ProfileFormProps {
  isInitialOnboarding: boolean;
  currentProfile: UserProfile;
  onCancel: () => void;
  onSave: (updated: Partial<UserProfile>) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  isInitialOnboarding,
  currentProfile,
  onCancel,
  onSave
}) => {
  const [name, setName] = useState<string>(() => (isInitialOnboarding ? '' : currentProfile.name || ''));
  const [age, setAge] = useState<string>(() => (isInitialOnboarding ? '' : String(currentProfile.age || '')));
  const [gender, setGender] = useState<string>(() => currentProfile.gender || 'Male');
  const [heightCm, setHeightCm] = useState<string>(() =>
    isInitialOnboarding ? '' : String(currentProfile.height_cm || '')
  );
  const [weightKg, setWeightKg] = useState<string>(() =>
    isInitialOnboarding ? '' : String(currentProfile.weight_kg || '')
  );
  const [activity, setActivity] = useState<string>(() => currentProfile.activity_level || 'moderate');
  const [goal, setGoal] = useState<string>(() => currentProfile.goal || 'maintain');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || 'Kamal Hossain',
      age: Number(age) || 35,
      gender,
      height_cm: Number(heightCm) || 175,
      weight_kg: Number(weightKg) || 75,
      activity_level: activity,
      goal
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
      <div>
        <label htmlFor="profile-name" className="font-bold text-slate-700 block mb-1">
          Full Name:
        </label>
        <input
          id="profile-name"
          name="name"
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full font-semibold border border-slate-300 rounded-lg p-2 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Kamal Hossain"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="profile-age" className="font-bold text-slate-700 block mb-1">
            Age (Years):
          </label>
          <input
            id="profile-age"
            name="age"
            type="number"
            min={12}
            max={100}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full font-semibold border border-slate-300 rounded-lg p-2 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="35"
            required
          />
        </div>
        <div>
          <label htmlFor="profile-gender" className="font-bold text-slate-700 block mb-1">
            Gender:
          </label>
          <select
            id="profile-gender"
            name="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full font-semibold border border-slate-300 rounded-lg p-2 text-slate-800 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="profile-height" className="font-bold text-slate-700 block mb-1">
            Height (cm):
          </label>
          <input
            id="profile-height"
            name="height_cm"
            type="number"
            step="0.5"
            min={100}
            max={250}
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="w-full font-semibold border border-slate-300 rounded-lg p-2 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="175"
            required
          />
        </div>
        <div>
          <label htmlFor="profile-weight" className="font-bold text-slate-700 block mb-1">
            Weight (kg):
          </label>
          <input
            id="profile-weight"
            name="weight_kg"
            type="number"
            step="0.5"
            min={30}
            max={250}
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="w-full font-semibold border border-slate-300 rounded-lg p-2 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="75"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="profile-activity" className="font-bold text-slate-700 block mb-1">
            Activity Level:
          </label>
          <select
            id="profile-activity"
            name="activity_level"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full font-semibold border border-slate-300 rounded-lg p-2 text-slate-800 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="sedentary">Sedentary (Little/no exercise)</option>
            <option value="light">Lightly active (1-3 days/week)</option>
            <option value="moderate">Moderately active (3-5 days/wk)</option>
            <option value="active">Very active (6-7 days/wk)</option>
            <option value="very_active">Athlete / Extra active</option>
          </select>
        </div>
        <div>
          <label htmlFor="profile-goal" className="font-bold text-slate-700 block mb-1">
            Dietary Goal:
          </label>
          <select
            id="profile-goal"
            name="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full font-semibold border border-slate-300 rounded-lg p-2 text-slate-800 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="weight_loss">Weight Loss (-400 kcal)</option>
            <option value="maintain">Maintain Weight</option>
            <option value="muscle_gain">Muscle Gain (+400 kcal)</option>
          </select>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-1.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
        >
          <Check className="w-4 h-4" /> Save Profile
        </button>
      </div>
    </form>
  );
};

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  isInitialOnboarding = false,
  onClose,
  currentProfile,
  onSave
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Open/close native <dialog> modal cleanly
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Light-dismiss fallback for browsers without native closedby="any" support
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
      if (pressedOutside && isOutside(e)) {
        dialog.close();
      }
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const formKey = isOpen
    ? `${isInitialOnboarding}-${currentProfile.name}-${currentProfile.age}-${currentProfile.height_cm}-${currentProfile.weight_kg}-${currentProfile.activity_level}-${currentProfile.goal}`
    : 'closed';

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as Record<string, string>)}
      aria-labelledby="profile-dialog-title"
      onClose={onClose}
      className={`m-auto p-0 bg-transparent border-0 max-w-md w-[calc(100%-2rem)] rounded-2xl shadow-2xl overflow-visible ${
        isInitialOnboarding ? 'dialog-solid-backdrop' : 'dialog-subtle-backdrop'
      }`}
    >
      <div className="bg-white rounded-2xl border border-slate-200 w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 id="profile-dialog-title" className="font-extrabold text-slate-900 text-base">
                Edit Health &amp; Nutrition Profile
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Calculates your accurate BMR, TDEE and daily macros.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close profile dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ProfileForm
          key={formKey}
          isInitialOnboarding={isInitialOnboarding}
          currentProfile={currentProfile}
          onCancel={() => dialogRef.current?.close()}
          onSave={onSave}
        />
      </div>
    </dialog>
  );
};
