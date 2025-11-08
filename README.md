# Chat2Pdf - AI Chat Editor & Exporter

<div align="center">
  <img src="public/icon/128.png" alt="Chat2Pdf Logo" width="200" style="border-radius: 12px; margin: 20px 0;">
</div>

A powerful browser extension that transforms AI chat conversations into beautifully formatted PDFs. Supports **ChatGPT**, **Claude**, **Gemini**, and **DeepSeek** with rich text editing, message management, backup/restore, and extensive customization capabilities.

## Table of Contents

-   [Features](#features)
-   [Installation](#installation)
-   [Getting Started](#getting-started)
-   [User Guide](#user-guide)
-   [Architecture](#architecture)
-   [Tech Stack](#tech-stack)
-   [Project Structure](#project-structure)
-   [Development](#development)
-   [Build & Distribution](#build--distribution)
-   [Contributing](#contributing)
-   [Support](#support)

---

## Features

### Core Features

-   **Multi-Platform Support**: ChatGPT, Claude, Gemini, and DeepSeek - all in one extension
-   **One-Click Export**: Export conversations with a single click from any supported platform
-   **Rich Text Editor**: Powerful inline editor with formatting, code blocks, lists, undo/redo
-   **Advanced Message Management**:
    -   Select/deselect individual messages
    -   Drag-and-drop reordering with real-time preview
    -   Edit message content with rich text formatting
    -   Hash-based message tracking for reliable state management
-   **Backup & Restore**:
    -   Export chats as JSON for backup
    -   Import previously exported chats
    -   Bulk export multiple chats at once
-   **Chat Management**:
    -   Save unlimited chats locally
    -   Merge multiple conversations
    -   Load and re-export with different settings
-   **Multiple Layout Options**: Chat (bubble), Q&A (structured), Document (formal)
-   **Extensive Customization**: Colors, fonts, spacing, bubble styles, margins, headers/footers
-   **Preset System**: Save and reuse styling configurations
-   **Theme Support**: Light/Dark mode with system detection
-   **Media Handling**: Include/exclude images and attachments
-   **Artifact Support**: Export Claude Artifacts and Gemini code blocks (optional)

### UI/UX Features

-   Intuitive sidebar navigation
-   Collapsible settings sections
-   Real-time preview of changes
-   Responsive design
-   Accessibility-focused components
-   Keyboard shortcuts support

---

## Installation

### From Source

1. **Clone the repository**:

```bash
git clone https://github.com/kanhaiyadav/Chat2Pdf.git
cd Ai-Chat-Editor-Exporter
```

2. **Install dependencies**:

```bash
npm install
```

3. **Build the extension**:

```bash
npm run build
```

4. **Load in Chromimum browsers**:

-   Open `chrome://extensions/`
-   Enable "Developer mode" (top-right)
-   Click "Load unpacked"
-   Select the `.output/chrome-mv3` directory

### Development Mode

For development with hot-reload:

```bash
npm run dev
```

Then follow the same steps to load in Chrome, but the extension will auto-update as you make changes.

### Firefox

To build for Firefox:

```bash
npm run build:firefox
```

---

## Getting Started

### Step 1: Export a Chat

1. Navigate to any chat on **ChatGPT**, **Claude**, **Gemini**, or **DeepSeek**
2. Click the **"Export Chat"** button that appears in the conversation header
3. The extension automatically opens with your chat data pre-loaded and ready to customize

### Step 2: Review & Edit (Optional)

-   All messages are automatically loaded and selected
-   Use the **"Message Management"** panel to:
    -   Select/deselect specific messages
    -   Drag and drop to reorder messages
    -   Edit message content with the rich text editor
    -   View real-time preview of changes

### Step 3: Customize (Optional)

-   Choose your preferred layout (Chat, Q&A, or Document)
-   Adjust colors, fonts, spacing, and styling
-   Configure headers, footers, and margins
-   Preview changes in real-time on the right panel

### Step 4: Export, Save, or Backup

-   **Export to PDF**: Click "Export PDF" to download immediately
-   **Save Chat**: Store chat locally for future editing/re-export
-   **Backup Chat**: Export as JSON file for backup/sharing
-   **Save Preset**: Save your styling settings for quick reuse

---

## User Guide

### Exporting Chats

#### Initial Export

1. Click the **"Export Chat"** button that appears in the chat header
2. The extension automatically extracts all messages, title, images, and attachments

#### Supported Platforms

**Fully Supported:**

-   **ChatGPT** (chatgpt.com, chat.openai.com)
    -   Standard messages, code blocks, images
    -   Multi-turn conversations
-   **Claude** (claude.ai)
    -   Messages, Artifacts (code/documents)
    -   Include/exclude Artifacts option
-   **Gemini** (gemini.google.com)
    -   Messages, code blocks, embedded code editors
    -   Monaco editor content extraction
-   **DeepSeek** (chat.deepseek.com)
    -   Messages, code blocks
    -   HTML rendering in code blocks

**Platform-Specific Features:**

-   All platforms support images and attachments
-   Claude Artifacts can be included/excluded individually
-   Gemini code editors extract with full syntax highlighting

---

### Chat Editor

The Chat Editor provides rich text editing capabilities:

| Tool          | Description             |
| ------------- | ----------------------- |
| Bold          | Make text bold          |
| Italic        | Make text italic        |
| Strikethrough | Strike text             |
| Inline Code   | Code snippet            |
| Code Block    | Full code block         |
| Lists         | Bullet or ordered lists |
| Undo/Redo     | Undo/Redo changes       |

**How to Edit**: Click the Edit icon next to a message, make changes, and click Save.

---

### Message Management

**Advanced Features**:

-   **Selection System**:
    -   Individual checkboxes for each message
    -   Visual counter showing selected vs total messages
    -   Role-based color coding (User/AI)
-   **Drag & Drop Reordering**:
    -   Smooth drag-and-drop interface using @dnd-kit
    -   Real-time preview updates during reordering
    -   Hash-based message tracking (no ID conflicts)
    -   Maintains selection state after reordering
-   **Rich Text Editor**:
    -   Bold, Italic, Strikethrough formatting
    -   Inline code and code blocks
    -   Bullet and numbered lists
    -   Undo/Redo support
    -   Real-time HTML preview
-   **Message Cards**:
    -   Hover effects and visual feedback
    -   Content preview with ellipsis
    -   Edit button with modal dialog
    -   Empty state handling

---

### Layout Options

#### 1. Chat Layout

-   Bubble-style conversation format
-   User messages on the right, AI on the left
-   Customizable colors, styles, and avatars
-   Best for: Preserving natural conversation flow

#### 2. Q&A Layout

-   Clean question-answer format
-   Optional numbering and custom prefixes
-   Separator styles (line, dots, or none)
-   Best for: Educational content and reports

#### 3. Document Layout

-   Traditional document format
-   Title and body color differentiation
-   Professional appearance
-   Best for: Formal documents and reports

---

### Customization

#### Layout-Specific Settings

-   **Chat**: Bubble colors, styles, spacing, avatars, fonts
-   **Q&A**: Question/answer colors, separators, numbering, prefixes
-   **Document**: Title/body colors, fonts, line height, spacing

#### General Settings

-   Background and text colors
-   Page size (A4, Letter, Legal)
-   Margins and spacing
-   Header and footer options
-   Font family and size
-   Media inclusion options

#### Preset Management

-   **Save Preset**: Store current settings for reuse
-   **Load Preset**: Apply saved settings instantly
-   **Edit/Delete**: Manage your presets
-   **Duplicate**: Create variations

---

### Saving & Managing

#### Save Chat

Store a chat conversation locally with current settings:

1. Click **"Save Chat"** in the preview toolbar
2. Enter a descriptive name
3. Access anytime from **Saved Chats Management** panel in sidebar
4. Load to edit and re-export with different settings

#### Backup & Restore

**Export Chat (Backup)**:

-   Export individual chat as JSON file
-   Includes all messages, metadata, and settings
-   Shareable and portable across devices
-   Click "Export Chat" button in preview toolbar

**Import Chat (Restore)**:

-   Import previously exported JSON files
-   Automatically validates and loads chat data
-   Preserves all message content and metadata
-   Access via sidebar "Import Chat" option

**Bulk Export**:

-   Export multiple saved chats at once
-   Select chats from list and download as ZIP
-   Perfect for backing up all conversations
-   Includes metadata and timestamps

#### Save Preset

Store styling settings for quick reuse:

1. Customize layout, colors, fonts, and spacing
2. Click **"Save Preset"**
3. Name your preset (e.g., "Professional Report", "Colorful Chat")
4. Load instantly from Preset Management panel
5. Use **Save As** to create variations

#### Merge Chats

Combine multiple saved chats into one conversation:

1. Select chats to merge from Saved Chats panel
2. Choose merge order
3. Creates new unified chat
4. Useful for combining related conversations

#### Management Panels

**Saved Chats Management** (Sidebar):

-   View all locally saved chats
-   Load, edit, delete, duplicate, or export
-   Filter by source platform (ChatGPT, Claude, etc.)
-   Sort by date or name
-   Quick preview of message count

**Preset Management** (Sidebar):

-   Browse all saved styling presets
-   Load, edit, delete, or duplicate
-   Preview preset details
-   Quick apply to current chat

---

## Architecture

### Data Flow

```
Chat Export → Extract Data → Load in Options Page
→ Initialize State → User Actions (Edit/Select/Reorder)
→ Update Preview → Save/Export → Persist to DB or Generate PDF
```

### Component Hierarchy

```
App.tsx (Main)
├── Header (Logo, Theme, Social Links)
├── Sidebar (Saved Chats, Presets)
├── PreviewContainer
│   ├── PreviewToolbar (Save/Export Buttons)
│   └── Layout Preview (Chat/QA/Document)
└── SettingsPanel
    ├── MessageManagement (Edit/Reorder/Select)
    ├── LayoutSelector
    ├── ChatSettings
    ├── QASettings
    ├── DocumentSettings
    └── GeneralSettings
```

---

## Tech Stack

### Frontend

-   React 19.1
-   TypeScript 5.9
-   Vite (build tool)

### UI & Styling

-   Shadcn/ui (components)
-   Tailwind CSS 4 (styling)
-   Radix UI (primitives)
-   Lucide React (icons)

### Database & State

-   Dexie 4 (IndexedDB)
-   dexie-react-hooks
-   Chrome Storage API

### Interactive Features

-   @dnd-kit (drag-and-drop)
-   ContentEditable API (text editing)

### Chrome Extension

-   WXT 0.20 (framework)
-   Manifest V3 (standard)

---

## Project Structure

```
C2Pdf_wxt/
├── entrypoints/
│   ├── background.ts              # Service worker
│   ├── content.ts                 # Content script (chat pages)
│   └── options/                   # Main extension UI
│       ├── App.tsx                # Main component
│       ├── Header.tsx             # Navigation bar
│       ├── MessageManagement.tsx  # Message list/edit
│       ├── Editor.tsx             # Rich text editor
│       ├── SettingsPanel.tsx      # Settings container
│       ├── ChatSettings.tsx       # Chat settings
│       ├── QASettings.tsx         # Q&A settings
│       ├── DocumentSettings.tsx   # Document settings
│       ├── GeneralSettings.tsx    # General settings
│       ├── PreviewContainer.tsx   # PDF preview
│       ├── ChatLayout.tsx         # Chat layout
│       ├── QALayout.tsx           # Q&A layout
│       ├── DocumentLayout.tsx     # Document layout
│       ├── SaveChatDialog.tsx     # Save chat modal
│       ├── SavePresetDialog.tsx   # Save preset modal
│       ├── MergeChatsDialog.tsx   # Merge chats modal
│       └── types.ts               # TypeScript types
│
├── components/                    # Reusable components
│   ├── Button.tsx
│   ├── ThemeToggle.tsx
│   ├── FeedbackModal.tsx
│   └── ui/                        # Shadcn/ui components
│
├── hooks/
│   └── use-mobile.ts
│
├── lib/
│   ├── settingsDB.ts              # Database operations
│   ├── useTheme.ts                # Theme hook
│   └── utils.ts                   # Utilities
│
├── assets/
│   └── tailwind.css
│
├── public/                        # Static assets
│   ├── icon/
│   ├── chat/
│   └── side/
│
├── wxt.config.ts                  # WXT config
├── tsconfig.json                  # TS config
├── tailwind.config.js             # Tailwind config
└── package.json                   # Dependencies
```

---

## Development

### Prerequisites

-   Node.js 16+
-   npm 7+
-   Chrome browser

### Setup

```bash
git clone https://github.com/kanhaiyadav/Chat2Pdf.git
cd Ai-Chat-Editor-Exporter
npm install
npm run dev
```

Then load `.output/chrome-mv3` in Chrome.

### Development Workflow

1. Make code changes
2. Vite handles compilation with HMR
3. Reload extension in Chrome
4. Changes reflect in preview

### Building

```bash
# Production build
npm run build

# Create zip for distribution
npm run zip

# Firefox build
npm run build:firefox
```

### Code Quality

```bash
# Type checking
npm run compile
```

---

## Build & Distribution

### Build Process

```bash
npm run build              # Chrome MV3
npm run build:firefox      # Firefox
npm run zip                # Create distribution zip
```

### Output

```
.output/
├── chrome-mv3/            # Chrome extension
└── firefox-mv2/           # Firefox extension
```

### Publishing

**Chrome Web Store**:

1. Zip the `chrome-mv3` directory
2. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
3. Submit for review

**Firefox Add-ons**:

1. Zip the `firefox-mv2` directory
2. Upload to [Firefox Developer Hub](https://addons.mozilla.org/)
3. Submit for review

---

## Contributing

We welcome contributions!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

-   Use TypeScript for type safety
-   Follow React hooks best practices
-   Use Shadcn/ui components
-   Keep components focused
-   Test your changes

---

## Support

### Getting Help

-   **GitHub Issues**: [Report bugs or request features](https://github.com/kanhaiyadav/Chat2Pdf/issues)
-   **Feedback Form**: Use the feedback button in the extension
-   **Buy Me Coffee**: Support development
-   **Star the repo**: Show your support!

### Troubleshooting

**Export button not appearing**:

-   Ensure chat page is fully loaded
-   Verify you're on a supported platform (ChatGPT, Claude, Gemini, or DeepSeek)
-   Check browser console for errors (F12)
-   Refresh the page and wait a few seconds

**Messages not loading**:

-   Reload the extension: `chrome://extensions` → reload Chat2Pdf
-   Verify chat has messages
-   Refresh the chat page
-   Check if content script is running (console should show initialization logs)

**PDF export issues**:

-   Verify at least one message is selected
-   Check all settings are valid (colors, fonts, etc.)
-   Try different layouts (Chat, Q&A, Document)
-   Clear browser cache and try again
-   Disable other extensions temporarily to test for conflicts

**Settings not saving**:

-   Check browser storage quota: `chrome://settings/content/all`
-   Verify IndexedDB is enabled
-   Try clearing extension data and re-saving
-   Check for browser privacy settings that might block storage

**Drag-and-drop not working**:

-   Ensure message list is not scrolling during drag
-   Try refreshing the extension
-   Check if messages are properly loaded
-   Clear cache and reload

**Import failing**:

-   Verify JSON file is valid (not corrupted)
-   Check file was exported from Chat2Pdf
-   Try importing a smaller file first
-   Check browser console for specific errors

**Claude Artifacts not showing**:

-   Ensure Artifact is fully loaded before clicking "Export Chat"
-   Look for "Include in Export" button on Artifact
-   Refresh page if Artifact doesn't appear
-   Check console for extraction errors

---

## FAQ

**Q: Is my chat data secure?**
A: Yes! All data is stored locally in your browser. Nothing is sent to external servers. Your conversations never leave your device.

**Q: Does this work with all AI chat platforms?**
A: Currently supports ChatGPT, Claude, Gemini, and DeepSeek. We're actively monitoring new platforms and community requests for future additions.

**Q: Can I export chats from one platform and import them on another?**
A: Yes! The backup/export feature creates JSON files that can be imported regardless of the original source platform.

**Q: How do I backup my chats?**
A: Use the "Export Chat" button to create JSON backups. For multiple chats, use "Bulk Export" to download all as a ZIP file.

**Q: Can I edit exported PDFs?**
A: PDFs are final documents. Edit content before exporting using the Rich Text Editor in Message Management.

**Q: How do I merge multiple chats?**
A: Save the chats you want to merge, then use the "Merge Chats" feature in the Saved Chats Management panel.

**Q: What if I clear browser data?**
A: Saved chats stored in IndexedDB will be lost. Regularly export important chats as JSON backups.

**Q: How do Claude Artifacts work?**
A: Artifacts are automatically extracted with "Include in Export" buttons. You can selectively include/exclude them before export.

**Q: Can I share my exported chats?**
A: Yes! Export as JSON and share the file. Recipients can import it using the "Import Chat" feature.

**Q: How do I report bugs?**
A: Open an issue on [GitHub](https://github.com/kanhaiyadav/Chat2Pdf/issues) with details and screenshots.

**Q: Can I contribute?**
A: Absolutely! See the Contributing section. We welcome code, documentation, and feature suggestions.

---

## Version

-   **v2.0.0** (Current): Multi-platform support release
    -   ✅ Added Claude support with Artifacts extraction
    -   ✅ Added Gemini support with Monaco editor extraction
    -   ✅ Added DeepSeek support with HTML code block rendering
    -   ✅ Backup/Restore: Export/Import chats as JSON
    -   ✅ Bulk Export: Download multiple chats as ZIP
    -   ✅ Enhanced drag-and-drop with hash-based tracking
    -   ✅ Improved message editor with better formatting
    -   ✅ Fixed reordering bugs and state management
    -   ✅ Removed FeedbackModal, added direct review link
    -   ✅ Enhanced UI/UX across all panels

---

## Connect

-   **GitHub**: [@kanhaiyadav](https://github.com/kanhaiyadav)
-   **Project**: [Ai-Chat-Editor-Exporter](https://github.com/kanhaiyadav/Chat2Pdf)
-   **Issues**: [Report bugs](https://github.com/kanhaiyadav/Chat2Pdf/issues)

---

**Made with ❤️ by the Chat2Pdf team**
