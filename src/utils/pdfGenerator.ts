import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import letterheadPdfUrl from '@/assets/Letterhead.pdf?url';
import { getStaticFileUrl } from '@/utils/apiConfig';
// @ts-ignore - arabic-reshaper doesn't have type definitions
import arabicReshaper from 'arabic-reshaper';
import html2pdf from 'html2pdf.js';

interface OfferEquipment {
	id: number;
	name: string;
	model?: string;
	provider?: string;
	country?: string;
	year?: number;
	price?: number;
	description?: string;
	inStock?: boolean;
	imagePath?: string | null;
	// Custom fields for PDF (not saved to DB)
	customDescription?: string; // Override description for PDF only
}

interface OfferData {
	id: number;
	clientName: string;
	clientType?: string;
	clientLocation?: string;
	products: string;
	totalAmount: number;
	discountAmount?: number;
	validUntil: string;
	paymentTerms?: string;
	deliveryTerms?: string;
	warrantyTerms?: string;
	createdAt: string;
	status: string;
	assignedToName?: string;
	equipment?: OfferEquipment[]; // Array of equipment items
}

export type PDFLanguage = 'ar' | 'en';

export interface PDFExportOptions {
	language?: PDFLanguage; // Default: 'en'
	generateBothLanguages?: boolean; // Generate both Arabic and English versions
	// Product table customization
	showProductHeaders?: boolean; // Show column headers in product table
	showModel?: boolean; // Show model column
	showProvider?: boolean; // Show provider column
	showCountry?: boolean; // Show country column
	showDescription?: boolean; // Show description column
	showImage?: boolean; // Show product image
	showPrice?: boolean; // Show price column
	// Custom descriptions per product (keyed by product id)
	customDescriptions?: Record<number, string>;
}

// Translation keys
const translations: Record<PDFLanguage, Record<string, string>> = {
	en: {
		date: 'Date',
		dearClient: 'Dear Client',
		documentTitle:
			'The Scientific Office for International Trade is pleased to submit the following offer. We are confident it aligns with your current needs and provides significant value',
		productsEquipment: 'Products & Equipment',
		productName: 'Product Name',
		description: 'Description',
		model: 'Model',
		provider: 'Provider',
		country: 'Country',
		price: 'Price',
		financialSummary: 'Financial Summary',
		subtotal: 'Subtotal',
		discount: 'Discount',
		totalAmount: 'Total Amount',
		termsConditions: 'Terms & Conditions',
		paymentTerms: 'Payment Terms',
		deliveryTerms: 'Delivery Terms',
		warranty: 'Warranty',
		validUntil: 'Valid Until',
		salesman: 'Salesman',
		noImage: 'No Image',
	},
	ar: {
		date: 'التاريخ',
		dearClient: 'عزيزي العميل',
		documentTitle:
			'يسر المكتب العلمي للتجارة الدولية أن يقدم العرض التالي. نحن واثقون من أنه يتماشى مع احتياجاتك الحالية ويوفر قيمة كبيرة',
		productsEquipment: 'المنتجات والمعدات',
		productName: 'اسم المنتج',
		description: 'الوصف',
		model: 'الموديل',
		provider: 'المورد',
		country: 'البلد',
		price: 'السعر',
		financialSummary: 'الملخص المالي',
		subtotal: 'المجموع الفرعي',
		discount: 'الخصم',
		totalAmount: 'المبلغ الإجمالي',
		termsConditions: 'الشروط والأحكام',
		paymentTerms: 'شروط الدفع',
		deliveryTerms: 'شروط التسليم',
		warranty: 'الضمان',
		validUntil: 'صالح حتى',
		salesman: 'مندوب المبيعات',
		noImage: 'لا توجد صورة',
	},
};

// Helper function to convert PDF to image data URL
async function convertPdfToImage(pdfUrl: string): Promise<string | null> {
	try {
		// Dynamically import pdfjs-dist only when needed
		const pdfjsLib = await import('pdfjs-dist');

		// Set worker source - use local worker file from public folder
		if (typeof window !== 'undefined') {
			// Use local worker file (copied to public folder)
			// This avoids CDN 404 errors and works offline
			pdfjsLib.GlobalWorkerOptions.workerSrc =
				'/pdf.worker.min.mjs';

			// Fallback to unpkg if local file doesn't work
			// const version = pdfjsLib.version || '5.4.394';
			// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
		}

		// Fetch the PDF - use arrayBuffer for better compatibility
		const response = await fetch(pdfUrl);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch PDF: ${response.statusText}`
			);
		}

		const arrayBuffer = await response.arrayBuffer();
		const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
		const pdf = await loadingTask.promise;

		// Get first page
		const page = await pdf.getPage(1);

		// Render to canvas with higher scale for better quality
		const scale = 2.0;
		const viewport = page.getViewport({ scale });
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');

		if (!context) {
			console.error('Could not get canvas context');
			return null;
		}

		canvas.height = viewport.height;
		canvas.width = viewport.width;

		await page.render({
			canvasContext: context,
			viewport: viewport,
			canvas: canvas,
		}).promise;

		// Convert canvas to data URL
		const imageDataUrl = canvas.toDataURL('image/png');

		return imageDataUrl;
	} catch (error) {
		console.error('Error converting PDF to image:', error);
		return null;
	}
}

// Helper function to get image URL
// Uses centralized utility for consistent URL construction
function getImageUrl(imagePath: string | null | undefined): string {
	return getStaticFileUrl(imagePath);
}

// Helper function to load image and convert to base64
// Note: Static files should be publicly accessible, so we don't need auth headers
// which would trigger CORS and ORB (Opaque Response Blocking)
async function loadImageAsBase64(imageUrl: string): Promise<string | null> {
	try {
		// Use direct fetch without auth headers to avoid CORS/ORB issues
		// Static files are served before authentication middleware
		const response = await fetch(imageUrl, {
			mode: 'cors',
			credentials: 'omit', // Don't send credentials to avoid CORS preflight
		});

		if (!response.ok) {
			console.warn(
				'Failed to load image:',
				imageUrl,
				response.status
			);
			return null;
		}

		const blob = await response.blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () =>
				resolve(reader.result as string);
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.warn('Error loading image:', error);
		return null;
	}
}

// Helper function to prepare Arabic text for proper RTL display in jsPDF
function prepareArabicText(
	text: string,
	useAmiriFont: boolean = false
): string {
	if (!text) return text;

	// Check if text contains Arabic characters (including alif ا)
	// Extended range to include all Arabic characters and diacritics
	const hasArabic =
		/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
			text
		);
	if (!hasArabic) return text;

	// If using Amiri font, don't reshape - Amiri handles Arabic properly
	if (useAmiriFont) {
		return text;
	}

	try {
		// Use arabic-reshaper for Helvetica fallback
		const reshaped = arabicReshaper.reshape(text);

		// Reverse the text for proper RTL display in jsPDF
		// jsPDF doesn't handle RTL automatically, so we need to reverse manually
		const reversed = reshaped.split('').reverse().join('');

		return reversed;
	} catch (error) {
		console.warn('Error processing Arabic text:', error);
		console.warn('Original text:', text);
		// Fallback: try simple reverse without reshaping
		try {
			return text.split('').reverse().join('');
		} catch (e) {
			return text;
		}
	}
}

// Helper function to get text alignment for RTL/LTR
function getTextAlignment(isRTL: boolean): 'left' | 'right' | 'center' {
	return isRTL ? 'right' : 'left';
}

// Helper function to check if text contains Arabic characters
function hasArabic(text: string): boolean {
	if (!text) return false;
	return /[\u0600-\u06FF]/.test(text);
}

// Helper function to get alignment based on text content and language
// English text should be left-aligned even in RTL documents
function getTextAlignmentForContent(
	text: string,
	isRTL: boolean
): 'left' | 'right' | 'center' {
	if (!isRTL) return 'left';
	// In RTL mode, check if text contains Arabic
	// If it's English (no Arabic), align left; if Arabic, align right
	return hasArabic(text) ? 'right' : 'left';
}

// Helper function to get margin positions for RTL/LTR
function getMarginPositions(
	pageWidth: number,
	margin: number,
	isRTL: boolean
): { left: number; right: number } {
	if (isRTL) {
		return {
			left: pageWidth - margin, // Right margin becomes left
			right: margin, // Left margin becomes right
		};
	}
	return {
		left: margin,
		right: pageWidth - margin,
	};
}

// Helper function to set font based on language
function setFontForLanguage(
	doc: jsPDF,
	lang: PDFLanguage,
	style: 'normal' | 'bold' | 'italic' = 'normal'
) {
	if (lang === 'ar') {
		// Try to use Amiri font for Arabic
		try {
			const fonts = (doc as any).getFontList();
			if (fonts && (fonts.Amiri || fonts.amiri)) {
				doc.setFont('Amiri', style);
				return;
			}
		} catch (e) {
			// Fallback to helvetica
		}
	}
	// Use Helvetica for all other cases
	doc.setFont('helvetica', style);
}

export const generateOfferPDF = async (
	offer: OfferData,
	options: PDFExportOptions = {}
): Promise<jsPDF> => {
	const lang: PDFLanguage = options.language || 'en';
	const isRTL = lang === 'ar';

	// Default options
	const opts: Required<PDFExportOptions> = {
		language: lang,
		generateBothLanguages: options.generateBothLanguages || false,
		showProductHeaders: options.showProductHeaders !== false, // Default true
		showModel: options.showModel !== false, // Default true
		showProvider: options.showProvider !== false, // Default true
		showCountry: options.showCountry !== false, // Default true
		showDescription: options.showDescription !== false, // Default true
		showImage: options.showImage !== false, // Default true
		showPrice: options.showPrice !== false, // Default true
		customDescriptions: options.customDescriptions || {},
	};

	const t = translations[lang];

	// Create PDF document (A4 size)
	const doc = new jsPDF({
		orientation: 'portrait',
		unit: 'mm',
		format: 'a4',
		compress: true,
	});

	// Load Amiri font for Arabic
	// DON'T load Amiri - it has Unicode cmap issues with jsPDF
	// Use Helvetica with arabic-reshaper instead
	let useAmiriFont = false;
	if (lang === 'ar') {
		console.log(
			'📝 Using Helvetica for Arabic (with reshaping & reverse)'
		);
		doc.setFont('helvetica', 'normal');
	}

	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const margin = 15;
	// Content margins: 10% top and 10% bottom
	const topContentMargin = pageHeight * 0.16; // Exactly 10% from top
	const bottomContentMargin = pageHeight * 0.15; // Exactly 10% from bottom
	const contentStartY = topContentMargin; // Content starts at 10% from top
	const contentEndY = pageHeight - bottomContentMargin; // Content ends at 10% from bottom

	// Get margin positions based on RTL/LTR
	const margins = getMarginPositions(pageWidth, margin, isRTL);
	const textAlign = getTextAlignment(isRTL);

	// Try to load letterhead FIRST - this is critical for it to be a background
	let letterheadImage: string | null = null;
	try {
		letterheadImage = await convertPdfToImage(letterheadPdfUrl);
	} catch (error) {
		// Silently handle letterhead loading errors, will use default styling
	}

	// Colors
	const primaryColor: [number, number, number] = [41, 128, 185]; // Blue
	const secondaryColor: [number, number, number] = [52, 73, 94]; // Dark Gray
	const lightGray: [number, number, number] = [236, 240, 241];

	// CRITICAL: Add letterhead as the FIRST thing (background layer)
	// This must be done before any other content
	if (letterheadImage) {
		// Add letterhead as background - this will be the bottom layer
		doc.addImage(
			letterheadImage,
			'PNG',
			0,
			0,
			pageWidth,
			pageHeight,
			undefined,
			'FAST'
		);
	} else {
		// Fallback: Add Header Background if no letterhead
		doc.setFillColor(...primaryColor);
		doc.rect(0, 0, pageWidth, 40, 'F');

		// Company Logo/Name
		doc.setTextColor(255, 255, 255);
		doc.setFontSize(24);
		setFontForLanguage(doc, lang, 'bold');
		doc.text('SOIT-MED', margin, 20);

		doc.setFontSize(10);
		setFontForLanguage(doc, lang, 'normal');
		doc.text('Medical Equipment Solutions', margin, 28);

		// Document Title background
		doc.setFillColor(...lightGray);
		doc.rect(0, 45, pageWidth, 15, 'F');
	}

	// Start with Date at the top, then "Dear Client, [Client Name]" below
	let yPos = contentStartY;

	// Date at the top - for Arabic, use English numerals (more readable and universal)
	// Format: DD/MM/YYYY
	let dateText = new Date(offer.createdAt).toLocaleDateString('en-GB');

	doc.setFontSize(10);
	setFontForLanguage(doc, lang, 'normal');
	doc.setTextColor(...secondaryColor);

	if (isRTL) {
		// Arabic: value first, then label
		const dateValueX = margins.left - 60;
		const dateLabelX = margins.left - 40;
		doc.text(dateText, dateValueX, yPos, {
			align: 'left',
		});
		setFontForLanguage(doc, lang, 'bold');
		let dateLabel = `${t.date}`;
		dateLabel = prepareArabicText(dateLabel, useAmiriFont);
		doc.text(dateLabel, dateLabelX, yPos, {
			align: 'left',
		});
	} else {
		// English: label first, then value
		const dateLabelX = margins.left;
		const dateValueX = margins.left + 10;
		setFontForLanguage(doc, lang, 'bold');
		doc.text(`${t.date}:`, dateLabelX, yPos, {
			align: 'left',
		});
		setFontForLanguage(doc, lang, 'normal');
		doc.text(dateText, dateValueX, yPos, {
			align: 'left',
		});
	}

	yPos += 8;

	// Dear Client below Date - for Arabic, swap label and value
	doc.setFontSize(11);
	doc.setTextColor(...secondaryColor);

	if (isRTL) {
		// Arabic: value (client name) first, then label
		let clientName = offer.clientName;
		clientName = prepareArabicText(clientName);
		setFontForLanguage(doc, lang, 'normal');
		doc.text(clientName, margins.left - 60, yPos, {
			align: 'left',
			maxWidth: pageWidth - margin * 2,
		});

		let dearClientLabel = t.dearClient;
		dearClientLabel = prepareArabicText(dearClientLabel);
		doc.text(dearClientLabel, margins.left - 40, yPos, {
			align: 'left',
			maxWidth: pageWidth - margin * 2,
		});
	} else {
		// English: label first, then value
		setFontForLanguage(doc, lang, 'normal');
		let clientGreeting = `${t.dearClient}, ${offer.clientName}`;
		doc.text(clientGreeting, margins.left, yPos, {
			align: 'left',
			maxWidth: pageWidth - margin * 2,
		});
	}

	yPos += 8;

	// Document Title - smaller font size
	doc.setFontSize(10);
	setFontForLanguage(doc, lang, 'normal');
	let documentTitle = t.documentTitle;
	if (isRTL) {
		documentTitle = prepareArabicText(documentTitle);
	}
	doc.text(documentTitle, margins.left, yPos, {
		maxWidth: pageWidth - margin * 2,
		align: textAlign,
	});
	yPos += 12;

	// Products Section - Use Equipment Table if available, otherwise fallback to products text
	// Check if we need a new page for products
	if (yPos > contentEndY - 40) {
		doc.addPage();
		if (letterheadImage) {
			doc.addImage(
				letterheadImage,
				'PNG',
				0,
				0,
				pageWidth,
				pageHeight,
				undefined,
				'FAST'
			);
		}
		yPos = contentStartY;
	}

	if (offer.equipment && offer.equipment.length > 0) {
		doc.setFontSize(14);
		setFontForLanguage(doc, lang, 'bold');
		doc.setTextColor(...primaryColor);
		let productsTitle = t.productsEquipment;

		// Prepare Arabic text if needed
		if (isRTL) {
			productsTitle = prepareArabicText(productsTitle);
		}

		// Render title directly without using splitTextToSize
		// jsPDF's splitTextToSize may incorrectly calculate Arabic text width
		// when using custom fonts (Cairo), causing truncation
		// "المنتجات والمعدات" should fit on one line with font size 14
		doc.text(productsTitle, margins.left, yPos, {
			align: textAlign,
			maxWidth: pageWidth - margin * 2,
		});
		yPos += 8; // Spacing after title

		// Load all equipment images first and normalize data structure
		const equipmentWithImages = await Promise.all(
			offer.equipment.map(async (eq: any) => {
				// Get imagePath from multiple possible field names (handle all variations)
				const imagePath =
					eq.imagePath ||
					eq.ImagePath ||
					eq.imageUrl ||
					eq.ImageUrl ||
					eq.imagePath;
				let imageBase64 = null;

				// Try to load image if path exists and is not a placeholder
				if (
					imagePath &&
					typeof imagePath === 'string' &&
					imagePath.trim() !== '' &&
					!imagePath.includes(
						'equipment-placeholder.png'
					) &&
					!imagePath.includes('placeholder')
				) {
					try {
						const imageUrl =
							getImageUrl(imagePath);
						console.log(
							`Loading image for ${
								eq.name ||
								'product'
							}: ${imageUrl}`
						);
						imageBase64 =
							await loadImageAsBase64(
								imageUrl
							);

						if (!imageBase64) {
							console.warn(
								`Failed to load image for ${
									eq.name ||
									'product'
								}: ${imagePath}`
							);
						} else {
							console.log(
								`Successfully loaded image for ${
									eq.name ||
									'product'
								}`
							);
						}
					} catch (error) {
						console.error(
							`Error loading image for ${
								eq.name ||
								'product'
							}:`,
							error,
							imagePath
						);
						imageBase64 = null;
					}
				} else {
					console.log(
						`Skipping image for ${
							eq.name || 'product'
						}:`,
						imagePath
							? 'placeholder or empty'
							: 'no path'
					);
				}

				// Normalize equipment data - handle both new and legacy field names
				// Backend returns: Name, Model, Provider, Country, Year, Price, Description, InStock, ImagePath
				const normalized = {
					id: eq.id || eq.Id,
					name: eq.name || eq.Name || 'N/A',
					model:
						eq.model ||
						eq.Model ||
						undefined,
					provider:
						eq.provider ||
						eq.Provider ||
						eq.manufacturer ||
						eq.Manufacturer ||
						undefined,
					country:
						eq.country ||
						eq.Country ||
						undefined,
					year: eq.year ?? eq.Year ?? undefined,
					price: (() => {
						const rawPrice =
							eq.price ??
							eq.Price ??
							eq.totalPrice ??
							eq.TotalPrice ??
							eq.unitPrice ??
							eq.UnitPrice ??
							0;
						if (
							typeof rawPrice ===
							'number'
						) {
							return rawPrice;
						}
						const parsed = Number(rawPrice);
						return Number.isFinite(parsed)
							? parsed
							: 0;
					})(),
					description:
						eq.description ||
						eq.Description ||
						eq.specifications ||
						eq.Specifications ||
						undefined,
					inStock:
						eq.inStock !== undefined
							? eq.inStock
							: eq.InStock !==
							  undefined
							? eq.InStock
							: true,
					imagePath:
						eq.imagePath ||
						eq.ImagePath ||
						eq.imageUrl ||
						eq.ImageUrl ||
						undefined,
					imageBase64,
				};

				return normalized;
			})
		);

		// Apply custom descriptions if provided (after loading images)
		equipmentWithImages.forEach((eq: any) => {
			if (opts.customDescriptions[eq.id]) {
				eq.customDescription =
					opts.customDescriptions[eq.id];
			}
		});

		// Layout: up to 4 columns per row, 2 products per page
		// For LTR: Column 1 (Name/Desc/Model) | Column 2 (Image) | Column 3 (Provider/Country) | Column 4 (Price)
		// For RTL: Columns are mirrored horizontally

		const totalDataWidth = pageWidth - margin * 2;
		const colSpacing = 5; // Space between columns
		const colPadding = 5; // Padding inside each column
		const columnCount = opts.showPrice ? 4 : 3;
		const totalSpacing = colSpacing * (columnCount - 1);
		const colWidth = (totalDataWidth - totalSpacing) / columnCount;

		const imgWidth = colWidth - 10; // Image width (smaller to fit in cell)
		const imgHeight = 40; // Reduced image height to fit in cell

		const getColumnX = (logicalIndex: number): number => {
			const index = isRTL
				? columnCount - 1 - logicalIndex
				: logicalIndex;
			return isRTL
				? margins.left -
						colWidth * (index + 1) -
						colSpacing * index +
						colPadding
				: margins.left +
						(colWidth + colSpacing) *
							index +
						colPadding;
		};

		const getHeaderX = (logicalIndex: number): number => {
			const base = getColumnX(logicalIndex);
			return isRTL ? base + colWidth - colPadding : base;
		};

		const col1X = getColumnX(0);
		const col2X = getColumnX(1);
		const col3X = getColumnX(2);
		const col4X = opts.showPrice ? getColumnX(3) : 0;

		// Add column headers if enabled
		if (opts.showProductHeaders) {
			// Check if we need a new page for headers
			if (yPos > contentEndY - 10) {
				doc.addPage();
				if (letterheadImage) {
					doc.addImage(
						letterheadImage,
						'PNG',
						0,
						0,
						pageWidth,
						pageHeight,
						undefined,
						'FAST'
					);
				}
				yPos = contentStartY;
			}

			// Draw header row background - use margins for RTL
			doc.setFillColor(240, 240, 240);
			const headerStartX = isRTL
				? margins.right
				: margins.left;
			const headerWidth = pageWidth - margin * 2;
			doc.rect(headerStartX, yPos, headerWidth, 8, 'F');

			// Draw header borders
			doc.setDrawColor(200, 200, 200);
			doc.setLineWidth(0.3);
			doc.rect(headerStartX, yPos, headerWidth, 8, 'S');

			// Column headers - use calculated column positions with proper alignment
			doc.setFontSize(9);
			setFontForLanguage(doc, lang, 'bold');
			doc.setTextColor(...primaryColor);

			// Calculate header text positions - for RTL, align from right edge of column
			// For LTR, align from left edge of column
			const col1HeaderX = getHeaderX(0);
			const col3HeaderX = getHeaderX(2);
			const col4HeaderX = opts.showPrice ? getHeaderX(3) : 0;

			// Column 1 header (Name/Description) - rightmost for RTL, leftmost for LTR
			let col1Header = t.productName;
			if (isRTL) col1Header = prepareArabicText(col1Header);
			doc.text(col1Header, col1HeaderX, yPos + 6, {
				align: textAlign,
				maxWidth: colWidth - colPadding * 2,
			});

			// Column 2 header (Image only) - middle column
			// No header text needed since column 2 is image only

			// Column 3 header (Provider/Country) - leftmost for RTL, rightmost for LTR
			if (opts.showProvider && opts.showCountry) {
				let col3Header = `${t.provider} / ${t.country}`;
				if (isRTL)
					col3Header =
						prepareArabicText(col3Header);
				doc.text(col3Header, col3HeaderX, yPos + 6, {
					align: textAlign,
					maxWidth: colWidth - colPadding * 2,
				});
			} else if (opts.showProvider) {
				let col3Header = t.provider;
				if (isRTL)
					col3Header =
						prepareArabicText(col3Header);
				doc.text(col3Header, col3HeaderX, yPos + 6, {
					align: textAlign,
					maxWidth: colWidth - colPadding * 2,
				});
			} else if (opts.showCountry) {
				let col3Header = t.country;
				if (isRTL)
					col3Header =
						prepareArabicText(col3Header);
				doc.text(col3Header, col3HeaderX, yPos + 6, {
					align: textAlign,
					maxWidth: colWidth - colPadding * 2,
				});
			}

			// Column 4 header (Price) - only if price column is enabled
			if (opts.showPrice) {
				let col4Header = t.price;
				if (isRTL)
					col4Header =
						prepareArabicText(col4Header);
				doc.text(col4Header, col4HeaderX, yPos + 6, {
					align: textAlign,
					maxWidth: colWidth - colPadding * 2,
				});
			}

			yPos += 10; // Space after headers
		}

		// Calculate row height - 20% of page height per product
		const calculatedRowHeight = pageHeight * 0.2; // 20% of page height per product

		for (let i = 0; i < equipmentWithImages.length; i++) {
			const eq = equipmentWithImages[i];

			// Use custom description if available, otherwise use original
			const descriptionToUse =
				(eq as any).customDescription ||
				eq.description ||
				'N/A';

			// Calculate row height FIRST to check if it fits on current page
			const descText = opts.showDescription
				? descriptionToUse
				: '';
			const descLines = doc.splitTextToSize(
				descText,
				colWidth - colPadding * 2
			);
			const nameLines = doc.splitTextToSize(
				eq.name || 'N/A',
				colWidth - colPadding * 2
			);

			// Calculate required height: image + name + description + spacing
			const imageSectionHeight = imgHeight + 10; // Image + spacing (reduced since model moved to col1)
			const textSectionHeight = Math.max(
				nameLines.length * 4 +
					descLines.length * 3 +
					15, // Name + description (reduced line spacing)
				15 // Minimum height (reduced)
			);
			// Use calculated height but ensure it fits within half the page
			const actualRowHeight = Math.min(
				calculatedRowHeight - 5, // Leave 5mm spacing between products
				Math.max(
					imageSectionHeight + textSectionHeight,
					60 // Minimum row height
				)
			);

			// Check if this product row would exceed the bottom margin
			// If yes, add a new page before drawing it
			if (yPos + actualRowHeight > contentEndY) {
				doc.addPage();
				// Add letterhead background to new page
				if (letterheadImage) {
					doc.addImage(
						letterheadImage,
						'PNG',
						0,
						0,
						pageWidth,
						pageHeight,
						undefined,
						'FAST'
					);
				}
				yPos = contentStartY;
			}

			// Draw row border - TRANSPARENT background (no fill)
			// Use margins for RTL mirroring
			const rowStartX = isRTL ? margins.right : margins.left;
			const rowWidth = pageWidth - margin * 2;
			doc.setDrawColor(220, 220, 220);
			doc.setLineWidth(0.3);
			doc.rect(
				rowStartX,
				yPos,
				rowWidth,
				actualRowHeight,
				'S'
			);

			// Draw vertical dividers between columns - use calculated column positions
			doc.setDrawColor(200, 200, 200);
			doc.setLineWidth(0.2);
			for (
				let dividerIndex = 0;
				dividerIndex < columnCount - 1;
				dividerIndex++
			) {
				const dividerX = isRTL
					? margins.left -
					  colWidth * (dividerIndex + 1) -
					  colSpacing * dividerIndex
					: margins.left +
					  colWidth * (dividerIndex + 1) +
					  colSpacing * dividerIndex;
				doc.line(
					dividerX,
					yPos,
					dividerX,
					yPos + actualRowHeight
				);
			}

			// COLUMN 1: Product Name (top) + Description (below) + Model
			// In Arabic, start from left edge (not right) for name and description
			const col1DataX = col1X; // Always start from left edge, even in RTL
			let col1Y = yPos + 6; // Reduced top padding

			// Product Name (bold, bigger font size)
			doc.setFontSize(11);
			setFontForLanguage(doc, lang, 'bold');
			doc.setTextColor(30, 30, 30);
			// Prepare Arabic text if needed
			const processedNameLines = isRTL
				? nameLines.map((line: string) =>
						prepareArabicText(line)
				  )
				: nameLines;
			// In Arabic, align left for name/description columns
			const nameAlign = isRTL ? 'left' : 'left';
			doc.text(processedNameLines, col1DataX, col1Y, {
				maxWidth: colWidth - colPadding * 2,
				align: nameAlign,
			});
			col1Y += nameLines.length * 5 + 8; // Increased spacing for bigger font

			// Description (below name, bigger font size) - only if enabled
			if (
				opts.showDescription &&
				descLines.length > 0 &&
				descText !== ''
			) {
				doc.setFontSize(9);
				setFontForLanguage(doc, lang, 'normal');
				doc.setTextColor(80, 80, 80);
				// Prepare Arabic text if needed
				const processedDescLines = isRTL
					? descLines.map((line: string) =>
							prepareArabicText(line)
					  )
					: descLines;
				// In Arabic, align left for name/description columns
				const descAlign = isRTL ? 'left' : 'left';
				doc.text(processedDescLines, col1DataX, col1Y, {
					maxWidth: colWidth - colPadding * 2,
					align: descAlign,
				});
				col1Y += descLines.length * 3 + 5; // Spacing after description
			}

			// Model (below description) - only if enabled
			if (opts.showModel) {
				const modelText = eq.model || 'N/A';
				const isModelArabic = hasArabic(modelText);
				doc.setFontSize(10);
				setFontForLanguage(doc, lang, 'normal');
				doc.setTextColor(50, 50, 50);
				let processedModelText = modelText;
				if (isRTL && isModelArabic) {
					processedModelText =
						prepareArabicText(
							processedModelText
						);
				}
				const modelLines = doc.splitTextToSize(
					processedModelText,
					colWidth - colPadding * 2
				);
				const processedModelLines =
					isRTL && isModelArabic
						? modelLines.map(
								(
									line: string
								) =>
									prepareArabicText(
										line
									)
						  )
						: modelLines;
				doc.text(
					processedModelLines,
					col1DataX,
					col1Y,
					{
						maxWidth:
							colWidth -
							colPadding * 2,
						align: getTextAlignmentForContent(
							modelText,
							isRTL
						),
					}
				);
			}

			// COLUMN 2: Image only (no model)
			// Use pre-calculated col2X position

			// Image (centered in column) - only if enabled
			if (opts.showImage) {
				const imageX =
					col2X +
					(colWidth - colPadding * 2 - imgWidth) /
						2;
				if (eq.imageBase64) {
					try {
						// Ensure image is a valid data URL
						let imageData = eq.imageBase64;
						if (
							!imageData.startsWith(
								'data:'
							)
						) {
							imageData = `data:image/png;base64,${imageData}`;
						}

						// Add image - centered vertically in cell
						const cellCenterY =
							yPos +
							actualRowHeight / 2 -
							imgHeight / 2;
						doc.addImage(
							imageData,
							'PNG',
							imageX,
							cellCenterY,
							imgWidth,
							imgHeight,
							undefined,
							'SLOW'
						);
					} catch (error) {
						console.error(
							'Error adding product image:',
							error,
							eq.name,
							eq.imagePath
						);
						// Draw placeholder - centered vertically in cell
						const cellCenterY =
							yPos +
							actualRowHeight / 2 -
							imgHeight / 2;
						doc.setDrawColor(200, 200, 200);
						doc.setLineWidth(0.5);
						doc.rect(
							imageX,
							cellCenterY,
							imgWidth,
							imgHeight,
							'S'
						);
						doc.setFontSize(6);
						doc.setTextColor(150, 150, 150);
						doc.text(
							t.noImage,
							imageX + imgWidth / 2,
							cellCenterY +
								imgHeight / 2,
							{
								align: 'center',
							}
						);
					}
				} else {
					// Draw placeholder if no image - centered vertically in cell
					const cellCenterY =
						yPos +
						actualRowHeight / 2 -
						imgHeight / 2;
					doc.setDrawColor(200, 200, 200);
					doc.setLineWidth(0.5);
					doc.rect(
						imageX,
						cellCenterY,
						imgWidth,
						imgHeight,
						'S'
					);
					doc.setFontSize(6);
					doc.setTextColor(150, 150, 150);
					doc.text(
						t.noImage,
						imageX + imgWidth / 2,
						cellCenterY + imgHeight / 2,
						{
							align: 'center',
						}
					);
				}
			}

			// COLUMN 3: Provider (top) + Country (below)
			let col3Y = yPos + 6; // Reduced top padding

			// Provider (bold, bigger font size) - only if enabled
			if (opts.showProvider) {
				const providerText = eq.provider || 'N/A';
				const isProviderArabic =
					hasArabic(providerText);
				// English text starts from left even in RTL documents
				const col3ProviderX =
					isRTL && isProviderArabic
						? col3X + colWidth - colPadding // Right edge for RTL Arabic
						: col3X; // Left edge for LTR or English text
				doc.setFontSize(10);
				setFontForLanguage(doc, lang, 'bold');
				doc.setTextColor(30, 30, 30);
				let processedProviderText = providerText;
				if (isRTL && isProviderArabic) {
					processedProviderText =
						prepareArabicText(
							processedProviderText
						);
				}
				const providerLines = doc.splitTextToSize(
					processedProviderText,
					colWidth - colPadding * 2
				);
				const processedProviderLines =
					isRTL && isProviderArabic
						? providerLines.map(
								(
									line: string
								) =>
									prepareArabicText(
										line
									)
						  )
						: providerLines;
				doc.text(
					processedProviderLines,
					col3ProviderX,
					col3Y,
					{
						maxWidth:
							colWidth -
							colPadding * 2,
						align: getTextAlignmentForContent(
							providerText,
							isRTL
						),
					}
				);
				col3Y += providerLines.length * 5 + 8; // Increased spacing for bigger font
			}

			// Country (below provider, bigger font size) - only if enabled
			if (opts.showCountry) {
				const countryText = eq.country || 'N/A';
				const isCountryArabic = hasArabic(countryText);
				// English text starts from left even in RTL documents
				const col3CountryX =
					isRTL && isCountryArabic
						? col3X + colWidth - colPadding // Right edge for RTL Arabic
						: col3X; // Left edge for LTR or English text
				doc.setFontSize(9);
				setFontForLanguage(doc, lang, 'normal');
				doc.setTextColor(80, 80, 80);
				let processedCountryText = countryText;
				if (isRTL && isCountryArabic) {
					processedCountryText =
						prepareArabicText(
							processedCountryText
						);
				}
				const countryLines = doc.splitTextToSize(
					processedCountryText,
					colWidth - colPadding * 2
				);
				const processedCountryLines =
					isRTL && isCountryArabic
						? countryLines.map(
								(
									line: string
								) =>
									prepareArabicText(
										line
									)
						  )
						: countryLines;
				doc.text(
					processedCountryLines,
					col3CountryX,
					col3Y,
					{
						maxWidth:
							colWidth -
							colPadding * 2,
						align: getTextAlignmentForContent(
							countryText,
							isRTL
						),
					}
				);
			}

			// COLUMN 4: Price (numeric)
			if (opts.showPrice) {
				const rawPrice = eq.price ?? 0;
				const priceNumber =
					typeof rawPrice === 'number'
						? rawPrice
						: Number(rawPrice) || 0;
				const safePrice = Number.isFinite(priceNumber)
					? priceNumber
					: 0;
				const currencyLabel =
					lang === 'ar'
						? prepareArabicText('جنيه')
						: 'EGP';
				const priceText = `${safePrice.toLocaleString(
					'en-US'
				)} ${currencyLabel}`;
				const col4PriceX = isRTL
					? col4X + colWidth - colPadding
					: col4X;

				doc.setFontSize(10);
				setFontForLanguage(doc, lang, 'bold');
				doc.setTextColor(30, 30, 30);
				doc.text(priceText, col4PriceX, yPos + 12, {
					align: isRTL ? 'right' : 'left',
					maxWidth: colWidth - colPadding * 2,
				});
			}

			yPos += actualRowHeight + 15; // Spacing between products (reduced)
		}

		yPos += 3; // Reduced bottom spacing after products
	} else {
		// Fallback to original products text display
		doc.setFontSize(14);
		setFontForLanguage(doc, lang, 'bold');
		doc.setTextColor(...primaryColor);
		doc.text('Products & Services', margin, yPos);
		yPos += 8;

		doc.setFontSize(10);
		setFontForLanguage(doc, lang, 'normal');
		doc.setTextColor(...secondaryColor);
		const splitProducts = doc.splitTextToSize(
			offer.products,
			pageWidth - margin * 2 - 10
		);
		doc.setDrawColor(...primaryColor);
		doc.setLineWidth(0.3);

		const productsHeight = splitProducts.length * 5 + 10;
		if (letterheadImage) {
			doc.rect(
				margin,
				yPos,
				pageWidth - margin * 2,
				productsHeight,
				'S'
			);
		} else {
			doc.setFillColor(250, 250, 250);
			doc.rect(
				margin,
				yPos,
				pageWidth - margin * 2,
				productsHeight,
				'FD'
			);
		}
		doc.text(splitProducts, margin + 5, yPos + 7);
		yPos += productsHeight + 10;
	}

	// Financial Summary - Show AFTER products on last page
	// Check if we need a new page
	if (yPos > contentEndY - 80) {
		doc.addPage();
		if (letterheadImage) {
			doc.addImage(
				letterheadImage,
				'PNG',
				0,
				0,
				pageWidth,
				pageHeight,
				undefined,
				'FAST'
			);
		}
		yPos = contentStartY;
	}

	doc.setFontSize(11);
	setFontForLanguage(doc, lang, 'bold');
	doc.setTextColor(...primaryColor);
	let financialSummaryTitle = t.financialSummary;
	if (isRTL)
		financialSummaryTitle = prepareArabicText(
			financialSummaryTitle
		);
	doc.text(financialSummaryTitle, margins.left, yPos, {
		align: textAlign,
	});
	yPos += 4;

	// Create table data
	// Ensure numeric values with proper defaults
	const totalAmount =
		typeof offer.totalAmount === 'number' ? offer.totalAmount : 0;
	const discountAmount =
		typeof offer.discountAmount === 'number'
			? offer.discountAmount
			: 0;

	const financialData = [
		[
			isRTL
				? prepareArabicText(
						String(t.subtotal),
						useAmiriFont
				  )
				: String(t.subtotal),
			`${totalAmount.toLocaleString('en-US')} ${
				lang === 'ar'
					? prepareArabicText(
							'جنيه',
							useAmiriFont
					  )
					: 'EGP'
			}`,
		],
	];

	if (discountAmount > 0) {
		financialData.push([
			isRTL
				? prepareArabicText(
						String(t.discount),
						useAmiriFont
				  )
				: String(t.discount),
			`- ${discountAmount.toLocaleString('en-US')} ${
				lang === 'ar'
					? prepareArabicText(
							'جنيه',
							useAmiriFont
					  )
					: 'EGP'
			}`,
		]);
	}

	const finalAmount = totalAmount - discountAmount;
	financialData.push([
		isRTL
			? prepareArabicText(String(t.totalAmount), useAmiriFont)
			: String(t.totalAmount),
		`${finalAmount.toLocaleString('en-US')} ${
			lang === 'ar'
				? prepareArabicText('جنيه', useAmiriFont)
				: 'EGP'
		}`,
	]);

	// Check if Amiri font is available for autoTable
	const fonts = (doc as any).getFontList();
	const hasAmiri = fonts && (fonts.Amiri || fonts.amiri);
	const arabicFont = hasAmiri ? 'Amiri' : 'helvetica';

	autoTable(doc, {
		startY: yPos,
		head: [],
		body: financialData,
		theme: 'grid',
		styles: {
			fontSize: 9,
			cellPadding: 4,
			overflow: 'linebreak',
			font: lang === 'ar' ? arabicFont : 'helvetica',
			fontStyle: 'normal',
			lineColor: [200, 200, 200],
			lineWidth: 0.3,
			fillColor: false,
		},
		columnStyles: {
			0: {
				fontStyle: 'bold',
				halign: isRTL ? 'right' : 'left',
				cellWidth: 'auto',
				font: lang === 'ar' ? arabicFont : 'helvetica',
			},
			1: {
				halign: isRTL ? 'left' : 'right',
				fontStyle: 'bold',
				cellWidth: 'auto',
				font: lang === 'ar' ? arabicFont : 'helvetica',
			},
		},
		// Use actual margins (not swapped) - autoTable handles alignment via halign
		margin: { left: margin, right: pageWidth - margin },
		tableWidth: pageWidth - margin * 2,
		didParseCell: function (data) {
			// Ensure correct font is used for Arabic text in all cells
			if (lang === 'ar') {
				data.cell.styles.font = arabicFont;
			}
		},
	});

	yPos = (doc as any).lastAutoTable.finalY + 5;

	// Terms & Conditions - Show AFTER products on last page
	if (offer.paymentTerms || offer.deliveryTerms || offer.warrantyTerms) {
		// Check if we need a new page
		if (yPos > contentEndY - 60) {
			doc.addPage();
			if (letterheadImage) {
				doc.addImage(
					letterheadImage,
					'PNG',
					0,
					0,
					pageWidth,
					pageHeight,
					undefined,
					'FAST'
				);
			}
			yPos = contentStartY;
		}

		doc.setFontSize(11);
		setFontForLanguage(doc, lang, 'bold');
		doc.setTextColor(...primaryColor);
		let termsTitle = t.termsConditions;
		if (isRTL) termsTitle = prepareArabicText(termsTitle);
		doc.text(termsTitle, margins.left, yPos, {
			align: textAlign,
		});
		yPos += 4;

		doc.setFontSize(8);
		setFontForLanguage(doc, lang, 'normal');
		doc.setTextColor(...secondaryColor);

		const termsData = [];
		if (offer.paymentTerms) {
			let paymentLabel = String(t.paymentTerms);
			let paymentValue = String(offer.paymentTerms);
			if (isRTL) {
				paymentLabel = prepareArabicText(paymentLabel);
				paymentValue = prepareArabicText(paymentValue);
			}
			termsData.push([paymentLabel, paymentValue]);
		}
		if (offer.deliveryTerms) {
			let deliveryLabel = String(t.deliveryTerms);
			let deliveryValue = String(offer.deliveryTerms);
			if (isRTL) {
				deliveryLabel =
					prepareArabicText(deliveryLabel);
				deliveryValue =
					prepareArabicText(deliveryValue);
			}
			termsData.push([deliveryLabel, deliveryValue]);
		}
		if (offer.warrantyTerms) {
			let warrantyLabel = String(t.warranty);
			let warrantyValue = String(offer.warrantyTerms);
			if (isRTL) {
				warrantyLabel =
					prepareArabicText(warrantyLabel);
				warrantyValue =
					prepareArabicText(warrantyValue);
			}
			termsData.push([warrantyLabel, warrantyValue]);
		}

		if (termsData.length > 0) {
			// Calculate proper column widths for terms table
			const termsTableWidth = pageWidth - margin * 2;
			const labelColumnWidth = 50; // Fixed width for labels
			const valueColumnWidth =
				termsTableWidth - labelColumnWidth - 10; // Remaining width for values

			autoTable(doc, {
				startY: yPos,
				head: [],
				body: termsData,
				theme: 'grid',
				styles: {
					fontSize: 8,
					cellPadding: 4,
					overflow: 'linebreak',
					font:
						lang === 'ar'
							? arabicFont
							: 'helvetica',
					fontStyle: 'normal',
					lineColor: [200, 200, 200],
					lineWidth: 0.3,
					fillColor: false,
				},
				columnStyles: {
					0: {
						fontStyle: 'bold',
						cellWidth: labelColumnWidth,
						halign: isRTL
							? 'right'
							: 'left',
						font:
							lang === 'ar'
								? arabicFont
								: 'helvetica',
					},
					1: {
						cellWidth: valueColumnWidth,
						halign: isRTL
							? 'right'
							: 'left',
						font:
							lang === 'ar'
								? arabicFont
								: 'helvetica',
					},
				},
				// Use actual margins (not swapped) - autoTable handles alignment via halign
				margin: {
					left: margin,
					right: pageWidth - margin,
				},
				tableWidth: termsTableWidth,
				didParseCell: function (data) {
					// Ensure correct font is used for Arabic text in all cells
					if (lang === 'ar') {
						data.cell.styles.font =
							arabicFont;
					}
					// Keep terms on one line - truncate if too long
					if (
						data.column.index === 1 &&
						data.cell.text &&
						data.cell.text.length > 0
					) {
						const maxLength = 80; // Approximate characters per line
						if (
							data.cell.text[0]
								.length >
							maxLength
						) {
							data.cell.text[0] =
								data.cell.text[0].substring(
									0,
									maxLength -
										3
								) + '...';
						}
					}
				},
			});

			yPos = (doc as any).lastAutoTable.finalY + 5;
		}
	}

	// Add Valid Until and Salesman directly under Terms & Conditions
	// Check if we need a new page
	if (yPos > contentEndY - 20) {
		doc.addPage();
		if (letterheadImage) {
			doc.addImage(
				letterheadImage,
				'PNG',
				0,
				0,
				pageWidth,
				pageHeight,
				undefined,
				'FAST'
			);
		}
		yPos = contentStartY;
	}

	// Valid Until and Salesman - mirrored for RTL
	const validUntilX = isRTL ? margins.left - 60 : margins.left;
	const validUntilValueX = isRTL ? margins.left - 40 : margins.left + 20;
	const salesmanX = isRTL ? margins.left - 60 : margins.left;
	const salesmanValueX = isRTL ? margins.left - 40 : margins.left + 20;

	doc.setFontSize(10);
	setFontForLanguage(doc, lang, 'bold');
	doc.setTextColor(...secondaryColor);

	let validUntilLabel = `${t.validUntil}:`;
	let salesmanLabel = `${t.salesman}:`;
	if (isRTL) {
		validUntilLabel = prepareArabicText(validUntilLabel);
		salesmanLabel = prepareArabicText(salesmanLabel);
	}
	doc.text(validUntilLabel, validUntilX, yPos, {
		align: textAlign,
	});
	doc.text(salesmanLabel, salesmanX, yPos + 8, {
		align: textAlign,
	});

	setFontForLanguage(doc, lang, 'normal');
	// Use English numerals for dates (more readable and universal)
	let validUntilValue = new Date(offer.validUntil).toLocaleDateString(
		'en-GB'
	);
	let salesmanValue = offer.assignedToName || 'N/A';
	if (isRTL) {
		salesmanValue = prepareArabicText(salesmanValue);
	}
	doc.text(validUntilValue, validUntilValueX, yPos, {
		align: textAlign,
	});
	doc.text(salesmanValue, salesmanValueX, yPos + 8, {
		align: textAlign,
	});

	// Footer - check if we need a new page respecting 20% bottom margin
	if (yPos > contentEndY - 40) {
		doc.addPage();
		// CRITICAL: Add letterhead FIRST on new page (before any content)
		if (letterheadImage) {
			doc.addImage(
				letterheadImage,
				'PNG',
				0,
				0,
				pageWidth,
				pageHeight,
				undefined,
				'FAST'
			);
		}
		// Start from content margin (20% from top)
		yPos = contentStartY;
	}

	// Footer background - skip filled background if letterhead is present
	if (!letterheadImage) {
		doc.setFillColor(...lightGray);
		doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
	}

	doc.setFontSize(8);
	doc.setTextColor(...secondaryColor);
	setFontForLanguage(doc, lang, 'normal');

	// Add Page Numbers to all pages (but don't add letterhead here - it covers content!)
	// Letterhead is already added:
	// - First page: added at the beginning (line 173-184)
	// - Manual pages: added immediately after addPage() calls (lines 440-451, 802-813, 875-886)
	// - AutoTable pages: added via didDrawPage callbacks (in autoTable configs above)
	const pageCount = doc.getNumberOfPages();
	for (let i = 1; i <= pageCount; i++) {
		doc.setPage(i);
		doc.setFontSize(8);
		doc.setTextColor(...secondaryColor);
		setFontForLanguage(doc, lang, 'normal');
		const pageX = isRTL ? margin : pageWidth - margin;
		doc.text(
			lang === 'ar'
				? `صفحة ${i} من ${pageCount}`
				: `Page ${i} of ${pageCount}`,
			pageX,
			pageHeight - 10,
			{ align: isRTL ? 'left' : 'right' }
		);
	}

	return doc;
};

// Generate HTML content for Arabic PDF (matching the English PDF design)
async function generateOfferHTML(
	offer: OfferData,
	lang: PDFLanguage = 'ar'
): Promise<string> {
	const isRTL = lang === 'ar';
	const t = translations[lang];

	// Convert letterhead PDF to image
	let letterheadBase64 = '';
	try {
		const letterheadImg = await convertPdfToImage(letterheadPdfUrl);
		if (letterheadImg) {
			letterheadBase64 = letterheadImg;
			console.log(' Letterhead loaded for HTML PDF');
		} else {
			console.warn('⚠️ Letterhead conversion returned null');
		}
	} catch (e) {
		console.warn('❌ Could not load letterhead for HTML PDF:', e);
	}

	// Load equipment images
	const equipmentWithImages = offer.equipment
		? await Promise.all(
				offer.equipment.map(async (eq: any) => {
					const imagePath =
						eq.imagePath || eq.ImagePath;
					let imageBase64 = '';

					if (
						imagePath &&
						typeof imagePath === 'string' &&
						imagePath.trim() !== ''
					) {
						try {
							const imageUrl =
								getStaticFileUrl(
									imagePath
								);
							const response =
								await fetch(
									imageUrl,
									{
										mode: 'cors',
										credentials:
											'omit',
									}
								);
							if (response.ok) {
								const blob =
									await response.blob();
								imageBase64 =
									await new Promise<string>(
										(
											resolve
										) => {
											const reader =
												new FileReader();
											reader.onloadend =
												() =>
													resolve(
														reader.result as string
													);
											reader.onerror =
												() =>
													resolve(
														''
													);
											reader.readAsDataURL(
												blob
											);
										}
									);
							}
						} catch (error) {
							console.warn(
								'Error loading image:',
								error
							);
						}
					}

					const rawPrice =
						eq.price ??
						eq.Price ??
						eq.totalPrice ??
						eq.TotalPrice ??
						eq.unitPrice ??
						eq.UnitPrice ??
						0;
					const priceNumber =
						typeof rawPrice === 'number'
							? rawPrice
							: Number(rawPrice) || 0;
					const priceValue = Number.isFinite(
						priceNumber
					)
						? priceNumber
						: 0;

					return {
						...eq,
						imageBase64,
						priceValue,
					};
				})
		  )
		: [];

	return `
<!DOCTYPE html>
<html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${lang}">
<head>
	<meta charset="UTF-8">
	<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
	<style>
		@page {
			size: A4;
			margin: 0;
			${
				letterheadBase64
					? `background-image: url('${letterheadBase64}');
			background-size: 210mm 297mm;
			background-position: 0 0;
			background-repeat: no-repeat;`
					: ''
			}
		}
		* { margin: 0; padding: 0; box-sizing: border-box; }
		html {
			width: 210mm;
			min-height: 100%;
			/* Letterhead background on html - ensures coverage for all pages */
			background: ${
				letterheadBase64
					? `url('${letterheadBase64}') repeat-y center top / 210mm 297mm`
					: 'white'
			};
			background-size: 210mm 297mm;
			background-repeat: repeat-y;
		}
		body {
			font-family: 'Cairo', Arial, sans-serif;
			direction: ${isRTL ? 'rtl' : 'ltr'};
			font-size: 10px; /* Match English: 10px base */
			line-height: 1.4;
			color: #34495e; /* Match English: secondaryColor [52, 73, 94] */
			position: relative;
			width: 210mm;
			margin: 0;
			padding: 0;
			/* Letterhead background on body - covers full page and repeats for all pages */
			background: ${
				letterheadBase64
					? `url('${letterheadBase64}') repeat-y center top / 210mm 297mm`
					: 'white'
			};
			background-size: 210mm 297mm;
			background-repeat: repeat-y;
			background-attachment: local;
			/* Ensure body expands to contain all content for html2canvas */
			min-height: 100%;
		}
		/* Page wrapper - contains all content, transparent to show body letterhead */
		.page-wrapper {
			position: relative;
			width: 210mm;
			min-height: 297mm;
			/* Transparent so body letterhead shows through */
			background: transparent;
		}
		/* Letterhead pages - Backup method: positioned divs for html2canvas */
		/* These ensure letterhead is captured at page boundaries as backup */
		.letterhead-page {
			position: absolute;
			left: 0;
			width: 210mm;
			height: 297mm;
			z-index: -1;
			pointer-events: none;
			${letterheadBase64 ? '' : 'display: none;'}
		}
		.letterhead-page img {
			width: 210mm;
			height: 297mm;
			object-fit: cover;
			display: block;
		}
		/* Content area - Match English: 16% top margin, 15% bottom margin, 15mm side margins */
		/* Padding applied to container - but we need margins on each page section */
		.content {
			padding: 0 15mm;
			position: relative;
			z-index: 1;
			background: transparent;
		}
		/* Page section wrapper - ensures margins on each page when html2pdf splits */
		.page-section {
			padding-top: 16%;
			padding-bottom: 15%;
			min-height: 297mm;
			page-break-after: always;
		}
		.page-section:last-child {
			page-break-after: auto;
		}
		/* First element in content gets top margin */
		.content > *:first-child {
			margin-top: 16%;
		}
		/* Elements after page breaks get top margin */
		.product-card:nth-child(2n) {
			margin-top: 16%;
		}
		.info-section {
			margin-bottom: 8px; /* Match English: yPos += 8 */
		}
		.info-row {
			margin: 4px 0;
			font-size: 10px; /* Match English: 10px for date */
		}
		.info-row:first-child {
			font-size: 10px; /* Match English: 10px for date */
		}
		.info-row:nth-child(2) {
			font-size: 11px; /* Match English: 11px for dear client */
		}
		.label {
			font-weight: bold;
			display: inline;
		}
		.section-title {
			font-size: 14px; /* Match English: 14px section titles */
			font-weight: bold;
			color: #2980b9; /* Match English: primaryColor [41, 128, 185] */
			margin: 8px 0; /* Match English: yPos += 8 after title */
		}
		/* Product table header - exact match to English */
		.product-header {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			background-color: rgb(240, 240, 240);
			border: 0.3px solid rgb(200, 200, 200);
			margin: 0;
		}
		.product-header-cell {
			padding: 6px 5px; /* Match English: yPos + 6, colPadding = 5 */
			font-size: 9px; /* Match English: 9px for headers */
			font-weight: bold;
			color: #2980b9; /* Match English: primaryColor */
			text-align: ${isRTL ? 'right' : 'left'};
			border-${isRTL ? 'left' : 'right'}: 0.2px solid rgb(200, 200, 200);
		}
		.product-header-cell:last-child {
			border: none;
		}
		/* Product rows - Match English: 20% of page height per product, 2 per page */
		.product-grid {
			margin: 0;
			margin-top: 8px; /* Match English: yPos += 8 after title */
		}
		.product-card {
			border: 0.3px solid rgb(220, 220, 220); /* Match English: doc.setDrawColor(220, 220, 220) */
			border-top: none;
			background: transparent; /* Match English: transparent background */
			padding: 0;
			page-break-inside: avoid;
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			/* Match English: 20% of page height (297mm * 0.20 = 59.4mm) */
			min-height: auto;
			height: auto;
			margin-bottom: 15px; /* Match English: yPos += actualRowHeight + 15 */
		}
		.product-card:first-of-type {
			border-top: 0.3px solid rgb(220, 220, 220);
		}
		/* Force page break after every 2nd product */
		.product-card:nth-child(2n) {
			page-break-after: always;
			margin-bottom: 0;
			position: relative;
		}
		/* Add top margin after page breaks to maintain 16% top margin on each page */
		.product-card:nth-child(2n+1):not(:first-child) {
			margin-top: 16%;
		}
		/* Page break handling - letterhead will be added via letterhead-page divs */
		.product-col {
			padding: 6px 5px; /* Match English: yPos + 6 for top, colPadding = 5 */
			border-${
				isRTL ? 'left' : 'right'
			}: 0.2px solid rgb(200, 200, 200); /* Match English: doc.setDrawColor(200, 200, 200) */
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: flex-start;
		}
		.product-col:last-child {
			border: none;
		}
		.product-col1 {
			/* Name and Description column - left aligned even in RTL */
			text-align: left;
		}
		.product-col2 {
			/* Image column */
			align-items: center;
			text-align: center;
			justify-content: flex-start;
			padding-top: 10px;
		}
		.product-col3 {
			/* Provider and Country column */
			text-align: left; /* English text starts from left */
		}
		.product-name {
			font-size: 11px; /* Match English: doc.setFontSize(11) */
			font-weight: bold; /* Match English: setFontForLanguage(doc, lang, 'bold') */
			margin-bottom: 0;
			color: rgb(30, 30, 30); /* Match English: doc.setTextColor(30, 30, 30) */
			line-height: 1.25;
		}
		.product-name + .product-desc {
			margin-top: 8px; /* Match English: col1Y += nameLines.length * 5 + 8 */
		}
		.product-desc {
			font-size: 9px; /* Match English: doc.setFontSize(9) */
			color: rgb(80, 80, 80); /* Match English: doc.setTextColor(80, 80, 80) */
			line-height: 1.3;
			margin-top: 0;
		}
		.product-image {
			width: 100% !important;
			height: 40mm !important; /* Match English: imgHeight = 40 */
			min-height: 40mm !important;
			max-height: 40mm !important;
			object-fit: contain;
			object-position: center;
			display: block;
		}
		.product-model {
			font-size: 10px; /* Match English: doc.setFontSize(10) */
			color: rgb(50, 50, 50); /* Match English: doc.setTextColor(50, 50, 50) */
			text-align: left;
			margin-top: 5px; /* Spacing after description */
		}
		.product-provider {
			font-size: 10px; /* Match English: doc.setFontSize(10) */
			font-weight: bold; /* Match English: setFontForLanguage(doc, lang, 'bold') */
			margin-bottom: 8px; /* Match English: col3Y += providerLines.length * 5 + 8 */
			color: rgb(30, 30, 30); /* Match English: doc.setTextColor(30, 30, 30) */
			text-align: left;
		}
		.product-country {
			font-size: 9px; /* Match English: doc.setFontSize(9) */
			color: rgb(80, 80, 80); /* Match English: doc.setTextColor(80, 80, 80) */
			text-align: left;
		}
		.product-col4 {
			/* Price column */
			text-align: ${isRTL ? 'right' : 'left'};
			align-items: ${isRTL ? 'flex-end' : 'flex-start'};
			justify-content: center;
		}
		.product-price {
			font-size: 10px; /* Match English: doc.setFontSize(10) */
			font-weight: bold;
			color: rgb(30, 30, 30); /* Match English: doc.setTextColor(30, 30, 30) */
			width: 100%;
			text-align: ${isRTL ? 'right' : 'left'};
		}
		.product-col4 {
			text-align: ${isRTL ? 'right' : 'left'};
			align-items: ${isRTL ? 'flex-end' : 'flex-start'};
			justify-content: center;
		}
		.product-price {
			font-size: 10px;
			font-weight: bold;
			color: rgb(30, 30, 30);
			width: 100%;
			text-align: ${isRTL ? 'right' : 'left'};
		}
		.financial-table {
			width: 100%;
			border-collapse: collapse;
			margin: 4px 0; /* Match English: yPos += 4 after title */
			font-size: 9px; /* Match English: fontSize: 9 */
			border: 0.3px solid rgb(200, 200, 200);
			background: transparent;
		}
		.financial-table td {
			padding: 4px; /* Match English: cellPadding: 4 */
			border: 0.3px solid rgb(200, 200, 200);
			background: transparent;
		}
		.financial-table .label-col {
			font-weight: bold;
			text-align: ${isRTL ? 'right' : 'left'};
			width: 50%;
		}
		.financial-table .value-col {
			text-align: ${isRTL ? 'left' : 'right'};
			font-weight: bold;
		}
		.terms-table {
			width: 100%;
			border-collapse: collapse;
			margin: 4px 0; /* Match English: yPos += 4 after title */
			font-size: 8px; /* Match English: doc.setFontSize(8) */
			border: 0.3px solid rgb(200, 200, 200);
			background: transparent;
		}
		.terms-table td {
			padding: 4px; /* Match English: cellPadding: 4 */
			border: 0.3px solid rgb(200, 200, 200);
			background: transparent;
			white-space: nowrap; /* Keep terms on one line */
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.terms-table .term-label-col {
			font-weight: bold;
			text-align: ${isRTL ? 'right' : 'left'};
			width: 50mm;
		}
		.terms-table .term-value-col {
			text-align: ${isRTL ? 'right' : 'left'};
		}
		.footer-info {
			margin-top: 0; /* Match English: spacing handled by yPos */
			font-size: 10px; /* Match English: doc.setFontSize(10) */
		}
		.footer-row {
			margin: 4px 0; /* Match English: spacing between rows */
		}
	</style>
</head>
<body>
	${
		letterheadBase64
			? `
	<!-- Letterhead images covering FULL page at each page boundary - Match English: letterhead at (0, 0) full page -->
	<!-- Positioned fixed to cover entire page background including margins -->
	<div class="letterhead-page" style="top: 0mm;">
		<img src="${letterheadBase64}" alt="Letterhead" />
	</div>
	<div class="letterhead-page" style="top: 297mm;">
		<img src="${letterheadBase64}" alt="Letterhead" />
	</div>
	<div class="letterhead-page" style="top: 594mm;">
		<img src="${letterheadBase64}" alt="Letterhead" />
	</div>
	<div class="letterhead-page" style="top: 891mm;">
		<img src="${letterheadBase64}" alt="Letterhead" />
	</div>
	<div class="letterhead-page" style="top: 1188mm;">
		<img src="${letterheadBase64}" alt="Letterhead" />
	</div>
	<div class="letterhead-page" style="top: 1485mm;">
		<img src="${letterheadBase64}" alt="Letterhead" />
	</div>
	<div class="letterhead-page" style="top: 1782mm;">
		<img src="${letterheadBase64}" alt="Letterhead" />
	</div>
	<div class="letterhead-page" style="top: 2079mm;">
		<img src="${letterheadBase64}" alt="Letterhead" />
	</div>
	`
			: ''
	}
	<div class="page-wrapper">
		<div class="content">
		<div class="info-section">
			<div class="info-row">
				<span class="label">${t.date}:</span>
				<span>${new Date(offer.createdAt).toLocaleDateString('en-GB')}</span>
			</div>
			<div class="info-row">
				<span class="label">${t.dearClient},</span>
				<span>${offer.clientName}</span>
			</div>
		</div>
		
		<div style="margin: 8px 0; font-size: 10px;">${t.documentTitle}</div>
		
		<div class="section-title">${t.productsEquipment}</div>
		
		${
			equipmentWithImages.length > 0
				? `
			<!-- Product table header -->
			<div class="product-header">
				<div class="product-header-cell">${t.productName}</div>
				<div class="product-header-cell"></div>
				<div class="product-header-cell">${t.provider} / ${t.country}</div>
				<div class="product-header-cell">${t.price}</div>
			</div>
			<!-- Product rows -->
			<div class="product-grid">
				${equipmentWithImages
					.map(
						(eq: any) => `
					<div class="product-card">
						<!-- Column 1: Name, Description & Model -->
						<div class="product-col product-col1">
							<div class="product-name">${eq.name || eq.Name || 'N/A'}</div>
							<div class="product-desc">${eq.description || eq.Description || ''}</div>
							<div class="product-model">${eq.model || eq.Model || 'N/A'}</div>
						</div>
						<!-- Column 2: Image only -->
						<div class="product-col product-col2">
							${
								eq.imageBase64
									? `<img src="${eq.imageBase64}" class="product-image" alt="Product" />`
									: `<div style="width: 100%; height: 40mm; border: 0.5px solid rgb(200, 200, 200); display: flex; align-items: center; justify-content: center; color: rgb(150, 150, 150); font-size: 6px;">${t.noImage}</div>`
							}
						</div>
						<!-- Column 3: Provider & Country -->
						<div class="product-col product-col3">
							<div class="product-provider">${
								eq.provider ||
								eq.Provider ||
								eq.manufacturer ||
								eq.Manufacturer ||
								'N/A'
							}</div>
							<div class="product-country">${eq.country || eq.Country || 'N/A'}</div>
						</div>
						<div class="product-col product-col4">
							<div class="product-price">${(eq.priceValue || 0).toLocaleString('en-US')} ${
							lang === 'ar'
								? 'جنيه'
								: 'EGP'
						}</div>
						</div>
					</div>
				`
					)
					.join('')}
			</div>
		`
				: `<p>${offer.products}</p>`
		}
		
		<div class="section-title">${t.financialSummary}</div>
		<table class="financial-table">
			<tr>
				<td class="label-col">${t.subtotal}</td>
				<td class="value-col">${offer.totalAmount.toLocaleString('en-US')} جنيه</td>
			</tr>
			${
				offer.discountAmount && offer.discountAmount > 0
					? `
			<tr>
				<td class="label-col">${t.discount}</td>
				<td class="value-col">- ${offer.discountAmount.toLocaleString(
					'en-US'
				)} جنيه</td>
			</tr>
			`
					: ''
			}
			<tr>
				<td class="label-col">${t.totalAmount}</td>
				<td class="value-col">${(
					offer.totalAmount -
					(offer.discountAmount || 0)
				).toLocaleString('en-US')} جنيه</td>
			</tr>
		</table>
		
		${
			offer.paymentTerms ||
			offer.deliveryTerms ||
			offer.warrantyTerms
				? `
		<div class="section-title">${t.termsConditions}</div>
		<table class="terms-table">
			${
				offer.paymentTerms
					? `
			<tr>
				<td class="term-label-col">${t.paymentTerms}</td>
				<td class="term-value-col">${offer.paymentTerms}</td>
			</tr>
			`
					: ''
			}
			${
				offer.deliveryTerms
					? `
			<tr>
				<td class="term-label-col">${t.deliveryTerms}</td>
				<td class="term-value-col">${offer.deliveryTerms}</td>
			</tr>
			`
					: ''
			}
			${
				offer.warrantyTerms
					? `
			<tr>
				<td class="term-label-col">${t.warranty}</td>
				<td class="term-value-col">${offer.warrantyTerms}</td>
			</tr>
			`
					: ''
			}
		</table>
		`
				: ''
		}
		
		<div class="footer-info">
			<div class="footer-row">
				<span class="label">${t.validUntil}:</span>
				<span>${new Date(offer.validUntil).toLocaleDateString('en-GB')}</span>
			</div>
			<div class="footer-row">
				<span class="label">${t.salesman}:</span>
				<span>${offer.assignedToName || 'N/A'}</span>
			</div>
		</div>
		</div>
	</div>
</body>
</html>
	`;
}

// Download PDF
export const downloadOfferPDF = async (
	offer: OfferData,
	options: PDFExportOptions = {}
) => {
	// Use HTML2PDF for Arabic (proper Arabic rendering) but with identical layout to English
	if (options.language === 'ar') {
		const htmlContent = await generateOfferHTML(offer, 'ar');
		const opt = {
			margin: [0, 0, 0, 0] as [
				number,
				number,
				number,
				number
			],
			filename: `Offer_${offer.id}_${offer.clientName}_AR.pdf`,
			image: { type: 'jpeg' as const, quality: 0.98 },
			html2canvas: {
				scale: 2,
				useCORS: true,
				letterRendering: true,
				logging: false,
				backgroundColor: null,
				allowTaint: true,
			},
			jsPDF: {
				unit: 'mm',
				format: 'a4',
				orientation: 'portrait' as const,
			},
			pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
		};
		await html2pdf().set(opt).from(htmlContent).save();
		return;
	}

	// Use jsPDF for English
	if (options.generateBothLanguages) {
		// Generate both Arabic and English versions
		const htmlContentAr = await generateOfferHTML(offer, 'ar');
		const optAr = {
			margin: [0, 0, 0, 0] as [
				number,
				number,
				number,
				number
			],
			filename: `Offer_${offer.id}_${offer.clientName}_AR.pdf`,
			image: { type: 'jpeg' as const, quality: 0.98 },
			html2canvas: {
				scale: 2,
				useCORS: true,
				letterRendering: true,
				logging: false,
			},
			jsPDF: {
				unit: 'mm',
				format: 'a4',
				orientation: 'portrait' as const,
			},
			pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
		};
		await html2pdf().set(optAr).from(htmlContentAr).save();

		// Small delay before generating English version
		setTimeout(async () => {
			const docEn = await generateOfferPDF(offer, {
				...options,
				language: 'en',
				generateBothLanguages: false,
			});
			docEn.save(
				`Offer_${offer.id}_${offer.clientName}_EN.pdf`
			);
		}, 1000);
	} else {
		// Single language export (English)
		const doc = await generateOfferPDF(offer, options);
		doc.save(`Offer_${offer.id}_${offer.clientName}_EN.pdf`);
	}
};

// Get PDF as Blob (for sharing)
export const getOfferPDFBlob = async (
	offer: OfferData,
	options: PDFExportOptions = {}
): Promise<Blob> => {
	const doc = await generateOfferPDF(offer, options);
	return doc.output('blob');
};

// Get PDF as Base64 (for mobile)
export const getOfferPDFBase64 = async (
	offer: OfferData,
	options: PDFExportOptions = {}
): Promise<string> => {
	const doc = await generateOfferPDF(offer, options);
	return doc.output('dataurlstring');
};
