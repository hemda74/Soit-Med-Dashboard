import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../ui/checkbox';

describe('Checkbox Component', () => {
	it('renders checkbox element', () => {
		render(<Checkbox />);
		const checkbox = screen.getByRole('checkbox');
		expect(checkbox).toBeInTheDocument();
	});

	it('is unchecked by default', () => {
		render(<Checkbox />);
		const checkbox = screen.getByRole('checkbox');
		expect(checkbox).not.toBeChecked();
	});

	it('can be checked', async () => {
		const user = userEvent.setup();
		render(<Checkbox />);
		const checkbox = screen.getByRole('checkbox');
		
		await user.click(checkbox);
		expect(checkbox).toBeChecked();
	});

	it('can be unchecked after being checked', async () => {
		const user = userEvent.setup();
		render(<Checkbox />);
		const checkbox = screen.getByRole('checkbox');
		
		await user.click(checkbox);
		expect(checkbox).toBeChecked();
		
		await user.click(checkbox);
		expect(checkbox).not.toBeChecked();
	});

	it('is checked when checked prop is true', () => {
		render(<Checkbox checked />);
		const checkbox = screen.getByRole('checkbox');
		expect(checkbox).toBeChecked();
	});

	it('is disabled when disabled prop is true', () => {
		render(<Checkbox disabled />);
		const checkbox = screen.getByRole('checkbox');
		expect(checkbox).toBeDisabled();
	});

	it('calls onCheckedChange when clicked', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();
		render(<Checkbox onCheckedChange={handleChange} />);
		const checkbox = screen.getByRole('checkbox');
		
		await user.click(checkbox);
		expect(handleChange).toHaveBeenCalledTimes(1);
	});

	it('applies custom className', () => {
		const { container } = render(<Checkbox className="custom-class" />);
		const checkbox = container.querySelector('[role="checkbox"]');
		expect(checkbox?.className).toContain('custom-class');
	});

	it('forwards ref correctly', () => {
		const ref = { current: null } as React.RefObject<HTMLButtonElement>;
		render(<Checkbox ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});
});




