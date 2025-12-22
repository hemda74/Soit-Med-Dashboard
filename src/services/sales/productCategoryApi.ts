import { BaseApi } from '../baseApi';
import { API_ENDPOINTS } from '../shared/endpoints';
import type {
	ProductCategory,
	CreateProductCategoryDto,
	UpdateProductCategoryDto,
	CategoryHierarchy,
	ApiResponse,
} from '@/types/sales.types';

class ProductCategoryApi extends BaseApi {
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

