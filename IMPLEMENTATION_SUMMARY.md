# Merge Functionality - Implementation Summary

## What Was Built

A complete merge functionality for combining multiple chat conversations into a single longer chat/PDF. Users can now merge chats from different AI sources (ChatGPT, Claude, Gemini, DeepSeek) to create comprehensive documents.

## Files Modified

### 1. **entrypoints/options/MergeChatsDialog.tsx** ✨ (NEW)

-   Complete merge dialog with dual-panel layout
-   Left panel: Chat selection with source filtering and search
-   Right panel: Horizontal flex-wrap layout for merged chats
-   Drag-and-drop reordering using dnd-kit
-   Source icons and message counts for each chat
-   Current chat always visible and distinct

### 2. **entrypoints/options/PreviewToolbar.tsx**

-   Added "Merge Chats" button with Merge icon
-   Button positioned between Export PDF and Save
-   Secondary styling variant
-   Connected to open merge dialog

### 3. **entrypoints/options/PreviewContainer.tsx**

-   Added `onMerge` prop to interface
-   Passes merge handler to PreviewToolbar

### 4. **entrypoints/options/App.tsx**

-   Added `showMergeDialog` state
-   Added `handleMergeChats` function to process merged messages
-   Integrated MergeChatsDialog component
-   Updates chat data with merged messages and "(Merged)" suffix

## Key Features

✅ **Dual-Panel Design**

-   Left: Source filtering, search, chat selection with checkboxes
-   Right: Horizontal flex-wrap display of selected chats

✅ **Visual Source Identification**

-   ChatGPT: 🤖 | Claude: 🧠 | Gemini: ✨ | DeepSeek: 🔍
-   Source icons displayed on each chat card

✅ **Smart Current Chat Handling**

-   Always included in merge with distinct blue styling
-   Cannot be removed from the merge
-   Labeled as "(Current)"

✅ **Drag & Drop Reordering**

-   Reorder merged chats using grip handles
-   Same implementation as message management
-   Not draggable for current chat

✅ **Search & Filter**

-   Search chats by title or name across selected source
-   Source dropdown to filter by AI platform
-   Real-time filtering with Dexie queries

✅ **Clean UI**

-   Horizontal wrapping cards in right panel
-   Responsive dialog with proper spacing
-   Consistent with existing design system

✅ **Settings Preservation**

-   Uses current chat's settings for merged PDF
-   All messages concatenated in order
-   Change tracking for unsaved detection

## How It Works

1. **User clicks "Merge Chats" button** in toolbar
2. **Dialog opens** showing:
    - Current chat (blue-highlighted, always included)
    - Available chats filtered by source (ChatGPT by default)
3. **User can**:
    - Change source via dropdown
    - Search for specific chats
    - Check multiple chats to select
    - Click "Add Selected" to add them to merge
    - Drag chats to reorder in right panel
    - Remove chats with X button
4. **User clicks "Merge Chats"** button
5. **System**:
    - Concatenates all messages from all chats
    - Updates chat title with "(Merged)" suffix
    - Selects all merged messages
    - Resets current chat ID (it's a new merged chat)
    - Updates tracking for change detection
6. **User can now**:
    - Export as PDF
    - Save as new chat
    - Continue editing

## Technical Details

### Architecture

```
MergeChatsDialog (Component)
├── Left Panel (Selection)
│   ├── Source Dropdown (Select)
│   ├── Search Input (Input)
│   └── Available Chats List (ScrollArea + Checkboxes)
├── Right Panel (Preview)
│   └── Merged Chats (DndContext + SortableContext)
│       └── SortableChatCard (Draggable)
└── Dialog Footer (Buttons)
```

### State Management

-   Uses React hooks for local state
-   Dexie React hooks for database queries
-   DnD Kit for drag-and-drop state

### Database Queries

-   `chatOperations.getChatsBySource()` - Filter by AI source
-   `db.chats.get()` - Get chat details
-   Leverages existing database indexes

## Styling

### Colors & Hierarchy

-   **Current Chat**: `bg-primary/10 border-primary` (blue)
-   **Added Chats**: `bg-card border-border` (default)
-   **Hover States**: `hover:border-accent`

### Layout

-   Left panel: Fixed 50% width
-   Right panel: Fixed 50% width, flex-wrap for horizontal layout
-   Max height: 80vh for visibility
-   ScrollAreas for overflow handling

### Typography

-   Chat titles with truncation
-   Message counts and source labels
-   Responsive text sizing

## Integration Points

-   **Database**: Uses existing `chatOperations` and `db.chats` queries
-   **Types**: Works with `ChatSource` and `Message` interfaces
-   **UI Components**: shadcn/ui (Dialog, Button, Input, ScrollArea, Select, Checkbox)
-   **Icons**: lucide-react and emoji for sources
-   **DnD**: dnd-kit (matching MessageManagement implementation)

## User Experience Flow

```
[Merge Chats Button Click]
        ↓
[Dialog Opens]
        ↓
[Select Source (optional)]
        ↓
[Search & Select Chats]
        ↓
[Add Selected to Merge]
        ↓
[Review & Reorder (optional)]
        ↓
[Click Merge Chats]
        ↓
[Merged Chat in Preview]
        ↓
[Export PDF / Save Chat]
```

## Testing Recommendations

1. **Selection**: Add/remove chats, verify checkboxes work
2. **Filtering**: Change sources, verify chat list updates
3. **Search**: Test searching with partial matches
4. **Drag & Drop**: Reorder chats and verify order in merge
5. **Current Chat**: Verify it can't be removed
6. **Merge**: Verify all messages are concatenated
7. **Export**: Export merged PDF and verify content
8. **Save**: Save merged chat and verify it appears in sidebar
9. **Edge Cases**:
    - Merge with no additional chats
    - Merge with many chats (200+)
    - Merge chats with images/attachments

## Performance Considerations

-   Database queries are optimized with indexes
-   ScrollArea prevents rendering all chats at once
-   Dexie hooks provide reactive updates
-   Drag-and-drop is performant with dnd-kit

## Accessibility

-   Keyboard navigation in drag-and-drop
-   Clear visual feedback for selections
-   Source icons + text labels (not just icons)
-   Proper contrast ratios for visibility
-   Semantic HTML structure

## Future Enhancements

1. Multi-source merging
2. Merge presets/templates
3. Message count preview
4. Duplicate message detection
5. Custom merge patterns
6. Batch operations
7. Merge history
