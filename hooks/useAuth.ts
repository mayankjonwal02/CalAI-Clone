import { useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithEmailAndPassword, 
         createUserWithEmailAndPassword, signOut, 
         GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/services/firebase";
import { UserProfile } from "@/services/types";
import { Platform } from "react-native";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  };

  const signUp = async (email: string, password: string, profile: Partial<UserProfile>) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        ...profile,
        createdAt: new Date().toISOString(),
      });

      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google sign-in...");
      
      // Check if we're on web platform
      if (Platform.OS === 'web') {
        // Use Firebase's built-in popup for web
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        const result = await signInWithPopup(auth, provider);
        
        // Ensure user profile exists
        const userDoc = doc(db, 'users', result.user.uid);
        const existing = await getDoc(userDoc);
        if (!existing.exists()) {
          await setDoc(userDoc, {
            email: result.user.email,
            name: result.user.displayName,
            photoURL: result.user.photoURL,
            createdAt: new Date().toISOString(),
          });
        }
        
        return { user: result.user, error: null };
      } else {
        // For mobile platforms, you still need expo-auth-session
        throw new Error('Mobile Google auth requires expo-auth-session setup with OAuth client IDs');
      }
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { user: null, error: (error as Error).message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  };

  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const information = docSnap.data() as UserProfile;
        return information;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, profile, { merge: true });
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    getUserProfile,
    updateUserProfile,
  };
};