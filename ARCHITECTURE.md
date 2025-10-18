# Component Structure

## Message Management Feature Architecture

```
App.tsx (Main Component)
├── State Management
│   ├── chatData: Message[] | null
│   ├── selectedMessages: Set<number>
│   └── expandedSections: { messages: true }
│
├── Handlers
│   ├── handleUpdateMessage(index, content)
│   ├── handleToggleMessage(index)
│   └── Message filtering logic
│
└── Child Components
    ├── Header
    ├── PreviewContainer (receives filtered messages)
    └── SettingsPanel
        ├── LayoutSelector
        ├── ChatSettings
        ├── QASettings
        ├── DocumentSettings
        ├── GeneralSettings
        └── MessageManagement ⭐ NEW
            ├── Message List (ScrollArea)
            │   └── Message Card
            │       ├── Checkbox
            │       ├── Role Badge
            │       ├── Message Preview
            │       └── Edit Button
            │
            └── Edit Dialog (Modal)
                ├── Dialog Header
                ├── ChatEditor ⭐ ENHANCED
                │   ├── Formatting Toolbar
                │   │   ├── Bold, Italic, Strike, Code
                │   │   ├── Lists (Bullet, Ordered)
                │   │   ├── Code Block
                │   │   └── Undo/Redo
                │   └── Editor Content (TipTap)
                └── Dialog Footer
                    ├── Cancel Button
                    └── Save Button
```

## Data Flow

```
1. Load Messages
   Chrome Storage → App.tsx → setChatData()
   ↓
   Initialize all as selected → setSelectedMessages(new Set([0,1,2,...]))

2. Message Selection
   User clicks checkbox → onToggleMessage(index)
   ↓
   Update selectedMessages Set
   ↓
   Filter messages for preview → filteredMessages
   ↓
   Pass to PreviewContainer

3. Message Editing
   User clicks Edit → handleEditClick(index, content)
   ↓
   Open Dialog with ChatEditor
   ↓
   User edits content → onChange(html)
   ↓
   User clicks Save → handleSave()
   ↓
   onUpdateMessage(index, content)
   ↓
   Update chatData state
   ↓
   Save to Chrome Storage
```

## File Structure

```
entrypoints/options/
├── App.tsx                    ← Main component (updated)
├── SettingsPanel.tsx          ← Settings panel (updated)
├── MessageManagement.tsx      ← NEW: Message list & selection
├── Editor.tsx                 ← ENHANCED: Rich text editor
├── style.css                  ← ENHANCED: Editor styles
├── Header.tsx
├── PreviewContainer.tsx
├── ChatLayout.tsx
├── QALayout.tsx
├── DocumentLayout.tsx
├── LayoutSelection.tsx
├── ChatSettings.tsx
├── QASettings.tsx
├── DocumentSettings.tsx
├── GeneralSettings.tsx
├── types.ts
└── utils.tsx

components/ui/
├── dialog.tsx                 ← NEW: Shadcn dialog
├── checkbox.tsx               ← NEW: Shadcn checkbox
├── scroll-area.tsx            ← NEW: Shadcn scroll area
├── button.tsx
├── card.tsx
├── collapsible.tsx
├── input.tsx
├── label.tsx
├── select.tsx
├── slider.tsx
└── switch.tsx
```

## Key Features by Component

### MessageManagement.tsx

-   ✅ Collapsible section with icon
-   ✅ Scrollable message list (320px max height)
-   ✅ Message cards with hover effects
-   ✅ Role-based color coding
-   ✅ Message selection tracking
-   ✅ Selection counter
-   ✅ Empty state handling
-   ✅ Edit dialog integration

### Editor.tsx

-   ✅ TipTap rich text editor
-   ✅ Comprehensive formatting toolbar
-   ✅ Active state indicators
-   ✅ Disabled state handling
-   ✅ Code block support
-   ✅ List formatting
-   ✅ Undo/Redo functionality
-   ✅ Real-time content updates
-   ✅ Prose styling integration

### App.tsx Enhancements

-   ✅ Message selection state
-   ✅ Message update handler
-   ✅ Message toggle handler
-   ✅ Message filtering logic
-   ✅ Auto-select all messages on load
-   ✅ Chrome storage integration

### SettingsPanel.tsx Updates

-   ✅ New props for message management
-   ✅ MessageManagement component integration
-   ✅ Proper prop drilling

## Styling Approach

### Consistent Design Language

-   Border: `border border-gray-200`
-   Cards: `bg-card hover:bg-accent/50`
-   Shadows: `shadow-sm`
-   Spacing: `space-y-2`, `gap-3`
-   Rounded corners: `rounded-lg`

### Color Palette

-   User: Amber tones (`#ffcc41`)
-   AI: Blue/gray tones (`#efefef`)
-   Borders: Gray (`border-gray-200`)
-   Backgrounds: Card/accent variations

### Typography

-   Headers: `font-semibold`
-   Body: `text-sm`
-   Muted: `text-muted-foreground`
-   Preview text: `text-foreground/80`
