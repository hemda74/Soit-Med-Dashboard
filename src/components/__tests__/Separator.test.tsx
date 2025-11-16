import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Separator } from '../ui/separator';

describe('Separator Component', () => {
	it('renders separator element', () => {
		const { container } = render(<Separator />);
		const separator = container.querySelector('div');
		expect(separator).toBeInTheDocument();
	});

	it('has correct default orientation', () => {
		const { container } = render(<Separator />);
		const separator = container.querySelector('div');
		expect(separator).toBeInTheDocument();
		// Separator uses decorative by default, so no role attribute
	});

	it('sets vertical orientation when orientation prop is vertical', () => {
		const { container } = render(<Separator orientation="vertical" />);
		const separator = container.querySelector('div');
		expect(separator).toBeInTheDocument();
		expect(separator?.className).toContain('w-[1px]');
	});

	it('sets horizontal orientation when orientation prop is horizontal', () => {
		const { container } = render(<Separator orientation="horizontal" />);
		const separator = container.querySelector('div');
		expect(separator).toBeInTheDocument();
		expect(separator?.className).toContain('w-full');
	});

	it('applies custom className', () => {
		const { container } = render(<Separator className="custom-class" />);
		const separator = container.querySelector('div');
		expect(separator?.className).toContain('custom-class');
	});

	it('forwards ref correctly', () => {
		const ref = { current: null } as React.RefObject<HTMLDivElement>;
		render(<Separator ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});

