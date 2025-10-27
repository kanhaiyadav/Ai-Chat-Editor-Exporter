# Editor Customization Features Guide

## 🎨 Complete Editor Toolbar Customization System

This guide demonstrates all the beautiful, feature-rich dialogs now available in the Chat2PDF editor.

---

## 1. IMAGE INSERTION DIALOG

### Features
- **Dual Source Options**: Upload from device OR paste URL
- **Auto Base64 Encoding**: Files automatically converted to base64
- **Custom Sizing**: Optional width and height controls
- **Aspect Ratio**: Height automatically maintains image aspect ratio unless manually set

### How to Use
1. Click the **Image Icon** in toolbar
2. Choose: **Upload from Device** or **From URL**
3. **Upload**: Click "Choose Image" button → Select file from computer
4. **URL**: Enter full image URL (e.g., https://example.com/image.jpg)
5. *Optional*: Set custom width (in pixels)
6. *Optional*: Set custom height (in pixels, or leave empty for auto)
7. Click **Insert Image**

### Default Styling
```css
max-width: 100%;        /* Responsive width */
height: auto;           /* Maintains aspect ratio */
margin: 8px 0;          /* Spacing above/below */
border-radius: 4px;     /* Slightly rounded corners */
display: block;         /* Full-width block */
```

### Generated HTML
```html
<img src="data:image/png;base64,..." 
     alt="image" 
     style="max-width: 100%; width: 400px; height: auto; margin: 8px 0; border-radius: 4px; display: block;" />
```

---

## 2. TABLE CREATION DIALOG

### Features
- **Configurable Grid**: Set custom rows and columns
- **Optional Header**: Toggle table header on/off
- **Three-Color System**:
  - Header background color
  - Body background color
  - Alternate row color (for better readability)
- **Live Color Pickers**: Hex color input + visual color selector
- **Professional Styling**: Borders, padding, and proper spacing

### How to Use
1. Click the **Table Icon** (settings icon) in toolbar
2. Set **Rows** (number of rows you want)
3. Set **Columns** (number of columns you want)
4. Toggle **"Include Table Header"** (optional)
5. If header enabled:
   - Click header color picker to set header background
   - Use hex field to enter specific color (e.g., #e5e7eb)
6. Set **Body Background Color**
7. Toggle **"Alternate Row Colors"** for striped effect
8. If alternate colors enabled:
   - Set alternate row color (usually lighter shade)
9. Click **Insert Table**

### Color Scheme Defaults
| Element | Color | Use |
|---------|-------|-----|
| Header | #e5e7eb | Light gray background for header |
| Body | #ffffff | White for normal rows |
| Alternate | #f9fafb | Very light gray for every 2nd row |
| Border | #d1d5db | Gray borders between cells |

### Example Output
**3x3 table with header and alternate colors:**
```
┌─────────┬─────────┬─────────┐
│ Header1 │ Header2 │ Header3 │  (light gray bg)
├─────────┼─────────┼─────────┤
│ Cell 1,1│ Cell 1,2│ Cell 1,3│  (white bg)
├─────────┼─────────┼─────────┤
│ Cell 2,1│ Cell 2,2│ Cell 2,3│  (light gray bg)
├─────────┼─────────┼─────────┤
│ Cell 3,1│ Cell 3,2│ Cell 3,3│  (white bg)
└─────────┴─────────┴─────────┘
```

### Generated HTML
```html
<table class="prose" style="width: 100%; border-collapse: collapse; margin: 8px 0;">
  <thead>
    <tr style="background-color: #e5e7eb;">
      <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-weight: bold;">Header 1</th>
      <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-weight: bold;">Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #ffffff;">
      <td style="border: 1px solid #d1d5db; padding: 8px;">Cell content</td>
      <td style="border: 1px solid #d1d5db; padding: 8px;">Cell content</td>
    </tr>
    <tr style="background-color: #f9fafb;">
      <td style="border: 1px solid #d1d5db; padding: 8px;">Cell content</td>
      <td style="border: 1px solid #d1d5db; padding: 8px;">Cell content</td>
    </tr>
  </tbody>
</table>
```

---

## 3. CODE BLOCK DIALOG

### Features
- **Language Support**: Any language (javascript, python, java, css, html, sql, etc.)
- **Font Size Slider**: Adjust from 10px to 24px
- **Dual Color System**: Background color + text color
- **Language Label**: Optional label showing language above code
- **Live Preview**: See changes in real-time
- **Professional Syntax Coloring**: Pre-configured with dark theme

### How to Use
1. Click the **Code Icon** in toolbar
2. Enter **Language** (e.g., javascript, python, java)
   - Examples: typescript, css, html, bash, sql
3. Adjust **Font Size** slider (10-24px)
4. Set **Background Color**:
   - Click color picker or enter hex (default: #1e293b - dark slate)
5. Set **Text Color**:
   - Click color picker or enter hex (default: #f1f5f9 - light blue-gray)
6. Toggle **"Show Language Label"** (displays language name above code)
7. See **Live Preview** update
8. Click **Insert Code Block**

### Color Scheme Defaults
| Element | Color | RGB | Use |
|---------|-------|-----|-----|
| Background | #1e293b | rgb(30, 41, 59) | Dark slate background |
| Text | #f1f5f9 | rgb(241, 245, 249) | Light blue-gray text |
| Label BG | #0f172a | rgb(15, 23, 42) | Darker slate for label |
| Label Text | #94a3b8 | rgb(148, 163, 184) | Gray text in label |

### Recommended Configurations

**JavaScript (Light)**
```
Background: #f5f5f5 (light gray)
Text: #000000 (black)
Font: 14px
```

**Python (Dark)**
```
Background: #282c34 (dark gray)
Text: #abb2bf (light gray)
Font: 14px
```

**SQL (Ocean)**
```
Background: #0d1117 (nearly black)
Text: #79c0ff (bright blue)
Font: 13px
```

### Generated HTML
```html
<div style="margin: 8px 0; border-radius: 4px; overflow: hidden;">
  <div style="background-color: #0f172a; color: #94a3b8; padding: 4px 8px; font-size: 12px; border-radius: 4px 4px 0 0; font-weight: bold;">
    javascript
  </div>
  <pre class="prose" style="background-color: #1e293b; color: #f1f5f9; padding: 12px; margin: 0; font-size: 14px; overflow-x: auto;">
    <code class="language-javascript">// javascript code here</code>
  </pre>
</div>
```

---

## 4. LINK CREATION DIALOG

### Features
- **URL Input**: Required URL field with validation
- **Custom Display Text**: Optional (uses URL if empty)
- **Link Color Customization**: Default link color
- **Active/Hover Color**: Separate color for when link is hovered
- **Underline Toggle**: Option to underline link text
- **Live Preview**: See link with your selected styling

### How to Use
1. Click the **Link Icon** in toolbar
2. Enter **URL** (required) - e.g., https://example.com
3. Enter **Display Text** (optional)
   - If empty, the URL will be shown as link text
4. Set **Link Color**:
   - Click color picker or enter hex (default: #0066cc - standard blue)
5. Set **Active/Hover Color**:
   - Color shown when user hovers over link (default: #003399 - darker blue)
6. Toggle **"Underline Text"** on/off
7. See **Live Preview** with your styling
8. Click **Insert Link**

### Color Scheme Defaults
| Element | Color | Use |
|---------|-------|-----|
| Link | #0066cc | Standard web blue |
| Active/Hover | #003399 | Darker blue for interaction |
| Underline | true | Standard web convention |

### Common Link Styles

**Professional Blue** (Default)
```
Link: #0066cc
Hover: #003399
Underline: true
```

**Minimalist** (No underline)
```
Link: #007acc (VS Code blue)
Hover: #005a9c
Underline: false
```

**Accent Color** (Brand orange)
```
Link: #ff6b35 (orange)
Hover: #cc5529 (dark orange)
Underline: false
```

**Subtle Green** (Soft)
```
Link: #059669 (green)
Hover: #047857 (dark green)
Underline: false
```

### Generated HTML
```html
<a href="https://example.com" 
   style="color: #0066cc; text-decoration: underline;" 
   data-active-color="#003399">
  Click here
</a>
```

---

## 📊 Quick Reference Table

| Element | Dialog Type | Input Method | Key Options | Default Style |
|---------|-------------|--------------|-------------|----------------|
| **Image** | Modal | File picker or URL | Size, source | 100% width, auto height |
| **Table** | Modal | Spinners | Rows, cols, colors, header | Gray header, white body |
| **Code** | Modal | Text + sliders | Language, font, colors | Dark background, light text |
| **Link** | Modal | Text inputs | URL, display text, colors | Blue (#0066cc), underlined |

---

## 🎯 Workflow Examples

### Example 1: Create a Professional Data Table

1. Click Table icon
2. Set Rows: 6, Columns: 4
3. Toggle "Include Table Header" ✓
4. Header Color: #3b82f6 (blue)
5. Body Color: #ffffff (white)
6. Toggle "Alternate Row Colors" ✓
7. Alternate Color: #f3f4f6 (very light gray)
8. Click Insert → Beautiful data table!

### Example 2: Insert Code with Custom Styling

1. Click Code icon
2. Language: python
3. Font Size: 13px
4. Background: #1f2937 (dark gray)
5. Text: #f0f0f0 (light gray)
6. Toggle "Show Language Label" ✓
7. See preview, click Insert

### Example 3: Create a Styled Link Section

1. Copy a URL
2. Click Link icon
3. Paste URL in URL field
4. Display Text: "Learn More →"
5. Link Color: #7c3aed (purple)
6. Hover Color: #6d28d9 (dark purple)
7. Underline: OFF
8. Click Insert

### Example 4: Add Image with Custom Size

1. Click Image icon
2. Choose "From URL"
3. Paste: https://example.com/screenshot.png
4. Width: 600px
5. Height: (leave empty for auto aspect ratio)
6. Click Insert Image

---

## 🔧 Technical Details

### Toolbar Icons
- **Image Icon**: ImageIcon (lucide-react)
- **Table Icon**: Settings2 (lucide-react) 
- **Code Icon**: Code (lucide-react)
- **Link Icon**: Link (lucide-react)

### UI Components Used (shadcn/ui)
- Dialog system with animated overlays
- Input fields for text and number entry
- Label components for accessibility
- Checkbox toggles for boolean options
- Separator dividers for visual organization
- Button components with variants

### Accessibility
- All inputs labeled with `<Label>` components
- Radio buttons for mutually exclusive options
- Checkboxes for boolean toggles
- Clear visual hierarchy
- Color pickers with hex text fallback
- Form validation with error messages
- Tab navigation support

---

## 💾 Export Compatibility

All inserted elements are:
- ✅ Print-friendly (works in PDF export)
- ✅ Responsive (adapt to container width)
- ✅ Semantic HTML (proper tag structure)
- ✅ Style-preserved (inline CSS maintains appearance)
- ✅ Base64 safe (images embedded directly)

---

## 🚀 Pro Tips

1. **Tables**: Use lighter alternate colors for long tables (easier to read)
2. **Code**: Match code language syntax coloring in backgrounds
3. **Links**: Use subtle underlines only for important CTAs
4. **Images**: Always set width to max 600px for PDF readability
5. **Colors**: Use hex values from your brand guidelines

---

## ❓ FAQ

**Q: Can I edit inserted elements?**
A: Yes! Click into the editor and select text to modify colors, sizes, etc.

**Q: Will images remain after export?**
A: Yes! Base64-encoded images are embedded in the HTML.

**Q: How do I change table colors after inserting?**
A: You can edit the inline styles directly in the HTML or delete and re-insert.

**Q: Can I use custom languages in code blocks?**
A: Yes! Enter any language name (it's just for the label and highlighting rules).

**Q: Do the colors match my PDF export?**
A: Yes! All inline styles are preserved in the PDF output.

---

## 🎨 Color Picker Tips

### Finding Good Colors
- Use tools like: coolors.co, color-hex.com, colorhexa.com
- Extract colors from images: tineye reverse image search
- Brand colors: check company brand guidelines
- Web-safe colors: Stick with hex values like #0066cc

### Accessibility
- Ensure sufficient contrast for readability (WCAG AA: 4.5:1 ratio)
- Don't rely only on color for information
- Use semantic color meanings (blue = link, green = success, red = error)

---

Generated for Chat2PDF Editor v1.1+ with Enhanced Dialog System
