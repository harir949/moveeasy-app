import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin only if not already initialized
if (!getApps().length) {
  // In production, you would use a service account key
  // For development, we'll use the default credentials or environment variables
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });
  } catch (error) {
    console.log('Firebase initialization failed, falling back to default credentials:', error);
    // Fallback to default initialization for development
    initializeApp();
  }
}

export const db = getFirestore();
export { FieldValue } from 'firebase-admin/firestore';