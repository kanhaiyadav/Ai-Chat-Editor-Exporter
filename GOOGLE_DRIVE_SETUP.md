# 🚀 Google Drive Sync Setup Guide

This implementation works in **ALL Chromium browsers**: Chrome, Brave, Edge, Opera, Vivaldi, etc.

---

## ⚡ Setup Steps (10 minutes)

### Step 1: Get Your Redirect URL

1. Load your extension in any browser
2. Go to **Options** → **General Settings** → **Google Drive Sync**
3. You'll see your **Redirect URI** displayed
4. **Copy it** - you'll need this

Example: `https://cmfbkbpocbpnioeefbgbohejpbgbkbih.chromiumapp.org/`

---

### Step 2: Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. Name: `ExportMyChat`
4. Click **"Create"**

---

### Step 3: Enable Google Drive API

1. Go to: **APIs & Services** → **Library**
2. Search: `Google Drive API`
3. Click it → Click **Enable**

---

### Step 4: Configure OAuth Consent Screen

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Choose: **External**
3. Fill in:
    - **App name**: ExportMyChat
    - **User support email**: Your email
    - **Developer contact**: Your email
4. Click **Save and Continue** (skip scopes)
5. **Test users**: Add your Google email
6. **Save and Continue**

---

### Step 5: Create OAuth Credentials ⚠️ IMPORTANT

1. Go to: **APIs & Services** → **Credentials**
2. Click: **+ CREATE CREDENTIALS** → **OAuth client ID**
3. **Application type**: Select **"Web application"** ✅
    - ⚠️ Do NOT select "Chrome Extension" - it won't work in other browsers!
4. **Name**: `ExportMyChat Web`
5. **Authorized redirect URIs**:
    - Click **+ ADD URI**
    - Paste the redirect URL from Step 1
6. Click **Create**
7. **Copy both**:
    - **Client ID** (e.g., `123456789-abc.apps.googleusercontent.com`)
    - **Client Secret** (e.g., `GOCSPX-xxxxxx`)

---

### Step 6: Enter Credentials in Extension

1. Open Extension **Options** → **General Settings**
2. Scroll to **Google Drive Sync**
3. Enter your **Client ID**
4. Enter your **Client Secret**
5. Click **"Save Credentials"**

---

### Step 7: Connect!

1. Click **"Connect to Google Drive"**
2. Sign in with your Google account
3. Click **Allow**
4. Done! ✅

---

## 🔧 Troubleshooting

| Error                   | Solution                                                    |
| ----------------------- | ----------------------------------------------------------- |
| `redirect_uri_mismatch` | Copy exact redirect URL from extension, add to Google Cloud |
| `invalid_client`        | Re-copy Client ID and Secret from Google Cloud              |
| `access_denied`         | Add your email as test user in OAuth consent screen         |
| `This app is blocked`   | Click "Advanced" → "Go to app (unsafe)"                     |

---

## ✅ Checklist

-   [ ] Created Google Cloud project
-   [ ] Enabled Google Drive API
-   [ ] Configured OAuth consent screen
-   [ ] Added test user (your email)
-   [ ] Created **Web application** OAuth client
-   [ ] Added redirect URI
-   [ ] Copied Client ID
-   [ ] Copied Client Secret
-   [ ] Entered credentials in extension
-   [ ] Connected successfully

---

## 🎯 After Setup

-   **Auto-sync**: Enable to sync automatically on changes
-   **Sync Now**: Manual sync button
-   **Last synced**: Shows sync status
-   **Works everywhere**: Same credentials work in all browsers!

---

**Questions?** Check the browser console (F12) for detailed error messages.
