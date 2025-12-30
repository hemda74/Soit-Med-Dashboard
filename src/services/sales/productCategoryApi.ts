import { API_ENDPOINTS } from '../shared/endpoints';
import type {
	ProductCategory,
	CreateProductCategoryDto,
	UpdateProductCategoryDto,
	CategoryHierarchy,
	ApiResponse,
} from '@/types/sales.types';
import { getAuthToken } from '@/utils/authUtils';
import { getApiBaseUrl } from '@/utils/apiConfig';
import { performanceMonitor } from '@/utils/performance';

class ProductCategoryApi {
	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		return performanceMonitor.measureApiCall(endpoint, async () => {
			const token = getAuthToken();
			if (!token) {
				throw new Error('Authentication required');
			}

			const baseUrl = getApiBaseUrl();
			const fullUrl = `${baseUrl}${endpoint}`;

			const headers: HeadersInit = {
				Authorization: `Bearer ${token}`,
				...options.headers,
			};

			const response = await fetch(fullUrl, {
				...options,
				headers,
			});

			const contentType = response.headers.get('content-type');
			if (contentType && contentType.includes('application/json')) {
				const data = await response.json();

				if (!response.ok) {
					return {
						success: false,
						message: data.message || 'Request failed',
						data: null as any,
					};
				}

				return {
					success: true,
					message: data.message || 'Success',
					data: data.data || data,
				};
			}

			if (!response.ok) {
				const text = await response.text();
				return {
					success: false,
					message: text || 'Request failed',
					data: null as any,
				};
			}

			return {
				success: true,
				message: 'Success',
				data: null as any,
			};
		});
	}

	/**
	 * Get all categories (flat list)
	 */
	async getAllCategories(): Promise<ApiResponse<ProductCategory[]>> {
		return this.makeRequest<ProductCategory[]>(
			API_ENDPOINTS.SALES.PRODUCT_CATEGORIES.BASE,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get category hierarchy (tree structure)
	 */
	async getCategoryHierarchy(): Promise<ApiResponse<CategoryHierarchy[]>> {
		return this.makeRequest<CategoryHierarchy[]>(
			`${API_ENDPOINTS.SALES.PRODUCT_CATEGORIES.BASE}/hierarchy`,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get main categories only (no parent)
	 */
	async getMainCategories(): Promise<ApiResponse<ProductCategory[]>> {
		return this.makeRequest<ProductCategory[]>(
			`${API_ENDPOINTS.SALES.PRODUCT_CATEGORIES.BASE}/main`,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get subcategories for a parent category
	 */
	async getSubCategories(
		parentCategoryId: number
	): Promise<ApiResponse<ProductCategory[]>> {
		return this.makeRequest<ProductCategory[]>(
			`${API_ENDPOINTS.SALES.PRODUCT_CATEGORIES.BASE}/${parentCategoryId}/subcategories`,
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Get category by ID
	 */
	async getCategoryById(
		id: number
	): Promise<ApiResponse<ProductCategory>> {
		return this.makeRequest<ProductCategory>(
			API_ENDPOINTS.SALES.PRODUCT_CATEGORIES.BY_ID(id),
			{
				method: 'GET',
			}
		);
	}

	/**
	 * Create a new category
	 */
	async createCategory(
		categoryData: CreateProductCategoryDto
	): Promise<ApiResponse<ProductCategory>> {
		return this.makeRequest<ProductCategory>(
			API_ENDPOINTS.SALES.PRODUCT_CATEGORIES.BASE,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(categoryData),
			}
		);
	}

	/**
	 * Update an existing category
	 */
	async updateCategory(
		id: number,
		categoryData: UpdateProductCategoryDto
	): Promise<ApiResponse<ProductCategory>> {
		return this.makeRequest<ProductCategory>(
			API_ENDPOINTS.SALES.PRODUCT_CATEGORIES.BY_ID(id),
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(categoryData),
			}
		);
	}

	/**
	 * Delete a category
	 */
	async deleteCategory(id: number): Promise<ApiResponse<string>> {
		return this.makeRequest<string>(
			API_ENDPOINTS.SALES.PRODUCT_CATEGORIES.BY_ID(id),
			{
				method: 'DELETE',
			}
		);
	}
}

export const productCategoryApi = new ProductCategoryApi();

