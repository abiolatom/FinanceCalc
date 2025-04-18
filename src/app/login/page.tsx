'use client';

import {Button} from '@/components/ui/button';
import {auth, googleAuthProvider} from '@/config/firebase';
import {signInWithPopup, signOut} from 'firebase/auth';
import {useAuthState} from 'react-firebase-hooks/auth';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

export default function LoginPage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/calculator');
    }
  }, [user, router]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
      // After successful sign-in, the useEffect hook above will redirect to the calculator page
    } catch (error: any) {
      console.error('Error signing in with Google', error);
      alert(`Error signing in with Google: ${error.message}`);
    }
  };

  const signOutWithGoogle = async () => {
    try {
      await signOut(auth);
      // After successful sign-out, you might want to redirect to the login page or refresh the current page
      router.push('/login');
    } catch (error: any) {
      console.error('Error signing out with Google', error);
      alert(`Error signing out with Google: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {user ? (
        <>
          <p>Welcome, {user.displayName}!</p>
          <Button onClick={signOutWithGoogle}>Sign Out</Button>
        </>
      ) : (
        <Button onClick={signInWithGoogle}>Sign In with Google</Button>
      )}
    </div>
  );
}

