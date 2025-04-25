'use client';

import {Button} from '@/components/ui/button';
import {auth, googleAuthProvider} from '@/config/firebase';
import {createUserWithEmailAndPassword, signInWithPopup, signOut, updateProfile} from 'firebase/auth';
import {useAuthState} from 'react-firebase-hooks/auth';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {!user && (
        <Button onClick={signInWithGoogle}>Sign In with Google</Button>
      )}
    </div>
  );
}
