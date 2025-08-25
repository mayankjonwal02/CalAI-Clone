import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { NutritionData, NutritionEntry } from './types';

export const saveNutritionEntry = async (userId: string, nutrition: NutritionData) => {
  try {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0]; // HH:mm:ss

    const entry: Omit<NutritionEntry, 'id'> = {
      userId,
      date,
      time,
      nutrition,
      timestamp: now.getTime(),
    };

    const docRef = await addDoc(collection(db, 'nutrition'), entry);
    return { id: docRef.id, ...entry };
  } catch (error) {
    console.error('Error saving nutrition entry:', error);
    throw error;
  }
};

export const subscribeToNutritionEntries = (
  userId: string,
  date: string,
  callback: (entries: NutritionEntry[]) => void
) => {
  console.log(userId, date)
  const q = query(
    collection(db, 'nutrition'),
    where('userId', '==', userId),
    where('date', '==', date),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const entries: NutritionEntry[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as NutritionEntry[];
    console.log(entries)
    callback(entries);
  });
};

export const getTodaysNutritionSummary = (entries: NutritionEntry[]) => {
  return entries.reduce(
    (summary, entry) => ({
      calories: summary.calories + entry.nutrition.calories,
      protein: summary.protein + entry.nutrition.protein,
      fat: summary.fat + entry.nutrition.fat,
      carbohydrates: summary.carbohydrates + entry.nutrition.carbohydrates,
    }),
    { calories: 0, protein: 0, fat: 0, carbohydrates: 0 }
  );
};