# Firebase Integration Process

This file documents the Firebase integration that was added to the project.

## What Was Integrated

The app was moved toward:

- `Firebase Auth` for admin login
- `Cloud Firestore` for portfolio/admin data
- `Firebase Storage` for uploaded images

The existing API shape was kept where possible so the frontend did not need a full rewrite.

## Current Flow

### Admin Login

- Admin login now uses Firebase Auth on the frontend
- File: `src/pages/LoginPage.jsx`
- Helper: `src/lib/firebaseAuth.js`

Process:

1. Admin signs in with email/password
2. Firebase returns the authenticated user
3. The app checks whether the user is allowed admin access
4. The Firebase ID token is stored and used for admin API calls

### Admin Authorization

Server-side admin routes now verify a Firebase ID token.

Files:

- `server/index.js`
- `server/firestoreStore.js`
- `server/firebaseAdmin.js`

Process:

1. Frontend sends `Authorization: Bearer <firebase-id-token>`
2. Server verifies the token with Firebase Admin SDK
3. Server allows admin access if:
   - the UID matches the configured default admin UID, or
   - the Firestore document `admins/{uid}` is active and has role `admin`

## Firestore Data Source

The Express API now reads and writes through Firestore instead of SQLite for the main portfolio/admin routes.

Handled in:

- `server/firestoreStore.js`

Collections used:

- `settings/profile`
- `experiences`
- `certifications`
- `skills`
- `projects`
- `contacts`
- `socialLinks`
- `messages`
- `mediaAssets`
- `admins`

## Storage Upload Flow

Admin image uploads now go to Firebase Storage.

Files:

- `src/utils/imageUpload.js`
- `src/pages/AdminPage.jsx`
- `server/index.js`

Process:

1. User selects an image in admin
2. Image is compressed in the browser first
3. Compressed image is sent to `/api/admin/assets`
4. Server uploads the file to Firebase Storage
5. Server creates a `mediaAssets` Firestore document
6. Returned `publicUrl` is used in profile/project data

## Admin Dashboard Changes Connected To Firebase

The admin dashboard continues to use the same main UI, but the data source is now Firebase-backed.

Main file:

- `src/pages/AdminPage.jsx`

Connected features:

- profile save
- experience add/edit/delete
- training add/edit/delete
- skills add/delete
- contacts save
- projects add/edit/delete
- image uploads for profile and project screenshots

## Firestore Bootstrap / Migration

On server startup:

1. Local SQLite data is still initialized
2. Firestore is checked
3. If Firestore is empty, current SQLite data is copied into Firestore
4. The configured admin UID is also ensured in `admins/{uid}`

This lets the existing portfolio content move into Firestore without a separate one-time manual migration step.

## Important Files Added

- `server/firebaseAdmin.js`
- `server/firestoreStore.js`
- `src/lib/firebase.js`
- `src/lib/firebaseAuth.js`
- `FIRESTORE_SETUP.md`
- `.gitignore`

## Important Files Updated

- `server/index.js`
- `src/api/client.js`
- `src/pages/LoginPage.jsx`
- `src/pages/AdminPage.jsx`
- `package.json`
- `package-lock.json`

## Current Assumptions

- Firebase web config is the one already provided
- Firebase Admin service account JSON exists locally
- Admin UID used is:
  - `WXkn3EKkdJg4hWVr0prXN2YoGzg1`

## What You Still Need To Do

1. Rotate the exposed Firebase Admin service account key
2. Replace the JSON file with the rotated one
3. Enable these Firebase services if not yet enabled:
   - Authentication
   - Firestore
   - Storage
4. Apply Firestore and Storage rules from `FIRESTORE_SETUP.md`
5. Restart the backend after the rotated key is in place

## Recommended Test Order

1. Start backend
2. Start frontend
3. Log in through `/login`
4. Open `/admin`
5. Save profile content
6. Upload a profile image
7. Add or edit a project
8. Upload screenshots
9. Confirm public pages reflect Firestore data

## Notes

- The frontend build passes after the Firebase integration
- There is a large JS bundle warning during build because Firebase adds size to the client bundle
- That warning does not block the build, but the bundle can be optimized later
