import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultServiceAccountPath = path.resolve(
  __dirname,
  "../portfolioweb-7ea04-firebase-adminsdk-fbsvc-078f739c8b.json",
);

function loadServiceAccount() {
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (jsonEnv) {
    return JSON.parse(jsonEnv);
  }

  const base64JsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
  if (base64JsonEnv) {
    return JSON.parse(Buffer.from(base64JsonEnv, "base64").toString("utf8"));
  }

  const explicitPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const candidatePath = explicitPath ? path.resolve(explicitPath) : defaultServiceAccountPath;

  if (fs.existsSync(candidatePath)) {
    return JSON.parse(fs.readFileSync(candidatePath, "utf8"));
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey =
    process.env.FIREBASE_PRIVATE_KEY ||
    (process.env.FIREBASE_PRIVATE_KEY_BASE64
      ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, "base64").toString("utf8")
      : "");

  if (projectId && clientEmail && privateKey) {
    return {
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, "\n"),
    };
  }

  // Log what we're looking for to help with debugging
  const debugInfo = {
    foundServiceAccountJson: !!jsonEnv,
    foundBase64: !!base64JsonEnv,
    foundExplicitPath: !!explicitPath,
    defaultPathExists: fs.existsSync(candidatePath),
    hasProjectId: !!projectId,
    hasClientEmail: !!clientEmail,
    hasPrivateKey: !!privateKey,
    environment: process.env.NODE_ENV || 'development',
  };
  
  console.error('[Firebase] Credentials missing. Debug info:', debugInfo);

  throw new Error(
    "Firebase Admin credentials were not found. Add the service account JSON, FIREBASE_SERVICE_ACCOUNT_JSON, or FIREBASE_* env vars.",
  );
}

function getBucketName(serviceAccount) {
  return (
    process.env.FIREBASE_STORAGE_BUCKET ||
    `${serviceAccount.project_id}.firebasestorage.app`
  );
}

export function getFirebaseAdminApp() {
  if (getApps().length) {
    return getApps()[0];
  }

  try {
    const serviceAccount = loadServiceAccount();
    console.log('[Firebase] Initializing app with project:', serviceAccount.project_id);
    return initializeApp({
      credential: cert(serviceAccount),
      storageBucket: getBucketName(serviceAccount),
    });
  } catch (error) {
    console.error('[Firebase] Failed to initialize app:', error.message);
    throw error;
  }
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseAdminApp());
}

export function getFirebaseBucket() {
  return getStorage(getFirebaseAdminApp()).bucket();
}
