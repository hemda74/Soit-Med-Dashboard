import React, { useEffect, useState } from 'react';
import { getStaticFileUrl } from '@/utils/apiConfig';
import letterheadPdfUrl from '@/assets/Letterhead.pdf?url';
import letterheadPngUrl from '@/assets/Letterhead.png?url';
import './OfferPrint.css';

/**
 * Convert PDF to image using PDF.js
 */
async function convertPdfToImage(pdfUrl: string): Promise<string | null> {
	try {
		const pdfjsLib = await import('pdfjs-dist');

		// Set worker source
		if (typeof window !== 'undefined') {
			pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
		}

		const response = await fetch(pdfUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch PDF: ${response.statusText}`);
		}

		const arrayBuffer = await response.arrayBuffer();
		const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
		const pdf = await loadingTask.promise;

		const page = await pdf.getPage(1);
		const scale = 5.0; // Ultra high quality (600 DPI equivalent)
		const viewport = page.getViewport({ scale });
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');

		if (!context) {
			console.error('Could not get canvas context');
			return null;
		}

		canvas.height = viewport.height;
		canvas.width = viewport.width;

		// Enable image smoothing for better quality
		context.imageSmoothingEnabled = true;
		context.imageSmoothingQuality = 'high';

		await page.render({
			canvasContext: context,
			viewport: viewport,
		}).promise;

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
			reader.onloadend = () => resolve(reader.result as string);
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

// Types for offer data
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

export type PDFLanguage = 'ar' | 'en';

export interface PDFExportOptions {
	language?: PDFLanguage;
	showProductHeaders?: boolean;
	showModel?: boolean;
	showProvider?: boolean;
	showCountry?: boolean;
	showDescription?: boolean;
	showImage?: boolean;
	showPrice?: boolean;
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
		page: 'Page',
		of: 'of',
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
		page: 'صفحة',
		of: 'من',
	},
};

// Normalize equipment data from various backend formats
function normalizeEquipment(eq: any): OfferEquipment & { normalizedImageUrl: string; normalizedProviderImageUrl: string } {
	const imagePath = eq.imagePath || eq.ImagePath || eq.imageUrl || eq.ImageUrl || null;
	const providerImagePath = eq.providerImagePath || eq.ProviderImagePath || eq.providerLogoPath || eq.ProviderLogoPath || null;

	return {
		id: eq.id || eq.Id,
		name: eq.name || eq.Name || 'N/A',
		model: eq.model || eq.Model || undefined,
		provider: eq.provider || eq.Provider || eq.manufacturer || eq.Manufacturer || undefined,
		country: eq.country || eq.Country || undefined,
		year: eq.year ?? eq.Year ?? undefined,
		price: (() => {
			const rawPrice = eq.price ?? eq.Price ?? eq.totalPrice ?? eq.TotalPrice ?? eq.unitPrice ?? eq.UnitPrice ?? 0;
			if (typeof rawPrice === 'number') return rawPrice;
			const parsed = Number(rawPrice);
			return Number.isFinite(parsed) ? parsed : 0;
		})(),
		description: eq.description || eq.Description || eq.specifications || eq.Specifications || undefined,
		inStock: eq.inStock !== undefined ? eq.inStock : eq.InStock !== undefined ? eq.InStock : true,
		imagePath,
		providerImagePath,
		customDescription: eq.customDescription,
		normalizedImageUrl: imagePath && !imagePath.includes('placeholder') ? getStaticFileUrl(imagePath) : '',
		normalizedProviderImageUrl: providerImagePath && !providerImagePath.includes('placeholder') && !providerImagePath.endsWith('.svg')
			? getStaticFileUrl(providerImagePath)
			: '',
	};
}

interface OfferPrintTemplateProps {
	offer: OfferData;
	options?: PDFExportOptions;
}

export const OfferPrintTemplate: React.FC<OfferPrintTemplateProps> = ({ offer, options = {} }) => {
	const lang: PDFLanguage = options.language || 'en';
	const isRTL = lang === 'ar';
	const t = translations[lang];

	// Load letterhead dynamically
	const [letterheadUrl, setLetterheadUrl] = useState<string>(letterheadPngUrl);

	useEffect(() => {
		getLetterheadImage().then((image) => {
			if (image) {
				setLetterheadUrl(image);
			}
		});
	}, []);

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

	// Normalize equipment data
	const normalizedEquipment = (offer.equipment || []).map((eq) => {
		const normalized = normalizeEquipment(eq);
		// Apply custom descriptions
		if (opts.customDescriptions[normalized.id]) {
			normalized.customDescription = opts.customDescriptions[normalized.id];
		}
		return normalized;
	});

	// Split products into pages (max 2 products per page)
	const productsPerPage = 2;
	const productPages: typeof normalizedEquipment[] = [];
	for (let i = 0; i < normalizedEquipment.length; i += productsPerPage) {
		productPages.push(normalizedEquipment.slice(i, i + productsPerPage));
	}

	// Format currency
	const formatCurrency = (amount: number) => {
		const formatted = amount.toLocaleString('en-US');
		return lang === 'ar' ? `${formatted} جنيه` : `${formatted} EGP`;
	};

	// Format date
	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString('en-GB');
	};

	// Calculate totals
	const totalAmount = typeof offer.totalAmount === 'number' ? offer.totalAmount : 0;
	const discountAmount = typeof offer.discountAmount === 'number' ? offer.discountAmount : 0;
	const finalAmount = totalAmount - discountAmount;

	const containerStyle: React.CSSProperties & Record<'--letterhead-url', string> = {
		'--letterhead-url': `url(${letterheadUrl})`,
	};

	return (
		<div
			className={`offer-print-container ${isRTL ? 'rtl' : 'ltr'}`}
			dir={isRTL ? 'rtl' : 'ltr'}
			style={containerStyle}
		>
			{/* Letterhead Background */}
			<div className="letterhead-background" aria-hidden="true" />

			{/* Render each page with max 2 products */}
			{productPages.map((pageProducts, pageIndex) => (
				<div key={pageIndex} className={`product-page ${pageIndex > 0 ? 'page-break' : ''}`}>
					{/* Page Content */}
					<div className="page-content">
						{/* Header Section - Only on first page */}
						{pageIndex === 0 && (
							<header className="offer-header">
								<div className="date-section">
									<span className="label">{t.date}:</span>
									<span className="value">{formatDate(offer.createdAt)}</span>
								</div>
								<div className="client-greeting">
									<span>{t.dearClient}, {offer.clientName}</span>
								</div>
								<p className="document-intro">{t.documentTitle}</p>
							</header>
						)}

						{/* Products Section */}
						<section className="products-section">
							{pageIndex === 0 && <h2 className="section-title">{t.productsEquipment}</h2>}

							{/* Products Table */}
							<table className="products-table">
								{opts.showProductHeaders && (
									<thead>
										<tr>
											<th className="col-product">{t.productName}</th>
											{opts.showImage && <th className="col-image">{t.noImage}</th>}
											{(opts.showProvider || opts.showCountry) && (
												<th className="col-provider">
													{opts.showProvider && opts.showCountry
														? `${t.provider} / ${t.country}`
														: opts.showProvider
															? t.provider
															: t.country}
												</th>
											)}
											{opts.showPrice && <th className="col-price">{t.price}</th>}
										</tr>
									</thead>
								)}
								<tbody>
									{pageProducts.map((eq, index) => {
										const descriptionToUse = eq.customDescription || eq.description || '';
										return (
											<tr key={eq.id || index} className="product-row">
												{/* Column 1: Name, Description, Model */}
												<td className="col-product">
													<div className="product-name">{eq.name}</div>
													{opts.showDescription && descriptionToUse && (
														<div className="product-description">{descriptionToUse}</div>
													)}
													{opts.showModel && eq.model && (
														<div className="product-model">{eq.model}</div>
													)}
												</td>

												{/* Column 2: Product Image */}
												{opts.showImage && (
													<td className="col-image">
														{eq.normalizedImageUrl ? (
															<img
																src={eq.normalizedImageUrl}
																alt={eq.name}
																className="product-image"
																onError={(e) => {
																	(e.target as HTMLImageElement).style.display = 'none';
																}}
															/>
														) : (
															<div className="no-image-placeholder">
																<span>{t.noImage}</span>
															</div>
														)}
													</td>
												)}

												{/* Column 3: Provider + Country */}
												{(opts.showProvider || opts.showCountry) && (
													<td className="col-provider">
														{opts.showProvider && (
															<div className="provider-info">
																{eq.normalizedProviderImageUrl && (
																	<img
																		src={eq.normalizedProviderImageUrl}
																		alt={eq.provider || ''}
																		className="provider-logo"
																		onError={(e) => {
																			(e.target as HTMLImageElement).style.display = 'none';
																		}}
																	/>
																)}
																<span className="provider-name">{eq.provider || 'N/A'}</span>
															</div>
														)}
														{opts.showCountry && (
															<div className="country-info">{eq.country || 'N/A'}</div>
														)}
													</td>
												)}

												{/* Column 4: Price */}
												{opts.showPrice && (
													<td className="col-price">
														<span className="price-value">{formatCurrency(eq.price || 0)}</span>
													</td>
												)}
											</tr>
										);
									})}
								</tbody>
							</table>
						</section>

						{/* Financial Summary and Terms - Only on last page */}
						{pageIndex === productPages.length - 1 && (
							<>
								{/* Financial Summary */}
								<section className="financial-section">
									<h2 className="section-title">{t.financialSummary}</h2>
									<table className="financial-table">
										<tbody>
											<tr>
												<td className="label">{t.subtotal}</td>
												<td className="value">{formatCurrency(totalAmount)}</td>
											</tr>
											{discountAmount > 0 && (
												<tr>
													<td className="label">{t.discount}</td>
													<td className="value discount">- {formatCurrency(discountAmount)}</td>
												</tr>
											)}
											<tr className="total-row">
												<td className="label">{t.totalAmount}</td>
												<td className="value">{formatCurrency(finalAmount)}</td>
											</tr>
										</tbody>
									</table>
								</section>

								{/* Terms & Conditions */}
								{(offer.paymentTerms || offer.deliveryTerms || offer.warrantyTerms) && (
									<section className="terms-section">
										<h2 className="section-title">{t.termsConditions}</h2>
										<table className="terms-table">
											<tbody>
												{offer.paymentTerms && (
													<tr>
														<td className="label">{t.paymentTerms}</td>
														<td className="value">{offer.paymentTerms}</td>
													</tr>
												)}
												{offer.deliveryTerms && (
													<tr>
														<td className="label">{t.deliveryTerms}</td>
														<td className="value">{offer.deliveryTerms}</td>
													</tr>
												)}
												{offer.warrantyTerms && (
													<tr>
														<td className="label">{t.warranty}</td>
														<td className="value">{offer.warrantyTerms}</td>
													</tr>
												)}
											</tbody>
										</table>
									</section>
								)}

								{/* Footer Info */}
								<footer className="offer-footer">
									<div className="footer-row">
										<span className="label">{t.validUntil}:</span>
										<span className="value">{formatDate(offer.validUntil)}</span>
									</div>
									<div className="footer-row">
										<span className="label">{t.salesman}:</span>
										<span className="value">{offer.assignedToName || 'N/A'}</span>
									</div>
								</footer>
							</>
						)}
					</div>
				</div>
			))}
		</div>
	);
};

export default OfferPrintTemplate;

