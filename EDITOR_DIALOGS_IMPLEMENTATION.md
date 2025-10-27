# Editor Dialogs Implementation - Chat2PDF

## Overview
The `Editor.tsx` component has been completely refactored to replace browser's default `alert()` and `prompt()` dialogs with beautiful, feature-rich shadcn/ui dialogs. This provides a professional, consistent UI experience with comprehensive customization options for each element type.

---

## 🎨 New Dialog Components

### 1. **ImageDialog** - Image Insertion
Replaces native prompts with a beautiful image insertion dialog.

#### Features:
- **Dual Source Options:**
  - Upload from device (with FileReader API for base64 encoding)
  - Insert via URL
- **Size Customization:**
  - Custom width (in pixels)
  - Height (auto-calculated aspect ratio, or manually set)
  - Both optional for responsive images
- **UI Components Used:**
  - Radio buttons for source selection
  - Color picker and text inputs for URL
  - Number inputs for dimensions
  - Separator for visual organization

#### Code Structure:
```tsx
ImageDialog {
  State:
  - imageSource: 'upload' | 'url'
  - imageUrl: string
  - width: string
  - height: string | 'auto'
  - fileInputRef: React.Ref<HTMLInputElement>
  
  Methods:
  - handleFileSelect(): Reads file as base64
  - insertImage(): Generates <img> HTML with inline styles
  - handleInsertUrl(): Validates and inserts URL-based image
  - resetForm(): Clears all form state
}
```

---

### 2. **TableDialog** - Table Creation
Replaces simple row/col prompts with a comprehensive table builder.

#### Features:
- **Table Structure:**
  - Configurable rows and columns
  - Optional table header with styling
  - Border styling (1px solid #d1d5db)
- **Color Customization:**
  - Header background color (color picker + hex input)
  - Body background color
  - Alternate row colors for better readability
- **Color Picker UI:**
  - HTML5 color input + hex code text field (synced)
  - Live color preview
  - Checkbox to toggle alternate rows
- **Generated HTML:**
  - Full styled table with inline CSS
  - Proper semantic HTML (`<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`)
  - Print-friendly styling

#### Code Structure:
```tsx
TableDialog {
  State:
  - rows: string
  - cols: string
  - hasHeader: boolean
  - headerBgColor: string (hex)
  - bodyBgColor: string (hex)
  - alternateRows: boolean
  - alternateBgColor: string (hex)
  
  Methods:
  - insertTable(): Generates complete <table> HTML with styling
  - resetForm(): Resets all color and dimension settings
}
```

#### Generated HTML Example:
```html
<table class="prose" style="width: 100%; border-collapse: collapse; margin: 8px 0;">
  <thead>
    <tr style="background-color: #e5e7eb;">
      <th style="border: 1px solid #d1d5db; padding: 8px; font-weight: bold;">Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #ffffff;">
      <td style="border: 1px solid #d1d5db; padding: 8px;">Cell 1,1</td>
      <td>Cell 1,2</td>
    </tr>
    <tr style="background-color: #f9fafb;">
      <td style="border: 1px solid #d1d5db; padding: 8px;">Cell 2,1</td>
      <td>Cell 2,2</td>
    </tr>
  </tbody>
</table>
```

---

### 3. **CodeBlockDialog** - Code Block Insertion
Professional code block dialog with syntax highlighting options.

#### Features:
- **Language Support:**
  - Dropdown/text field for language selection
  - Examples: javascript, python, java, typescript, css, html, sql
  - User-defined custom languages
- **Styling Options:**
  - Font size slider (10-24px)
  - Background color customization
  - Text color customization
  - Both use color picker + hex input
- **Display Options:**
  - Toggle language label display (shows above code)
  - Language label styling (dark background, smaller text)
- **Live Preview:**
  - Real-time preview showing:
    - Language label (if enabled)
    - Code block with selected colors and font size

#### Code Structure:
```tsx
CodeBlockDialog {
  State:
  - language: string
  - fontSize: string (10-24)
  - bgColor: string (hex, default: #1e293b - dark slate)
  - textColor: string (hex, default: #f1f5f9 - light blue-gray)
  - showLanguageLabel: boolean
  
  Methods:
  - insertCodeBlock(): Generates <pre><code> with styling
  - resetForm(): Resets to defaults
}
```

#### Generated HTML Example:
```html
<div style="margin: 8px 0; border-radius: 4px; overflow: hidden;">
  <div style="background-color: #0f172a; color: #94a3b8; padding: 4px 8px; font-size: 12px; border-radius: 4px 4px 0 0; font-weight: bold;">javascript</div>
  <pre class="prose" style="background-color: #1e293b; color: #f1f5f9; padding: 12px; margin: 0; font-size: 14px; overflow-x: auto;">
    <code class="language-javascript">// javascript code here</code>
  </pre>
</div>
```

#### Default Color Scheme:
- **Dark Mode:** Background #1e293b, Text #f1f5f9 (perfect for code)
- **Label:** Background #0f172a, Text #94a3b8 (subdued label)

---

### 4. **LinkDialog** - Link Creation
Beautiful link insertion dialog with styling customization.

#### Features:
- **Required Fields:**
  - URL (required, validated)
- **Optional Fields:**
  - Display text (uses URL if empty)
- **Link Styling:**
  - Link color (default: #0066cc - standard blue)
  - Active/hover color (default: #003399 - darker blue)
  - Underline toggle
- **Live Preview:**
  - Real-time preview showing:
    - Actual link with selected color
    - Underline on/off
    - Display text or URL
- **Accessibility:**
  - Required field marked with red asterisk
  - Color inputs synced with hex text fields

#### Code Structure:
```tsx
LinkDialog {
  State:
  - url: string
  - displayText: string
  - linkColor: string (hex)
  - activeLinkColor: string (hex, for hover/active states)
  - underline: boolean
  
  Methods:
  - insertLink(): Generates <a> tag with inline styles
  - resetForm(): Clears all fields and resets colors
}
```

#### Generated HTML Example:
```html
<a href="https://example.com" 
   style="color: #0066cc; text-decoration: underline;" 
   data-active-color="#003399">
  Click here
</a>
```

---

## 🔧 Implementation Details

### Dialog State Management (in ChatEditor)
```tsx
const [imageDialogOpen, setImageDialogOpen] = useState(false);
const [tableDialogOpen, setTableDialogOpen] = useState(false);
const [codeBlockDialogOpen, setCodeBlockDialogOpen] = useState(false);
const [linkDialogOpen, setLinkDialogOpen] = useState(false);
```

### Toolbar Integration
Each toolbar button now opens the corresponding dialog:

```tsx
{/* Image Button */}
<Button 
  onClick={() => setImageDialogOpen(true)} 
  title="Insert Image"
>
  <ImageIcon size={16} />
</Button>

{/* Table Button */}
<Button 
  onClick={() => setTableDialogOpen(true)} 
  title="Insert Table"
>
  <Settings2 size={16} />
</Button>

{/* Code Button */}
<Button 
  onClick={() => setCodeBlockDialogOpen(true)} 
  title="Code Block"
>
  <Code size={16} />
</Button>

{/* Link Button */}
<Button 
  onClick={() => setLinkDialogOpen(true)} 
  title="Insert Link"
>
  <LinkIcon size={16} />
</Button>
```

---

## 📦 UI Components Used

### From shadcn/ui:
- `Dialog` - Modal container
- `DialogContent` - Dialog body
- `DialogHeader` - Header section
- `DialogTitle` - Title
- `DialogFooter` - Action buttons
- `Button` - Action buttons
- `Input` - Text inputs (text, number, color, email)
- `Label` - Form labels
- `Checkbox` - Boolean toggles
- `Separator` - Visual dividers

### Icons (from lucide-react):
- `Palette` - For color pickers
- `Settings2` - For table button
- `Link as LinkIcon` - For link button
- Plus all existing icons (Bold, Italic, etc.)

---

## 🎯 Key Features

### 1. **Consistent UI Design**
- All dialogs use the same color scheme
- Unified spacing and typography
- shadcn/ui components ensure consistency

### 2. **Color Pickers**
Every dialog with colors includes:
- HTML5 `<input type="color">` for visual selection
- Hex text field for precise values
- Both inputs synchronized (changes in one update the other)

### 3. **Form Validation**
- Links: URL required
- Tables: Positive integers for rows/cols
- Images: URL required for URL mode
- Code blocks: Any language string accepted

### 4. **Reset on Close**
All dialogs reset their state when closed, ensuring:
- No data leakage between insertions
- Fresh defaults for next insertion
- Clean user experience

### 5. **Live Previews**
Dialogs with styling options include:
- CodeBlockDialog: Live code block preview
- LinkDialog: Live link preview
- Table dialog: Visual feedback through color pickers

---

## 🚀 Usage Flow

### Image Insertion:
1. Click image icon → ImageDialog opens
2. Choose upload or URL source
3. (Upload): Click "Choose Image", select file → auto base64 encoded
4. (URL): Enter image URL
5. Optional: Set custom width/height
6. Click "Insert Image" → HTML inserted into editor

### Table Creation:
1. Click table icon → TableDialog opens
2. Set rows and columns
3. Toggle header (optional)
4. Customize colors using color pickers
5. Toggle alternate rows (optional)
6. Click "Insert Table" → Styled table inserted

### Code Block:
1. Click code icon → CodeBlockDialog opens
2. Enter language (javascript, python, etc.)
3. Adjust font size (10-24px)
4. Customize colors
5. Toggle language label
6. See live preview
7. Click "Insert Code Block" → Formatted code block inserted

### Link Creation:
1. Click link icon → LinkDialog opens
2. Enter URL (required)
3. Optional: Enter custom display text
4. Customize colors and underline
5. See live preview
6. Click "Insert Link" → Styled link inserted

---

## 🔄 HTML Output

All generated HTML:
- Uses `class="prose"` for CSS inheritance
- Includes inline styles for precise control
- Is sanitized and safe to insert
- Maintains semantic HTML structure
- Compatible with PDF export

---

## 💡 Benefits Over Previous Implementation

| Feature | Before | After |
|---------|--------|-------|
| Image Insertion | `prompt()` for URL only | Dialog with upload or URL, size control |
| Tables | Two `prompt()` calls for rows/cols | Full customization: colors, headers, alternates |
| Code Blocks | `prompt()` for language | Dialog with fonts, colors, language label toggle |
| Links | `prompt()` + `execCommand` | Full dialog with color, underline, preview |
| UX | Native browser dialogs | Professional, branded UI |
| Validation | Minimal | Comprehensive error checking |
| Customization | None | Extensive options |

---

## 🎨 Default Colors & Styles

### Images:
- Max-width: 100%
- Height: Auto (unless specified)
- Margin: 8px 0
- Border-radius: 4px

### Tables:
- Header BG: #e5e7eb (light gray)
- Body BG: #ffffff (white)
- Alternate BG: #f9fafb (very light gray)
- Border: 1px solid #d1d5db

### Code Blocks:
- Background: #1e293b (dark slate)
- Text: #f1f5f9 (light blue-gray)
- Font-size: 14px (default)
- Label BG: #0f172a (darker slate)
- Label Text: #94a3b8 (gray)

### Links:
- Default: #0066cc (standard blue)
- Active: #003399 (darker blue)
- Underline: true (by default)

---

## 📝 Future Enhancements

Possible additions:
- Link target option (_blank, _self, etc.)
- Table column width customization
- Code block line numbering
- Image alt text editor
- More language suggestions for code blocks
- Preset color schemes for quick selection

