// hooks/useAuth.ts
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithCredential,
    signInWithEmailAndPassword,
    User
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { auth } from '../config/firebase';

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Configure Google Sign-In
    useEffect(() => {
        if (WEB_CLIENT_ID) {
            GoogleSignin.configure({
                webClientId: WEB_CLIENT_ID,
            });
        }
    }, []);

    // Listen to auth state changes
    useEffect(() => {
        const config: any = {};
        if (WEB_CLIENT_ID) {
            config.webClientId = WEB_CLIENT_ID;
        }
        GoogleSignin.configure(config);
    }, []);

    // Email/Password Sign In
    const signIn = async (email: string, password: string) => {
        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Email/Password Sign Up
    const signUp = async (email: string, password: string) => {
        try {
            setLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Google Sign In
    const signInWithGoogle = async () => {
        try {
            setGoogleLoading(true);

            // Check if Google Play Services are available (Android)
            await GoogleSignin.hasPlayServices();

            // Sign out first to show account picker
            await GoogleSignin.signOut();

            // Start Google Sign-In flow
            const response = await GoogleSignin.signIn();

            if (response.data?.idToken) {
                // Create Google credential
                const googleCredential = GoogleAuthProvider.credential(response.data.idToken);

                // Sign in to Firebase with the credential
                const userCredential = await signInWithCredential(auth, googleCredential);

                return {
                    success: true,
                    user: userCredential.user,
                    additionalUserInfo: {
                        displayName: userCredential.user.displayName,
                        email: userCredential.user.email,
                        photoURL: userCredential.user.photoURL
                    }
                };
            } else {
                throw new Error('No ID token received from Google');
            }
        } catch (error: any) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.SIGN_IN_CANCELLED:
                        console.log('User cancelled sign-in');
                        break;
                    case statusCodes.IN_PROGRESS:
                        console.log('Sign-in already in progress');
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        Alert.alert('Error', 'Google Play Services is not available');
                        break;
                    default:
                        Alert.alert('Error', error.message);
                }
            } else {
                Alert.alert('Error', 'An unexpected error occurred');
            }
            return { success: false, error: error.message };
        } finally {
            setGoogleLoading(false);
        }
    };

    // Sign Out
    const signOut = async () => {
        try {
            setLoading(true);
            await GoogleSignin.signOut();
            await firebaseSignOut(auth);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        googleLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
    };
};