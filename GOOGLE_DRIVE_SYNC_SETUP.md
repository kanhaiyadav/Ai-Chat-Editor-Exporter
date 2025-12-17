# Google Drive Sync Setup Guide

This guide will help you set up Google Drive cloud sync for ExportMyChat.

## Prerequisites

1. A Google Cloud Console account (free)
2. Your Chrome extension must be published (or in developer mode for testing)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it something like "ExportMyChat Sync"

## Step 2: Enable Google Drive API

1. In your Google Cloud project, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click on it and press **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have a Google Workspace)
3. Fill in the required information:
    - **App name**: ExportMyChat
    - **User support email**: Your email
    - **Developer contact information**: Your email
4. Add scopes:
    - Click **Add or Remove Scopes**
    - Add: `https://www.googleapis.com/auth/drive.file`
    - Add: `https://www.googleapis.com/auth/drive.appdata`
5. Add test users (for testing before publishing):
    - Add your Google account email
6. Save and continue

## Step 4: Create OAuth 2.0 Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Chrome App** or **Web application**
4. For Chrome Extension:
    - Name: ExportMyChat Extension
    - Application ID: Your Chrome Extension ID (from chrome://extensions)
    - Or use the format: `chrome-extension://YOUR_EXTENSION_ID/`
5. Click **Create**
6. Copy the **Client ID** (it should look like: `xxxxxxxxxxxxx.apps.googleusercontent.com`)

## Step 5: Update Extension Manifest

1. Open `wxt.config.ts` in your project
2. Replace `YOUR_CLIENT_ID` with your actual Client ID:

```typescript
oauth2: {
    client_id: "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com",
    scopes: [
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive.appdata"
    ]
},
```

## Step 6: Build and Test

1. Build your extension:

    ```bash
    npm run build
    ```

2. Load the extension in Chrome:

    - Go to `chrome://extensions/`
    - Enable **Developer mode**
    - Click **Load unpacked**
    - Select the `.output/chrome-mv3` folder

3. Test the sync:
    - Open the extension options page
    - Go to General Settings
    - Scroll down to "Google Drive Sync"
    - Click "Connect to Google Drive"
    - Sign in with your Google account
    - Enable "Auto Sync"

## Step 7: Publish (Optional but Recommended)

### For OAuth Verification:

Google requires verification if you want to move from "Testing" to "Production" mode:

1. Go back to **OAuth consent screen**
2. Click **Publish App**
3. For verification (required if using sensitive scopes):
    - Submit for verification
    - Provide homepage URL
    - Provide privacy policy URL
    - Explain why you need Drive access

**Note**: For personal use or testing with specific users, you can stay in "Testing" mode and add users manually.

## Understanding the Sync

### Data Storage

-   **Local Storage**: IndexedDB (Dexie) in browser
-   **Cloud Storage**: Google Drive (in user's personal Drive)
-   **Folder**: A folder named `ExportMyChat_Data` is created in the root of the user's Drive
-   **Files**:
    -   `chats.json` - All saved chats
    -   `presets.json` - All style presets

### Sync Strategy

-   **Auto Sync**: Automatically syncs after every create/update/delete operation
-   **Manual Sync**: User can click "Sync Now" button
-   **Conflict Resolution**: Uses `updatedAt` timestamp - keeps the most recent version
-   **Merge Logic**: Combines local and remote data intelligently

### Privacy & Security

-   ✅ Data is stored in user's personal Google Drive
-   ✅ End-to-end encryption provided by Google
-   ✅ No data passes through your servers
-   ✅ Users can disconnect and delete data anytime
-   ✅ Zero cost for you as the developer

## Troubleshooting

### "Authentication failed" error

-   Check that Client ID is correct in `wxt.config.ts`
-   Verify Google Drive API is enabled
-   Ensure OAuth consent screen is configured
-   Add your test email in test users list

### "Access blocked" error

-   Your app needs to be verified by Google, or
-   You're not added as a test user in OAuth consent screen
-   Change to "Internal" if you have Google Workspace

### Extension ID mismatch

-   The extension ID changes when you rebuild
-   In development, get the ID from `chrome://extensions/`
-   Update the OAuth client configuration with new ID

### Sync not working

-   Check browser console for errors
-   Verify network connectivity
-   Try disconnecting and reconnecting
-   Check Google Drive API quotas

## API Quotas & Limits

Google Drive API has generous free quotas:

-   **Queries per day**: 1,000,000,000
-   **Queries per 100 seconds per user**: 1,000
-   **Queries per 100 seconds**: 10,000

For typical usage (syncing chats/presets), you'll never hit these limits.

## Cost

**Zero cost** for both you and your users:

-   Google Drive API is free for personal use
-   Users use their own Google Drive storage (15GB free)
-   Typical data size: A few KB to a few MB max

## Support

If users encounter issues:

1. Ask them to check their Google Drive storage quota
2. Verify they granted all requested permissions
3. Try the "Disconnect" and reconnect flow
4. Check for browser console errors

## Development Tips

### Testing Sync

```javascript
// In browser console
chrome.storage.local.get("syncStatus", (result) => {
    console.log(result.syncStatus);
});
```

### Debugging

Enable debug logging in [googleDriveSync.ts](d:\Chrome_Extensions\C2Pdf_wxt\lib\googleDriveSync.ts):

```typescript
// Add at the top of methods
console.log("Sync triggered:", { chats, presets });
```

### Reset Sync State

```javascript
// In browser console
chrome.storage.local.remove("syncStatus");
```

## Architecture

```
User's Browser
├── IndexedDB (Local)
│   ├── Chats
│   └── Presets
│
└── Google Drive API
    └── User's Drive
        └── ExportMyChat_Data/
            ├── chats.json
            └── presets.json
```

## Next Steps

1. Test thoroughly with multiple accounts
2. Add more robust error handling if needed
3. Consider adding import/export UI for manual backup
4. Add sync history/logs for power users
5. Implement selective sync (choose what to sync)

## Files Modified/Created

1. ✅ `lib/googleDriveSync.ts` - Core sync service
2. ✅ `lib/settingsDB.ts` - Auto-sync triggers added
3. ✅ `components/GoogleDriveSyncSettings.tsx` - UI component
4. ✅ `components/SyncStatusIndicator.tsx` - Header status
5. ✅ `entrypoints/options/GeneralSettings.tsx` - Integration
6. ✅ `entrypoints/options/Header.tsx` - Status indicator
7. ✅ `wxt.config.ts` - Manifest permissions
8. ✅ `hooks/use-toast.ts` - Toast notifications

Enjoy your free, serverless cloud sync! 🚀
