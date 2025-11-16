# Arabic PDF Export Fix

## Issues Fixed

### 1. Date Format Issue (٥٢٠٢ instead of 2025)
**Problem:** Arabic locale was converting date numbers to Arabic-Indic numerals, making them confusing and reversed.

**Solution:** Changed date formatting to use English locale (`en-GB`) for universal readability:
```typescript
// Before
let dateText = new Date(offer.createdAt).toLocaleDateString(
    lang === 'ar' ? 'ar-EG' : 'en-US'
);

// After
let dateText = new Date(offer.createdAt).toLocaleDateString('en-GB');
```

### 2. Text Corruption (لمكتب لعلمي instead of المكتب العلمي)
**Problem:** The `arabic-reshaper` library was corrupting Arabic text when used with Cairo font. Cairo font already handles Arabic shaping correctly, so reshaping was causing double processing.

**Solution:** Disabled arabic-reshaper when using Cairo font:
```typescript
function prepareArabicText(text: string): string {
    // Cairo font handles Arabic shaping natively
    // Return original text without reshaping
    return text;
}
```

### 3. Garbled Text in Tables (þòþßþŽþäþŸþùþ•)
**Problem:** `autoTable` library wasn't using Cairo font, defaulting to Helvetica which doesn't support Arabic.

**Solution:** Configured autoTable to use Cairo font for Arabic:
```typescript
autoTable(doc, {
    styles: {
        font: lang === 'ar' ? 'Cairo' : 'helvetica',
    },
    columnStyles: {
        0: { font: lang === 'ar' ? 'Cairo' : 'helvetica' },
        1: { font: lang === 'ar' ? 'Cairo' : 'helvetica' },
    },
    didParseCell: function (data) {
        if (lang === 'ar') {
            data.cell.styles.font = 'Cairo';
        }
    },
});
```

### 4. Arabic-Indic Numerals in Financial Data
**Problem:** Numbers were showing as Arabic numerals (١٢٣) instead of standard Arabic numerals (123).

**Solution:** Use English locale for all number formatting:
```typescript
// Before
totalAmount.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')

// After  
totalAmount.toLocaleString('en-US')
```

## Testing

After these changes, the Arabic PDF should display:
- ✅ Dates in standard format: `11/11/2025`
- ✅ Complete Arabic text: `المكتب العلمي للتجارة الدولية`
- ✅ Proper Arabic in tables: `المجموع الفرعي`
- ✅ Standard numerals: `1,234,567 جنيه`

## Alternative Fonts (If Cairo Still Has Issues)

If Cairo font doesn't work properly with autoTable, here are alternatives:

### Option 1: Amiri Font
A traditional Arabic font with excellent jsPDF support:

1. Download from: https://fonts.google.com/specimen/Amiri
2. Convert using jsPDF font converter
3. Replace Cairo with Amiri in `loadCairoFont()` function

### Option 2: Noto Sans Arabic
Google's universal Arabic font:

1. Download from: https://fonts.google.com/noto/specimen/Noto+Sans+Arabic
2. Convert for jsPDF
3. Replace Cairo with Noto Sans Arabic

### Option 3: Use Pre-converted Fonts
Instead of loading TTF files directly, use pre-converted fonts:

1. Visit: https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
2. Upload Cairo-Regular.ttf
3. Download the generated `.js` file
4. Import in pdfGenerator.ts:
   ```typescript
   import './fonts/cairo-normal.js';
   ```

### Option 4: Scheherazade New
Free Arabic font designed for long texts:

1. Download from: https://software.sil.org/scheherazade/
2. Convert and use as above

## Font Conversion Steps

If you need to convert any font:

1. Go to: https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
2. Upload the `.ttf` font file
3. Click "Create"
4. Save the generated `.js` file to `public/fonts/`
5. Import it:
   ```typescript
   import './fonts/your-font-normal.js';
   ```
6. Use it:
   ```typescript
   doc.addFont('your-font-normal.ttf', 'YourFont', 'normal');
   doc.setFont('YourFont', 'normal');
   ```

## Known Limitations

1. **Cairo font with TTF**: jsPDF may not parse TTF files correctly. Use converted fonts if issues persist.
2. **autoTable font support**: Some fonts work better than others with autoTable. Test thoroughly.
3. **Bold/Italic variants**: Make sure to convert all font weights you need.

## Quick Test

To test if the fix works:

1. Generate an Arabic PDF
2. Check for:
   - Date shows `11/11/2025` (not `١١/١١/٥٢٠٢`)
   - Text is complete (not missing letters)
   - Tables show proper Arabic (not garbled characters)
   - Numbers use standard digits: `123,456` (not `١٢٣٬٤٥٦`)

## Troubleshooting

### If text is still garbled:
1. Check browser console for font loading errors
2. Verify Cairo font files exist in `/public/fonts/`
3. Try pre-converted font (Option 3 above)

### If text is reversed:
1. Check RTL alignment settings
2. Verify `textAlign` is set correctly

### If numbers are still Arabic-Indic:
1. Check all `toLocaleString()` calls use `'en-US'`
2. Verify date formatting uses `'en-GB'`

## Additional Resources

- jsPDF Documentation: https://github.com/parallax/jsPDF
- autoTable Documentation: https://github.com/simonbengtsson/jsPDF-AutoTable
- Cairo Font: https://fonts.google.com/specimen/Cairo
- Font Converter: https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html

