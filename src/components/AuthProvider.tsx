'use client';

import {useEffect, useState, createContext, useContext} from 'react';
import {useAuthState} from 'react-firebase-hooks/auth';
import {auth} from '@/config/firebase';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
  const [user, loading, error] = useAuthState(auth);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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


