/**
 * HTML-based PDF Generator
 *
 * Uses HTML templates and browser rendering for PDF generation.
 * This approach provides:
 * - WYSIWYG editing - preview exactly what will be printed
 * - Easy styling with CSS
 * - Better support for complex layouts
 * - Native print dialog integration
 */

import type { PDFLanguage } from '@/components/print/OfferPrintTemplate';
import letterheadPdfUrl from '@/assets/Letterhead.pdf?url';
import letterheadPngUrl from '@/assets/Letterhead.png?url';

/**
 * Convert PDF to image using PDF.js
 */
async function convertPdfToImage(pdfUrl: string): Promise<string | null> {
	try {
		const pdfjsLib = await import('pdfjs-dist');

		// Set worker source
		const pdfjsWorker = await import(
			'pdfjs-dist/build/pdf.worker.min.mjs?url'
		);
		pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

		// Load PDF
		const loadingTask = pdfjsLib.getDocument(pdfUrl);
		const pdf = await loadingTask.promise;

		// Get first page
		const page = await pdf.getPage(1);

		// Set scale for ultra high quality (600 DPI equivalent)
		const scale = 5.0;
		const viewport = page.getViewport({ scale });

		// Create canvas
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Failed to get canvas context');
		}

		canvas.width = viewport.width;
		canvas.height = viewport.height;

		// Enable image smoothing for better quality
		context.imageSmoothingEnabled = true;
		context.imageSmoothingQuality = 'high';

		// Render PDF page to canvas
		const renderContext = {
			canvasContext: context,
			viewport: viewport,
			canvas: canvas,
		};

		await page.render(renderContext).promise;

		// Convert to base64 with maximum quality
		return canvas.toDataURL('image/png', 1.0);
	} catch (error) {
		console.error('Error converting PDF to image:', error);
		return null;
	}
}

/**
 * Load image as base64
 */
async function loadImageAsBase64(imageUrl: string): Promise<string | null> {
	try {
		const response = await fetch(imageUrl);
		const blob = await response.blob();
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () =>
				resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.error('Error loading image:', error);
		return null;
	}
}

/**
 * Get letterhead as base64 image
 * Tries PNG first, falls back to converting PDF
 */
let cachedLetterheadImage: string | null | undefined;
async function getLetterheadImage(): Promise<string | null> {
	if (cachedLetterheadImage !== undefined) {
		return cachedLetterheadImage;
	}

	let base64: string | null = null;

	// Try PNG first
	if (letterheadPngUrl) {
		base64 = await loadImageAsBase64(letterheadPngUrl);
	}

	// Fall back to converting PDF
	if (!base64 && letterheadPdfUrl) {
		base64 = await convertPdfToImage(letterheadPdfUrl);
	}

	cachedLetterheadImage = base64;
	return base64;
}

// Types matching the existing pdfGenerator
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
	providerImagePath?: string | null;
	customDescription?: string;
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
	equipment?: OfferEquipment[];
}

export interface HtmlPdfExportOptions {
	language?: PDFLanguage;
	generateBothLanguages?: boolean;
	showProductHeaders?: boolean;
	showModel?: boolean;
	showProvider?: boolean;
	showCountry?: boolean;
	showDescription?: boolean;
	showImage?: boolean;
	showPrice?: boolean;
	customDescriptions?: Record<number, string>;
	filenameSuffix?: string;
}

/**
 * Opens a new window with the print template and triggers print dialog
 * This is the simplest approach - uses the browser's native PDF export
 */
export async function printOfferHtml(
	offer: OfferData,
	options: HtmlPdfExportOptions = {}
): Promise<void> {
	const printWindow = window.open('', '_blank', 'width=800,height=1000');
	if (!printWindow) {
		throw new Error(
			'Failed to open print window. Please allow popups.'
		);
	}

	// Get letterhead image first
	const letterheadImage = await getLetterheadImage();
	const htmlContent = generatePrintHtml(
		offer,
		options,
		false,
		letterheadImage
	);

	printWindow.document.write(htmlContent);
	printWindow.document.close();

	// Wait for images to load, then print
	printWindow.onload = () => {
		setTimeout(() => {
			printWindow.print();
		}, 500);
	};
}

/**
 * Opens a preview window without triggering print
 * Useful for reviewing the document before printing
 */
export async function previewOfferHtml(
	offer: OfferData,
	options: HtmlPdfExportOptions = {}
): Promise<Window | null> {
	const previewWindow = window.open(
		'',
		'_blank',
		'width=900,height=1100'
	);
	if (!previewWindow) {
		console.error('Failed to open preview window');
		return null;
	}

	// Get letterhead image first
	const letterheadImage = await getLetterheadImage();
	const htmlContent = generatePrintHtml(
		offer,
		options,
		true,
		letterheadImage
	);

	previewWindow.document.write(htmlContent);
	previewWindow.document.close();

	return previewWindow;
}

/**
 * Downloads PDF using html2canvas and jsPDF
 * This provides programmatic PDF generation without print dialog
 */
export async function downloadOfferPdfFromHtml(
	offer: OfferData,
	options: HtmlPdfExportOptions = {}
): Promise<void> {
	// Dynamic imports for better code splitting
	const [{ default: html2canvas }, { default: jsPDF }] =
		await Promise.all([import('html2canvas'), import('jspdf')]);

	// Get letterhead image first
	const letterheadImage = await getLetterheadImage();

	// Create a hidden container for rendering
	const container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.left = '-9999px';
	container.style.top = '0';
	container.style.width = '210mm';
	container.innerHTML = generatePrintHtmlBody(
		offer,
		options,
		letterheadImage
	);
	document.body.appendChild(container);

	const element = container.querySelector(
		'.offer-print-container'
	) as HTMLElement;
	if (!element) {
		document.body.removeChild(container);
		throw new Error('Failed to create print element');
	}

	try {
		// Wait for images to load
		await waitForImages(element);

		// Find all product pages
		const productPages = element.querySelectorAll(
			'.product-page'
		) as NodeListOf<HTMLElement>;

		if (productPages.length === 0) {
			throw new Error('No product pages found');
		}

		// Create PDF
		const pdf = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a4',
		});

		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();

		// Render each page separately
		for (let i = 0; i < productPages.length; i++) {
			const pageElement = productPages[i];

			// Render this page to canvas
			// Ensure the page element has fixed dimensions for proper letterhead coverage
			pageElement.style.width = '210mm';
			pageElement.style.height = '297mm';
			pageElement.style.minHeight = '297mm';

			const canvas = await html2canvas(pageElement, {
				scale: 2, // Higher quality
				useCORS: true,
				allowTaint: true,
				backgroundColor: '#ffffff',
				width: 794, // A4 width in pixels at 96 DPI
				height: 1123, // A4 height in pixels at 96 DPI
				windowWidth: 794,
				windowHeight: 1123,
			});

			// Add new page if not the first one
			if (i > 0) {
				pdf.addPage();
			}

			// Add image to PDF
			const imgData = canvas.toDataURL('image/png');
			pdf.addImage(
				imgData,
				'PNG',
				0,
				0,
				pageWidth,
				pageHeight
			);
		}

		// Generate filename
		const langSuffix = options.language === 'ar' ? 'AR' : 'EN';
		const extraSuffix = options.filenameSuffix
			? `_${options.filenameSuffix}`
			: '';
		const filename = `Offer_${offer.id}_${offer.clientName}_${langSuffix}${extraSuffix}.pdf`;

		pdf.save(filename);
	} finally {
		document.body.removeChild(container);
	}
}

/**
 * Returns the offer as a Blob for sharing/uploading
 */
export async function getOfferPdfBlobFromHtml(
	offer: OfferData,
	options: HtmlPdfExportOptions = {}
): Promise<Blob> {
	const [{ default: html2canvas }, { default: jsPDF }] =
		await Promise.all([import('html2canvas'), import('jspdf')]);

	// Get letterhead image first
	const letterheadImage = await getLetterheadImage();

	const container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.left = '-9999px';
	container.style.top = '0';
	container.style.width = '210mm';
	container.innerHTML = generatePrintHtmlBody(
		offer,
		options,
		letterheadImage
	);
	document.body.appendChild(container);

	const element = container.querySelector(
		'.offer-print-container'
	) as HTMLElement;
	if (!element) {
		document.body.removeChild(container);
		throw new Error('Failed to create print element');
	}

	try {
		await waitForImages(element);

		// Find all product pages
		const productPages = element.querySelectorAll(
			'.product-page'
		) as NodeListOf<HTMLElement>;

		if (productPages.length === 0) {
			throw new Error('No product pages found');
		}

		const pdf = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a4',
		});

		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();

		// Render each page separately
		for (let i = 0; i < productPages.length; i++) {
			const pageElement = productPages[i];

			// Render this page to canvas
			// Ensure the page element has fixed dimensions for proper letterhead coverage
			pageElement.style.width = '210mm';
			pageElement.style.height = '297mm';
			pageElement.style.minHeight = '297mm';

			const canvas = await html2canvas(pageElement, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				backgroundColor: '#ffffff',
				width: 794, // A4 width in pixels at 96 DPI
				height: 1123, // A4 height in pixels at 96 DPI
				windowWidth: 794,
				windowHeight: 1123,
			});

			// Add new page if not the first one
			if (i > 0) {
				pdf.addPage();
			}

			// Add image to PDF
			const imgData = canvas.toDataURL('image/png');
			pdf.addImage(
				imgData,
				'PNG',
				0,
				0,
				pageWidth,
				pageHeight
			);
		}

		return pdf.output('blob');
	} finally {
		document.body.removeChild(container);
	}
}

/**
 * Helper: Wait for all images in an element to load
 */
function waitForImages(element: HTMLElement): Promise<void> {
	const images = element.querySelectorAll('img');
	const promises = Array.from(images).map((img) => {
		if (img.complete) return Promise.resolve();
		return new Promise<void>((resolve) => {
			img.onload = () => resolve();
			img.onerror = () => resolve(); // Resolve even on error
		});
	});
	return Promise.all(promises).then(() => {});
}

/**
 * Generates the complete HTML document for printing
 */
function generatePrintHtml(
	offer: OfferData,
	options: HtmlPdfExportOptions,
	includePreviewControls: boolean = false,
	letterheadImage: string | null = null
): string {
	const lang = options.language || 'en';
	const isRTL = lang === 'ar';

	return `<!DOCTYPE html>
<html lang="${lang}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Offer #${offer.id} - ${offer.clientName}</title>
	${includePreviewControls ? getPreviewStyles() : ''}
	${getPrintStyles(isRTL, letterheadImage)}
</head>
<body>
	${includePreviewControls ? getPreviewControls(lang) : ''}
	${generatePrintHtmlBody(offer, options, letterheadImage)}
</body>
</html>`;
}

/**
 * Generates just the body content (for embedding in React or iframe)
 */
function generatePrintHtmlBody(
	offer: OfferData,
	options: HtmlPdfExportOptions,
	letterheadImage: string | null = null
): string {
	const lang = options.language || 'en';
	const isRTL = lang === 'ar';
	const t = getTranslations(lang);

	// Default options
	const opts = {
		showProductHeaders: options.showProductHeaders !== false,
		showModel: options.showModel !== false,
		showProvider: options.showProvider !== false,
		showCountry: options.showCountry !== false,
		showDescription: options.showDescription !== false,
		showImage: options.showImage !== false,
		showPrice: options.showPrice !== false,
		customDescriptions: options.customDescriptions || {},
	};

	// Process equipment
	const equipment = (offer.equipment || []).map((eq) =>
		normalizeEquipment(eq, opts.customDescriptions)
	);

	// Calculate totals
	const totalAmount =
		typeof offer.totalAmount === 'number' ? offer.totalAmount : 0;
	const discountAmount =
		typeof offer.discountAmount === 'number'
			? offer.discountAmount
			: 0;
	const finalAmount = totalAmount - discountAmount;

	// Format helpers
	const formatCurrency = (amount: number) => {
		const formatted = amount.toLocaleString('en-US');
		return lang === 'ar' ? `${formatted} جنيه` : `${formatted} EGP`;
	};

	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString('en-GB');

	// Split products into pages (max 2 products per page)
	const productsPerPage = 2;
	const productPages: any[][] = [];
	for (let i = 0; i < equipment.length; i += productsPerPage) {
		productPages.push(equipment.slice(i, i + productsPerPage));
	}

	// Helper to build product rows for a page
	const buildProductRows = (pageProducts: any[]) =>
		pageProducts
			.map((eq) => {
				const descriptionToUse =
					eq.customDescription ||
					eq.description ||
					'';
				return `
		<tr class="product-row">
			<td class="col-product">
				<div class="product-name">${escapeHtml(eq.name)}</div>
				${
					opts.showDescription && descriptionToUse
						? `<div class="product-description">${escapeHtml(
								descriptionToUse
						  )}</div>`
						: ''
				}
				${
					opts.showModel && eq.model
						? `<div class="product-model">${escapeHtml(
								eq.model
						  )}</div>`
						: ''
				}
			</td>
			${
				opts.showImage
					? `
			<td class="col-image">
				${
					eq.imageUrl
						? `<img src="${
								eq.imageUrl
						  }" alt="${escapeHtml(
								eq.name
						  )}" class="product-image" onerror="this.style.display='none'">`
						: `<div class="no-image-placeholder"><span>${t.noImage}</span></div>`
				}
			</td>
			`
					: ''
			}
			${
				opts.showProvider || opts.showCountry
					? `
			<td class="col-provider">
				${
					opts.showProvider
						? `
				<div class="provider-info">
					${
						eq.providerImageUrl
							? `<img src="${
									eq.providerImageUrl
							  }" alt="${escapeHtml(
									eq.provider ||
										''
							  )}" class="provider-logo" onerror="this.style.display='none'">`
							: ''
					}
					<span class="provider-name">${escapeHtml(eq.provider || 'N/A')}</span>
				</div>
				`
						: ''
				}
				${
					opts.showCountry
						? `<div class="country-info">${escapeHtml(
								eq.country ||
									'N/A'
						  )}</div>`
						: ''
				}
			</td>
			`
					: ''
			}
			${
				opts.showPrice
					? `
			<td class="col-price">
				<span class="price-value">${formatCurrency(eq.price || 0)}</span>
			</td>
			`
					: ''
			}
		</tr>`;
			})
			.join('');

	// Build terms rows
	const termsRows = [
		offer.paymentTerms &&
			`<tr><td class="label">${
				t.paymentTerms
			}</td><td class="value">${escapeHtml(
				offer.paymentTerms
			)}</td></tr>`,
		offer.deliveryTerms &&
			`<tr><td class="label">${
				t.deliveryTerms
			}</td><td class="value">${escapeHtml(
				offer.deliveryTerms
			)}</td></tr>`,
		offer.warrantyTerms &&
			`<tr><td class="label">${
				t.warranty
			}</td><td class="value">${escapeHtml(
				offer.warrantyTerms
			)}</td></tr>`,
	]
		.filter(Boolean)
		.join('');

	// Build pages HTML
	const pagesHtml = productPages
		.map(
			(pageProducts, pageIndex) => `
		<div class="product-page ${pageIndex > 0 ? 'page-break' : ''}">
			<div class="page-content">
				${
					pageIndex === 0
						? `
				<header class="offer-header">
					<div class="date-section">
						<span class="label">${t.date}:</span>
						<span class="value">${formatDate(offer.createdAt)}</span>
					</div>
					<div class="client-greeting">
						<span>${t.dearClient}, ${escapeHtml(offer.clientName)}</span>
					</div>
					<p class="document-intro">${t.documentTitle}</p>
				</header>
				`
						: ''
				}

				<section class="products-section">
					${
						pageIndex === 0
							? `<h2 class="section-title">${t.productsEquipment}</h2>`
							: ''
					}
					<table class="products-table">
						${
							opts.showProductHeaders
								? `
						<thead>
							<tr>
								<th class="col-product">${t.productName}</th>
								${opts.showImage ? `<th class="col-image"></th>` : ''}
								${
									opts.showProvider ||
									opts.showCountry
										? `<th class="col-provider">${
												opts.showProvider &&
												opts.showCountry
													? `${t.provider} / ${t.country}`
													: opts.showProvider
													? t.provider
													: t.country
										  }</th>`
										: ''
								}
								${opts.showPrice ? `<th class="col-price">${t.price}</th>` : ''}
							</tr>
						</thead>
						`
								: ''
						}
						<tbody>
							${buildProductRows(pageProducts)}
						</tbody>
					</table>
				</section>

				${
					pageIndex === productPages.length - 1
						? `
				<section class="financial-section">
					<h2 class="section-title">${t.financialSummary}</h2>
					<table class="financial-table">
						<tbody>
							<tr>
								<td class="label">${t.subtotal}</td>
								<td class="value">${formatCurrency(totalAmount)}</td>
							</tr>
							${
								discountAmount >
								0
									? `
							<tr>
								<td class="label">${t.discount}</td>
								<td class="value discount">- ${formatCurrency(discountAmount)}</td>
							</tr>
							`
									: ''
							}
							<tr class="total-row">
								<td class="label">${t.totalAmount}</td>
								<td class="value">${formatCurrency(finalAmount)}</td>
							</tr>
						</tbody>
					</table>
				</section>

				${
					termsRows
						? `
				<section class="terms-section">
					<h2 class="section-title">${t.termsConditions}</h2>
					<table class="terms-table">
						<tbody>
							${termsRows}
						</tbody>
					</table>
				</section>
				`
						: ''
				}

				<footer class="offer-footer">
					<div class="footer-row">
						<span class="label">${t.validUntil}:</span>
						<span class="value">${formatDate(offer.validUntil)}</span>
					</div>
					<div class="footer-row">
						<span class="label">${t.salesman}:</span>
						<span class="value">${escapeHtml(offer.assignedToName || 'N/A')}</span>
					</div>
				</footer>
				`
						: ''
				}
			</div>
		</div>
	`
		)
		.join('');

	// Use letterhead image (base64) if available, otherwise fallback to PNG URL
	const letterheadUrl = letterheadImage || letterheadPngUrl;

	return `
<div class="offer-print-container ${isRTL ? 'rtl' : 'ltr'}" dir="${
		isRTL ? 'rtl' : 'ltr'
	}" style="--letterhead-url: url('${letterheadUrl}')">
	<div class="letterhead-background" aria-hidden="true"></div>
	${pagesHtml}
</div>`;
}

/**
 * Normalize equipment data from various backend formats
 */
function normalizeEquipment(
	eq: any,
	customDescriptions: Record<number, string>
): any {
	const id = eq.id || eq.Id;
	const imagePath =
		eq.imagePath ||
		eq.ImagePath ||
		eq.imageUrl ||
		eq.ImageUrl ||
		null;
	const providerImagePath =
		eq.providerImagePath ||
		eq.ProviderImagePath ||
		eq.providerLogoPath ||
		eq.ProviderLogoPath ||
		null;

	return {
		id,
		name: eq.name || eq.Name || 'N/A',
		model: eq.model || eq.Model || undefined,
		provider:
			eq.provider ||
			eq.Provider ||
			eq.manufacturer ||
			eq.Manufacturer ||
			undefined,
		country: eq.country || eq.Country || undefined,
		price: (() => {
			const rawPrice =
				eq.price ??
				eq.Price ??
				eq.totalPrice ??
				eq.TotalPrice ??
				eq.unitPrice ??
				eq.UnitPrice ??
				0;
			if (typeof rawPrice === 'number') return rawPrice;
			const parsed = Number(rawPrice);
			return Number.isFinite(parsed) ? parsed : 0;
		})(),
		description:
			eq.description ||
			eq.Description ||
			eq.specifications ||
			eq.Specifications ||
			undefined,
		customDescription:
			customDescriptions[id] || eq.customDescription,
		imageUrl:
			imagePath && !imagePath.includes('placeholder')
				? getImageUrl(imagePath)
				: '',
		providerImageUrl:
			providerImagePath &&
			!providerImagePath.includes('placeholder') &&
			!providerImagePath.endsWith('.svg')
				? getImageUrl(providerImagePath)
				: '',
	};
}

/**
 * Get full image URL
 */
function getImageUrl(path: string): string {
	if (!path) return '';
	if (path.startsWith('http://') || path.startsWith('https://'))
		return path;
	if (path.startsWith('/')) return path;
	return `/${path}`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
	if (!text) return '';
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Get translations
 */
function getTranslations(lang: PDFLanguage): Record<string, string> {
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
			print: 'Print / Save PDF',
			close: 'Close',
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
			print: 'طباعة / حفظ PDF',
			close: 'إغلاق',
		},
	};
	return translations[lang];
}

/**
 * Get preview control buttons HTML
 */
function getPreviewControls(lang: PDFLanguage): string {
	const t = getTranslations(lang);
	return `
<div class="preview-controls no-print">
	<button onclick="window.print()" class="btn-print">${t.print}</button>
	<button onclick="window.close()" class="btn-close">${t.close}</button>
</div>`;
}

/**
 * Get preview-specific styles
 */
function getPreviewStyles(): string {
	return `
<style>
	.preview-controls {
		position: fixed;
		top: 10px;
		right: 20px;
		z-index: 1000;
		display: flex;
		gap: 10px;
		background: white;
		padding: 10px 15px;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.2);
	}
	.preview-controls button {
		padding: 8px 20px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
	}
	.btn-print {
		background: #2980b9;
		color: white;
	}
	.btn-print:hover {
		background: #1f6692;
	}
	.btn-close {
		background: #e0e0e0;
		color: #333;
	}
	.btn-close:hover {
		background: #d0d0d0;
	}
	@media print {
		.preview-controls {
			display: none !important;
		}
	}
</style>`;
}

/**
 * Get all print styles
 */
function getPrintStyles(
	isRTL: boolean,
	letterheadImage: string | null = null
): string {
	// Use letterhead image (base64) if available, otherwise fallback to PNG URL
	const letterheadUrl = letterheadImage || letterheadPngUrl;

	return `
<style>
/* CSS Custom Properties */
:root {
	--print-primary: #2980b9;
	--print-secondary: #34495e;
	--print-text: #1e1e1e;
	--print-text-muted: #505050;
	--print-border: #c8c8c8;
	--print-border-light: #dcdcdc;
	--print-bg-header: #f0f0f0;
	--print-white: #ffffff;
	--print-font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	--print-font-arabic: 'Cairo', 'Amiri', 'Segoe UI', Tahoma, sans-serif;
	--letterhead-url: url('${letterheadUrl}');
}

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body {
	font-family: ${isRTL ? 'var(--print-font-arabic)' : 'var(--print-font-family)'};
	font-size: 10pt;
	color: var(--print-text);
	line-height: 1.4;
	background: #f5f5f5;
}

/* Container */
.offer-print-container {
	position: relative;
	width: 210mm;
	min-height: 297mm;
	margin: 20px auto;
	background: var(--print-white);
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}

.offer-print-container.rtl {
	direction: rtl;
	font-family: var(--print-font-arabic);
}

.offer-print-container.ltr {
	direction: ltr;
}

/* Letterhead - not used, moved to product-page */
.letterhead-background {
	display: none;
}

/* Page Content - CONTENT completely separate from letterhead */
/* CONTENT is 50% of page (25% top + 25% bottom = 50% total) */
/* Content is positioned independently - letterhead does NOT affect it */
/* If content exceeds this 50% area, it automatically wraps to next page via CSS page-break */
.page-content {
	position: relative;
	z-index: 2; /* Above letterhead background */
	padding: 25% 15mm 25% 15mm; /* CONTENT padding: 25% top, 25% bottom, 15mm sides - ALWAYS */
	/* Content area = 100% - 25% (top) - 25% (bottom) = 50% of page */
	margin: 0; /* No margin - completely separate from letterhead */
	box-sizing: border-box;
	background: transparent; /* No background - letterhead is separate layer */
	/* Content positioning is independent - letterhead is just a visual background */
	/* Page-break properties handle wrapping when content exceeds 50% */
}

/* Header */
.offer-header {
	margin-bottom: 12pt;
}

.date-section {
	margin-bottom: 8pt;
	font-size: 11pt;
}

.date-section .label {
	font-weight: 600;
	color: var(--print-secondary);
}

.date-section .value {
	margin-inline-start: 8pt;
	color: var(--print-secondary);
}

.client-greeting {
	font-size: 11pt;
	color: var(--print-secondary);
	margin-bottom: 8pt;
}

.document-intro {
	font-size: 10pt;
	color: var(--print-secondary);
	line-height: 1.5;
}

/* Section Titles */
.section-title {
	font-size: 13pt;
	font-weight: 700;
	color: var(--print-primary);
	margin: 16pt 0 8pt 0;
}

/* Products Table */
.products-table {
	width: 100%;
	border-collapse: collapse;
	border: 1px solid var(--print-border);
	margin-bottom: 12pt;
}

.products-table th,
.products-table td {
	border: 1px solid var(--print-border);
	padding: 8pt 6pt;
	vertical-align: top;
	text-align: start;
}

.products-table thead th {
	background: var(--print-bg-header);
	font-weight: 600;
	font-size: 9pt;
	color: var(--print-primary);
	text-align: center;
}

.col-product { width: 25%; }
.col-image { width: 30%; text-align: center; }
.col-provider { width: 15%; }
.col-price { width: 15%; text-align: end; }

/* Product Page Container - LETTERHEAD as background only, completely separate from content */
.product-page {
	position: relative;
	width: 210mm;
	min-height: 297mm;
	height: 297mm; /* Fixed height to ensure letterhead covers full page */
	margin: 0;
	padding: 0;
	background-color: white;
	/* LETTERHEAD: Background layer only - does NOT affect content positioning */
	background-image: var(--letterhead-url);
	background-repeat: no-repeat;
	background-size: 100% 100%; /* Cover entire page - use 100% 100% instead of cover for better export */
	background-position: center center;
	box-sizing: border-box;
	page-break-after: always;
	page-break-inside: avoid;
	-webkit-print-color-adjust: exact;
	print-color-adjust: exact;
	image-rendering: -webkit-optimize-contrast;
	image-rendering: pixelated;
	image-rendering: crisp-edges;
}

.product-page:last-child {
	page-break-after: auto;
}

.product-row {
	page-break-inside: avoid;
	height: 50mm; /* Fixed row height - consistent with OfferPrint.css */
	vertical-align: top;
}

/* When 2 products are on same page, ensure they fit within 50% content area */
/* If content exceeds 50% area, second product should wrap to next page */
.product-row:nth-child(2) {
	page-break-before: auto; /* Allow page break before second product if content exceeds 50% */
}

.product-row:nth-child(even) {
	background: rgba(240, 240, 240, 0.3);
}

.product-row td {
	vertical-align: middle;
	padding: 8pt;
}

.product-name {
	font-size: 11pt;
	font-weight: 600;
	color: var(--print-text);
	margin-bottom: 4pt;
}

.product-description {
	font-size: 9pt;
	color: var(--print-text-muted);
	line-height: 1.3;
	margin-bottom: 4pt;
}

.product-model {
	font-size: 9pt;
	color: var(--print-text-muted);
	font-style: italic;
}

.product-image {
	width: 50mm;
	height: 50mm;
	object-fit: contain;
	display: block;
	margin: 0 auto;
	image-rendering: -webkit-optimize-contrast;
	image-rendering: crisp-edges;
	-webkit-print-color-adjust: exact;
	print-color-adjust: exact;
}

.no-image-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 50mm;
	height: 50mm;
	border: 1px dashed var(--print-border);
	background: #fafafa;
	color: var(--print-text-muted);
	font-size: 8pt;
	margin: 0 auto;
}

.provider-info {
	display: flex;
	flex-direction: column;
	gap: 4pt;
	margin-bottom: 6pt;
}

.provider-logo {
	width: 35mm;
	height: 15mm;
	object-fit: contain;
	display: block;
	margin: 0 auto 4pt auto;
	image-rendering: -webkit-optimize-contrast;
	image-rendering: crisp-edges;
	image-rendering: high-quality;
	-webkit-print-color-adjust: exact;
	print-color-adjust: exact;
}

.provider-name {
	font-size: 10pt;
	font-weight: 600;
	color: var(--print-text);
}

.country-info {
	font-size: 9pt;
	color: var(--print-text-muted);
}

.price-value {
	font-size: 10pt;
	font-weight: 600;
	color: var(--print-text);
	white-space: nowrap;
}

/* Financial Table */
.financial-table {
	width: 100%;
	max-width: 300pt;
	border-collapse: collapse;
	border: 1px solid var(--print-border);
	${
		isRTL
			? 'margin-left: auto; margin-right: 0;'
			: 'margin-left: 0; margin-right: auto;'
	}
}

.financial-table td {
	border: 1px solid var(--print-border);
	padding: 6pt 10pt;
	font-size: 9pt;
}

.financial-table .label {
	font-weight: 600;
	color: var(--print-secondary);
	width: 50%;
}

.financial-table .value {
	text-align: end;
	font-weight: 600;
	color: var(--print-text);
}

.financial-table .value.discount {
	color: #c0392b;
}

.financial-table .total-row {
	background: var(--print-bg-header);
}

.financial-table .total-row .label,
.financial-table .total-row .value {
	font-size: 10pt;
	font-weight: 700;
	color: var(--print-primary);
}

/* Terms Table */
.terms-table {
	width: 100%;
	border-collapse: collapse;
	border: 1px solid var(--print-border);
}

.terms-table td {
	border: 1px solid var(--print-border);
	padding: 6pt 10pt;
	font-size: 8pt;
}

.terms-table .label {
	font-weight: 600;
	color: var(--print-secondary);
	width: 100pt;
}

.terms-table .value {
	color: var(--print-text);
}

/* Footer */
.offer-footer {
	margin-top: 16pt;
	padding-top: 8pt;
	border-top: 1px solid var(--print-border-light);
}

.footer-row {
	display: flex;
	gap: 8pt;
	margin-bottom: 4pt;
	font-size: 10pt;
}

.footer-row .label {
	font-weight: 600;
	color: var(--print-secondary);
}

.footer-row .value {
	color: var(--print-text);
}

/* Print Styles */
@media print {
	body {
		margin: 0 !important;
		padding: 0 !important;
		background: white;
	}

	@page {
		size: A4 portrait;
		margin: 0;
	}

	.offer-print-container {
		width: 100%;
		min-height: 100vh;
		margin: 0;
		box-shadow: none;
	}

	.letterhead-background {
		display: none;
	}

	/* Product page - LETTERHEAD as background only, completely separate from content */
	.product-page {
		width: 100%;
		min-height: 100vh;
		height: 100vh; /* Fixed height to ensure letterhead covers full page */
		page-break-after: always;
		page-break-before: auto;
		page-break-inside: avoid;
		/* LETTERHEAD: Background layer only - does NOT affect content positioning */
		background-image: var(--letterhead-url);
		background-repeat: no-repeat;
		background-size: 100% 100%; /* Cover entire page - use 100% 100% for better export */
		background-position: center center;
		-webkit-print-color-adjust: exact;
		print-color-adjust: exact;
		margin: 0;
		padding: 0; /* No padding - letterhead is background only, content is separate */
		display: block;
		image-rendering: -webkit-optimize-contrast;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
	}

	.product-page:first-child {
		page-break-before: avoid;
	}

	.product-page:last-child {
		page-break-after: auto;
	}

	/* Content area - CONTENT completely separate from letterhead */
	/* CONTENT is 50% of page (25% top + 25% bottom = 50% total) */
	/* Content positioning is independent - letterhead is just a visual background */
	/* If content exceeds this 50% area, it automatically wraps to next page via CSS page-break */
	.page-content {
		position: relative;
		z-index: 2; /* Above letterhead background */
		padding: 25% 15mm 25% 15mm; /* CONTENT padding: 25% top, 25% bottom, 15mm sides - ALWAYS */
		/* Content area = 100% - 25% (top) - 25% (bottom) = 50% of page */
		margin: 0; /* No margin - completely separate from letterhead */
		background: transparent; /* No background - letterhead is separate layer */
		/* Content positioning is independent - letterhead does NOT affect it */
		/* Page-break properties handle wrapping when content exceeds 50% */
	}

	.product-row,
	.financial-table tr,
	.terms-table tr {
		page-break-inside: avoid;
	}

	/* Force page break when content exceeds 50% area (25% top + 25% bottom) */
	/* This ensures content automatically wraps to next page when it exceeds the content area */
	/* Same logic as jsPDF: if (yPos + height > contentEndY) { addPage(); } */
	.products-section,
	.financial-section,
	.terms-section {
		page-break-after: auto;
		page-break-before: auto;
		orphans: 3;
		widows: 3;
	}
	
	/* Products table - allow breaking across pages when content exceeds 50% area */
	.products-table {
		page-break-inside: auto; /* Allow table to break across pages */
	}
	
	/* Product rows - avoid breaking individual rows, but allow page break between rows */
	/* This mimics jsPDF logic: check if row exceeds contentEndY before drawing */
	.product-row {
		page-break-inside: avoid; /* Don't break individual rows */
		page-break-after: auto; /* Allow page break after rows when exceeding 50% area */
	}
	
	/* Special handling for 2 products: ensure second product wraps if content exceeds 50% */
	.product-row:nth-child(2) {
		page-break-before: auto; /* Allow page break before second product if content exceeds 50% */
	}
	
	/* Ensure products table respects 50% content area and allows proper page breaking */
	.products-table {
		page-break-inside: auto; /* Allow table to break across pages */
	}
	
	/* When there are exactly 2 products, check if they fit in 50% content area */
	/* If header + first product + second product exceeds 50%, second product should wrap */
	.products-section:has(.product-row:nth-child(2)) .product-row:nth-child(2) {
		page-break-before: auto; /* Allow break if content exceeds 50% */
	}

	.no-print {
		display: none !important;
	}

	img {
		-webkit-print-color-adjust: exact;
		print-color-adjust: exact;
	}

	* {
		-webkit-print-color-adjust: exact !important;
		print-color-adjust: exact !important;
	}
}
</style>`;
}

// Export types for use in components
export type { OfferData, OfferEquipment };
