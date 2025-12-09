/**
 * Print Components
 * HTML-based PDF generation components
 */

export { OfferPrintTemplate } from './OfferPrintTemplate';
export type { PDFLanguage, PDFExportOptions } from './OfferPrintTemplate';

// Re-export utility functions
export {
	printOfferHtml,
	previewOfferHtml,
	downloadOfferPdfFromHtml,
	getOfferPdfBlobFromHtml,
} from '@/utils/pdfGeneratorHtml';
export type { HtmlPdfExportOptions, OfferData, OfferEquipment } from '@/utils/pdfGeneratorHtml';

