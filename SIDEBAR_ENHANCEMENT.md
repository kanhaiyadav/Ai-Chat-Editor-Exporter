# Left Sidebar Enhancement

## Overview

Enhanced the left sidebar to use shadcn's Sidebar component and added comprehensive features including saved chats, saved presets, and community engagement buttons.

## Changes Made

### 1. Component Updates

#### LeftSidebar.tsx - Complete Redesign

-   **Replaced**: Custom sidebar implementation with shadcn's `Sidebar` component
-   **Enhanced Structure**:
    -   `SidebarProvider` - Wraps the entire sidebar for context
    -   `SidebarHeader` - Contains title and close button
    -   `SidebarContent` - Main content area with two sections
    -   `SidebarFooter` - Community engagement buttons

**New Props**:

```typescript
interface LeftSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadChat: (chat: SavedChat, preset: PDFSettings | null) => void;
    onLoadPreset: (settings: PDFSettings, presetId: number) => void; // NEW
}
```

### 2. New Features

#### Saved Chats Section

-   Displays all saved chats with live updates via `useLiveQuery`
-   Shows chat metadata:
    -   Chat name (editable)
    -   Chat title
    -   Associated preset name
    -   Message count
    -   Last updated timestamp
-   Actions available:
    -   Load chat (click on card)
    -   Rename (pencil icon)
    -   Duplicate (copy icon)
    -   Delete (trash icon)
-   Empty state with helpful message

#### Saved Presets Section (NEW)

-   Displays all saved presets with live updates via `useLiveQuery`
-   Shows preset metadata:
    -   Preset name (editable)
    -   Last updated timestamp
-   Actions available:
    -   Load preset (click on card)
    -   Rename (pencil icon)
    -   Duplicate (copy icon)
    -   Delete (trash icon)
-   Empty state with helpful message
-   Separated from chats with a `Separator` component

#### Footer Section (NEW)

Three community engagement buttons:

1. **Star on GitHub**
    - Opens repository in new tab
    - URL: `https://github.com/kanhaiyadav/Ai-Chat-Editor-Exporter`
    - Icon: GitHub + Star
2. **Send Feedback**
    - Opens `FeedbackModal` component
    - Icon: MessageCircle
    - Allows users to submit feedback directly
3. **Buy Me a Coffee**
    - Opens `BuyMeCoffeeModal` component
    - Icon: Coffee
    - Enables direct support for the project

### 3. Technical Implementation

#### State Management

```typescript
// Separate state for editing chats and presets
const [editingChatId, setEditingChatId] = useState<number | null>(null);
const [editingChatName, setEditingChatName] = useState("");
const [editingPresetId, setEditingPresetId] = useState<number | null>(null);
const [editingPresetName, setEditingPresetName] = useState("");
const [error, setError] = useState("");

// Modal state
const [showBuyMeCoffee, setShowBuyMeCoffee] = useState(false);
const [showFeedback, setShowFeedback] = useState(false);
```

#### Live Data Queries

```typescript
const chats = useLiveQuery(
    () => db.chats.orderBy("updatedAt").reverse().toArray(),
    []
);

const presets = useLiveQuery(
    () => db.presets.orderBy("updatedAt").reverse().toArray(),
    []
);
```

#### Handler Functions

**Chat Operations**:

-   `handleLoadChat(chat)` - Loads chat and associated preset
-   `handleDeleteChat(id, e)` - Deletes a chat
-   `handleStartEditChat(chat, e)` - Enters edit mode for chat name
-   `handleSaveEditChat(id, e)` - Saves edited chat name
-   `handleCancelEditChat(e)` - Cancels editing
-   `handleDuplicateChat(chat, e)` - Creates a copy of the chat

**Preset Operations** (NEW):

-   `handleLoadPreset(preset, e)` - Loads preset settings
-   `handleDeletePreset(id, e)` - Deletes a preset
-   `handleStartEditPreset(preset, e)` - Enters edit mode for preset name
-   `handleSaveEditPreset(id, e)` - Saves edited preset name
-   `handleCancelEditPreset(e)` - Cancels editing
-   `handleDuplicatePreset(preset, e)` - Creates a copy of the preset

**Community Actions** (NEW):

-   `handleStarRepo()` - Opens GitHub repository in new tab

### 4. UI/UX Improvements

#### Layout Structure

```
┌─────────────────────────────┐
│ Header (Title + Close)      │
├─────────────────────────────┤
│                             │
│ Saved Chats Section         │
│ ├─ Chat Card 1              │
│ ├─ Chat Card 2              │
│ └─ ...                      │
│                             │
├─────────────────────────────┤
│ Separator                   │
├─────────────────────────────┤
│                             │
│ Saved Presets Section       │
│ ├─ Preset Card 1            │
│ ├─ Preset Card 2            │
│ └─ ...                      │
│                             │
├─────────────────────────────┤
│ Footer                      │
│ ├─ Star on GitHub           │
│ ├─ Send Feedback            │
│ └─ Buy Me a Coffee          │
└─────────────────────────────┘
```

#### Visual Design

-   **Width**: 380px (increased from 350px for better content display)
-   **Sections**: Clear visual separation with section labels
-   **Cards**: Consistent rounded corners, hover effects, and borders
-   **Icons**: Contextual icons for each section (MessageSquare, Settings2)
-   **Actions**: Hidden until hover for cleaner look
-   **Scrollable Areas**: Fixed heights to prevent overflow
    -   Chats: 300px scroll area
    -   Presets: 250px scroll area

#### Interactive Elements

-   **Inline Editing**: Edit names directly in the card
-   **Keyboard Support**:
    -   Enter to save
    -   Escape to cancel
-   **Visual Feedback**:
    -   Hover states on cards
    -   Transition animations
    -   Error messages for validation
-   **Click Prevention**: Event propagation stopped for action buttons

### 5. Dependencies Added

#### shadcn Components

```bash
npx shadcn@latest add sidebar separator
```

**New Components Installed**:

-   `components/ui/sidebar.tsx` - Main sidebar component
-   `components/ui/separator.tsx` - Visual separator
-   `components/ui/sheet.tsx` - (Dependency)
-   `components/ui/tooltip.tsx` - (Dependency)
-   `components/ui/skeleton.tsx` - (Dependency)
-   `hooks/use-mobile.ts` - Mobile detection hook

### 6. Integration Changes

#### App.tsx Updates

```typescript
<LeftSidebar
    isOpen={sidebarOpen}
    onClose={() => setSidebarOpen(false)}
    onLoadChat={handleLoadChat}
    onLoadPreset={handleLoadPreset} // NEW PROP
/>
```

### 7. Benefits

1. **Unified Library**: All saved data (chats and presets) in one place
2. **Better Organization**: Clear sections with visual hierarchy
3. **Enhanced Functionality**: Full CRUD operations for both chats and presets
4. **Community Engagement**: Direct access to feedback and support options
5. **Consistent Design**: Uses shadcn components for UI consistency
6. **Better UX**: Improved navigation and discoverability
7. **Live Updates**: Automatic refresh when data changes
8. **Professional Look**: Clean, modern design with proper spacing

## Testing Checklist

-   [ ] Sidebar opens/closes smoothly
-   [ ] Saved chats load correctly
-   [ ] Saved presets load correctly
-   [ ] Chat rename functionality works
-   [ ] Preset rename functionality works
-   [ ] Chat duplication works
-   [ ] Preset duplication works
-   [ ] Chat deletion works
-   [ ] Preset deletion works
-   [ ] Loading chat applies associated preset
-   [ ] Loading preset updates settings
-   [ ] Star on GitHub opens correct URL
-   [ ] Feedback modal opens and submits
-   [ ] Buy Me a Coffee modal opens and processes
-   [ ] Empty states display correctly
-   [ ] Scroll areas work properly
-   [ ] Error messages show for validation failures
-   [ ] Keyboard shortcuts work (Enter/Escape)

## Future Enhancements

1. **Search/Filter**: Add search functionality for chats and presets
2. **Tags/Categories**: Organize chats and presets with tags
3. **Sort Options**: Allow sorting by name, date, or custom order
4. **Favorites**: Pin favorite chats/presets to top
5. **Export/Import**: Backup and restore chats/presets
6. **Keyboard Navigation**: Full keyboard support for accessibility
7. **Drag & Drop**: Reorder items via drag and drop
8. **Bulk Actions**: Select multiple items for batch operations
