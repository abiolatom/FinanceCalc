'use client';

import {Button} from '@/components/ui/button';
import {auth, googleAuthProvider} from '@/config/firebase';
import {signInWithPopup, updateProfile} from 'firebase/auth';
import {useAuthState} from 'react-firebase-hooks/auth';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

export default function LoginPage() {
  const [user, setUser] = useState<any>(null); // Set user to null initially
  const [loading, setLoading] = useState<boolean>(false); // Set loading to false initially
  const [error, setError] = useState<any>(null); // Set error to null initially
  const router = useRouter();
  
  
  const [isSignUp, setIsSignUp] = useState(false); // State to toggle between sign-in and sign-up

  useEffect(() => {
    if (auth) {
      const [userAuth, loadingAuth, errorAuth] = useAuthState(auth);
      setUser(userAuth);
      setLoading(loadingAuth);
      setError(errorAuth);
    }
  }, [auth]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;

      // Check if the user is new
      if (result.additionalUserInfo?.isNewUser) {
        // Update the user's display name
        await updateProfile(user, {
          displayName: user.displayName,
        });
      }
      router.push('/calculator');
    } catch (error: any) {
      console.error('Error signing in with Google', error);
      alert(`Error signing in with Google: ${error.message}`);
    }
  };

  useEffect(() => {
    if (user) {
      router.push('/calculator');
    }
  }, [user, router]);

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      <div>
        <h2 className="text-2xl font-semibold mb-4">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        <Button onClick={signInWithGoogle} className="mb-4">
          Sign In with Google
        </Button>
        <Button variant="secondary" onClick={toggleSignUp}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Button>
      </div>
    </div>
  );
}

