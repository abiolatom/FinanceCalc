'use client';

import {useEffect, useState, createContext, useContext} from 'react';
import {useAuthState} from 'react-firebase-hooks/auth';
import {auth} from '@/config/firebase';
import {useRouter} from 'next/navigation';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
  const [user, loading, error] = useAuthState(auth);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!user && !loading && isClient) {
      router.push('/login');
    }
  }, [user, loading, router, isClient]);

  const value = {
    user,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
