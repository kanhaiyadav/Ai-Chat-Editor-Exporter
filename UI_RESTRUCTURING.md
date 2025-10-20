# UI Restructuring - Chat Operations & Zoom Controls

## Overview

This document describes the major UI restructuring that separates chat operations from PDF settings, adds zoom controls, and introduces a sidebar for saved chats management.

## Changes Made

### 1. New Components Created

#### PreviewToolbar.tsx

-   **Location**: `entrypoints/options/PreviewToolbar.tsx`
-   **Purpose**: Toolbar for the preview section with chat operations and zoom controls
-   **Features**:
    -   Left side: Export PDF, Save Chat, Save As Chat buttons
    -   Right side: Zoom controls (Zoom %, Zoom Out, Reset 1:1, Zoom In)
    -   Zoom range: 0.5x to 2x
    -   Clean, icon-based design with Tailwind CSS

#### LeftSidebar.tsx

-   **Location**: `entrypoints/options/LeftSidebar.tsx`
-   **Purpose**: Toggleable left sidebar for managing saved chats
-   **Features**:
    -   Overlay backdrop when open
    -   Slide-in animation from left
    -   Lists all saved chats with metadata (title, preset, messages count, last updated)
    -   Actions: Load, Edit, Duplicate, Delete
    -   Uses `useLiveQuery` for automatic refresh
    -   Close on overlay click or X button

#### SavePresetDialog.tsx

-   **Location**: `entrypoints/options/SavePresetDialog.tsx`
-   **Purpose**: Dialog for saving/updating PDF settings presets
-   **Features**:
    -   Two modes: "Update Preset" (save) and "Save As New Preset" (saveAs)
    -   Auto-fills current preset name in update mode
    -   Suggests "PresetName (Copy)" in saveAs mode
    -   Validates preset name uniqueness
    -   Uses `useLiveQuery` to check existing presets

### 2. Modified Components

#### App.tsx

**Added State**:

-   `showSavePresetDialog` - Controls preset dialog visibility
-   `savePresetMode` - Tracks 'save' vs 'saveAs' mode for presets
-   `currentPresetId` - Tracks the currently loaded preset ID
-   `sidebarOpen` - Controls left sidebar visibility
-   `zoom` - Tracks current zoom level (0.5 to 2.0, default 1.0)

**New Handlers**:

-   `handleLoadPreset(settings, presetId)` - Updated to accept preset ID
-   `handleSavePreset()` - Opens preset dialog in appropriate mode
-   `handleSaveAsPreset()` - Opens preset dialog in saveAs mode
-   `handleToggleSidebar()` - Toggles sidebar visibility
-   `handleZoomIn()` - Increases zoom (max 2.0)
-   `handleZoomOut()` - Decreases zoom (min 0.5)
-   `handleResetZoom()` - Resets zoom to 1.0
-   `handleGeneratePDF()` - Triggers window.print()

**Updated Component Props**:

-   `Header`: Added `onToggleSidebar` prop
-   `PreviewContainer`: Added `currentChatId`, `zoom`, and 6 handler props
-   `SettingsPanel`: Removed chat-related props, added `currentPresetId`, `onSavePreset`, `onSaveAsPreset`
-   Added `LeftSidebar` component to render tree
-   Added `SavePresetDialog` component to render tree

#### Header.tsx

**Added**:

-   Menu button (toggles sidebar)
-   `onToggleSidebar` prop

#### PreviewContainer.tsx

**Added**:

-   `PreviewToolbar` component at top
-   Zoom transform wrapper with CSS scale
-   Props: `currentChatId`, `zoom`, 6 handler functions

#### SettingsPanel.tsx

**Removed**:

-   `SavedChatsManagement` component
-   `chatTitle`, `currentChatId` props
-   `onGeneratePDF`, `onSaveChat`, `onSaveAsChat`, `onLoadChat` props
-   Export PDF and Save Chat buttons

**Added**:

-   `currentPresetId` prop
-   `onSavePreset`, `onSaveAsPreset` props
-   Preset Save/Save As buttons in button bar

#### PresetManagement.tsx

**Updated**:

-   `handleLoadPreset` now calls `onLoadPreset(preset.settings, preset.id!)`
-   Interface updated to match new signature

### 3. User Experience Improvements

#### Separation of Concerns

-   **Settings Panel**: Now focuses exclusively on PDF settings configuration
-   **Preview Toolbar**: Contains all chat-related operations (export, save, save as)
-   **Left Sidebar**: Dedicated space for saved chats management

#### Zoom Controls

-   Range: 0.5x (50%) to 2.0x (200%)
-   Step size: 0.1 (10%)
-   Visual feedback: Displays current zoom percentage
-   Quick reset to 100% with 1:1 button
-   Applied via CSS transform for smooth scaling

#### Sidebar Navigation

-   Toggleable with Menu button in header
-   Overlay darkens main content when open
-   Click overlay or X button to close
-   Automatically closes after loading a chat
-   Smooth slide-in/out animation

#### Save/Save As Pattern

**For Chats**:

-   Save: Updates existing chat (when `currentChatId` is set)
-   Save As: Creates new chat (always available)

**For Presets**:

-   Save: Updates existing preset (when `currentPresetId` is set)
-   Save As: Creates new preset (always available)

### 4. Technical Implementation

#### Live Data Updates

All data components use `useLiveQuery` from `dexie-react-hooks`:

-   `PresetManagement` - Auto-refreshes when presets change
-   `LeftSidebar` - Auto-refreshes when chats change
-   `SaveChatDialog` - Auto-refreshes preset dropdown
-   `SavePresetDialog` - Auto-refreshes for name validation

#### State Tracking

-   `currentChatId` - Tracks loaded chat for Save vs Save As
-   `currentPresetId` - Tracks loaded preset for Save vs Save As
-   Both set to `null` when creating new content
-   Updated when loading from database

#### Zoom Implementation

```tsx
<div
    style={{
        transform: `scale(${zoom})`,
        transformOrigin: "top center",
        transition: "transform 0.2s ease-in-out",
    }}
>
    {/* Preview content */}
</div>
```

## File Structure

```
entrypoints/options/
├── App.tsx                    (Modified - main orchestration)
├── Header.tsx                 (Modified - added sidebar toggle)
├── PreviewContainer.tsx       (Modified - added toolbar & zoom)
├── PreviewToolbar.tsx         (NEW - chat operations & zoom)
├── LeftSidebar.tsx           (NEW - saved chats management)
├── SettingsPanel.tsx         (Modified - settings only)
├── PresetManagement.tsx      (Modified - updated load signature)
├── SavePresetDialog.tsx      (NEW - preset save/save as)
├── SaveChatDialog.tsx        (Existing - chat save/save as)
└── SavedChatsManagement.tsx  (Existing - moved to sidebar)
```

## Benefits

1. **Better Organization**: Clear separation between settings and operations
2. **Improved UX**: Dedicated spaces for different tasks
3. **Zoom Functionality**: Better preview control for different screen sizes
4. **Consistent Patterns**: Save/Save As works the same for chats and presets
5. **Live Updates**: `useLiveQuery` ensures UI stays in sync with database
6. **Clean UI**: Less clutter in settings panel, more focused interfaces

## Next Steps

-   Test all zoom controls in different scenarios
-   Test preset Save/Save As functionality
-   Verify sidebar interactions on different screen sizes
-   Ensure UI consistency across all components
