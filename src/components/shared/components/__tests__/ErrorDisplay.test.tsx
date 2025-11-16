import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorDisplay } from '../ErrorDisplay';

describe('ErrorDisplay Component', () => {
	it('renders with default title and message', () => {
		render(<ErrorDisplay message="Error occurred" />);
		expect(screen.getByText('Something went wrong')).toBeInTheDocument();
		expect(screen.getByText('Error occurred')).toBeInTheDocument();
	});

	it('renders with custom title', () => {
		render(<ErrorDisplay title="Custom Error" message="Error message" />);
		expect(screen.getByText('Custom Error')).toBeInTheDocument();
	});

	it('renders error message', () => {
		render(<ErrorDisplay message="Network error" />);
		expect(screen.getByText('Network error')).toBeInTheDocument();
	});

	it('renders retry button when onRetry provided', () => {
		const handleRetry = vi.fn();
		render(<ErrorDisplay message="Error" onRetry={handleRetry} />);
		expect(screen.getByText('Try Again')).toBeInTheDocument();
	});

	it('calls onRetry when retry button clicked', async () => {
		const handleRetry = vi.fn();
		const user = userEvent.setup();
		render(<ErrorDisplay message="Error" onRetry={handleRetry} />);

		await user.click(screen.getByText('Try Again'));
		expect(handleRetry).toHaveBeenCalledTimes(1);
	});

	it('renders dismiss button when onDismiss provided', () => {
		const handleDismiss = vi.fn();
		render(<ErrorDisplay message="Error" onDismiss={handleDismiss} />);
		expect(screen.getByText('Dismiss')).toBeInTheDocument();
	});

	it('calls onDismiss when dismiss button clicked', async () => {
		const handleDismiss = vi.fn();
		const user = userEvent.setup();
		render(<ErrorDisplay message="Error" onDismiss={handleDismiss} />);

		await user.click(screen.getByText('Dismiss'));
		expect(handleDismiss).toHaveBeenCalledTimes(1);
	});

	it('renders both retry and dismiss buttons', () => {
		const handleRetry = vi.fn();
		const handleDismiss = vi.fn();
		render(
			<ErrorDisplay
				message="Error"
				onRetry={handleRetry}
				onDismiss={handleDismiss}
			/>
		);
		expect(screen.getByText('Try Again')).toBeInTheDocument();
		expect(screen.getByText('Dismiss')).toBeInTheDocument();
	});

	it('does not render buttons when no callbacks provided', () => {
		render(<ErrorDisplay message="Error" />);
		expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
		expect(screen.queryByText('Dismiss')).not.toBeInTheDocument();
	});

	it('applies custom className', () => {
		const { container } = render(
			<ErrorDisplay message="Error" className="custom-class" />
		);
		const card = container.querySelector('.custom-class');
		expect(card).toBeInTheDocument();
	});
});




