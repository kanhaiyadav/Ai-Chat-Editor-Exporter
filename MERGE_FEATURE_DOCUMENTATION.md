# Merge Chats Feature Implementation

## Overview

A new merge functionality has been added to allow users to combine multiple chat conversations from different sources (ChatGPT, Claude, Gemini, DeepSeek) into a single chat, which can then be exported as a longer PDF.

## Components Created/Modified

### 1. **MergeChatsDialog.tsx** (New)

The main dialog component for merging chats. Features include:

#### Left Section - Chat Selection

-   **Source Dropdown**: Filter chats by source (ChatGPT 🤖, Claude 🧠, Gemini ✨, DeepSeek 🔍)
-   **Search Box**: Search chats by title or name
-   **Checkboxes**: Select multiple chats to add to merge
-   **Add Selected Button**: Bulk add all selected chats to the merge panel

#### Right Section - Merge Preview

-   **Current Chat**: Always displayed with distinct styling (blue border, primary background)
-   **Selected Chats**: Horizontally wrapped cards showing all selected chats
-   **Drag & Drop**: Reorder chats using drag handles (similar to message management in SettingsPanel)
-   **Remove Buttons**: Each added chat (except current) can be removed individually

#### Key Features

-   **Visual Source Indicators**: Each chat card displays the source icon and label
-   **Message Count**: Shows how many messages each chat contains
-   **Persistent Current Chat**: The current chat is always included and cannot be removed
-   **Horizontal Flex Layout**: Chats are displayed in a horizontally wrappable container for clean UI
-   **DnD Kit Integration**: Uses same drag-and-drop library as MessageManagement for consistency

### 2. **PreviewToolbar.tsx** (Modified)

Added merge button to the toolbar:

-   New "Merge Chats" button with icon
-   Secondary variant styling for distinction
-   Positioned between Export PDF and Save buttons

### 3. **PreviewContainer.tsx** (Modified)

-   Added `onMerge` prop to pass merge handler to toolbar
-   Passes the handler down to PreviewToolbar component

### 4. **App.tsx** (Modified)

Added merge dialog state and handler:

#### New State

```typescript
const [showMergeDialog, setShowMergeDialog] = useState(false);
```

#### New Handler

```typescript
const handleMergeChats = (mergedMessages: Message[]) => {
    // Updates chat data with merged messages
    // Resets current chat ID (as it's a new merged chat)
    // Updates selected messages to include all merged messages
    // Updates original chat data for change tracking
};
```

#### Dialog Integration

-   MergeChatsDialog component added to JSX
-   Connected to showMergeDialog state
-   Passes current messages and merge handler

## User Flow

1. **Click "Merge Chats" button** in PreviewToolbar
2. **MergeChatsDialog opens** showing:
    - Current chat (highlighted in blue)
    - Available chats for the selected source
3. **Select source** from dropdown (if different)
4. **Search and select chats** using checkboxes
5. **Add Selected** chats to the right panel
6. **Reorder chats** by dragging if desired
7. **Remove chats** using X button if needed
8. **Click "Merge Chats"** button to merge
9. **Merged chat appears** in the preview with updated title "(Merged)"
10. **Export or save** the merged chat as needed

## UI Design

### Styling & Consistency

-   Uses existing shadcn/ui components (Dialog, Button, ScrollArea, etc.)
-   Matches the current app's design system
-   Responsive layout with 50/50 split between selection and preview
-   Tailwind CSS for styling with proper spacing and colors

### Visual Hierarchy

-   **Current Chat**: Blue border, primary background highlight
-   **Added Chats**: Standard card styling with source icon
-   **Search & Filters**: Top section of left panel
-   **Merged Preview**: Bottom-right takes most space for visibility

### Icons & Labels

-   Source-specific emojis for quick identification
-   Clear message counts and chat titles
-   "Current" label for the active chat

## Database Integration

Uses existing database utilities from `settingsDB.ts`:

-   `chatOperations.getChatsBySource()`: Fetch chats by AI source
-   `db.chats.get()`: Get individual chat details
-   Works with existing `SavedChat` interface

## Key Implementation Details

1. **Current Chat Handling**: The current chat is always included with `isCurrentChat: true` flag

    - Cannot be removed from the merge
    - Always appears first in the merged list
    - Not draggable by default for safety

2. **Message Merging**: All messages from all selected chats are concatenated in order

    - Maintains message order from each chat
    - Respects the order of chats in the right panel

3. **Settings Preservation**: Uses current chat's settings for the merged chat

    - This ensures consistent formatting in the exported PDF

4. **Change Tracking**: Updates `originalChatData` to track future changes

    - Merged chat starts as unsaved
    - Can be saved as a new chat or exported directly

5. **Source Filtering**: Only shows chats from the selected source
    - Prevents accidental mixing of different chat sources
    - Can be changed to show all sources if needed

## Dependencies

-   `@dnd-kit/*`: Drag and drop functionality
-   `dexie-react-hooks`: Database queries with React
-   `lucide-react`: Icons
-   `shadcn/ui`: UI components
-   Existing types from `./types.ts`

## Future Enhancements (Optional)

-   Allow merging chats from multiple sources at once
-   Save merged chat combinations as templates
-   Preview message count summary before merging
-   Option to deduplicate similar messages
-   Custom merge order presets

## Testing Checklist

-   [ ] Dialog opens when clicking "Merge Chats" button
-   [ ] Source dropdown filters chats correctly
-   [ ] Search functionality works for all chat fields
-   [ ] Checkboxes select/deselect chats
-   [ ] "Add Selected" button adds chats to right panel
-   [ ] Current chat cannot be removed
-   [ ] Drag and drop reorders chats
-   [ ] Remove button (X) removes chats from merge
-   [ ] Merge button combines all messages correctly
-   [ ] Merged chat appears in preview with correct title
-   [ ] Merged chat settings use current chat settings
-   [ ] Can export merged chat as PDF
-   [ ] Can save merged chat as new chat
