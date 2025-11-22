// Products Catalog API Service

import type {
	Product,
	CreateProductDto,
	UpdateProductDto,
	ApiResponse,
} from '@/types/sales.types';
import { getAuthToken } from '@/utils/authUtils';
import { API_ENDPOINTS } from '../shared/endpoints';
import { getStaticFileUrl, getApiBaseUrl } from '@/utils/apiConfig';
import { performanceMonitor } from '@/utils/performance';

class ProductApiService {
	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		return performanceMonitor.measureApiCall(endpoint, async () => {
			const token = getAuthToken();
			if (!token) {
				throw new Error('Authentication required');
			}

			// Endpoints already include /api prefix, so use them directly
			const baseUrl = getApiBaseUrl();
			const fullUrl = `${baseUrl}${endpoint}`;

			// Don't set Content-Type for FormData - browser sets it automatically with boundary
			const isFormData = options.body instanceof FormData;
			const headers: HeadersInit = {
				Authorization: `Bearer ${token}`,
				...options.headers,
			};

			// Remove Content-Type for FormData requests (browser adds it automatically)
			if (isFormData && 'Content-Type' in headers) {
				delete (headers as any)['Content-Type'];
			}

			const response = await fetch(fullUrl, {
				...options,
				headers,
			});

			// Check if response is actually JSON before parsing
			const contentType = response.headers.get('content-type');
			if (!contentType || !contentType.includes('application/json')) {
				const text = await response.text();
				console.error(
					'Non-JSON response:',
					text.substring(0, 200)
				);
				throw new Error(
					`Server returned non-JSON response: ${response.status} ${response.statusText}`
				);
			}

			if (!response.ok) {
				try {
					const error = await response.json();
					throw new Error(
						error.message ||
							error.error ||
							`HTTP ${response.status}: ${response.statusText}`
					);
				} catch (parseError) {
					throw new Error(
						`HTTP ${response.status}: ${response.statusText}`
					);
				}
			}

			return response.json();
		});
	}

	/**
	 * Get all products with optional filters
	 */
	async getAllProducts(params?: {
		category?: string;
		inStock?: boolean;
	}): Promise<ApiResponse<Product[]>> {
		const searchParams = new URLSearchParams();
		if (params?.category) {
			searchParams.set('category', params.category);
		}
		if (params?.inStock !== undefined) {
			searchParams.set('inStock', params.inStock.toString());
		}

		const query = searchParams.toString();
		const endpoint = query
			? `${API_ENDPOINTS.SALES.PRODUCTS.BASE}?${query}`
			: API_ENDPOINTS.SALES.PRODUCTS.BASE;

		return this.makeRequest<Product[]>(endpoint, { method: 'GET' });
	}

	/**
	 * Get product by ID
	 */
	async getProductById(id: number): Promise<ApiResponse<Product>> {
		return this.makeRequest<Product>(
			API_ENDPOINTS.SALES.PRODUCTS.BY_ID(id),
			{ method: 'GET' }
		);
	}

	/**
	 * Get products by category
	 */
	async getProductsByCategory(
		category: string
	): Promise<ApiResponse<Product[]>> {
		return this.makeRequest<Product[]>(
			API_ENDPOINTS.SALES.PRODUCTS.BY_CATEGORY(category),
			{ method: 'GET' }
		);
	}

	/**
	 * Search products
	 */
	async searchProducts(
		searchTerm: string
	): Promise<ApiResponse<Product[]>> {
		if (!searchTerm || !searchTerm.trim()) {
			return this.getAllProducts();
		}

		const endpoint = `${
			API_ENDPOINTS.SALES.PRODUCTS.SEARCH
		}?q=${encodeURIComponent(searchTerm.trim())}`;

		return this.makeRequest<Product[]>(endpoint, { method: 'GET' });
	}

	/**
	 * Create new product
	 */
	async createProduct(
		product: CreateProductDto
	): Promise<ApiResponse<Product>> {
		return this.makeRequest<Product>(
			API_ENDPOINTS.SALES.PRODUCTS.BASE,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(product),
			}
		);
	}

	/**
	 * Update product
	 */
	async updateProduct(
		id: number,
		product: UpdateProductDto
	): Promise<ApiResponse<Product>> {
		return this.makeRequest<Product>(
			API_ENDPOINTS.SALES.PRODUCTS.BY_ID(id),
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(product),
			}
		);
	}

	/**
	 * Delete product (soft delete)
	 */
	async deleteProduct(id: number): Promise<ApiResponse<null>> {
		return this.makeRequest<null>(
			API_ENDPOINTS.SALES.PRODUCTS.BY_ID(id),
			{ method: 'DELETE' }
		);
	}

	/**
	 * Upload product image
	 */
	async uploadProductImage(
		id: number,
		file: File
	): Promise<ApiResponse<Product>> {
		const formData = new FormData();
		formData.append('file', file);

		return this.makeRequest<Product>(
			API_ENDPOINTS.SALES.PRODUCTS.UPLOAD_IMAGE(id),
			{
				method: 'POST',
				body: formData,
			}
		);
	}

	/**
	 * Get image URL helper
	 * Constructs full URL to backend-served images
	 */
	getImageUrl(imagePath: string | null | undefined): string {
		// Use centralized utility for consistent URL construction
		return getStaticFileUrl(imagePath);
	}
}

export const productApi = new ProductApiService();
