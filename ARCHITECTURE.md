# ExportMyChat Extension Architecture

## Overview

ExportMyChat is a browser extension that exports AI chat conversations from multiple platforms (ChatGPT, Claude, Gemini, DeepSeek) to beautifully formatted PDFs. Built with React, TypeScript, and the WXT framework.

## Platform Support

### Supported Platforms

-   **ChatGPT** (chatgpt.com, chat.openai.com)
-   **Claude** (claude.ai) - with Artifacts extraction
-   **Gemini** (gemini.google.com) - with Monaco editor extraction
-   **DeepSeek** (chat.deepseek.com) - with HTML rendering support

### Platform Detection

The content script automatically detects which platform the user is on and adapts extraction logic accordingly.

---

## Core Architecture

### Component Hierarchy

```
App.tsx (Main Component)
├── State Management
│   ├── chatData: { title, messages, source, artifacts }
│   ├── selectedMessages: Set<number> (hash-based tracking)
│   ├── settings: PDFSettings
│   ├── expandedSections: { [key: string]: boolean }
│   └── Dialog states (save, merge, export, import, etc.)
│
├── Handlers
│   ├── handleReorderMessages() - drag-and-drop with flushSync
│   ├── handleUpdateMessage() - edit message content
│   ├── handleToggleMessage() - selection toggle
│   ├── handleSaveChat() - save to IndexedDB
│   ├── handleExportChat() - export as JSON
│   ├── handleImportChat() - import from JSON
│   └── handleMergeChats() - merge multiple chats
│
└── Child Components
    ├── Header (Logo, Theme, Social Links, Review)
    ├── AppSidebar
    │   ├── SavedChatsManagement (with export/import/merge)
    │   ├── PresetManagement
    │   └── BuyMeCoffee / Social Actions
    ├── PreviewContainer
    │   ├── PreviewToolbar (Export PDF, Save Chat, Export JSON)
    │   └── Layout Renderers
    │       ├── ChatLayout (bubble style)
    │       ├── QALayout (structured Q&A)
    │       └── DocumentLayout (formal document)
    └── SettingsPanel
        ├── MessageManagement ⭐
        │   ├── Drag-and-drop reordering (@dnd-kit)
        │   ├── Selection system (Set<number>)
        │   ├── Message cards with edit dialog
        │   └── ChatEditor (rich text editor)
        ├── LayoutSelection
        ├── ChatSettings
        ├── QASettings
        ├── DocumentSettings
        └── GeneralSettings
```

---

## Data Flow

### 1. Chat Extraction (content.ts)

```
User on Chat Platform → Clicks "Export Chat" Button
↓
Content Script Detects Platform (ChatGPT/Claude/Gemini/DeepSeek)
↓
Platform-Specific Extraction:
  - ChatGPT: Standard DOM extraction
  - Claude: Includes Artifact detection and extraction
  - Gemini: Monaco editor content extraction via injected script
  - DeepSeek: HTML-aware code block extraction
↓
Extract: title, messages[], images, artifacts
↓
Save to Chrome Storage: chrome.storage.local.set({ chatData })
↓
Open Options Page: chrome.runtime.openOptionsPage()
```

### 2. Message Loading (App.tsx)

```
Options Page Loads → useEffect checks Chrome Storage
↓
chatData found → setChatData({ title, messages, source, artifacts })
↓
Auto-select all messages → setSelectedMessages(new Set([0,1,2,...]))
↓
Generate message hashes → hash = simpleHash(role + content)
↓
Initialize filteredMessages → messages.filter(selected)
↓
Pass to PreviewContainer for rendering
```

### 3. Message Selection

```
User clicks checkbox → handleToggleMessage(index)
↓
Get message hash → const hash = generateMessageHash(message)
↓
Update Set (add/remove) → new Set(selectedMessages)
↓
flushSync update → setChatData & setSelectedMessages
↓
Re-compute filteredMessages
↓
Update Preview immediately
```

### 4. Message Reordering (Drag & Drop)

```
User drags message → DndContext detects
↓
handleReorderMessages(oldIndex, newIndex)
↓
Generate message hashes for tracking
↓
Reorder messages array → arrayMove(messages, old, new)
↓
Update selection Set with new hashes
↓
flushSync(() => { setChatData(); setSelectedMessages(); })
↓
Synchronous state update → Preview updates instantly
↓
Save to Chrome Storage → chrome.storage.local.set()
```

### 5. Message Editing

```
User clicks Edit → handleEditClick(index, content)
↓
Open Dialog with ChatEditor component
↓
User edits content (formatting, code, lists)
↓
onChange(html) → update local state
↓
User clicks Save → handleSave()
↓
onUpdateMessage(index, newContent)
↓
Update chatData.messages[index].content
↓
flushSync update state
↓
Save to Chrome Storage
↓
Preview updates automatically
```

### 6. Backup & Restore

**Export Chat (Backup):**

```
User clicks "Export Chat" → handleExportChat()
↓
Prepare chat data: { title, messages, source, artifacts, timestamp, version }
↓
Convert to JSON string
↓
Create Blob and download link
↓
Download as: {title}_backup_{timestamp}.json
```

**Import Chat (Restore):**

```
User selects JSON file → handleImportChat(file)
↓
Read file content → FileReader
↓
Parse JSON and validate structure
↓
Load into app → setChatData(importedData)
↓
Initialize selection → setSelectedMessages(all)
↓
Show success notification
```

**Bulk Export:**

```
User selects multiple chats → BulkExportChatsDialog
↓
Retrieve all selected chats from IndexedDB
↓
Convert each to JSON
↓
Create ZIP file with JSZip
↓
Download as: chats_backup_{timestamp}.zip
```

### 7. Save & Load Chats

**Save:**

```
User clicks "Save Chat" → handleSaveChat()
↓
Open SaveChatDialog for name input
↓
Prepare SavedChat object: { name, chatData, settings, timestamp }
↓
settingsDB.saveChat(savedChat) → IndexedDB
↓
Update sidebar chat list
↓
Show success toast
```

**Load:**

```
User clicks chat in sidebar → handleLoadChat(id)
↓
settingsDB.getChat(id) → retrieve from IndexedDB
↓
setChatData(chat.chatData)
↓
setSettings(chat.settings)
↓
Initialize selectedMessages
↓
Show loaded notification
```

### 8. PDF Export

```
User clicks "Export PDF" → handleExportPDF()
↓
Gather: filteredMessages, settings, layout
↓
Generate HTML based on layout:
  - ChatLayout: Bubble style with avatars
  - QALayout: Q&A format with numbering
  - DocumentLayout: Formal document style
↓
Apply settings: colors, fonts, spacing, margins
↓
Open new window with generated HTML
↓
Trigger browser print dialog: window.print()
↓
User saves as PDF via browser's print-to-PDF
```

---

## File Structure

```
entrypoints/
├── background.ts                  # Service worker (future use)
├── content.ts                     # 🔥 Platform detection & extraction
│   ├── ChatGPT extraction
│   ├── Claude extraction (with Artifacts)
│   ├── Gemini extraction (Monaco editor)
│   └── DeepSeek extraction (HTML rendering)
│
└── options/                       # Main extension UI
    ├── App.tsx                    # 🔥 Main component with state management
    ├── Header.tsx                 # Navigation bar with review link
    ├── app-sidebar.tsx            # 🔥 Sidebar with chats/presets management
    │
    ├── PreviewContainer.tsx       # PDF preview panel
    ├── PreviewToolbar.tsx         # Export/Save/Backup buttons
    ├── ChatLayout.tsx             # Bubble chat layout
    ├── QALayout.tsx               # Q&A structured layout
    ├── DocumentLayout.tsx         # Formal document layout
    │
    ├── SettingsPanel.tsx          # Settings container
    ├── LayoutSelection.tsx        # Layout picker
    ├── ChatSettings.tsx           # Chat-specific settings
    ├── QASettings.tsx             # Q&A-specific settings
    ├── DocumentSettings.tsx       # Document-specific settings
    ├── GeneralSettings.tsx        # Global settings
    │
    ├── MessageManagement.tsx      # 🔥 Message selection/edit/reorder
    ├── Editor.tsx                 # 🔥 Rich text editor (TipTap-based)
    │
    ├── SaveChatDialog.tsx         # Save chat modal
    ├── SavePresetDialog.tsx       # Save preset modal
    ├── ExportChatDialog.tsx       # 🔥 Export as JSON backup
    ├── ImportChatDialog.tsx       # 🔥 Import from JSON backup
    ├── BulkExportChatsDialog.tsx  # 🔥 Bulk export as ZIP
    ├── MergeChatsDialog.tsx       # Merge multiple chats
    ├── ConfirmationDialog.tsx     # Generic confirmation
    ├── UnsavedChangesDialog.tsx   # Unsaved changes warning
    │
    ├── SavedChatsManagement.tsx   # Chat list in sidebar
    ├── PresetManagement.tsx       # Preset list in sidebar
    ├── nav-main.tsx               # Main navigation items
    ├── nav-chats.tsx              # Chat navigation component
    ├── nav-presets.tsx            # Preset navigation component
    ├── team-switcher.tsx          # Sidebar toggle component
    │
    ├── types.ts                   # TypeScript types
    ├── utils.tsx                  # Utility functions
    ├── style.css                  # Custom styles
    ├── index.html                 # Options page HTML
    └── main.tsx                   # React entry point

components/                        # Reusable components
├── ThemeToggle.tsx               # Light/Dark theme switcher
├── BuyMeCoffeeModal.tsx          # Support modal
└── ui/                           # Shadcn/ui components
    ├── button.tsx
    ├── button-group.tsx
    ├── card.tsx
    ├── checkbox.tsx             # 🔥 Used in MessageManagement
    ├── collapsible.tsx
    ├── dialog.tsx               # 🔥 Used for all modals
    ├── dropdown-menu.tsx
    ├── input.tsx
    ├── label.tsx
    ├── scroll-area.tsx          # 🔥 Used in MessageManagement
    ├── select.tsx
    ├── separator.tsx
    ├── sidebar.tsx              # 🔥 Sidebar primitive
    ├── skeleton.tsx
    ├── slider.tsx
    ├── spinner.tsx
    ├── switch.tsx
    ├── textarea.tsx
    └── tooltip.tsx

lib/
├── settingsDB.ts                # 🔥 IndexedDB operations (Dexie)
├── themeStorage.ts              # Theme persistence
├── useTheme.ts                  # Theme hook
└── utils.ts                     # Utility functions

hooks/
└── use-mobile.ts                # Mobile detection hook

public/                          # Static assets
├── monaco-extractor.js          # 🔥 Gemini Monaco editor extractor
├── icon/                        # Extension icons
├── chat/                        # Platform logos
└── side/                        # Sidebar images

assets/
├── tailwind.css                 # Global styles
├── *.svg                        # Platform logos (light/dark)

wxt.config.ts                    # WXT framework configuration
tsconfig.json                    # TypeScript configuration
package.json                     # Dependencies and scripts
```

🔥 = New or significantly enhanced in v14.0.0

---

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
