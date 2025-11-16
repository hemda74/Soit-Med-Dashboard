import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../ui/badge';

describe('Badge Component', () => {
	it('renders badge with text', () => {
		render(<Badge>Test Badge</Badge>);
		expect(screen.getByText('Test Badge')).toBeInTheDocument();
	});

	it('renders with default variant', () => {
		const { container } = render(<Badge>Default</Badge>);
		const badge = container.firstChild as HTMLElement;
		expect(badge).toBeInTheDocument();
	});

	it('renders with secondary variant', () => {
		const { container } = render(<Badge variant="secondary">Secondary</Badge>);
		const badge = container.firstChild as HTMLElement;
		expect(badge).toBeInTheDocument();
		expect(badge.className).toContain('secondary');
	});

	it('renders with destructive variant', () => {
		const { container } = render(<Badge variant="destructive">Destructive</Badge>);
		const badge = container.firstChild as HTMLElement;
		expect(badge).toBeInTheDocument();
		expect(badge.className).toContain('destructive');
	});

	it('renders with outline variant', () => {
		const { container } = render(<Badge variant="outline">Outline</Badge>);
		const badge = container.firstChild as HTMLElement;
		expect(badge).toBeInTheDocument();
		expect(badge.className).toContain('outline');
	});

	it('applies custom className', () => {
		const { container } = render(<Badge className="custom-class">Custom</Badge>);
		const badge = container.firstChild as HTMLElement;
		expect(badge.className).toContain('custom-class');
	});

	it('renders badge with children elements', () => {
		render(
			<Badge>
				<span>Badge with span</span>
			</Badge>
		);
		expect(screen.getByText('Badge with span')).toBeInTheDocument();
	});
});




