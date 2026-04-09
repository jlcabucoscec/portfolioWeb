# Vercel Deployment Fixes & Checklist

## Issues Found

### 1. **API Route Handler - FIXED ✓**
**File:** `api/[[...route]].js`

**Problem:** Handler didn't have proper error handling for app initialization failures.

**Status:** ✓ Fixed - Added:
- Try-catch block around handler
- App initialization error caching
- Better error messages with debug info
- Proper error responses instead of silent failures

---

### 2. **Firebase Admin Credentials - NEEDS VERIFICATION**
**Files:** `server/firebaseAdmin.js`, `server/firestoreStore.js`

**Problem:** Firebase credentials not being loaded on Vercel deployment.

**Status:** ✓ Improved logging - Added:
- Debug info showing which credential sources were checked
- Better error messages in firebaseAdmin.js
- Initialization logging in firestoreStore.js

---

### 3. **Environment Variables - ACTION REQUIRED**

**Critical:** You must set these in your Vercel project settings:

#### Firebase Admin (Backend)
```
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
FIREBASE_STORAGE_BUCKET
FIREBASE_ADMIN_UID
FIREBASE_ADMIN_EMAIL
```

#### OR Alternative (use ONE approach):

**Option A - Single JSON (recommended for Vercel):**
```
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64
```
(Base64-encode your service account JSON)

**Option B - Individual vars (easier to manage):**
- See above individual FIREBASE_* vars

#### Firebase App (Frontend)
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_FIREBASE_ADMIN_UID
```

---

## Setup Steps for Vercel

### Step 1: Prepare Your Service Account

Get your Firebase service account JSON from:
- Firebase Console → Project Settings → Service Accounts → Generate New Private Key

### Step 2: Encode Service Account (Base64 Method - RECOMMENDED)

**Option A - PowerShell:**
```powershell
# Read the JSON file
$json = Get-Content "portfolioweb-7ea04-firebase-adminsdk-fbsvc-078f739c8b.json" -Raw

# Convert to Base64
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$encoded = [Convert]::ToBase64String($bytes)

# Copy to clipboard
$encoded | Set-Clipboard

Write-Host "Base64 encoded JSON copied to clipboard!"
```

**Option B - Node.js:**
```bash
node -e "console.log(Buffer.from(require('fs').readFileSync('portfolioweb-7ea04-firebase-adminsdk-fbsvc-078f739c8b.json', 'utf8')).toString('base64'))"
```

### Step 3: Set Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Add the base64 variable:
   ```
   Name: FIREBASE_SERVICE_ACCOUNT_JSON_BASE64
   Value: <paste the base64 string from Step 2>
   ```

4. Add all `VITE_*` variables (from your local `.env` or Firebase config):
   ```
   VITE_FIREBASE_API_KEY = AIzaSyAg2yVACpKlF2IyLIEBOcX5HIGdX2xDAP0
   VITE_FIREBASE_AUTH_DOMAIN = portfolioweb-7ea04.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = portfolioweb-7ea04
   VITE_FIREBASE_STORAGE_BUCKET = portfolioweb-7ea04.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID = 869933875215
   VITE_FIREBASE_APP_ID = 1:869933875215:web:7e09721b7dcc815541a37a
   VITE_FIREBASE_MEASUREMENT_ID = G-T2SGETK71K
   ```

5. Save and redeploy

### Step 4: Test Build Locally

**Before pushing to Vercel:**

```powershell
# Clean build
rm -r dist, public

# Build for Vercel
npm run build:vercel

# Check that public/ exists and has index.html
ls public/

# Verify server files parse correctly
node --check server/index.js
node --check server/app.js
node --check server.js
node --check api/[[...route]].js
```

### Step 5: Deploy and Test

```powershell
# If using git
git add .
git commit -m "Fix: Add improved error handling for Vercel deployment"
git push origin main
```

Then in Vercel:
1. Redeploy from the dashboard
2. Watch the build logs
3. Check function logs if deployment fails

### Step 6: Test Your API Endpoints

After deployment, test these URLs:

**Health Check:**
```
GET https://jlportfolio-dev.vercel.app/api/health
Expected: { ok: true }
```

**Portfolio Data:**
```
GET https://jlportfolio-dev.vercel.app/api/portfolio
Expected: JSON with profile, projects, etc.
```

**Contact Form (to test POST):**
```
POST https://jlportfolio-dev.vercel.app/api/contact
Body: { "name": "Test", "email": "test@test.com", "subject": "Test", "message": "Test" }
Expected: 201 with success message
```

---

## Debugging If Still Broken

### Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** → Latest deployment
3. Click **Logs** tab
4. Look for errors from `/api/` endpoint logs

### Common Issues

#### Issue: "Firebase Admin credentials were not found"

**Solution:**
- Verify `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` is set correctly
- The value should be a long base64 string (starts with `eyI...`)
- If using individual vars, ensure ALL of these are set:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`

#### Issue: "API returned HTML instead of JSON"

**Cause:** Usually means the API route is not being invoked at all.

**Check:**
- Is `api/[[...route]].js` present?
- Does `vercel.json` have the rewrites rule?
- Are all node_modules included in the deployment?

**Solution:**
```powershell
# Verify files are in place
ls api/
ls server/
cat vercel.json
```

#### Issue: 404 NOT_FOUND with Vercel error page

**Cause:** Request is reaching Vercel but not being routed to the API handler.

**Check:**
1. Verify `vercel.json` rewrites rule
2. Check that `api/` folder exists in root
3. Ensure `package.json` has `"type": "module"`

**Debug:**
```powershell
cat vercel.json | Select-String -Pattern 'rewrites' -Context 3
```

#### Issue: 500 Server Error with no message

**Cause:** App initialization failing quickly.

**Check:**
1. Look at Vercel Function logs
2. Verify Firebase environment variables are set
3. Check if dependencies are installed: Check `package-lock.json` exists

**Test build locally:**
```powershell
npm ci  # Use lock file for deterministic install
npm run build:vercel
```

---

## Improved Code Changes

### Files Modified for Better Debugging

1. **api/[[...route]].js**
   - Added proper error handling
   - Error caching to prevent retry loops
   - Better error responses

2. **server/firebaseAdmin.js**
   - Added debug logging for credential loading
   - Shows which credential sources were checked
   - Better error messages with specific missing requirements

3. **server/firestoreStore.js**
   - Added initialization logging
   - Better error propagation

---

## Deployment Command

After all environment variables are set:

```powershell
git add -A
git commit -m "fix: Add improved error handling and logging for Vercel"
git push origin main
```

Vercel will automatically rebuild and deploy.

---

## Quick Reference: What's Deployed

- **Frontend (built from `src/`):** `/` served as static files from `public/`
- **Backend API:** `/api/*` routes handled by `api/[[...route]].js` → Express app
- **Static Assets:** `public/assets/` (CSS, JS bundles from Vite build)

---

## Security Reminder

- **DO NOT** commit Firebase credentials to Git
- **DO NOT** hardcode credentials in code
- Always use environment variables on Vercel
- Rotate credentials if they're ever exposed
- The `portfolioweb-7ea04-firebase-adminsdk-fbsvc-078f739c8b.json` should stay local only
