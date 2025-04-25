'use client';

import {useEffect, useState, createContext, useContext} from 'react';
import {useAuthState} from 'react-firebase-hooks/auth';
import {auth, firebaseApp} from '@/config/firebase';
import { useRouter } from 'next/navigation';


export const AuthContext = createContext<any>(null);


export const AuthProvider = ({children}: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (firebaseApp) {
      const [authUser, authLoading, authError] = useAuthState(auth);
      setUser(authUser);
      setLoading(authLoading);
      setError(authError);
    } else {
      setLoading(false);
      setError('Firebase not initialized');
    }
  }, [firebaseApp]);

  useEffect(() => {
    if (user) {
      // Redirect to calculator page after successful login
      router.push('/calculator');
    }
  }, [user, router]);

  const value = {
    user, loading, error,
  };

  return (<AuthContext.Provider value={value}>{children}</AuthContext.Provider>);
};


export const useAuth = () => {
  return useContext(AuthContext);
};
