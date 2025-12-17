# 🔧 Fixing Brave Browser OAuth Error

## The Problem

You're seeing "Error 400: invalid_request - Custom URI scheme is not supported on Chrome apps" in Brave.

This happens because **each browser generates a different extension ID** for unpacked extensions, and your OAuth client is configured for Chrome's ID only.

---

## 🎯 Solution Options

### Option 1: Add Brave Extension ID to OAuth Client (Quick Fix)

**Step 1: Get Brave Extension ID**

1. Open Brave browser
2. Go to `brave://extensions/`
3. Enable "Developer mode"
4. Find ExportMyChat extension
5. Copy the **ID** (different from Chrome's ID)

**Step 2: Update Google OAuth Client**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Look for "Authorized redirect URIs"
5. **Add new URI**:
    ```
    https://YOUR_BRAVE_EXTENSION_ID.chromiumapp.org/
    ```
    Replace `YOUR_BRAVE_EXTENSION_ID` with the ID from Brave
6. Click **Save**

**Step 3: Test**

1. Reload extension in Brave
2. Try "Connect to Google Drive" again
3. Should work now! ✅

---

### Option 2: Use a Fixed Extension Key (Better for Multi-Browser)

This ensures the extension has the **same ID** across all Chromium browsers (Chrome, Brave, Edge, etc.).

**Step 1: Generate Extension Key**

Create a file `generate-key.js`:

```javascript
const crypto = require("crypto");
const fs = require("fs");

// Generate a key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: "spki",
        format: "pem",
    },
    privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
    },
});

// Convert public key to base64 (for manifest)
const publicKeyBase64 = publicKey
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\n/g, "");

console.log("Add this to wxt.config.ts manifest.key:");
console.log(publicKeyBase64);

// Save private key (keep this secret!)
fs.writeFileSync("extension-key.pem", privateKey);
console.log("\nPrivate key saved to extension-key.pem (DO NOT COMMIT THIS!)");
```

Run it:

```bash
node generate-key.js
```

**Step 2: Update wxt.config.ts**

Add the `key` field to manifest:

```typescript
manifest: {
    name: "ExportMyChat",
    key: "YOUR_PUBLIC_KEY_HERE", // ← Paste the output from step 1
    // ... rest of config
}
```

**Step 3: Rebuild & Get New Extension ID**

```bash
npm run build
```

Load in Chrome, note the new (permanent) extension ID.

**Step 4: Update OAuth Client**
Update the redirect URI in Google Cloud Console with the new ID.

**Step 5: Load in All Browsers**
Now the extension will have the **same ID** in Chrome, Brave, Edge, etc.!

---

### Option 3: Test Mode - Allow Any Origin (Development Only)

If you're just testing and don't want to deal with multiple extension IDs:

**In Google Cloud Console:**

1. Go to **APIs & Services** → **Credentials**
2. Click your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
    ```
    https://*.chromiumapp.org/
    ```
    (Note: Google might not allow wildcards - if not, use Option 1 or 2)

---

## 🎯 Recommended Approach

### For Development/Testing:

→ **Use Option 1** (Add Brave extension ID to OAuth client)

-   Quick and easy
-   Takes 2 minutes
-   Works immediately

### For Production/Distribution:

→ **Use Option 2** (Fixed extension key)

-   Consistent ID across all browsers
-   Easier to manage
-   Professional solution
-   One-time setup

---

## 📋 Quick Checklist (Option 1 - Fastest)

-   [ ] Get extension ID from `brave://extensions/`
-   [ ] Go to Google Cloud Console
-   [ ] Find your OAuth Client credentials
-   [ ] Add redirect URI: `https://BRAVE_EXTENSION_ID.chromiumapp.org/`
-   [ ] Save
-   [ ] Reload extension in Brave
-   [ ] Test connection
-   [ ] Verify sync works

---

## 🔍 Why This Happens

**Chrome Extension IDs:**

-   **Unpacked extensions**: Get random ID each time
-   **Packed extensions**: ID is derived from private key
-   **Published extensions**: Fixed ID from Web Store

**OAuth Redirect URIs:**

-   Google OAuth needs to know valid redirect URIs
-   Chrome extensions use: `https://EXTENSION_ID.chromiumapp.org/`
-   Each browser sees a different ID for unpacked extensions
-   OAuth client must list ALL possible redirect URIs

**Solution:**

-   Add all browser extension IDs to OAuth client, OR
-   Use a fixed key so all browsers see same ID

---

## ⚡ After Fix

Once configured, you'll be able to:

-   ✅ Sign in with same Google account in Chrome
-   ✅ Sign in with same Google account in Brave
-   ✅ Sign in with same Google account in Edge
-   ✅ All browsers sync to the same Google Drive data
-   ✅ Chats appear across all browsers automatically

---

## 🐛 Still Not Working?

**Error persists after adding redirect URI:**

-   Wait 5 minutes (Google OAuth changes take time)
-   Try clearing Brave's cache
-   Try incognito mode in Brave
-   Check redirect URI exactly matches extension ID

**"redirect_uri_mismatch" error:**

-   Double-check extension ID is correct
-   Make sure you added `https://` and `.chromiumapp.org/`
-   Format: `https://abcdefghij.chromiumapp.org/` (no trailing path)

---

**Choose Option 1 for quick fix, or Option 2 for professional setup!** 🚀
