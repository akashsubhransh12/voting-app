import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthUser extends User {
  role?: 'voter' | 'admin';
  isVerified?: boolean;
  voterId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refreshUser: async () => {} });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (currentUser: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        return { ...currentUser, ...userDoc.data() } as AuthUser;
      } else {
        // Create default profile for new user
        const defaultData = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || 'Voter',
          role: 'voter',
          isVerified: false,
          voterId: '',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', currentUser.uid), defaultData);
        return { ...currentUser, ...defaultData } as AuthUser;
      }
    } catch (error) {
      console.error("Firestore Error in fetchUserData:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      const updated = await fetchUserData(auth.currentUser);
      setUser(updated);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const fullUser = await fetchUserData(currentUser);
          setUser(fullUser);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(currentUser as AuthUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
