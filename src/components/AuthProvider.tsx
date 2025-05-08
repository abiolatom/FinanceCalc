'use client';

import type { User, Auth } from 'firebase/auth'; // Import Auth type
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthState as useRfhAuthState } from 'react-firebase-hooks/auth';
import { auth as importedFirebaseAuthInstance } from '@/config/firebase'; // This is Auth | undefined
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  error: Error | undefined;
  firebaseReady: boolean; 
}

export const AuthContext = createContext<AuthContextType>({
  user: undefined,
  loading: true,
  error: undefined,
  firebaseReady: false,
});

// This inner component ensures useRfhAuthState is only called when authInstance is valid.
const AuthStateInitializer: React.FC<{ authInstance: Auth; children: React.ReactNode; router: any }> = ({ authInstance, children, router }) => {
  const [user, loading, error] = useRfhAuthState(authInstance);

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (router.pathname === '/login' || router.pathname === '/') {
          router.push('/calculator');
        }
      } else {
        const publicPaths = ['/login', '/'];
        if (!publicPaths.includes(router.pathname)) {
          router.push('/login');
        }
      }
    }
  }, [user, loading, router]);

  return (
    <AuthContext.Provider value={{ user, loading, error, firebaseReady: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [effectiveAuth, setEffectiveAuth] = useState<Auth | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    // Monitor the importedFirebaseAuthInstance.
    // Since it's a module-level variable, its readiness isn't event-driven here.
    // We check it, and if not ready, poll briefly.
    if (importedFirebaseAuthInstance) {
      setEffectiveAuth(importedFirebaseAuthInstance);
    } else {
      const intervalId = setInterval(() => {
        if (importedFirebaseAuthInstance) {
          setEffectiveAuth(importedFirebaseAuthInstance);
          clearInterval(intervalId);
        }
      }, 100); // Poll every 100ms
      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, []); // Run once on mount

  if (!effectiveAuth) {
    // Firebase auth instance from config/firebase.ts is not yet available.
    // Provide a loading state through context.
    return (
      <AuthContext.Provider value={{ user: undefined, loading: true, error: undefined, firebaseReady: false }}>
        <div>Loading Authentication...</div>
        {/* Or a global spinner component */}
      </AuthContext.Provider>
    );
  }

  // Once effectiveAuth is set (meaning importedFirebaseAuthInstance is available),
  // render AuthStateInitializer which will call useRfhAuthState.
  return <AuthStateInitializer authInstance={effectiveAuth} router={router}>{children}</AuthStateInitializer>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
