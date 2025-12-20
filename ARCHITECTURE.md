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
│   ├── handleReorderMessages() - drag-and-drop reordering
│   ├── handleContentChange() - edit message content inline
│   ├── handleToggleMessage() - selection toggle
│   ├── handleSaveChat() - save to IndexedDB
│   ├── handleExportJSON() - export as JSON
│   ├── handleImportChat() - import from JSON
│   ├── handleMergeChats() - merge multiple chats
│   ├── handleGeneratePDF() - export to PDF
│   ├── handleOpenInWord() - export to DOCX
│   ├── handleExportMarkdown() - export to MD
│   ├── handleExportHTML() - export to HTML
│   └── handleExportPlainText() - export to TXT
│
└── Child Components
    ├── Header (Logo, Language Selector, Theme, Social Links, Review)
    ├── AppSidebar
    │   ├── SavedChatsManagement (with export/import/merge)
    │   ├── PresetManagement
    │   ├── GoogleDriveSyncSettings (cloud sync)
    │   └── BuyMeCoffee / Social Actions
    ├── PreviewContainer
    │   ├── PreviewToolbar (Export PDF/DOCX/HTML/MD/JSON/TXT, Save Chat, Merge)
    │   └── Layout Renderers
    │       ├── ChatLayout (bubble style)
    │       ├── QALayout (structured Q&A)
    │       └── DocumentLayout (formal document)
    ├── SettingsPanel
    │   ├── LayoutSelection
    │   ├── ChatSettings
    │   ├── QASettings
    │   ├── DocumentSettings
    │   └── GeneralSettings
    ├── EditorPanel ⭐ (Overlay)
    │   ├── EditorToolbar (formatting controls)
    │   ├── Editor (ContentEditable with rich text)
    │   └── EditorForms (image/table/link dialogs)
    └── MessageManagementPanel ⭐ (Overlay)
        ├── Drag-and-drop reordering (@dnd-kit)
        ├── Selection system (Set<number>)
        └── Message cards with role indicators
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

### 5. Message Editing (Inline)

```
User enables edit mode → Click edit icon in PreviewToolbar
↓
setIsEditingContent(true) → setShowEditorPanel(true)
↓
User clicks message in preview → handleStartEdit(index, element)
↓
EditorPanel opens with EditorToolbar
↓
User edits content directly in preview (contentEditable)
↓
EditorToolbar provides formatting options
  - Bold, italic, underline, headings
  - Lists, code blocks, tables
  - Links, images, alignment
↓
onContentChange(html) → update chatData.messages[index].content
↓
flushSync update state
↓
Save to Chrome Storage
↓
Preview updates in real-time
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

### 8. Multi-Format Export

**PDF Export:**

```
User clicks "Export PDF" → handleGeneratePDF()
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

**DOCX Export:**

```
handleOpenInWord() → exportToWord()
↓
Generate HTML with Word-compatible styling
↓
Create Blob with application/msword MIME type
↓
Download as .docx file
```

**HTML/Markdown/Plain Text Export:**

```
exportToHTML/Markdown/PlainText()
↓
Convert messages to target format
↓
Create downloadable file
↓
Trigger download
```

---

## File Structure

```
C2Pdf_wxt/
entrypoints/
├── background.ts                  # Service worker (future use)
├── content.ts                     # 🔥 Platform detection & extraction
│   ├── ChatGPT extraction
│   ├── Claude extraction (with Artifacts)
│   ├── Gemini extraction (Monaco editor)
│   └── DeepSeek extraction (HTML rendering)
│
├── popup/                         # 🔥 Browser action popup
│   ├── App.tsx                    # Popup component with platform guides
│   ├── main.tsx                   # Entry point
│   ├── App.css, style.css         # Popup styles
│   └── index.html                 # Popup HTML
│
├── popup/                         # 🔥 Browser action popup
│   ├── App.tsx                    # Popup component with platform guides
│   ├── main.tsx                   # Entry point
│   ├── App.css, style.css         # Popup styles
│   └── index.html                 # Popup HTML
│
└── options/                       # Main extension UI
    ├── App.tsx                    # 🔥 Main component with state management
    ├── Header.tsx                 # Navigation bar with language, theme, review
    ├── app-sidebar.tsx            # 🔥 Sidebar with chats/presets/sync
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
    ├── MessageManagementPanel.tsx # 🔥 Message selection/edit/reorder (overlay)
    ├── EditorPanel.tsx            # 🔥 Rich text editor panel (overlay)
    ├── EditorToolbar.tsx          # 🔥 Editor formatting toolbar
    ├── EditorForms.tsx            # 🔥 Image/table/link dialogs
    ├── Editor.tsx                 # 🔥 ContentEditable-based rich editor
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
    ├── nav-presets.tsx            # Presets navigation component
    ├── team-switcher.tsx          # Sidebar toggle component
    │
    ├── types.ts                   # TypeScript types
    ├── utils.tsx                  # Utility functions
    ├── style.css                  # Custom styles
    ├── index.html                 # Options page HTML
    └── main.tsx                   # React entry point

components/                        # Reusable components
├── ThemeToggle.tsx               # Light/Dark theme switcher
├── LanguageSelector.tsx          # 🔥 Multi-language selector (i18n)
├── BuyMeCoffeeModal.tsx          # Support modal
├── GoogleDriveSyncModal.tsx      # 🔥 Google Drive sync modal
├── GoogleDriveSyncSettings.tsx   # 🔥 Google Drive sync settings
├── SyncStatusIndicator.tsx       # 🔥 Cloud sync status indicator
└── ui/                           # Shadcn/ui components
    ├── button.tsx
    ├── button-group.tsx
    ├── card.tsx
    ├── checkbox.tsx             # 🔥 Used in MessageManagementPanel
    ├── collapsible.tsx
    ├── dialog.tsx               # 🔥 Used for all modals
    ├── dropdown-menu.tsx
    ├── input.tsx
    ├── label.tsx
    ├── scroll-area.tsx          # 🔥 Used in MessageManagementPanel
    ├── select.tsx
    ├── separator.tsx
    ├── sheet.tsx                # 🔥 Used for overlay panels
    ├── sidebar.tsx              # 🔥 Sidebar primitive
    ├── skeleton.tsx
    ├── slider.tsx
    ├── spinner.tsx
    ├── switch.tsx
    ├── textarea.tsx
    └── tooltip.tsx

lib/
├── settingsDB.ts                # 🔥 IndexedDB operations (Dexie with syncId)
├── googleDriveSync.ts           # 🔥 Google Drive sync service
├── themeStorage.ts              # Theme persistence
├── useTheme.ts                  # Theme hook
├── utils.ts                     # Utility functions
└── i18n/                        # 🔥 Internationalization
    ├── config.ts                # i18n configuration
    └── locales/                 # 15 language files
        ├── en.json, es.json, fr.json, de.json, it.json
        ├── pt.json, ru.json, zh.json, ja.json, ko.json
        └── ar.json, hi.json, nl.json, pl.json, tr.json

hooks/
├── use-mobile.ts                # Mobile detection hook
└── use-toast.ts                 # Toast notification hook

public/                          # Static assets
├── monaco-extractor.js          # 🔥 Gemini Monaco editor extractor
├── icon/                        # Extension icons
├── chat/                        # Platform logos
└── side/                        # Sidebar images

assets/
├── tailwind.css                 # Global styles
└── Platform logos (SVG)
    ├── openai.svg, openai-light.svg (ChatGPT)
    ├── claude.svg, claude-light.svg (Claude)
    ├── gemini-fill.svg, gemini-fill-light.svg (Gemini)
    └── deepseek-fill.svg, deepseek-fill-light.svg (DeepSeek)

wxt.config.ts                    # WXT framework configuration
tsconfig.json                    # TypeScript configuration
package.json                     # Dependencies and scripts
```

🔥 = New or significantly enhanced in v14.0.0

---

## Key Features by Component

### MessageManagementPanel.tsx

-   ✅ Overlay panel (Sheet component)
-   ✅ Scrollable message list
-   ✅ Drag-and-drop reordering with @dnd-kit
-   ✅ Message cards with hover effects
-   ✅ Role-based color coding (user/assistant)
-   ✅ Message selection tracking (checkboxes)
-   ✅ Selection counter and statistics
-   ✅ Empty state handling
-   ✅ Keyboard navigation support

### Editor.tsx + EditorPanel.tsx

-   ✅ ContentEditable-based rich text editor
-   ✅ Comprehensive formatting toolbar (EditorToolbar)
-   ✅ Text formatting: bold, italic, underline, subscript, superscript
-   ✅ Text alignment: left, center, right, justify
-   ✅ Headings: H1, H2, H3
-   ✅ Lists: bullet and ordered
-   ✅ Code block insertion with syntax highlighting
-   ✅ Table insertion with customizable colors
-   ✅ Link insertion with styling
-   ✅ Image insertion (URL or upload)
-   ✅ Horizontal separator
-   ✅ Undo/Redo functionality
-   ✅ Real-time preview updates
-   ✅ Dialog-based forms for complex elements (EditorForms)

### App.tsx Enhancements

-   ✅ Message selection state (Set<number>)
-   ✅ Message content editing handlers
-   ✅ Message toggle and reordering handlers
-   ✅ Message filtering logic
-   ✅ Auto-select all messages on load
-   ✅ Chrome storage integration
-   ✅ Overlay panel management (Editor, MessageManagement)
-   ✅ Multi-format export handlers
-   ✅ Google Drive sync state management

### Database Schema (Dexie)

**SavedChat:**

```typescript
{
  id: number,
  syncId: string,      // 🔥 UUID for cross-device sync
  name: string,
  title: string,
  messages: Message[],
  source: ChatSource,
  settings: PDFSettings,
  createdAt: Date,
  updatedAt: Date
}
```

**SavedPreset:**

```typescript
{
  id: number,
  syncId: string,      // 🔥 UUID for cross-device sync
  name: string,
  settings: PDFSettings,
  createdAt: Date,
  updatedAt: Date
}
```

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
