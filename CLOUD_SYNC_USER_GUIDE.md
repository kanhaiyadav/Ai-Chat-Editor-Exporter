# ☁️ Google Drive Sync - Quick Start

ExportMyChat now supports cloud sync with Google Drive! Your chats and presets can be automatically backed up and synced across devices.

## 🎯 Benefits

-   **Zero Cost**: Uses your own Google Drive storage (free 15GB)
-   **Privacy First**: Data stays in your personal Drive, not on our servers
-   **Auto Sync**: Changes sync automatically across all your devices
-   **Secure**: Google's encryption protects your data
-   **Easy Setup**: Connect with one click

## 🚀 Quick Setup

1. **Open Extension Options**

    - Click the ExportMyChat icon → Options
    - Or right-click extension icon → Options

2. **Navigate to Settings**

    - Go to "General Settings" section
    - Scroll down to "Google Drive Sync"

3. **Connect Your Account**

    - Click "Connect to Google Drive"
    - Sign in with your Google account
    - Grant permissions (Drive access)

4. **Enable Auto-Sync**
    - Toggle "Auto Sync" on
    - Done! Your data will now sync automatically

## ✨ Features

### Automatic Sync

Every time you:

-   Save a chat
-   Update a chat
-   Delete a chat
-   Create a preset
-   Modify a preset
-   Delete a preset

Your changes are automatically synced to Google Drive.

### Manual Sync

Click "Sync Now" button anytime to:

-   Force a sync
-   Pull latest data from Drive
-   Resolve any conflicts

### Sync Status Indicator

Check the header bar to see:

-   ✅ Synced - Everything is up to date
-   🔄 Syncing - Sync in progress
-   ❌ Error - Check connection

### Conflict Resolution

If you edit the same chat on different devices:

-   The most recently modified version wins
-   No data loss - older version is preserved in merge

## 📂 Data Location

Your data is stored in Google Drive at:

```
My Drive/
└── ExportMyChat_Data/
    ├── chats.json     (all your saved chats)
    └── presets.json   (all your style presets)
```

## 🔒 Privacy & Security

-   **Your Data**: Stored only in your personal Google Drive
-   **Encryption**: Protected by Google's security
-   **No Tracking**: We never see or access your data
-   **Disconnect Anytime**: Remove access whenever you want
-   **Delete Data**: Remove cloud data with one click

## 💡 Pro Tips

### Multi-Device Workflow

1. **Desktop Computer**

    - Create and edit chats
    - Auto-sync enabled

2. **Laptop**

    - Open extension
    - Sign in to same Google account
    - All chats appear automatically

3. **Work Computer**
    - Sync enabled
    - Changes sync back to all devices

### Manual Backup

Even with auto-sync, you can:

-   Download data manually from Google Drive
-   Keep local copies for extra safety
-   Export as JSON from the extension

### Troubleshooting

**Sync Not Working?**

-   Check internet connection
-   Verify you're signed in
-   Try "Disconnect" then reconnect
-   Click "Sync Now" manually

**Data Not Appearing?**

-   Wait a moment for sync to complete
-   Check sync status indicator
-   Verify same Google account on all devices

**Authentication Errors?**

-   Sign out and sign back in
-   Check browser permissions
-   Clear browser cache if needed

## 📊 Storage Usage

Typical data sizes:

-   **1 chat**: ~10-50 KB
-   **100 chats**: ~1-5 MB
-   **10 presets**: ~50 KB

Your Google Drive free tier (15GB) can store:

-   **Thousands of chats** comfortably
-   More than you'll ever need!

## 🔧 Advanced Options

### Disable Auto-Sync

If you prefer manual control:

1. Toggle "Auto Sync" off
2. Use "Sync Now" when needed
3. Still connected, just manual

### Delete Cloud Data

To remove all data from Drive:

1. Click "Delete Cloud Data"
2. Confirm deletion
3. Local data remains safe
4. Can re-sync anytime

### Disconnect

To stop syncing entirely:

1. Click "Disconnect"
2. Revokes access to Drive
3. Local data stays intact
4. Cloud data remains until deleted

## 🆘 Need Help?

**Common Issues:**

1. **"Access Blocked" Error**

    - Extension might be in test mode
    - Contact developer for access

2. **"Sync Failed" Message**

    - Check Google Drive storage space
    - Verify internet connection
    - Try again in a few minutes

3. **Data Not Syncing**
    - Check sync status indicator
    - Click "Sync Now" manually
    - Verify auto-sync is enabled

**Still Having Issues?**

-   Check browser console for errors
-   Open GitHub issue with details
-   Include: browser version, error messages

## 🎓 Developer Setup

If you're a developer wanting to set this up:
See [GOOGLE_DRIVE_SYNC_SETUP.md](./GOOGLE_DRIVE_SYNC_SETUP.md) for complete setup instructions.

## 🎉 That's It!

You're now set up with cloud sync. Your chats and presets will be safely backed up and synced across all your devices automatically.

Happy syncing! 🚀

---

**Note**: Google Drive sync is completely optional. You can continue using ExportMyChat locally without connecting to Drive.
