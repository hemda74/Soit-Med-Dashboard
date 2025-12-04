import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import letterheadPdfUrl from '@/assets/Letterhead.pdf?url';
import letterheadPngUrl from '@/assets/Letterhead.png?url';
import { getStaticFileUrl } from '@/utils/apiConfig';
import {
	downloadOfferPdfFromHtml,
	getOfferPdfBlobFromHtml,
	type HtmlPdfExportOptions,
} from '@/utils/pdfGeneratorHtml';
// @ts-ignore - arabic-reshaper doesn't have type definitions
import arabicReshaper from 'arabic-reshaper';

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
	providerImagePath?: string | null; // Provider logo/image path
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

export type PDFRenderingMode = 'jspdf' | 'html' | 'both';

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
	// Rendering strategy
	renderingMode?: PDFRenderingMode;
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

let cachedLetterheadImage: string | null | undefined;
async function getLetterheadImage(): Promise<string | null> {
	if (cachedLetterheadImage !== undefined) {
		return cachedLetterheadImage;
	}
	let base64: string | null = null;
	if (letterheadPngUrl) {
		base64 = await loadImageAsBase64(letterheadPngUrl);
	}
	if (!base64) {
		base64 = await convertPdfToImage(letterheadPdfUrl);
	}
	cachedLetterheadImage = base64;
	return base64;
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

		// Validate blob type
		if (!blob.type || !blob.type.startsWith('image/')) {
			console.warn(
				'Invalid image blob type:',
				blob.type,
				'for URL:',
				imageUrl
			);
			// Still try to process it, might be a valid image with wrong MIME type
		}

		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				const result = reader.result as string;
				// Validate the result is a proper data URL
				if (
					result &&
					result.startsWith('data:image/') &&
					result.includes('base64,')
				) {
					// Verify base64 data is not empty
					const base64Part = result.split(',')[1];
					if (
						base64Part &&
						base64Part.length > 0
					) {
						resolve(result);
					} else {
						console.warn(
							'Empty base64 data in image result for:',
							imageUrl
						);
						resolve(null);
					}
				} else {
					console.warn(
						'Invalid data URL format for:',
						imageUrl,
						'Result:',
						result?.substring(0, 50)
					);
					resolve(null);
				}
			};
			reader.onerror = (error) => {
				console.warn(
					'FileReader error loading image:',
					imageUrl,
					error
				);
				resolve(null);
			};
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.warn('Error loading image:', error, 'URL:', imageUrl);
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
	const opts: Required<Omit<PDFExportOptions, 'renderingMode'>> = {
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
			'  Using Helvetica for Arabic (with reshaping & reverse)'
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
		letterheadImage = await getLetterheadImage();
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

	doc.setFontSize(12); // Increased font size for date section
	setFontForLanguage(doc, lang, 'normal');
	doc.setTextColor(...secondaryColor);

	if (isRTL) {
		// Arabic: value first, then label
		const dateValueX = margins.left - 30;
		const dateLabelX = margins.left - 30;
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
		const dateValueX = margins.left + 13;
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

		// VERIFICATION: Log equipment data before processing
		console.log(
			'=== PDF GENERATOR: Equipment Data Verification ==='
		);
		console.log(
			'Total equipment items:',
			offer.equipment?.length || 0
		);
		if (offer.equipment && offer.equipment.length > 0) {
			offer.equipment.forEach((eq: any, index: number) => {
				const allKeys = Object.keys(eq);
				const allValues = allKeys.reduce(
					(acc: any, key: string) => {
						acc[key] = eq[key];
						return acc;
					},
					{}
				);
				console.log(`Equipment ${index + 1}:`, {
					name: eq.name || eq.Name,
					provider: eq.provider || eq.Provider,
					providerImagePath:
						eq.providerImagePath ||
						eq.ProviderImagePath ||
						eq.providerLogoPath ||
						eq.ProviderLogoPath ||
						'NOT FOUND',
					imagePath:
						eq.imagePath ||
						eq.ImagePath ||
						'NOT FOUND',
					allKeys: allKeys,
					allValues: allValues,
				});
			});
		}
		console.log('=== END VERIFICATION ===');

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

				// Get providerImagePath from multiple possible field names
				const providerImagePath =
					eq.providerImagePath ||
					eq.ProviderImagePath ||
					eq.providerLogoPath ||
					eq.ProviderLogoPath ||
					undefined;

				console.log(
					`[${
						eq.name || 'Unknown'
					}] Provider image path check:`,
					{
						providerImagePath:
							providerImagePath ||
							'NOT FOUND',
						hasProviderImagePath:
							!!providerImagePath,
						providerImagePathType:
							typeof providerImagePath,
						allProviderFields: {
							providerImagePath:
								eq.providerImagePath,
							ProviderImagePath:
								eq.ProviderImagePath,
							providerLogoPath:
								eq.providerLogoPath,
							ProviderLogoPath:
								eq.ProviderLogoPath,
						},
					}
				);

				let providerImageBase64 = null;

				// Try to load provider logo if path exists and is not a placeholder
				if (
					providerImagePath &&
					typeof providerImagePath === 'string' &&
					providerImagePath.trim() !== '' &&
					!providerImagePath.includes(
						'placeholder'
					)
				) {
					// Skip SVG files as jsPDF doesn't support them directly
					if (
						providerImagePath
							.toLowerCase()
							.endsWith('.svg')
					) {
						console.warn(
							`Skipping SVG provider logo for ${
								eq.name ||
								'product'
							}: SVG format not supported in jsPDF`
						);
						providerImageBase64 = null;
					} else {
						try {
							const providerImageUrl =
								getImageUrl(
									providerImagePath
								);
							console.log(
								`Loading provider logo for ${
									eq.name ||
									'product'
								}: ${providerImageUrl} (from path: ${providerImagePath})`
							);
							providerImageBase64 =
								await loadImageAsBase64(
									providerImageUrl
								);

							if (
								!providerImageBase64
							) {
								console.warn(
									`Failed to load provider logo for ${
										eq.name ||
										'product'
									}: ${providerImagePath} (URL: ${providerImageUrl})`
								);
							} else {
								console.log(
									`Successfully loaded provider logo for ${
										eq.name ||
										'product'
									} (${providerImageBase64.substring(
										0,
										50
									)}...)`
								);
							}
						} catch (error) {
							console.error(
								`Error loading provider logo for ${
									eq.name ||
									'product'
								}:`,
								error,
								providerImagePath
							);
							providerImageBase64 =
								null;
						}
					}
				} else {
					console.log(
						`No provider logo path for ${
							eq.name || 'product'
						}:`,
						providerImagePath ||
							'null/undefined'
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
					providerImagePath:
						eq.providerImagePath ||
						eq.ProviderImagePath ||
						eq.providerLogoPath ||
						eq.ProviderLogoPath ||
						undefined,
					providerImageBase64,
				};

				return normalized;
			})
		);

		// VERIFICATION: Log after image loading
		console.log('=== PDF GENERATOR: After Image Loading ===');
		equipmentWithImages.forEach((eq: any, index: number) => {
			console.log(`Equipment ${index + 1} (${eq.name}):`, {
				hasProductImage: !!eq.imageBase64,
				hasProviderLogo: !!eq.providerImageBase64,
				providerImagePath:
					eq.providerImagePath || 'NOT SET',
				providerImageBase64Length:
					eq.providerImageBase64?.length || 0,
			});
		});

		// PROVIDER IMAGE VERIFICATION SUMMARY
		console.log('=== PROVIDER IMAGE VERIFICATION SUMMARY ===');
		const providerImageStatus = equipmentWithImages.map(
			(eq: any) => {
				const status = {
					productName: eq.name || 'Unknown',
					provider: eq.provider || 'N/A',
					hasProviderImagePath:
						!!eq.providerImagePath,
					providerImagePath:
						eq.providerImagePath ||
						'NOT SET',
					hasProviderImageBase64:
						!!eq.providerImageBase64,
					providerImageBase64Length:
						eq.providerImageBase64
							?.length || 0,
					status: eq.providerImageBase64
						? '  LOADED'
						: eq.providerImagePath
						? '❌ FAILED TO LOAD'
						: '⚠️ NO PATH PROVIDED',
				};
				return status;
			}
		);

		console.table(providerImageStatus);

		const loadedCount = providerImageStatus.filter(
			(s) => s.hasProviderImageBase64
		).length;
		const failedCount = providerImageStatus.filter(
			(s) =>
				s.hasProviderImagePath &&
				!s.hasProviderImageBase64
		).length;
		const noPathCount = providerImageStatus.filter(
			(s) => !s.hasProviderImagePath
		).length;

		console.log(`📊 Provider Image Summary:`);
		console.log(
			`     Successfully loaded: ${loadedCount}/${equipmentWithImages.length}`
		);
		console.log(
			`   ❌ Failed to load: ${failedCount}/${equipmentWithImages.length}`
		);
		console.log(
			`   ⚠️  No path provided: ${noPathCount}/${equipmentWithImages.length}`
		);
		console.log('=== END VERIFICATION ===');

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

				// VERIFICATION: Log before rendering provider section
				console.log(
					`[PDF RENDER] Equipment: ${eq.name}`,
					{
						provider: providerText,
						hasProviderImageBase64:
							!!eq.providerImageBase64,
						providerImagePath:
							eq.providerImagePath ||
							'NOT SET',
						providerImageBase64Type:
							typeof eq.providerImageBase64,
						providerImageBase64Length:
							eq.providerImageBase64
								?.length || 0,
						providerImageBase64Preview:
							eq.providerImageBase64
								? eq.providerImageBase64.substring(
										0,
										100
								  )
								: 'NONE',
					}
				);

				// Provider logo size (smaller than product image)
				const providerLogoSize = 12; // Height in mm (reduced for better fit)
				const providerLogoWidth = 15; // Width in mm (reduced for better fit)
				const logoTextSpacing = 4; // Space between logo and text

				// Calculate provider text width (accounting for logo if present)
				const textMaxWidth = eq.providerImageBase64
					? colWidth -
					  colPadding * 2 -
					  providerLogoWidth -
					  logoTextSpacing
					: colWidth - colPadding * 2;

				// English text starts from left even in RTL documents
				const col3ProviderX =
					isRTL && isProviderArabic
						? col3X + colWidth - colPadding // Right edge for RTL Arabic
						: col3X; // Left edge for LTR or English text

				// Draw provider logo if available
				if (eq.providerImageBase64) {
					try {
						let providerImageData =
							eq.providerImageBase64;

						// Detect image format from data URL and extract base64
						let imageFormat = 'PNG';
						let base64Data =
							providerImageData;

						if (
							providerImageData.startsWith(
								'data:'
							)
						) {
							// Extract format from data URL
							const formatMatch =
								providerImageData.match(
									/data:image\/([^;]+);base64,/
								);
							if (formatMatch) {
								const format =
									formatMatch[1].toUpperCase();
								if (
									format ===
										'JPEG' ||
									format ===
										'JPG'
								) {
									imageFormat =
										'JPEG';
								} else if (
									format ===
									'PNG'
								) {
									imageFormat =
										'PNG';
								} else if (
									format ===
									'GIF'
								) {
									imageFormat =
										'GIF';
								}
								// Extract just the base64 part (after the comma)
								base64Data =
									providerImageData.split(
										','
									)[1];
							} else {
								// Try to extract base64 even if format is missing
								const base64Match =
									providerImageData.match(
										/base64,(.+)/
									);
								if (
									base64Match
								) {
									base64Data =
										base64Match[1];
								}
							}
						}

						// Validate base64 data
						if (
							!base64Data ||
							base64Data.length < 100
						) {
							throw new Error(
								'Invalid or too short base64 data'
							);
						}

						// For jsPDF, we need to pass the data URL format, not just base64
						// But ensure it's properly formatted
						if (
							!providerImageData.startsWith(
								'data:'
							)
						) {
							providerImageData = `data:image/${imageFormat.toLowerCase()};base64,${base64Data}`;
						}

						const logoX =
							isRTL &&
							isProviderArabic
								? col3X +
								  colWidth -
								  colPadding -
								  providerLogoWidth
								: col3X;
						const logoY = col3Y;

						console.log(
							`[PDF RENDER] Adding provider logo for ${eq.name}:`,
							{
								logoX,
								logoY,
								width: providerLogoWidth,
								height: providerLogoSize,
								format: imageFormat,
								hasData: !!providerImageData,
								dataLength: providerImageData.length,
								dataPreview:
									providerImageData.substring(
										0,
										100
									),
								base64Length:
									base64Data?.length ||
									0,
								isDataUrl: providerImageData.startsWith(
									'data:'
								),
							}
						);

						// Validate the image data before adding
						if (
							!base64Data ||
							base64Data.trim()
								.length === 0
						) {
							throw new Error(
								'Empty base64 data'
							);
						}

						// Validate PNG signature if format is PNG (first 8 bytes of decoded base64 should be PNG signature)
						if (imageFormat === 'PNG') {
							try {
								const decoded =
									atob(
										base64Data.substring(
											0,
											12
										)
									); // First 8 bytes of PNG signature
								const pngSignature =
									[
										0x89,
										0x50,
										0x4e,
										0x47,
										0x0d,
										0x0a,
										0x1a,
										0x0a,
									];
								const isValidPNG =
									Array.from(
										decoded.slice(
											0,
											8
										)
									).every(
										(
											byte,
											i
										) =>
											byte.charCodeAt(
												0
											) ===
											pngSignature[
												i
											]
									);
								if (
									!isValidPNG
								) {
									console.warn(
										`[PDF RENDER] PNG signature validation failed for ${eq.name}, but continuing...`
									);
									// Try to detect actual format from content
									const firstBytes =
										Array.from(
											decoded.slice(
												0,
												4
											)
										).map(
											(
												b
											) =>
												b.charCodeAt(
													0
												)
										);
									if (
										firstBytes[0] ===
											0xff &&
										firstBytes[1] ===
											0xd8
									) {
										console.log(
											`[PDF RENDER] Detected JPEG format instead of PNG for ${eq.name}`
										);
										imageFormat =
											'JPEG';
									}
								}
							} catch (sigError) {
								console.warn(
									`[PDF RENDER] Could not validate PNG signature for ${eq.name}:`,
									sigError
								);
							}
						}

						// Draw a border around logo area for debugging (light gray)
						doc.setDrawColor(200, 200, 200);
						doc.setLineWidth(0.2);
						doc.rect(
							logoX,
							logoY,
							providerLogoWidth,
							providerLogoSize,
							'S'
						);

						// jsPDF addImage works best with just the base64 string (without data URL prefix)
						// and the format specified separately
						try {
							doc.addImage(
								base64Data, // Use just the base64 string, not the full data URL
								imageFormat,
								logoX,
								logoY,
								providerLogoWidth,
								providerLogoSize,
								undefined,
								'SLOW'
							);
						} catch (addImageError) {
							// If base64-only fails, try with data URL as fallback
							console.warn(
								`[PDF RENDER] Failed with base64 only, trying data URL:`,
								addImageError
							);
							try {
								doc.addImage(
									providerImageData, // Full data URL
									imageFormat,
									logoX,
									logoY,
									providerLogoWidth,
									providerLogoSize,
									undefined,
									'SLOW'
								);
							} catch (dataUrlError) {
								throw new Error(
									`Both base64 and data URL formats failed. Base64 error: ${
										addImageError instanceof
										Error
											? addImageError.message
											: String(
													addImageError
											  )
									}. Data URL error: ${
										dataUrlError instanceof
										Error
											? dataUrlError.message
											: String(
													dataUrlError
											  )
									}`
								);
							}
						}

						// Adjust text position to account for logo
						const textX =
							isRTL &&
							isProviderArabic
								? col3ProviderX -
								  providerLogoWidth -
								  logoTextSpacing
								: col3X +
								  providerLogoWidth +
								  logoTextSpacing;

						doc.setFontSize(10);
						setFontForLanguage(
							doc,
							lang,
							'bold'
						);
						doc.setTextColor(30, 30, 30);
						let processedProviderText =
							providerText;
						if (isRTL && isProviderArabic) {
							processedProviderText =
								prepareArabicText(
									processedProviderText
								);
						}
						const providerLines =
							doc.splitTextToSize(
								processedProviderText,
								textMaxWidth
							);
						const processedProviderLines =
							isRTL &&
							isProviderArabic
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
							textX,
							col3Y +
								providerLogoSize /
									2 -
								(providerLines.length *
									5) /
									2,
							{
								maxWidth: textMaxWidth,
								align: getTextAlignmentForContent(
									providerText,
									isRTL
								),
							}
						);
						col3Y +=
							Math.max(
								providerLogoSize,
								providerLines.length *
									5
							) + 8;
						console.log(
							`[PDF RENDER]   Successfully added provider logo for ${eq.name}`
						);
					} catch (error) {
						console.error(
							`[PDF RENDER] ❌ Error adding provider logo for ${eq.name}:`,
							error,
							{
								providerImagePath:
									eq.providerImagePath,
								imageDataLength:
									eq
										.providerImageBase64
										?.length,
								errorMessage:
									error instanceof
									Error
										? error.message
										: String(
												error
										  ),
							}
						);
						// Draw placeholder rectangle to show where logo should be (for debugging)
						const logoX =
							isRTL &&
							isProviderArabic
								? col3X +
								  colWidth -
								  colPadding -
								  providerLogoWidth
								: col3X;
						const logoY = col3Y;
						doc.setDrawColor(255, 0, 0); // Red border for debugging
						doc.setLineWidth(0.5);
						doc.rect(
							logoX,
							logoY,
							providerLogoWidth,
							providerLogoSize,
							'S'
						);
						doc.setFontSize(5);
						doc.setTextColor(255, 0, 0);
						doc.text(
							'LOGO ERROR',
							logoX +
								providerLogoWidth /
									2,
							logoY +
								providerLogoSize /
									2,
							{ align: 'center' }
						);
						// Set providerImageBase64 to null so text-only rendering happens
						eq.providerImageBase64 = null;
					}
				} else {
					console.log(
						`[PDF RENDER] ⚠️ No provider logo base64 for ${eq.name}`,
						{
							hasProviderImagePath:
								!!eq.providerImagePath,
							providerImagePath:
								eq.providerImagePath ||
								'NOT SET',
							providerImageBase64:
								eq.providerImageBase64 ||
								'NOT SET',
						}
					);
				}

				// If no logo or logo failed, render text only
				if (!eq.providerImageBase64) {
					doc.setFontSize(10);
					setFontForLanguage(doc, lang, 'bold');
					doc.setTextColor(30, 30, 30);
					let processedProviderText =
						providerText;
					if (isRTL && isProviderArabic) {
						processedProviderText =
							prepareArabicText(
								processedProviderText
							);
					}
					const providerLines =
						doc.splitTextToSize(
							processedProviderText,
							colWidth -
								colPadding * 2
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

		// FINAL VERIFICATION: Provider images rendered in PDF
		console.log(
			'=== FINAL PROVIDER IMAGE RENDERING VERIFICATION ==='
		);
		const renderedStatus = equipmentWithImages.map((eq: any) => {
			const wasRendered =
				eq.providerImageBase64 !== null &&
				eq.providerImageBase64 !== undefined;
			return {
				productName: eq.name || 'Unknown',
				provider: eq.provider || 'N/A',
				hadImageBase64: !!eq.providerImageBase64,
				renderedInPDF: wasRendered ? '  YES' : '❌ NO',
				reason: wasRendered
					? 'Image was available and rendered'
					: eq.providerImagePath
					? 'Image path provided but failed to load'
					: 'No image path provided',
			};
		});
		console.table(renderedStatus);
		const renderedCount = renderedStatus.filter(
			(s) => s.hadImageBase64
		).length;
		console.log(
			`📊 Final Summary: ${renderedCount}/${equipmentWithImages.length} provider images rendered in PDF`
		);
		console.log('=== END FINAL VERIFICATION ===');

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

	// Footer - check if we need a new page respecting 20% bottom margin
	// Add Valid Until and Salesman at the bottom of content (last content before page numbers)
	// Check if we need a new page
	if (yPos > contentEndY - 30) {
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

	// Position Valid Until and Salesman at the bottom of content area
	// Calculate position to be near the bottom but within content area
	const bottomYPos = contentEndY - 20; // Position near bottom of content area
	yPos = bottomYPos;

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

const DEFAULT_RENDERING_MODE: PDFRenderingMode = 'both';

function shouldUseJsPdf(mode?: PDFRenderingMode): boolean {
	return !mode || mode === 'jspdf' || mode === 'both';
}

function shouldUseHtml(mode?: PDFRenderingMode): boolean {
	return mode === 'html' || mode === 'both';
}

function normalizeLanguages(options: PDFExportOptions): PDFLanguage[] {
	if (options.generateBothLanguages) {
		return ['ar', 'en'];
	}
	return [options.language || 'en'];
}

function mapToHtmlOptions(
	options: PDFExportOptions,
	extra?: Partial<HtmlPdfExportOptions>
): HtmlPdfExportOptions {
	return {
		language: options.language,
		generateBothLanguages: false,
		showProductHeaders: options.showProductHeaders,
		showModel: options.showModel,
		showProvider: options.showProvider,
		showCountry: options.showCountry,
		showDescription: options.showDescription,
		showImage: options.showImage,
		showPrice: options.showPrice,
		customDescriptions: options.customDescriptions,
		...extra,
	};
}

function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			if (typeof reader.result === 'string') {
				resolve(reader.result);
			} else {
				reject(
					new Error('Failed to convert blob to base64 string')
				);
			}
		};
		reader.onerror = () =>
			reject(
				reader.error ||
					new Error('Unknown error converting blob to base64')
			);
		reader.readAsDataURL(blob);
	});
}

// Download PDF
export const downloadOfferPDF = async (
	offer: OfferData,
	options: PDFExportOptions = {}
) => {
	const renderingMode = options.renderingMode || DEFAULT_RENDERING_MODE;
	const languages = normalizeLanguages(options);
	const useJsPdf = shouldUseJsPdf(renderingMode);
	const useHtml = shouldUseHtml(renderingMode);

	// Legacy jsPDF generation
	if (useJsPdf) {
		for (const lang of languages) {
			const doc = await generateOfferPDF(offer, {
				...options,
				language: lang,
				generateBothLanguages: false,
			});
			const langSuffix = lang === 'ar' ? 'AR' : 'EN';
			const approachSuffix = useHtml ? '_JSPDF' : '';
			doc.save(
				`Offer_${offer.id}_${offer.clientName}_${langSuffix}${approachSuffix}.pdf`
			);
		}
	}

	// HTML-first generation (canvas + jsPDF)
	if (useHtml) {
		for (const lang of languages) {
			await downloadOfferPdfFromHtml(
				offer,
				mapToHtmlOptions(
					{ ...options, language: lang, generateBothLanguages: false },
					{ filenameSuffix: useJsPdf ? 'HTML' : undefined }
				)
			);
		}
	}
};

// Get PDF as Blob (for sharing)
export const getOfferPDFBlob = async (
	offer: OfferData,
	options: PDFExportOptions = {}
): Promise<Blob> => {
	if (options.renderingMode === 'html') {
		return getOfferPdfBlobFromHtml(
			offer,
			mapToHtmlOptions({ ...options, generateBothLanguages: false })
		);
	}
	const doc = await generateOfferPDF(offer, options);
	return doc.output('blob');
};

// Get PDF as Base64 (for mobile)
export const getOfferPDFBase64 = async (
	offer: OfferData,
	options: PDFExportOptions = {}
): Promise<string> => {
	if (options.renderingMode === 'html') {
		const blob = await getOfferPdfBlobFromHtml(
			offer,
			mapToHtmlOptions({ ...options, generateBothLanguages: false })
		);
		return blobToBase64(blob);
	}
	const doc = await generateOfferPDF(offer, options);
	return doc.output('dataurlstring');
};
