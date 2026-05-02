import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

// Guard: if keys are placeholder/missing, skip init so SSR doesn't crash
const isConfigured = apiKey && apiKey !== 'your-api-key' && apiKey !== 'your_firebase_api_key_here'

const firebaseConfig = {
  apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = isConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  : (getApps().length === 0 ? initializeApp({ apiKey: 'placeholder', projectId: 'placeholder' }) : getApps()[0])

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export const firebaseReady = !!isConfigured

export async function signInWithGoogle() {
  if (!isConfigured) throw new Error('Firebase not configured — add your API keys to .env.local')
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function signInWithEmail(email: string, password: string) {
  if (!isConfigured) throw new Error('Firebase not configured — add your API keys to .env.local')
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signUpWithEmail(email: string, password: string) {
  if (!isConfigured) throw new Error('Firebase not configured — add your API keys to .env.local')
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signOutUser() {
  await signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}
