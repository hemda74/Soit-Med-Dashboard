# Arabic Font Setup for PDF Export

## Problem
jsPDF doesn't natively support Arabic fonts. Without a proper Arabic font, Arabic characters will display as boxes (□) in the PDF.

## Solution Options

### Option 1: Use jsPDF Font Converter (RECOMMENDED)

jsPDF requires fonts to be converted using their font converter tool for best compatibility.

**Steps:**

1. **Go to jsPDF Font Converter**
   - Visit: https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
   - Or use: https://github.com/MrRio/jsPDF/tree/master/fontconverter

2. **Convert Cairo Font**
   - Download Cairo font from [Google Fonts](https://fonts.google.com/specimen/Cairo)
   - Upload `Cairo-Regular.ttf` to the font converter
   - Select "normal" style
   - Click "Convert"
   - Save the generated `.js` file as `cairo-normal.js`
   - Repeat for `Cairo-Bold.ttf` with "bold" style, save as `cairo-bold.js`

3. **Add Converted Fonts to Project**
   - Create `src/fonts/` directory
   - Place `cairo-normal.js` and `cairo-bold.js` in `src/fonts/`
   - Import and register them in `pdfGenerator.ts`:

```typescript
// At the top of pdfGenerator.ts
import cairoNormal from '@/fonts/cairo-normal';
import cairoBold from '@/fonts/cairo-bold';

// In loadCairoFont function:
doc.addFileToVFS('Cairo-Regular.ttf', cairoNormal);
doc.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
doc.addFileToVFS('Cairo-Bold.ttf', cairoBold);
doc.addFont('Cairo-Bold.ttf', 'Cairo', 'bold');
```

### Option 2: Direct TTF Loading (Current Implementation)

The current code attempts to load TTF files directly. This works in jsPDF v3+ but may have compatibility issues.

**Steps:**

1. **Download Cairo Font**
   - Go to [Google Fonts - Cairo](https://fonts.google.com/specimen/Cairo)
   - Download Regular and Bold weights
   - Or use direct download links

2. **Place Font Files**
   - Create `public/fonts/` directory if it doesn't exist
   - Copy `Cairo-Regular.ttf` to `public/fonts/Cairo-Regular.ttf`
   - Copy `Cairo-Bold.ttf` to `public/fonts/Cairo-Bold.ttf`

3. **Verify Files Are Accessible**
   - Start your dev server
   - Visit: `http://localhost:5173/fonts/Cairo-Regular.ttf`
   - Should download the font file (not 404)

4. **Check Browser Console**
   - When exporting PDF, check console for font loading messages
   - Look for: `✓ Cairo Regular font loaded and registered`
   - If you see errors, the font files may not be accessible

## Troubleshooting

### Font Not Loading

1. **Check File Path**
   - Ensure files are in `public/fonts/` (not `src/fonts/`)
   - File names must match exactly: `Cairo-Regular.ttf` and `Cairo-Bold.ttf`

2. **Check Browser Console**
   - Look for error messages about font loading
   - Check network tab to see if font requests are successful

3. **Verify Font Format**
   - Ensure files are valid TTF format
   - Try opening them in a font viewer to verify

4. **Use Font Converter**
   - If direct loading doesn't work, use Option 1 (Font Converter)
   - This is the most reliable method

### Arabic Text Still Shows as Boxes

1. **Font Not Registered**
   - Check console for font registration messages
   - Verify font appears in "Available fonts" list

2. **Font Name Mismatch**
   - The font name in `setFont()` must match the name used in `addFont()`
   - Current code uses 'Cairo' (capital C)

3. **Text Not Being Processed**
   - Ensure `prepareArabicText()` is being called
   - Check that `isRTL` is true for Arabic language

## Current Implementation Status

- ✅ Arabic text reshaping using `arabic-reshaper`
- ✅ RTL alignment and positioning
- ✅ Automatic font loading from `public/fonts/`
- ✅ Font registration with verification
- ⚠️ Requires Cairo font files to be added manually
- ⚠️ May need font converter for best compatibility

## Testing

After adding fonts:

1. Export a PDF with Arabic content
2. Check browser console for:
   - `✓ Cairo Regular font loaded and registered`
   - `Available fonts: [...]` (should include Cairo)
3. Verify Arabic text renders correctly in PDF
4. If still showing boxes, try Option 1 (Font Converter)

## Alternative: Use html2pdf

If font loading continues to be problematic, consider using `html2pdf` library which better handles Arabic text by converting HTML to PDF.
