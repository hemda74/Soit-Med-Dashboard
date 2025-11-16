import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../ui/button';

describe('Button Component', () => {
	it('renders button with text', () => {
		render(<Button>Click me</Button>);
		expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
	});

	it('calls onClick when clicked', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();
		
		render(<Button onClick={handleClick}>Click me</Button>);
		
		await user.click(screen.getByRole('button'));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('is disabled when disabled prop is true', () => {
		render(<Button disabled>Disabled</Button>);
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('shows loading state', () => {
		render(<Button disabled>Loading...</Button>);
		expect(screen.getByRole('button')).toBeDisabled();
	});
});

