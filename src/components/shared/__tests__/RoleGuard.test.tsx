import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RoleGuard from '../RoleGuard';
import { useAuthStore } from '@/stores/authStore';

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
	useAuthStore: vi.fn(),
}));

// Mock Navigate component
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
	};
});

describe('RoleGuard Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders children when user is authenticated and has required role', () => {
		(useAuthStore as any).mockReturnValue({
			isAuthenticated: true,
			hasAnyRole: vi.fn(() => true),
		});

		const { getByText } = render(
			<BrowserRouter>
				<RoleGuard requiredAnyRoles={['Admin']}>
					<div>Protected Content</div>
				</RoleGuard>
			</BrowserRouter>
		);

		expect(getByText('Protected Content')).toBeInTheDocument();
	});

	it('redirects to login when user is not authenticated', () => {
		(useAuthStore as any).mockReturnValue({
			isAuthenticated: false,
			hasAnyRole: vi.fn(() => false),
		});

		const { getByTestId } = render(
			<BrowserRouter>
				<RoleGuard requiredAnyRoles={['Admin']}>
					<div>Protected Content</div>
				</RoleGuard>
			</BrowserRouter>
		);

		expect(getByTestId('navigate')).toBeInTheDocument();
		expect(getByTestId('navigate').textContent).toBe('/login');
	});

	it('allows SuperAdmin to access any route', () => {
		(useAuthStore as any).mockReturnValue({
			isAuthenticated: true,
			hasAnyRole: vi.fn((roles) => roles.includes('SuperAdmin')),
		});

		const { getByText } = render(
			<BrowserRouter>
				<RoleGuard requiredAnyRoles={['Admin']}>
					<div>Protected Content</div>
				</RoleGuard>
			</BrowserRouter>
		);

		expect(getByText('Protected Content')).toBeInTheDocument();
	});

	it('redirects to not-found when user lacks required roles', () => {
		(useAuthStore as any).mockReturnValue({
			isAuthenticated: true,
			hasAnyRole: vi.fn(() => false),
		});

		const { getByTestId } = render(
			<BrowserRouter>
				<RoleGuard requiredAnyRoles={['Admin']}>
					<div>Protected Content</div>
				</RoleGuard>
			</BrowserRouter>
		);

		expect(getByTestId('navigate')).toBeInTheDocument();
		expect(getByTestId('navigate').textContent).toBe('/not-found');
	});

	it('renders children when no roles are required', () => {
		(useAuthStore as any).mockReturnValue({
			isAuthenticated: true,
			hasAnyRole: vi.fn(() => false),
		});

		const { getByText } = render(
			<BrowserRouter>
				<RoleGuard>
					<div>Public Content</div>
				</RoleGuard>
			</BrowserRouter>
		);

		expect(getByText('Public Content')).toBeInTheDocument();
	});
});




