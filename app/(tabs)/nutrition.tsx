import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useCamera } from '@/hooks/useCamera';
import { analyzeFood } from '@/services/gemini';
import { saveNutritionEntry, subscribeToNutritionEntries, getTodaysNutritionSummary } from '@/services/nutrition';
import { NutritionEntry } from '@/services/types';
import { Camera, Image as ImageIcon, Plus, Target, TrendingUp } from 'lucide-react-native';

export default function NutritionScreen() {
  const { user, getUserProfile } = useAuth();
  const { captureImage, pickImage } = useCamera();
  const [todaysEntries, setTodaysEntries] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 150,
    fat: 70,
    carbohydrates: 250,
  });

  const today = new Date().toISOString().split('T')[0];
  const todaysSummary = getTodaysNutritionSummary(todaysEntries);

  // 🔹 Fetch user profile goals when user changes
  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;

      try {
        const userProfile = await getUserProfile(user.uid);

        if (userProfile?.goals) {
          setGoals({
            calories: userProfile.goals.calories ?? 2000,
            protein: userProfile.goals.protein ?? 150,
            fat: userProfile.goals.fat ?? 70,
            carbohydrates: userProfile.goals.carbohydrates ?? 250,
          });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchGoals();
  }, [user]);

  // 🔹 Subscribe to today's entries
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNutritionEntries(
      user.uid,
      today,
      setTodaysEntries
    );

    return unsubscribe;
  }, [user, today]);

  const handleImageCapture = async (source: 'camera' | 'gallery') => {
    setShowImageModal(false);
    setLoading(true);

    try {
      const imageBase64 =
        source === 'camera' ? await captureImage() : await pickImage();

      if (!imageBase64) {
        setLoading(false);
        return;
      }

      const nutritionData = await analyzeFood(imageBase64);

      if (user) {
        await saveNutritionEntry(user.uid, nutritionData);
        Alert.alert('Success', 'Nutrition data analyzed and saved!');
      }
    } catch (error) {
      console.error('Error analyzing food:', error);
      Alert.alert('Error', 'Failed to analyze food. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatNumber = (num: number) => {
    return Number.isInteger(num) ? num.toString() : num.toFixed(1);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nutrition Tracker</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Target size={24} color="#10B981" />
            <Text style={styles.summaryTitle}>Today&apos;s Progress</Text>
          </View>

          <View style={styles.macroGrid}>
            {Object.entries(goals).map(([key, goal]) => {
              const current = todaysSummary[key as keyof typeof todaysSummary];
              const percentage = getProgressPercentage(current, goal);

              return (
                <View key={key} style={styles.macroItem}>
                  <Text style={styles.macroLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  <Text style={styles.macroValue}>{formatNumber(current)}/{goal}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${percentage}%` },
                        percentage >= 100 && styles.progressComplete
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Add Food Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowImageModal(true)}
          disabled={loading}
        >
          <Plus size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>
            {loading ? 'Analyzing...' : 'Add Food'}
          </Text>
        </TouchableOpacity>

        {/* Nutrition Entries */}
        <View style={styles.entriesSection}>
          <View style={styles.entriesHeader}>
            <TrendingUp size={20} color="#6B7280" />
            <Text style={styles.entriesTitle}>Today&apos;s Entries</Text>
          </View>

          {todaysEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No nutrition entries yet today</Text>
              <Text style={styles.emptySubtext}>Capture or upload food images to get started</Text>
            </View>
          ) : (
            todaysEntries.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTime}>{formatTime(entry.time)}</Text>
                  <Text style={styles.entryCalories}>{formatNumber(entry.nutrition.calories)} cal</Text>
                </View>

                <View style={styles.entryMacros}>
                  <Text style={styles.entryMacro}>P: {formatNumber(entry.nutrition.protein)}g</Text>
                  <Text style={styles.entryMacro}>F: {formatNumber(entry.nutrition.fat)}g</Text>
                  <Text style={styles.entryMacro}>C: {formatNumber(entry.nutrition.carbohydrates)}g</Text>
                </View>

                {entry.nutrition.vitamins.length > 0 && (
                  <View style={styles.vitaminsContainer}>
                    <Text style={styles.vitaminsLabel}>Vitamins:</Text>
                    <Text style={styles.vitaminsText}>{entry.nutrition.vitamins.join(', ')}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Image Source Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Food</Text>
            <Text style={styles.modalSubtitle}>Choose how to capture your food</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleImageCapture('camera')}
            >
              <Camera size={24} color="#10B981" />
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleImageCapture('gallery')}
            >
              <ImageIcon size={24} color="#10B981" />
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowImageModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 12,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  macroItem: {
    width: '48%',
    marginBottom: 16,
  },
  macroLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressComplete: {
    backgroundColor: '#059669',
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 12,
  },
  entriesSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  entriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  entriesTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryTime: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  entryCalories: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
  },
  entryMacros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryMacro: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  vitaminsContainer: {
    marginTop: 8,
  },
  vitaminsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  vitaminsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 12,
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
});