import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../ui/label';

describe('Label Component', () => {
	it('renders label with text', () => {
		render(<Label>Test Label</Label>);
		expect(screen.getByText('Test Label')).toBeInTheDocument();
	});

	it('renders label with htmlFor attribute', () => {
		render(<Label htmlFor="test-input">Input Label</Label>);
		const label = screen.getByText('Input Label');
		expect(label).toHaveAttribute('for', 'test-input');
	});

	it('applies custom className', () => {
		const { container } = render(<Label className="custom-class">Custom Label</Label>);
		const label = container.querySelector('label');
		expect(label?.className).toContain('custom-class');
	});

	it('renders label with children elements', () => {
		render(
			<Label>
				<span>Label with span</span>
			</Label>
		);
		expect(screen.getByText('Label with span')).toBeInTheDocument();
	});

	it('forwards ref correctly', () => {
		const ref = { current: null } as React.RefObject<HTMLLabelElement>;
		render(<Label ref={ref}>Ref Label</Label>);
		expect(ref.current).toBeInstanceOf(HTMLLabelElement);
	});
});




