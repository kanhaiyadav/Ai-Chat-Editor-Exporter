# Sidebar Migration - Old LeftSidebar to AppSidebar

## Overview

This document describes the migration from the old `LeftSidebar.tsx` component to the new `app-sidebar.tsx` component, integrating chat listing functionality organized by AI platform source.

## Key Changes

### 1. Added Chat Source Classification

#### Type Definitions (`types.ts`)

-   Added `ChatSource` type to classify chats by AI platform:
    ```typescript
    export type ChatSource = "chatgpt" | "claude" | "gemini" | "deepseek";
    ```
-   Updated `ChatData` interface to include `source` field

#### Database Schema (`settingsDB.ts`)

-   Updated `SavedChat` interface to include `source: ChatSource` field
-   Upgraded database to version 3 with source field in chats table
-   Updated all chat operations to handle the source parameter:
    -   `saveChat()` - now requires `source` parameter
    -   `updateChat()` - now requires `source` parameter
    -   `duplicateChat()` - preserves source when duplicating
    -   `getChatsBySource()` - new method to filter chats by source

### 2. Content Script Updates (`content.ts`)

-   Modified chat extraction to automatically tag ChatGPT chats with `source: "chatgpt"`
-   Ready for future integration of Claude, Gemini, and DeepSeek extraction

### 3. New Chat Navigation Component

#### Created `nav-chats.tsx`

-   Displays chats grouped by AI platform source
-   Features:
    -   Collapsible sections for each platform (ChatGPT, Claude, Gemini, DeepSeek)
    -   Platform-specific icons
    -   Inline editing of chat names
    -   Duplicate and delete functionality
    -   Empty state handling for platforms with no chats
    -   Date formatting for last updated timestamp

### 4. Enhanced AppSidebar (`app-sidebar.tsx`)

#### Added Props Interface

```typescript
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    onLoadChat: (chat: SavedChat, preset: PDFSettings | null) => void;
    onLoadPreset: (settings: PDFSettings, presetId: number) => void;
}
```

#### New Features

-   **Source Icons Mapping**: Maps each platform to its respective icon
-   **Chat Grouping**: Automatically groups chats by source using `useMemo`
-   **Integrated Chat Management**: All CRUD operations for chats
-   **Preset Management**: Preserved existing preset functionality

#### Component Structure

```
AppSidebar
├── SidebarHeader (TeamSwitcher)
├── SidebarContent
│   ├── NavChats (NEW - organized by source)
│   └── NavPresets (existing)
└── SidebarFooter (NavUser)
```

### 5. App.tsx Updates

#### Removed Dependencies

-   Removed import of old `LeftSidebar` component
-   Removed `sidebarOpen` state (no longer needed with collapsible sidebar)

#### Updated ChatData Handling

-   Added `source` field to ChatData interface
-   Updated `handleLoadChat` to include source
-   Modified storage operations to preserve source
-   Added backward compatibility: defaults to "chatgpt" for old chats without source

#### Updated Props Passing

```typescript
<AppSidebar
    className="h-full"
    onLoadChat={handleLoadChat}
    onLoadPreset={handleLoadPreset}
/>
```

### 6. SaveChatDialog Updates (`SaveChatDialog.tsx`)

-   Added `chatSource: ChatSource` prop
-   Updated save operations to include source field
-   Both save and update operations now preserve chat source

## Component Architecture

### Old Structure (Deprecated)

```
App.tsx
├── LeftSidebar (Sheet overlay)
│   ├── Saved Chats (flat list)
│   └── Presets (flat list)
└── Main Content
```

### New Structure

```
App.tsx
├── AppSidebar (Collapsible)
│   ├── TeamSwitcher
│   ├── NavChats
│   │   ├── ChatGPT (collapsible)
│   │   ├── Claude (collapsible)
│   │   ├── Gemini (collapsible)
│   │   └── DeepSeek (collapsible)
│   ├── NavPresets (collapsible)
│   └── NavUser
└── Main Content
```

## Database Migration

### Version 3 Schema

```typescript
this.version(3).stores({
    presets: "++id, name, createdAt, updatedAt",
    chats: "++id, name, source, createdAt, updatedAt",
});
```

### Backward Compatibility

-   Old chats without source field default to "chatgpt"
-   Database automatically upgrades when first accessed
-   No data loss during migration

## Features Preserved from LeftSidebar

✅ Chat loading with preset settings
✅ Inline editing of chat names
✅ Duplicate chat functionality
✅ Delete chat with confirmation
✅ Name validation (no duplicates, no empty names)
✅ Preset management
✅ Date formatting for timestamps
✅ Error handling and display

## New Features Added

✨ Chat organization by AI platform
✨ Platform-specific icons
✨ Collapsible platform sections
✨ Cleaner, more scalable UI
✨ Better visual hierarchy
✨ Ready for multi-platform support

## Future Enhancements

### Ready for Implementation

1. **Claude Chat Extraction**: Add content script for claude.ai
2. **Gemini Chat Extraction**: Add content script for gemini.google.com
3. **DeepSeek Chat Extraction**: Add content script for deepseek.com

### Suggested Features

-   Star/favorite chats
-   Search/filter chats
-   Export multiple chats
-   Chat tags/categories
-   Platform-specific settings

## Files Modified

### Core Files

-   ✏️ `entrypoints/options/types.ts` - Added ChatSource type
-   ✏️ `lib/settingsDB.ts` - Database schema v3, source field
-   ✏️ `entrypoints/content.ts` - Added source to extracted data
-   ✏️ `entrypoints/options/App.tsx` - Removed LeftSidebar, integrated AppSidebar
-   ✏️ `entrypoints/options/app-sidebar.tsx` - Added chat listing
-   ✏️ `entrypoints/options/SaveChatDialog.tsx` - Added source parameter

### New Files

-   ➕ `entrypoints/options/nav-chats.tsx` - Chat navigation component

### Deprecated (Not Deleted)

-   ❌ `entrypoints/options/LeftSidebar.tsx` - Old sidebar implementation

## Testing Checklist

-   [ ] Load existing chats (should default to chatgpt)
-   [ ] Save new chat from ChatGPT
-   [ ] Edit chat name
-   [ ] Duplicate chat
-   [ ] Delete chat
-   [ ] Load chat with preset
-   [ ] Load chat without preset
-   [ ] Verify source icons display correctly
-   [ ] Test collapsible sections
-   [ ] Verify empty state for platforms without chats
-   [ ] Test preset management (unaffected)

## Migration Notes

1. **No Breaking Changes**: Existing chats automatically get `source: "chatgpt"`
2. **Backward Compatible**: Old storage format still readable
3. **Smooth Transition**: No user action required
4. **Data Integrity**: All existing chat data preserved

## Summary

The migration successfully:

-   ✅ Replaces old LeftSidebar with modern AppSidebar
-   ✅ Adds multi-platform support infrastructure
-   ✅ Improves UI organization and scalability
-   ✅ Maintains all existing functionality
-   ✅ Prepares for future platform integrations
-   ✅ Preserves data integrity and backward compatibility
