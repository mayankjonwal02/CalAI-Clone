export interface NutritionData {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  vitamins: string[];
  minerals: string[];
}

export interface GymEquipmentData {
  name: string;
  how_to_use: string;
  warnings: string[];
  instructions: string[];
}

export type UserProfile = {
  name: string;
  age: number | string;   // 👈 allow both
  gender: 'male' | 'female' | 'other';
  height: number | string | null;
  weight: number | string | null;
  activityLevel: 'sedentary' | 'moderate' | 'active';
  goals: {
    calories: number | string | null;
    protein: number | string | null;
    fat: number | string | null;
    carbohydrates: number | string | null;
  };
};



export interface NutritionEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  nutrition: NutritionData;
  timestamp: number;
}