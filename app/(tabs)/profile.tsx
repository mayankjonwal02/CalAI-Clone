import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/services/types';
import { User, CreditCard as Edit3, Save, LogOut, Target } from 'lucide-react-native';
import { Portal, Dialog, Button, Paragraph } from "react-native-paper";


export default function ProfileScreen() {
  const { user, logout, getUserProfile, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: 0,
    gender: 'male',
    height: 0,
    weight: 0,
    activityLevel: 'moderate',
    goals: {
      calories: 2000,
      protein: 150,
      fat: 70,
      carbohydrates: 250,
    },
  });
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      const userData = await getUserProfile(user.uid);
      console.log("UserData:", userData)
      if (userData) {
        setProfile(userData);
      }
      if (userData) {
        setProfile(userData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [user, getUserProfile]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    const profileToSave = {
      ...profile,
      age: profile.age ? parseInt(profile.age as unknown as string, 10) : 0, // convert safely
    };
    const { error } = await updateUserProfile(user.uid, profileToSave);

    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('Success', 'Profile updated successfully!');
      setEditing(false);
    }

    setLoading(false);
  };

  const handleLogout = () => {
    console.log('Logout button pressed')
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout().then(({ error }) => {
              if (error) {
                Alert.alert("Error", error);
              } else {
                router.replace("/login"); // adjust path to your actual login route
              }
            });
          },
        },
      ]
    );
  };


  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'active', label: 'Active' },
  ];

  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  return (



    <View style={styles.container}>
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to logout?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button onPress={() => {
              logout();
              router.replace("/login");
            }}>Logout</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setVisible(true)}
          // onPress={() => console.log('Logout button pressed')}
          >
            <LogOut size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <User size={20} color="#10B981" />
            <Text style={styles.cardTitle}>Personal Information</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(!editing)}
            >
              <Edit3 size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={profile.name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
              editable={editing}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={profile.age?.toString() ?? ''}
                onChangeText={(text) =>
                  setProfile(prev => ({
                    ...prev,
                    age: text, // 👈 keep as string
                  }))
                }
                editable={editing}
                keyboardType="numeric"
                placeholder="Age"
                placeholderTextColor="#9CA3AF"
              />

            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.segmentedControl}>
                {genders.map((gender) => (
                  <TouchableOpacity
                    key={gender.value}
                    style={[
                      styles.segmentButton,
                      profile.gender === gender.value && styles.segmentButtonActive,
                      !editing && styles.segmentButtonDisabled,
                    ]}
                    onPress={() => editing && setProfile(prev => ({ ...prev, gender: gender.value as any }))}
                    disabled={!editing}
                  >
                    <Text style={[
                      styles.segmentButtonText,
                      profile.gender === gender.value && styles.segmentButtonTextActive,
                    ]}>
                      {gender.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={profile.height !== null && profile.height !== undefined ? profile.height.toString() : ''}
                onChangeText={(text) => setProfile(prev => ({ ...prev, height: text === '' ? null : parseInt(text, 10) }))}
                editable={editing}
                keyboardType="numeric"
                placeholder="Height"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={profile.weight !== null && profile.weight !== undefined ? profile.weight.toString() : ''}
                onChangeText={(text) => setProfile(prev => ({ ...prev, weight: text === '' ? null : parseInt(text, 10) }))}
                editable={editing}
                keyboardType="numeric"
                placeholder="Weight"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Activity Level</Text>
            <View style={styles.segmentedControl}>
              {activityLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.segmentButton,
                    profile.activityLevel === level.value && styles.segmentButtonActive,
                    !editing && styles.segmentButtonDisabled,
                  ]}
                  onPress={() => editing && setProfile(prev => ({ ...prev, activityLevel: level.value as any }))}
                  disabled={!editing}
                >
                  <Text style={[
                    styles.segmentButtonText,
                    profile.activityLevel === level.value && styles.segmentButtonTextActive,
                  ]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Goals */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Target size={20} color="#F97316" />
            <Text style={styles.cardTitle}>Daily Goals</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Calories</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={profile.goals && profile.goals.calories != null ? String(profile.goals.calories) : ''}
                onChangeText={(text) =>
                  setProfile(prev => ({
                    ...prev,
                    goals: {
                      ...prev.goals,
                      calories: text === '' ? null : parseInt(text, 10),
                    },
                  }))
                }
                editable={editing}
                keyboardType="numeric"
                placeholder="2000"
                placeholderTextColor="#9CA3AF"
              />

            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={profile.goals && profile.goals.protein != null ? String(profile.goals.protein) : ''}
                onChangeText={(text) =>
                  setProfile(prev => ({
                    ...prev,
                    goals: {
                      ...prev.goals,
                      protein: text === '' ? null : parseInt(text, 10),
                    },
                  }))
                }
                editable={editing}
                keyboardType="numeric"
                placeholder="150"
                placeholderTextColor="#9CA3AF"
              />

            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Fat (g)</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={profile.goals && profile.goals.fat != null ? String(profile.goals.fat) : ''}
                onChangeText={(text) =>
                  setProfile(prev => ({
                    ...prev,
                    goals: {
                      ...prev.goals,
                      fat: text === '' ? null : parseInt(text, 10),
                    },
                  }))
                }
                editable={editing}
                keyboardType="numeric"
                placeholder="70"
                placeholderTextColor="#9CA3AF"
              />

            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Carbs (g)</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={profile.goals && profile.goals.carbohydrates != null ? String(profile.goals.carbohydrates) : ''}
                onChangeText={(text) =>
                  setProfile(prev => ({
                    ...prev,
                    goals: {
                      ...prev.goals,
                      carbohydrates: text === '' ? null : parseInt(text, 10),
                    },
                  }))
                }
                editable={editing}
                keyboardType="numeric"
                placeholder="250"
                placeholderTextColor="#9CA3AF"
              />

            </View>
          </View>
        </View>

        {editing && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            <Save size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  logoutButton: {
    padding: 8,
  },
  email: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentButtonDisabled: {
    opacity: 0.6,
  },
  segmentButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  segmentButtonTextActive: {
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 8,
  },
});