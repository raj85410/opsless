import React, { createContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully logged in!');
    } catch (error: unknown) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string, role: string = 'developer') => {
    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      const userData: User = {
        uid: user.uid,
        email: user.email!,
        displayName,
        photoURL: user.photoURL || undefined,
        role: role as 'admin' | 'developer' | 'viewer',
        createdAt: new Date(),
        lastLoginAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      toast.success('Account created successfully!');
    } catch (error: unknown) {
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
      toast.success('Successfully logged out!');
    } catch (error: unknown) {
      toast.error('Logout failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      // Optimistically update local state first for instant UI feedback
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
      
      // Then update Firestore in background
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...updates,
        lastLoginAt: new Date()
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      // Revert optimistic update on error
      setCurrentUser(prev => prev ? { ...prev, ...currentUser } : null);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            // Convert Firestore timestamps to Date objects
            userData.createdAt = userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt);
            userData.lastLoginAt = userData.lastLoginAt instanceof Date ? userData.lastLoginAt : new Date(userData.lastLoginAt);
            setCurrentUser(userData);
          } else {
            // If user document doesn't exist, create a basic one
            const basicUserData: User = {
              uid: user.uid,
              email: user.email!,
              displayName: user.displayName || user.email!.split('@')[0],
              photoURL: user.photoURL || undefined,
              role: 'developer',
              createdAt: new Date(),
              lastLoginAt: new Date()
            };
            await setDoc(doc(db, 'users', user.uid), basicUserData);
            setCurrentUser(basicUserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set basic user data if Firestore fails
          const basicUserData: User = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || user.email!.split('@')[0],
            photoURL: user.photoURL || undefined,
            role: 'developer',
            createdAt: new Date(),
            lastLoginAt: new Date()
          };
          setCurrentUser(basicUserData);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    firebaseUser,
    login,
    signup,
    logout,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};