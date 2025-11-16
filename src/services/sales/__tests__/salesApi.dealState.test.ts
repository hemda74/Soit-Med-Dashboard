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

describe('SalesApi - Deal State Transitions', () => {
	const API_BASE_URL = 'http://localhost:5117';

	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('createDeal', () => {
		it('should call correct endpoint with deal data', async () => {
			const dealData = {
				offerId: 123,
				clientId: 456,
				dealValue: 50000,
				paymentTerms: 'Net 30',
				deliveryTerms: 'FOB',
				expectedDeliveryDate: '2025-02-01',
				notes: 'Test deal',
			};
			const mockResponse = {
				success: true,
				data: { id: 1, status: 'PendingManagerApproval', ...dealData },
				message: 'Deal created successfully',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.createDeal(dealData);

			expect(global.fetch).toHaveBeenCalledWith(
				`${API_BASE_URL}${API_ENDPOINTS.SALES.DEALS.BASE}`,
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(dealData),
				})
			);
			expect(result.success).toBe(true);
			expect(result.data.status).toBe('PendingManagerApproval');
		});
	});

	describe('managerApproval', () => {
		it('should call correct endpoint for approval', async () => {
			const dealId = '123';
			const approvalData = {
				approved: true,
				comments: 'Approved by manager',
			};
			const mockResponse = {
				success: true,
				data: { id: dealId, status: 'PendingSuperAdminApproval' },
				message: 'Manager approval processed',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.approveDeal(dealId, approvalData);

			expect(global.fetch).toHaveBeenCalledWith(
				`${API_BASE_URL}${API_ENDPOINTS.SALES.DEALS.MANAGER_APPROVAL(dealId)}`,
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(approvalData),
				})
			);
			expect(result.success).toBe(true);
			expect(result.data.status).toBe('PendingSuperAdminApproval');
		});

		it('should call correct endpoint for rejection', async () => {
			const dealId = '123';
			const approvalData = {
				approved: false,
				rejectionReason: 'Money',
				comments: 'Rejected due to budget constraints',
			};
			const mockResponse = {
				success: true,
				data: { id: dealId, status: 'RejectedByManager' },
				message: 'Manager rejection processed',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.approveDeal(dealId, approvalData);

			expect(result.success).toBe(true);
			expect(result.data.status).toBe('RejectedByManager');
		});
	});

	describe('superAdminApproval', () => {
		it('should call correct endpoint for approval', async () => {
			const dealId = '123';
			const approvalData = {
				approved: true,
				comments: 'Approved by super admin',
			};
			const mockResponse = {
				success: true,
				data: { id: dealId, status: 'SentToLegal' },
				message: 'SuperAdmin approval processed',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.superAdminApproval(dealId, approvalData);

			expect(global.fetch).toHaveBeenCalledWith(
				`${API_BASE_URL}${API_ENDPOINTS.SALES.DEALS.SUPERADMIN_APPROVAL(dealId)}`,
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(approvalData),
				})
			);
			expect(result.success).toBe(true);
			expect(result.data.status).toBe('SentToLegal');
		});

		it('should call correct endpoint for rejection', async () => {
			const dealId = '123';
			const approvalData = {
				approved: false,
				rejectionReason: 'CashFlow',
				comments: 'Rejected due to cash flow issues',
			};
			const mockResponse = {
				success: true,
				data: { id: dealId, status: 'RejectedBySuperAdmin' },
				message: 'SuperAdmin rejection processed',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.superAdminApproval(dealId, approvalData);

			expect(result.success).toBe(true);
			expect(result.data.status).toBe('RejectedBySuperAdmin');
		});
	});

	describe('markDealAsCompleted', () => {
		it('should call correct endpoint with completion notes', async () => {
			const dealId = '123';
			const completionNotes = 'Deal completed successfully';
			const mockResponse = {
				success: true,
				data: { id: dealId, status: 'Success' },
				message: 'Deal marked as completed',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.completeDeal(dealId, { completionNotes });

			expect(global.fetch).toHaveBeenCalledWith(
				`${API_BASE_URL}${API_ENDPOINTS.SALES.DEALS.COMPLETE(dealId)}`,
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({ completionNotes }),
				})
			);
			expect(result.success).toBe(true);
			expect(result.data.status).toBe('Success');
		});
	});

	describe('markDealAsFailed', () => {
		it('should call correct endpoint with failure notes', async () => {
			const dealId = '123';
			const failureNotes = 'Deal failed due to client cancellation';
			const mockResponse = {
				success: true,
				data: { id: dealId, status: 'Failed' },
				message: 'Deal marked as failed',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.failDeal(dealId, { failureNotes });

			expect(global.fetch).toHaveBeenCalledWith(
				`${API_BASE_URL}${API_ENDPOINTS.SALES.DEALS.FAIL(dealId)}`,
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({ failureNotes }),
				})
			);
			expect(result.success).toBe(true);
			expect(result.data.status).toBe('Failed');
		});
	});

	describe('getPendingManagerApprovals', () => {
		it('should call correct endpoint', async () => {
			const mockResponse = {
				success: true,
				data: [
					{ id: 1, status: 'PendingManagerApproval' },
					{ id: 2, status: 'PendingManagerApproval' },
				],
				message: 'Pending approvals retrieved',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.getPendingApprovals();

			expect(global.fetch).toHaveBeenCalledWith(
				`${API_BASE_URL}${API_ENDPOINTS.SALES.DEALS.PENDING_MANAGER}`,
				expect.objectContaining({
					method: 'GET',
				})
			);
			expect(result.success).toBe(true);
			expect(Array.isArray(result.data)).toBe(true);
		});
	});

	describe('getPendingSuperAdminApprovals', () => {
		it('should call correct endpoint', async () => {
			const mockResponse = {
				success: true,
				data: [
					{ id: 1, status: 'PendingSuperAdminApproval' },
					{ id: 2, status: 'PendingSuperAdminApproval' },
				],
				message: 'Pending approvals retrieved',
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await salesApi.getPendingSuperAdminApprovals();

			expect(global.fetch).toHaveBeenCalledWith(
				`${API_BASE_URL}${API_ENDPOINTS.SALES.DEALS.PENDING_SUPERADMIN}`,
				expect.objectContaining({
					method: 'GET',
				})
			);
			expect(result.success).toBe(true);
			expect(Array.isArray(result.data)).toBe(true);
		});
	});
});

