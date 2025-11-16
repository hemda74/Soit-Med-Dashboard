import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '../PageHeader';
import { Button } from '@/components/ui/button';

describe('PageHeader Component', () => {
	it('renders title', () => {
		render(<PageHeader title="Test Page" />);
		expect(screen.getByText('Test Page')).toBeInTheDocument();
	});

	it('renders description when provided', () => {
		render(
			<PageHeader
				title="Test Page"
				description="Test description"
			/>
		);
		expect(screen.getByText('Test description')).toBeInTheDocument();
	});

	it('does not render description when not provided', () => {
		render(<PageHeader title="Test Page" />);
		expect(screen.queryByText('Test description')).not.toBeInTheDocument();
	});

	it('renders action button when provided', () => {
		render(
			<PageHeader
				title="Test Page"
				action={<Button>Add Item</Button>}
			/>
		);
		expect(screen.getByText('Add Item')).toBeInTheDocument();
	});

	it('does not render action when not provided', () => {
		render(<PageHeader title="Test Page" />);
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('applies custom className', () => {
		const { container } = render(
			<PageHeader title="Test Page" className="custom-class" />
		);
		const header = container.firstChild as HTMLElement;
		expect(header.className).toContain('custom-class');
	});

	it('renders complete header with all props', () => {
		render(
			<PageHeader
				title="Test Page"
				description="Test description"
				action={<Button>Action</Button>}
			/>
		);

		expect(screen.getByText('Test Page')).toBeInTheDocument();
		expect(screen.getByText('Test description')).toBeInTheDocument();
		expect(screen.getByText('Action')).toBeInTheDocument();
	});
});




