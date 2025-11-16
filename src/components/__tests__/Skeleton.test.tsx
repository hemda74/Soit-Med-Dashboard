import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '../ui/skeleton';

describe('Skeleton Component', () => {
	it('renders skeleton element', () => {
		const { container } = render(<Skeleton />);
		const skeleton = container.querySelector('div');
		expect(skeleton).toBeInTheDocument();
	});

	it('applies default skeleton styles', () => {
		const { container } = render(<Skeleton />);
		const skeleton = container.querySelector('div');
		expect(skeleton?.className).toContain('animate-pulse');
	});

	it('applies custom className', () => {
		const { container } = render(<Skeleton className="custom-class" />);
		const skeleton = container.querySelector('div');
		expect(skeleton?.className).toContain('custom-class');
	});

	it('renders with custom width', () => {
		const { container } = render(<Skeleton className="w-32" />);
		const skeleton = container.querySelector('div');
		expect(skeleton?.className).toContain('w-32');
	});

	it('renders with custom height', () => {
		const { container } = render(<Skeleton className="h-10" />);
		const skeleton = container.querySelector('div');
		expect(skeleton?.className).toContain('h-10');
	});

	it('renders children when provided', () => {
		const { container } = render(
			<Skeleton>
				<span>Loading...</span>
			</Skeleton>
		);
		expect(container.querySelector('span')).toBeInTheDocument();
		expect(container.textContent).toContain('Loading...');
	});
});




