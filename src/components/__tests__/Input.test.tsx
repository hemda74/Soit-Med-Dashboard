import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../ui/input';

describe('Input Component', () => {
	it('renders input element', () => {
		render(<Input />);
		const input = screen.getByRole('textbox');
		expect(input).toBeInTheDocument();
	});

	it('renders input with placeholder', () => {
		render(<Input placeholder="Enter text" />);
		expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
	});

	it('handles value changes', async () => {
		const user = userEvent.setup();
		render(<Input />);
		const input = screen.getByRole('textbox') as HTMLInputElement;
		
		await user.type(input, 'test value');
		expect(input.value).toBe('test value');
	});

	it('calls onChange handler', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();
		render(<Input onChange={handleChange} />);
		const input = screen.getByRole('textbox');
		
		await user.type(input, 'test');
		expect(handleChange).toHaveBeenCalled();
	});

	it('is disabled when disabled prop is true', () => {
		render(<Input disabled />);
		const input = screen.getByRole('textbox');
		expect(input).toBeDisabled();
	});

	it('supports different input types', () => {
		const { rerender, container } = render(<Input type="text" />);
		let input = screen.getByRole('textbox') as HTMLInputElement;
		expect(input.type).toBe('text');

		rerender(<Input type="email" />);
		input = screen.getByRole('textbox') as HTMLInputElement;
		expect(input.type).toBe('email');

		rerender(<Input type="password" />);
		const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
		expect(passwordInput).toBeInTheDocument();
		expect(passwordInput.type).toBe('password');
	});

	it('applies custom className', () => {
		const { container } = render(<Input className="custom-class" />);
		const input = container.querySelector('input');
		expect(input?.className).toContain('custom-class');
	});

	it('forwards ref correctly', () => {
		const ref = { current: null } as React.RefObject<HTMLInputElement>;
		render(<Input ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLInputElement);
	});
});

