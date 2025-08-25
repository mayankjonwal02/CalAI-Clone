import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { useCamera } from '@/hooks/useCamera';
import { analyzeGymEquipment } from '@/services/gemini';
import { GymEquipmentData } from '@/services/types';
import { Camera, Image as ImageIcon, Dumbbell, TriangleAlert as AlertTriangle, BookOpen, Info } from 'lucide-react-native';

export default function GymScreen() {
  const { captureImage, pickImage } = useCamera();
  const [equipmentData, setEquipmentData] = useState<GymEquipmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleImageCapture = async (source: 'camera' | 'gallery') => {
    setShowImageModal(false);
    setLoading(true);

    try {
      const imageBase64 = source === 'camera' 
        ? await captureImage()
        : await pickImage();

      if (!imageBase64) {
        setLoading(false);
        return;
      }

      const data = await analyzeGymEquipment(imageBase64);
      setEquipmentData(data);
      Alert.alert('Success', 'Equipment analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing equipment:', error);
      Alert.alert('Error', 'Failed to analyze equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gym Equipment Guide</Text>
        <Text style={styles.subtitle}>Analyze equipment and get usage instructions</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={() => setShowImageModal(true)}
          disabled={loading}
        >
          <Dumbbell size={24} color="#ffffff" />
          <Text style={styles.analyzeButtonText}>
            {loading ? 'Analyzing Equipment...' : 'Analyze Equipment'}
          </Text>
        </TouchableOpacity>

        {equipmentData && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Info size={24} color="#3B82F6" />
              <Text style={styles.equipmentName}>{equipmentData.name}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <BookOpen size={20} color="#10B981" />
                <Text style={styles.sectionTitle}>How to Use</Text>
              </View>
              <Text style={styles.sectionContent}>{equipmentData.how_to_use}</Text>
            </View>

            {equipmentData.instructions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Info size={20} color="#3B82F6" />
                  <Text style={styles.sectionTitle}>Instructions</Text>
                </View>
                {equipmentData.instructions.map((instruction, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.listNumber}>{index + 1}.</Text>
                    <Text style={styles.listText}>{instruction}</Text>
                  </View>
                ))}
              </View>
            )}

            {equipmentData.warnings.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AlertTriangle size={20} color="#F97316" />
                  <Text style={styles.sectionTitle}>Safety Warnings</Text>
                </View>
                {equipmentData.warnings.map((warning, index) => (
                  <View key={index} style={styles.warningItem}>
                    <AlertTriangle size={16} color="#F97316" />
                    <Text style={styles.warningText}>{warning}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {!equipmentData && (
          <View style={styles.placeholderCard}>
            <Dumbbell size={64} color="#E5E7EB" />
            <Text style={styles.placeholderTitle}>No Equipment Analyzed</Text>
            <Text style={styles.placeholderText}>
              Capture or upload an image of gym equipment to get detailed usage instructions and safety information.
            </Text>
          </View>
        )}
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
            <Text style={styles.modalTitle}>Analyze Equipment</Text>
            <Text style={styles.modalSubtitle}>Choose how to capture the equipment</Text>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleImageCapture('camera')}
            >
              <Camera size={24} color="#3B82F6" />
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleImageCapture('gallery')}
            >
              <ImageIcon size={24} color="#3B82F6" />
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
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  analyzeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 12,
  },
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  equipmentName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 8,
  },
  sectionContent: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  listNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
    marginRight: 8,
    minWidth: 20,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 24,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    backgroundColor: '#FEF3E8',
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#EA580C',
    marginLeft: 8,
    lineHeight: 20,
  },
  placeholderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 48,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  placeholderTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
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