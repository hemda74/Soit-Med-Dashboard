import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { salesApi } from '../salesApi';
import { API_ENDPOINTS } from '../../shared/endpoints';

// Mock dependencies
vi.mock('@/utils/authUtils', () => ({
	getAuthToken: vi.fn(() => 'mock-token'),
}));

vi.mock('@/utils/performance', () => ({
	performanceMonitor: {
		measureApiCall: vi.fn(async (endpoint: string, fn: () => Promise<any>) => {
			return fn();
		}),
	},
}));

describe('SalesApi - Offer State Transitions', () => {
	const API_BASE_URL = 'http://localhost:5117';

	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('markAsNeedsModification', () => {
		it('should call correct endpoint with reason', async () => {
			const offerId = '123';
			const reason = 'Needs price adjustment';
			const mockResponse = {
				success: true,
				data: { id: offerId, status: 'NeedsModification' },
				message: 'Offer marked as needs modification',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.markAsNeedsModification(offerId, reason);

			expect(global.fetch).toHaveBeenCalledWith(
				`${API_BASE_URL}${API_ENDPOINTS.SALES.OFFERS.BY_ID(offerId)}/needs-modification`,
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({ reason }),
					headers: expect.objectContaining({
						'Authorization': 'Bearer mock-token',
						'Content-Type': 'application/json',
					}),
				})
			);
			expect(result.success).toBe(true);
			expect(result.data.status).toBe('NeedsModification');
		});

		it('should call endpoint without reason when reason is not provided', async () => {
			const offerId = '123';
			const mockResponse = {
				success: true,
				data: { id: offerId, status: 'NeedsModification' },
				message: 'Offer marked as needs modification',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			await salesApi.markAsNeedsModification(offerId);

			expect(global.fetch).toHaveBeenCalledWith(
				`${API_BASE_URL}${API_ENDPOINTS.SALES.OFFERS.BY_ID(offerId)}/needs-modification`,
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({ reason: undefined }),
				})
			);
		});
	});

	describe('markAsUnderReview', () => {
		it('should call correct endpoint', async () => {
			const offerId = '123';
			const mockResponse = {
				success: true,
				data: { id: offerId, status: 'UnderReview' },
				message: 'Offer marked as under review',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.markAsUnderReview(offerId);

			expect(global.fetch).toHaveBeenCalledWith(
				`${API_BASE_URL}${API_ENDPOINTS.SALES.OFFERS.BY_ID(offerId)}/under-review`,
				expect.objectContaining({
					method: 'POST',
				})
			);
			expect(result.success).toBe(true);
			expect(result.data.status).toBe('UnderReview');
		});
	});

	describe('updateExpiredOffers', () => {
		it('should call correct endpoint and return expired count', async () => {
			const mockResponse = {
				success: true,
				data: { expiredCount: 5 },
				message: 'Expired offers updated',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.updateExpiredOffers();

			expect(global.fetch).toHaveBeenCalledWith(
				`${API_BASE_URL}${API_ENDPOINTS.SALES.OFFERS.BASE}/update-expired`,
				expect.objectContaining({
					method: 'POST',
				})
			);
			expect(result.success).toBe(true);
			expect(result.data.expiredCount).toBe(5);
		});
	});

	describe('sendOfferToSalesman', () => {
		it('should call correct endpoint', async () => {
			const offerId = '123';
			const mockResponse = {
				success: true,
				data: { id: offerId, status: 'Sent' },
				message: 'Offer sent to salesman',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.sendOfferToSalesman(offerId);

			expect(global.fetch).toHaveBeenCalledWith(
				`${API_BASE_URL}${API_ENDPOINTS.SALES.OFFERS.BY_ID(offerId)}/send-to-salesman`,
				expect.objectContaining({
					method: 'POST',
				})
			);
			expect(result.success).toBe(true);
			expect(result.data.status).toBe('Sent');
		});
	});

	describe('recordClientResponse', () => {
		it('should call correct endpoint with accepted response', async () => {
			const offerId = '123';
			const responseData = {
				accepted: true,
				response: 'Client accepted the offer',
			};
			const mockResponse = {
				success: true,
				data: { id: offerId, status: 'Accepted' },
				message: 'Client response recorded',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.recordClientResponse(offerId, responseData);

			expect(global.fetch).toHaveBeenCalledWith(
				`${API_BASE_URL}${API_ENDPOINTS.SALES.OFFERS.BY_ID(offerId)}/client-response`,
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(responseData),
				})
			);
			expect(result.success).toBe(true);
			expect(result.data.status).toBe('Accepted');
		});

		it('should call correct endpoint with rejected response', async () => {
			const offerId = '123';
			const responseData = {
				accepted: false,
				response: 'Client rejected due to pricing',
			};
			const mockResponse = {
				success: true,
				data: { id: offerId, status: 'Rejected' },
				message: 'Client response recorded',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.recordClientResponse(offerId, responseData);

			expect(result.success).toBe(true);
			expect(result.data.status).toBe('Rejected');
		});
	});

	describe('completeOffer', () => {
		it('should call correct endpoint with completion notes', async () => {
			const offerId = '123';
			const completionNotes = 'Offer completed successfully';
			const mockResponse = {
				success: true,
				data: { id: offerId, status: 'Completed' },
				message: 'Offer marked as completed',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.completeOffer(offerId, completionNotes);

			expect(global.fetch).toHaveBeenCalledWith(
				`${API_BASE_URL}${API_ENDPOINTS.SALES.OFFERS.BY_ID(offerId)}/complete`,
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({ completionNotes }),
				})
			);
			expect(result.success).toBe(true);
			expect(result.data.status).toBe('Completed');
		});
	});
});

