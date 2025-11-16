import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../EmptyState';
import { Button } from '@/components/ui/button';

describe('EmptyState Component', () => {
	it('renders with default title and description', () => {
		render(<EmptyState />);
		expect(screen.getByText('No data available')).toBeInTheDocument();
		expect(
			screen.getByText('There is no data to display at the moment.')
		).toBeInTheDocument();
	});

	it('renders with custom title', () => {
		render(<EmptyState title="Custom Title" />);
		expect(screen.getByText('Custom Title')).toBeInTheDocument();
	});

	it('renders with custom description', () => {
		render(<EmptyState description="Custom description" />);
		expect(screen.getByText('Custom description')).toBeInTheDocument();
	});

	it('renders with custom icon', () => {
		const CustomIcon = () => <div data-testid="custom-icon">Icon</div>;
		render(<EmptyState icon={<CustomIcon />} />);
		expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
	});

	it('renders with action button', () => {
		const handleClick = vi.fn();
		render(
			<EmptyState
				action={<Button onClick={handleClick}>Add Item</Button>}
			/>
		);
		expect(screen.getByText('Add Item')).toBeInTheDocument();
	});

	it('calls action button onClick handler', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();
		render(
			<EmptyState
				action={<Button onClick={handleClick}>Add Item</Button>}
			/>
		);

		await user.click(screen.getByText('Add Item'));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('applies custom className', () => {
		const { container } = render(<EmptyState className="custom-class" />);
		const emptyState = container.firstChild as HTMLElement;
		expect(emptyState.className).toContain('custom-class');
	});

	it('renders default icon when no icon provided', () => {
		const { container } = render(<EmptyState />);
		const icon = container.querySelector('svg');
		expect(icon).toBeInTheDocument();
	});
});




