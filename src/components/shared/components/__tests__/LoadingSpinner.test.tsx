import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
	it('renders spinner element', () => {
		const { container } = render(<LoadingSpinner />);
		const spinner = container.querySelector('.animate-spin');
		expect(spinner).toBeInTheDocument();
	});

	it('renders with default size (md)', () => {
		const { container } = render(<LoadingSpinner />);
		const spinner = container.querySelector('.h-8');
		expect(spinner).toBeInTheDocument();
	});

	it('renders with small size', () => {
		const { container } = render(<LoadingSpinner size="sm" />);
		const spinner = container.querySelector('.h-4');
		expect(spinner).toBeInTheDocument();
	});

	it('renders with large size', () => {
		const { container } = render(<LoadingSpinner size="lg" />);
		const spinner = container.querySelector('.h-12');
		expect(spinner).toBeInTheDocument();
	});

	it('renders text when provided', () => {
		render(<LoadingSpinner text="Loading..." />);
		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	it('does not render text when not provided', () => {
		render(<LoadingSpinner />);
		expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
	});

	it('applies custom className', () => {
		const { container } = render(
			<LoadingSpinner className="custom-class" />
		);
		const wrapper = container.firstChild as HTMLElement;
		expect(wrapper.className).toContain('custom-class');
	});

	it('renders with all props', () => {
		const { container } = render(
			<LoadingSpinner
				size="lg"
				text="Please wait..."
				className="custom-class"
			/>
		);

		expect(screen.getByText('Please wait...')).toBeInTheDocument();
		const spinner = container.querySelector('.h-12');
		expect(spinner).toBeInTheDocument();
		const wrapper = container.firstChild as HTMLElement;
		expect(wrapper.className).toContain('custom-class');
	});
});




