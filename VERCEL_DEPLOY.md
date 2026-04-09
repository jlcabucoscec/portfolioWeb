# Vercel Deployment Guide

This project is prepared for:

- `Vite` frontend deployment on Vercel
- `Express` API deployment through a Vercel serverless function
- `Firebase Auth + Firestore + Storage` for app data

## What Changed

The repo now uses this deployment shape:

- `server/app.js`
  Shared Express app with all `/api/*` routes
- `server/index.js`
  Local Node server for development and `npm start`
- `api/[[...route]].js`
  Vercel function entry that serves the Express backend
- `vercel.json`
  Vercel build config and SPA fallback

## Before You Push

Do not commit these:

- `node_modules/`
- `dist/`
- `server/*.sqlite*`
- Firebase Admin JSON keys
- `.env*`
- local dev logs

Those are already covered in `.gitignore`.

## Required Vercel Environment Variables

Set these in the Vercel project dashboard.

### Frontend Firebase config

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_ADMIN_UID`

### Backend Firebase Admin config

Use one of these approaches:

1. Recommended: individual env vars
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_ADMIN_UID`
   - `FIREBASE_ADMIN_EMAIL`

2. Alternative: full service account in one env var
   - `FIREBASE_SERVICE_ACCOUNT_JSON`

3. Alternative: base64-encoded service account
   - `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`

Notes:

- If `FIREBASE_PRIVATE_KEY` is pasted into Vercel, keep the line breaks intact.
- If line breaks give trouble, use `FIREBASE_PRIVATE_KEY_BASE64` instead.

## Local Checks Before Deploying

Run:

```powershell
npm run build
node --check server/index.js
node --check server/app.js
node --check api/[[...route]].js
```

## GitHub Setup

If this folder is not yet a git repo:

```powershell
git init
git branch -M main
git remote add origin https://github.com/jlcabucoscec/portfolioWeb.git
```

Then commit:

```powershell
git add .
git commit -m "Prepare app for Vercel deployment"
git push -u origin main
```

## Vercel Setup

1. Import the GitHub repo into Vercel
2. Framework preset: `Vite`
3. Root directory: project root
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add the environment variables listed above
7. Deploy

## After Deploy

Test these first:

- `/`
- `/projects`
- `/contact`
- `/login`
- `/api/health`
- admin login
- one profile update
- one project screenshot upload
- one contact form submission

## Important Security Note

Your Firebase Admin service-account JSON should stay local only.

- Do not commit it
- Do not upload it to GitHub
- Rotate the key if it was exposed before
