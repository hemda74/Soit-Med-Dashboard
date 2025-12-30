/**
 * PDF Export Service
 * Centralized service for exporting offer PDFs with optimized performance and error handling
 */

import { getApiBaseUrl } from '@/utils/apiConfig';

export interface PdfExportOptions {
	offerId: number;
	token: string;
	languages?: ('en' | 'ar')[];
	onProgress?: (language: string, status: 'loading' | 'success' | 'error') => void;
	timeout?: number; // Timeout in milliseconds (default: 60000 = 60 seconds)
}

export interface PdfExportResult {
	success: boolean;
	downloaded: string[];
	failed: Array<{ language: string; error: string }>;
}

/**
 * Downloads a single PDF for a specific language
 */
async function downloadPdfForLanguage(
	offerId: number,
	language: 'en' | 'ar',
	token: string,
	timeout: number = 60000
): Promise<{ success: boolean; error?: string }> {
	const apiBaseUrl = getApiBaseUrl();
	const url = `${apiBaseUrl}/api/Offer/${offerId}/pdf?language=${language}`;

	try {
		// Create AbortController for timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/pdf',
			},
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		// Check content type to ensure we got a PDF
		const contentType = response.headers.get('content-type') || '';
		const isJsonError = contentType.includes('application/json') || contentType.includes('text/json');

		if (!response.ok || isJsonError) {
			// Handle errors
			if (response.status === 403) {
				let errorMessage = 'You do not have permission to access this offer PDF';
				try {
					const errorText = await response.text();
					if (errorText) {
						const errorData = JSON.parse(errorText);
						errorMessage = errorData.message || errorMessage;
					}
				} catch {
					// Use default error message
				}
				return { success: false, error: errorMessage };
			}

			if (response.status === 401) {
				return { success: false, error: 'Your session has expired. Please login again.' };
			}

			if (response.status === 404) {
				return { success: false, error: 'Offer not found' };
			}

			// Try to parse error response
			try {
				const errorText = await response.text();
				const errorData = JSON.parse(errorText);
				return { success: false, error: errorData.message || `Request failed: ${response.status}` };
			} catch {
				return { success: false, error: `Request failed: ${response.status}` };
			}
		}

		// Verify we got a PDF
		if (!contentType.includes('application/pdf')) {
			return { success: false, error: 'Server did not return a PDF file' };
		}

		// Get PDF blob
		const pdfBlob = await response.blob();

		if (!pdfBlob || pdfBlob.size === 0) {
			return { success: false, error: 'Received empty PDF file' };
		}

		// Create download link
		const urlObject = window.URL.createObjectURL(pdfBlob);
		const link = document.createElement('a');
		link.href = urlObject;
		const langSuffix = language === 'ar' ? 'AR' : 'EN';
		link.download = `Offer_${offerId}_${langSuffix}_${new Date().toISOString().split('T')[0]}.pdf`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(urlObject);

		return { success: true };
	} catch (error: any) {
		if (error.name === 'AbortError') {
			return { success: false, error: 'Request timeout. The PDF generation took too long.' };
		}
		return { success: false, error: error.message || 'Failed to download PDF' };
	}
}

/**
 * Exports PDFs for an offer in multiple languages
 * Optimized to process languages in parallel for better performance
 */
export async function exportOfferPdfs(options: PdfExportOptions): Promise<PdfExportResult> {
	const { offerId, token, languages = ['en', 'ar'], onProgress, timeout = 60000 } = options;

	if (!token) {
		return {
			success: false,
			downloaded: [],
			failed: [{ language: 'all', error: 'Authentication token is required' }],
		};
	}

	const results: PdfExportResult = {
		success: true,
		downloaded: [],
		failed: [],
	};

	// Process languages in parallel for better performance
	// But add small delay between downloads to avoid browser blocking multiple downloads
	const promises = languages.map(async (lang, index) => {
		// Add small delay between downloads (100ms per language)
		if (index > 0) {
			await new Promise(resolve => setTimeout(resolve, index * 100));
		}

		onProgress?.(lang, 'loading');

		const result = await downloadPdfForLanguage(offerId, lang, token, timeout);

		if (result.success) {
			results.downloaded.push(lang);
			onProgress?.(lang, 'success');
		} else {
			results.failed.push({ language: lang, error: result.error || 'Unknown error' });
			results.success = false;
			onProgress?.(lang, 'error');
		}
	});

	await Promise.allSettled(promises);

	return results;
}

/**
 * Exports a single PDF for a specific language
 */
export async function exportOfferPdf(
	offerId: number,
	token: string,
	language: 'en' | 'ar' = 'en',
	timeout: number = 60000
): Promise<{ success: boolean; error?: string }> {
	return downloadPdfForLanguage(offerId, language, token, timeout);
}

