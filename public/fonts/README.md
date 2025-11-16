# Arabic Font Setup for PDF Generation

## Quick Solution - Use Embedded Font

Since jsPDF doesn't support TTF files directly and Helvetica doesn't support Arabic, we need to use a pre-converted font.

### Step 1: Download Font Converter Tool

Visit: https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html

### Step 2: Download Amiri Font

1. Go to: https://fonts.google.com/specimen/Amiri
2. Click "Download family"
3. Extract the ZIP file
4. You'll find: `Amiri-Regular.ttf` and `Amiri-Bold.ttf`

### Step 3: Convert the Font

1. Open the font converter: https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
2. Upload `Amiri-Regular.ttf`
3. Click "Create"
4. Save the generated file as `amiri-normal.js`
5. Repeat for `Amiri-Bold.ttf` and save as `amiri-bold.js`

### Step 4: Place Converted Files

Put the `.js` files in this directory (`public/fonts/`):
- `amiri-normal.js`
- `amiri-bold.js`

### Step 5: Import in pdfGenerator.ts

Add these imports at the top of `pdfGenerator.ts`:

```typescript
// Import pre-converted Arabic fonts
import '../../public/fonts/amiri-normal.js';
import '../../public/fonts/amiri-bold.js';
```

### Step 6: Update Font Usage

The fonts will be automatically registered as 'amiri' when imported.

## Alternative: Use Web-based Arabic Font Service

If the above is too complex, consider using a service like:
- PDFKit with node-canvas (server-side)
- Puppeteer to generate PDFs from HTML (server-side)
- External PDF generation API

## Why This Is Necessary

- jsPDF doesn't support TTF files directly (they need Unicode cmap data)
- Helvetica doesn't support Arabic characters
- arabic-reshaper alone isn't sufficient without proper Arabic font support
- Pre-converted fonts include all necessary font metrics and Unicode mappings

## Files Needed

After conversion, you should have:
```
public/fonts/
  ├── amiri-normal.js (generated from Amiri-Regular.ttf)
  ├── amiri-bold.js (generated from Amiri-Bold.ttf)
  └── README.md (this file)
```

