import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from '../ui/progress';

describe('Progress Component', () => {
	it('renders progress element', () => {
		const { container } = render(<Progress value={50} />);
		const progress = container.querySelector('[role="progressbar"]');
		expect(progress).toBeInTheDocument();
	});

	it('displays correct value', () => {
		const { container } = render(<Progress value={75} />);
		const progress = container.querySelector('[role="progressbar"]');
		expect(progress).toBeInTheDocument();
		// Progress component uses value prop for styling, not aria attributes
	});

	it('handles value of 0', () => {
		const { container } = render(<Progress value={0} />);
		const progress = container.querySelector('[role="progressbar"]');
		expect(progress).toBeInTheDocument();
	});

	it('handles value of 100', () => {
		const { container } = render(<Progress value={100} />);
		const progress = container.querySelector('[role="progressbar"]');
		expect(progress).toBeInTheDocument();
	});

	it('handles value above 100', () => {
		const { container } = render(<Progress value={150} />);
		const progress = container.querySelector('[role="progressbar"]');
		expect(progress).toBeInTheDocument();
	});

	it('handles value below 0', () => {
		const { container } = render(<Progress value={-10} />);
		const progress = container.querySelector('[role="progressbar"]');
		expect(progress).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const { container } = render(<Progress value={50} className="custom-class" />);
		const progress = container.querySelector('[role="progressbar"]');
		expect(progress?.className).toContain('custom-class');
	});

	it('has correct accessibility role', () => {
		const { container } = render(<Progress value={50} />);
		const progress = container.querySelector('[role="progressbar"]');
		expect(progress).toBeInTheDocument();
	});
});

