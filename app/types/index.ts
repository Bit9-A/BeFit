// User & Profile Types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  height?: number;
  birth_date?: string;
  gender?: "male" | "female" | "other";
  activity_level?:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active";
  goal?: "muscle_gain" | "weight_loss" | "maintenance";

  // Onboarding status
  onboarding_completed?: boolean;

  // Notifications
  notifications_enabled?: boolean;
  reminder_time?: string;

  // Activity tracking
  last_active_at?: string;
  streak_days?: number;
  total_workouts?: number;

  created_at: string;
  updated_at: string;
}

// Metrics Types
export interface Measurement {
  id: string;
  user_id: string;
  weight: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  bmi?: number;
  bazz_metabolic_rate?: number;
  tdee?: number;
  recorded_at: string;
}

export interface CalculatedMetrics {
  bmi: string;
  tmb: number;
  tdee: number;
  status: string;
  explanation: string;
}

// Gym Types
export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  tips: string;
  completed?: boolean;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  ai_explanation?: string;
  plan_data: {
    routineName: string;
    exercises: Exercise[];
    explanation: string;
  };
  is_completed: boolean;
  scheduled_date: string;
  created_at: string;
}

// Kitchen Types
export interface NutritionLog {
  id: string;
  user_id: string;
  image_url?: string;
  meal_name?: string;
  calories?: number;
  macros?: {
    protein: number;
    carbs: number;
    fats: number;
  };
  ai_analysis?: string;
  consumed_at: string;
}

export interface Recipe {
  nombre: string;
  ingredientes?: string[];
  instrucciones: string[];
  calorias: number;
  macros: {
    proteina: string;
    carbohidratos: string;
    grasa: string;
  };
}

export interface FridgeAnalysis {
  ingredientes_detectados: string[];
  receta: Recipe;
  explicacion_xai: string;
}

// Mental Journal Types
export interface JournalEntry {
  id: string;
  user_id: string;
  entry_text: string;
  ai_response?: string;
  mood_detected?: string;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

// Wellness Types
export interface WellnessCard {
  title: string;
  summary: string;
  content: string;
  category: string;
  icon?: string;
}

// Onboarding Types
export interface OnboardingData {
  height?: number;
  weight?: number;
  birthDate?: string;
  gender?: "male" | "female" | "other";
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal?: "muscle_gain" | "weight_loss" | "maintenance";
}
