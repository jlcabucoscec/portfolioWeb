# Firestore Setup Guide

This file explains how to move the current portfolio app from `SQLite` to `Firebase Auth + Firestore + Firebase Storage`.

The structure below matches the current app data model, so migration will be straightforward.

## 1. What You Already Have

You already provided the web Firebase config for the frontend:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`
- `measurementId`

That is enough for:

- Firebase client initialization
- Firebase Auth on the frontend
- Firestore reads/writes from the frontend
- Firebase Storage uploads from the frontend

## 2. What I Still Need From You

If you want me to fully integrate Firebase into this project next, I need:

### Option A: Recommended

Firebase Admin credentials for secure server-side admin operations.

Send either:

- the `serviceAccountKey.json` file

or these values from the service account:

- `project_id`
- `client_email`
- `private_key`

This is the best option because your app already has:

- an Express backend
- protected admin operations
- admin-only content management
- image upload / media handling

### Option B: Client-only Firebase

If you do not want server-side Firebase Admin yet, I only need:

- confirmation that admin access should be controlled by Firebase Auth on the client
- the admin user's `uid`

Then I can secure admin access using:

- an `admins/{uid}` Firestore document

or

- a custom claim like `role: "admin"`

## 3. Recommended Firebase Services

Enable these in Firebase Console:

1. `Authentication`
2. `Cloud Firestore`
3. `Storage`

Use:

- `Email/Password` sign-in for admin
- `Firestore` for content data
- `Storage` for profile/project images

## 4. Recommended Environment Variables

Create a `.env` file for the frontend:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

If we use Firebase Admin on the server, add:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 5. Recommended Firestore Collections

This is the cleanest mapping from your current SQLite schema.

### `settings`

Singleton document:

- `settings/profile`

Fields:

- `name`
- `title`
- `tagline`
- `summary`
- `location`
- `availability`
- `focusTitle`
- `focusSummary`
- `yearsOfCraft`
- `projectsShipped`
- `profileImageUrl`
- `profileImageAlt`
- `updatedAt`

### `experiences`

One document per job / teaching experience.

Fields:

- `title`
- `organization`
- `period`
- `description`
- `emphasis`
- `sortOrder`
- `createdAt`
- `updatedAt`

### `certifications`

One document per training, seminar, or certification.

Fields:

- `title`
- `issuer`
- `period`
- `description`
- `sortOrder`
- `createdAt`
- `updatedAt`

### `skills`

One document per skill entry.

Fields:

- `name`
- `category`
- `level`
- `sortOrder`

### `projects`

One document per project.

Fields:

- `slug`
- `title`
- `summary`
- `description`
- `technologies`
- `role`
- `category`
- `yearLabel`
- `metricLabel`
- `metricValue`
- `linkLabel`
- `linkUrl`
- `thumbnailUrl`
- `thumbnailAssetId`
- `useThumbnail`
- `screenshotUrls`
- `screenshotAssetIds`
- `featured`
- `sortOrder`
- `createdAt`
- `updatedAt`

Notes:

- `technologies` should be an array
- `screenshotUrls` should be an array
- `screenshotAssetIds` should be an array
- `thumbnailUrl` should come from one screenshot or one stored asset

### `contacts`

One document per contact item.

Fields:

- `label`
- `value`
- `icon`
- `url`
- `sortOrder`

### `socialLinks`

One document per footer/social link.

Fields:

- `label`
- `url`
- `sortOrder`

### `messages`

Used by the public contact form.

Fields:

- `name`
- `email`
- `subject`
- `message`
- `createdAt`
- `read`

### `mediaAssets`

Used for uploaded images.

Fields:

- `kind`
- `fileName`
- `storagePath`
- `publicUrl`
- `mimeType`
- `sizeBytes`
- `width`
- `height`
- `createdAt`
- `uploadedBy`

Recommended `kind` values:

- `profile`
- `project`
- `general`

### `admins`

Only needed if you want role checking through Firestore instead of custom claims.

Document ID:

- use Firebase Auth `uid`

Fields:

- `email`
- `displayName`
- `role`
- `active`
- `createdAt`

Recommended:

- `role: "admin"`

## 6. Recommended Storage Folder Structure

In Firebase Storage, use:

- `profile/`
- `project/`
- `general/`

Examples:

- `profile/jl-profile-01.jpg`
- `project/class-schedule-01.jpg`
- `project/class-schedule-02.jpg`

The `mediaAssets` collection should store the metadata for each uploaded file.

## 7. Auth Setup For Admin

Since you already created an admin email/password in Firebase Auth, I recommend one of these two patterns:

### Pattern 1: `admins/{uid}` document

After login, check if:

- the signed-in user exists in `admins`
- `active === true`
- `role === "admin"`

This is easiest to manage.

### Pattern 2: Custom claims

Set:

```json
{ "role": "admin" }
```

on the admin user.

This is stronger for security, but it requires Firebase Admin SDK.

## 8. Recommended Security Rules

### Firestore Rules

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return signedIn()
        && (
          request.auth.token.role == "admin" ||
          exists(/databases/$(database)/documents/admins/$(request.auth.uid))
        );
    }

    match /settings/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /experiences/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /certifications/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /skills/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /projects/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /contacts/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /socialLinks/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /mediaAssets/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /messages/{doc} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    match /admins/{uid} {
      allow read: if request.auth != null && (request.auth.uid == uid || isAdmin());
      allow write: if false;
    }
  }
}
```

### Storage Rules

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null
        && (
          request.auth.token.role == "admin"
        );
    }

    match /profile/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /project/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /general/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

If you use `admins/{uid}` instead of claims, the Storage rules usually still work best with custom claims, because Storage rules cannot do the same Firestore `exists(...)` check in the same simple way.

## 9. Recommended Migration Mapping

Current SQLite table to Firebase target:

- `profile` -> `settings/profile`
- `experiences` -> `experiences`
- `certifications` -> `certifications`
- `skills` -> `skills`
- `projects` -> `projects`
- `contacts` -> `contacts`
- `social_links` -> `socialLinks`
- `messages` -> `messages`
- `media_assets` -> `mediaAssets`
- `admin_users` -> `Firebase Auth` + optional `admins`

## 10. Best Integration Path For This Project

Because your app already has:

- React frontend
- Express backend
- admin-only dashboard
- file/image handling

the best next step is:

1. keep Firebase config on the frontend
2. use Firebase Auth for admin login
3. use Firebase Admin SDK on the backend
4. move images to Firebase Storage
5. move portfolio content to Firestore
6. keep the same collection names listed above

## 11. What To Send Me Next

If you want me to integrate Firebase next, send:

### Minimum for frontend-only integration

- confirmation to use your current Firebase web config
- the admin user's Firebase Auth `uid`
- whether you want `admins/{uid}` or custom claims

### Recommended for full integration

- Firebase service account JSON

That will let me:

- connect Firebase Auth to the current login flow
- replace SQLite reads/writes with Firestore
- move image uploads from local `/uploads` to Firebase Storage
- keep the admin dashboard working with the same UI
