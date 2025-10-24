# Chat Backup & Import Feature Implementation

## Overview

This document summarizes the implementation of comprehensive backup and import features for the Chat2Pdf extension.

## Features Implemented

### 1. **Export Single Chat (Individual Backup)**

-   **Location**: Preview Toolbar + Sidebar Chat Dropdown Menu
-   **Button Location**: "Export Chat" button in the toolbar (visible when a chat is loaded)
-   **Dropdown Location**: Right-click menu on any saved chat in the sidebar

**Functionality:**

-   Allows users to export a single chat conversation
-   Supports two export formats:
    -   JSON (.json) - Standard JSON format
    -   JSON-LD (.jsonld) - Linked Data format for semantic web compatibility
-   Downloaded file includes:
    -   Version information
    -   Export timestamp
    -   Chat source (chatgpt, claude, etc.)
    -   Chat title and name
    -   All messages with metadata
    -   Message count

**Files:**

-   New: `ExportChatDialog.tsx` - Dialog UI for selecting export format
-   Modified: `PreviewToolbar.tsx` - Added `onExportChat` prop and button
-   Modified: `PreviewContainer.tsx` - Added `onExportChat` prop passthrough

### 2. **Bulk Export (Complete Backup)**

-   **Location**: Left Sidebar Footer - "Backup Chats" button
-   **Dialog Type**: Large modal with two-section layout (similar to Merge Chats dialog)

**Functionality:**

-   Export multiple or all chats in a single operation
-   Two-section layout:
    -   **Left Section**: Search and filter chats, select multiple chats
    -   **Right Section**: Preview of selected chats with message counts
-   Bulk file includes:
    -   Version: 1
    -   Export type: "bulk"
    -   Chat count
    -   Array of all selected chats with their data
-   Downloads as single JSON file named: `chats-backup-{timestamp}.json`

**Features:**

-   Search functionality to find chats by title or name
-   "Select All" checkbox to quickly select all filtered chats
-   Count display shows how many chats are selected
-   Info box displays collection metadata
-   Disabled export button when no chats selected

**Files:**

-   New: `BulkExportChatsDialog.tsx` - Dialog for bulk export with chat selection

### 3. **Import Chat (Restore Backup)**

-   **Location**: Left Sidebar Footer - "Import Chats" button
-   **Dialog Type**: Modal with multi-step workflow

**Functionality:**

-   Import previously exported chat backups
-   Automatic file format detection (JSON or JSON-LD)
-   Multi-step import process:
    1. **Initial Step**: Drag-and-drop or file picker
    2. **Preview Step**: Review chats to be imported
    3. **Importing Step**: Progress indication
    4. **Success/Error Step**: Confirmation or error details

**Features:**

-   **Drag and Drop**: Large drop zone with visual feedback
-   **File Picker**: Alternative file selection method
-   **File Validation**: Checks for proper JSON format
-   **Data Validation**: Ensures exported data structure is valid
-   **Duplicate Handling**: Automatically renames chats if name already exists (adds counter)
-   **Error Handling**: Detailed error messages for various failure scenarios
-   **Progress Indication**: Shows importing status
-   **Auto-Success**: Closes after 2 seconds on successful import
-   **Supported Formats**:
    -   Single chat exports
    -   Bulk exports with multiple chats

**Files:**

-   New: `ImportChatDialog.tsx` - Multi-step import dialog

### 4. **Integration Updates**

#### App.tsx Changes

-   Added imports for all new dialog components
-   Added state variables:
    -   `showExportChatDialog`: Controls export dialog visibility
    -   `exportingChat`: Stores the chat being exported
    -   `showBulkExportDialog`: Controls bulk export dialog visibility
    -   `showImportDialog`: Controls import dialog visibility
-   Added callbacks to pass through the component tree
-   Added all three new dialogs to render section

#### PreviewToolbar.tsx Changes

-   Added `onExportChat` optional prop
-   Added "Export Chat" button visible when chat is loaded
-   Button appears with Download icon
-   Positioned after "Merge Chats" button

#### PreviewContainer.tsx Changes

-   Added `onExportChat` optional prop to component interface
-   Passes prop to PreviewToolbar component

#### LeftSidebar.tsx Changes

-   Added new props: `onExportChat`, `onOpenBulkExport`, `onOpenImport`
-   Added dropdown menu to chat items in footer
-   Added "Backup Chats" button - opens bulk export dialog
-   Added "Import Chats" button - opens import dialog
-   Added export option to chat context menu in dropdown

#### AppSidebar.tsx Changes

-   Added new props to interface: `onExportChat`, `onOpenBulkExport`, `onOpenImport`
-   Updated function signature to include new props
-   Added backup/import section in footer with two buttons:
    -   "Backup Chats" - triggers bulk export
    -   "Import Chats" - triggers import
-   Added necessary icon imports: `FiDownload`, `FiUpload`
-   Passes `onExportChat` to NavChats component

#### NavChats.tsx Changes

-   Added `onExportChat` optional prop to component
-   Added Download icon import
-   Added "Export Chat" option to dropdown menu for each chat
-   Properly handles click propagation in dropdown items

## File Structure

### New Files Created

```
entrypoints/options/
├── ExportChatDialog.tsx        (Single chat export UI)
├── BulkExportChatsDialog.tsx   (Bulk export with selection UI)
└── ImportChatDialog.tsx         (Import with multi-step workflow)
```

### Modified Files

```
entrypoints/options/
├── App.tsx                      (Added dialog states and integration)
├── PreviewToolbar.tsx           (Added export chat button)
├── PreviewContainer.tsx         (Added prop passthrough)
├── app-sidebar.tsx              (Added footer buttons)
├── nav-chats.tsx                (Added dropdown export option)
└── LeftSidebar.tsx             (Updated with new callbacks)

lib/
└── settingsDB.ts                (No changes - uses existing operations)
```

## Data Format

### Single Chat Export Format

```json
{
  "version": 1,
  "exportDate": "2025-10-23T...",
  "source": "chatgpt",
  "chatName": "Chat Name",
  "chatTitle": "Chat Title",
  "messageCount": 15,
  "messages": [
    {
      "role": "user",
      "content": "...",
      "images": [...],
      "attachments": [...]
    },
    ...
  ]
}
```

### Bulk Export Format

```json
{
  "version": 1,
  "exportDate": "2025-10-23T...",
  "exportType": "bulk",
  "chatCount": 3,
  "chats": [
    {
      "id": 1,
      "name": "Chat 1",
      "title": "Chat 1 Title",
      "messages": [...],
      "source": "chatgpt",
      "settings": {...},
      "createdAt": "2025-10-23T...",
      "updatedAt": "2025-10-23T..."
    },
    ...
  ]
}
```

## UI/UX Considerations

### Consistency

-   All dialogs use Shadcn/ui components
-   Icons from lucide-react for consistency
-   Dark/Light theme support maintained
-   Responsive design for all new components

### User Feedback

-   Info boxes explain what will happen
-   Clear button labels and tooltips
-   Progress indicators during import
-   Success/error messages with details
-   Visual feedback for drag-and-drop

### Error Handling

-   Comprehensive error messages
-   Graceful fallbacks
-   Validation of file format and content
-   Duplicate name handling with automatic renaming

## Browser Compatibility

-   Uses Chrome Extension APIs (chrome.storage)
-   Fetch and File APIs for file operations
-   IndexedDB (Dexie) for database operations

## Security Considerations

-   All data processed locally (no external API calls)
-   File validation before processing
-   User consent required for import
-   No sensitive data stored in export metadata

## Future Enhancements

-   Cloud sync/backup options
-   Scheduled automatic backups
-   Backup versioning and history
-   Selective restore (choose which chats to import)
-   Backup encryption option
-   Import merge options (combine with existing chats)
-   Backup file compression

## Testing Checklist

-   [ ] Export single chat in JSON format
-   [ ] Export single chat in JSON-LD format
-   [ ] Verify export file structure and integrity
-   [ ] Export bulk with single chat
-   [ ] Export bulk with multiple chats
-   [ ] Verify bulk export file structure
-   [ ] Import single chat export
-   [ ] Import bulk export with multiple chats
-   [ ] Test duplicate chat name handling
-   [ ] Test drag-and-drop file upload
-   [ ] Test file picker upload
-   [ ] Test invalid file format error handling
-   [ ] Test successful import and chat loading
-   [ ] Verify dark/light theme consistency
-   [ ] Test on different screen sizes
-   [ ] Test with large chat files
-   [ ] Verify all UI elements visible in collapsed sidebar
