# ⚠️ CRITICAL: What You Need to Do Right Now

## The Problem

Your 404 NOT_FOUND error is happening because:

1. **API routes are not being invoked** - The handler in `api/[[...route]].js` likely crashed silently
2. **Firebase credentials missing** - Environment variables not set in Vercel  
3. **No error visibility** - The old code didn't report errors properly

## What I Fixed (Code Changes)

✓ **api/[[...route]].js** - Now has proper error handling and won't fail silently
✓ **server/firebaseAdmin.js** - Better error messages showing what's missing
✓ **server/firestoreStore.js** - Initialization logging for debugging

## What YOU Must Do (3 Steps)

### STEP 1: Get Your Firebase Credentials

Go to: **Firebase Console → Your Project → Project Settings → Service Accounts**
- Click **Generate New Private Key**
- Save the JSON file (keep it locally, don't commit)

### STEP 2: Convert to Base64

**In PowerShell, run this:**
```powershell
$json = Get-Content "portfolioweb-7ea04-firebase-adminsdk-fbsvc-078f739c8b.json" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$encoded = [Convert]::ToBase64String($bytes)
$encoded | Set-Clipboard
Write-Host "Copied to clipboard!"
```

### STEP 3: Add to Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add these variables:

**Firebase Admin (Backend):**
```
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 = <paste the base64 string>
```

**Firebase App (Frontend) - Copy from your firebase.js:**
```
VITE_FIREBASE_API_KEY = AIzaSyAg2yVACpKlF2IyLIEBOcX5HIGdX2xDAP0
VITE_FIREBASE_AUTH_DOMAIN = portfolioweb-7ea04.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = portfolioweb-7ea04
VITE_FIREBASE_STORAGE_BUCKET = portfolioweb-7ea04.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 869933875215
VITE_FIREBASE_APP_ID = 1:869933875215:web:7e09721b7dcc815541a37a
VITE_FIREBASE_MEASUREMENT_ID = G-T2SGETK71K
```

3. **Save** and go to **Deployments** → **Redeploy**

### STEP 4: Test Locally First (Optional but Recommended)

```powershell
# Clean and rebuild
rm dist, public -r -Force
npm run build:vercel

# Verify the build worked
ls public/index.html  # Should exist

# Check syntax
node --check api/[[...route]].js
node --check server/app.js
node --check server.js
```

## Expected Results

After redeploying with environment variables:

**These should work:**
- `GET /api/health` → Returns `{ ok: true }`
- `GET /api/portfolio` → Returns portfolio JSON
- `POST /api/contact` → Accepts form submissions
- `/` → Loads React app

## If Still Getting 404

Check Vercel logs:
1. **Vercel Dashboard** → **Deployments** → Latest → **Logs**
2. Look for errors mentioning "Firebase" or "initialization"
3. Copy error messages and share them

---

**The files have been updated. Now you just need to:**
1. Get Firebase credentials ✓
2. Convert to base64 ✓  
3. Add to Vercel ✓
4. Redeploy ✓
