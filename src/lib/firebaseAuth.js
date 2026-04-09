import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { clearAdminToken, setAdminToken } from "../api/client";
import { firebaseAuth, firebaseDb } from "./firebase";

const DEFAULT_ADMIN_UID =
  import.meta.env.VITE_FIREBASE_ADMIN_UID || "WXkn3EKkdJg4hWVr0prXN2YoGzg1";

export async function isAdminUser(uid) {
  if (!uid) {
    return false;
  }

  if (uid === DEFAULT_ADMIN_UID) {
    return true;
  }

  try {
    const snapshot = await getDoc(doc(firebaseDb, "admins", uid));
    if (!snapshot.exists()) {
      return false;
    }

    const data = snapshot.data();
    return data.active !== false && data.role === "admin";
  } catch {
    return false;
  }
}

export async function signInAdmin(email, password) {
  await setPersistence(firebaseAuth, browserLocalPersistence);
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  const allowed = await isAdminUser(credential.user.uid);

  if (!allowed) {
    await signOut(firebaseAuth);
    clearAdminToken();
    throw new Error("This account does not have admin access.");
  }

  const token = await credential.user.getIdToken();
  setAdminToken(token);
  return credential.user;
}

export async function getFreshAdminToken() {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    return "";
  }

  const token = await currentUser.getIdToken();
  setAdminToken(token);
  return token;
}

export async function signOutAdmin() {
  clearAdminToken();
  await signOut(firebaseAuth);
}
