import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../ui/textarea';

describe('Textarea Component', () => {
	it('renders textarea element', () => {
		render(<Textarea />);
		const textarea = screen.getByRole('textbox');
		expect(textarea).toBeInTheDocument();
	});

	it('renders with placeholder', () => {
		render(<Textarea placeholder="Enter text here" />);
		expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
	});

	it('handles value changes', async () => {
		const user = userEvent.setup();
		render(<Textarea />);
		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		
		await user.type(textarea, 'test value');
		expect(textarea.value).toBe('test value');
	});

	it('calls onChange handler', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();
		render(<Textarea onChange={handleChange} />);
		const textarea = screen.getByRole('textbox');
		
		await user.type(textarea, 'test');
		expect(handleChange).toHaveBeenCalled();
	});

	it('is disabled when disabled prop is true', () => {
		render(<Textarea disabled />);
		const textarea = screen.getByRole('textbox');
		expect(textarea).toBeDisabled();
	});

	it('respects rows attribute', () => {
		render(<Textarea rows={5} />);
		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		expect(textarea.rows).toBe(5);
	});

	it('applies custom className', () => {
		const { container } = render(<Textarea className="custom-class" />);
		const textarea = container.querySelector('textarea');
		expect(textarea?.className).toContain('custom-class');
	});

	it('forwards ref correctly', () => {
		const ref = { current: null } as React.RefObject<HTMLTextAreaElement>;
		render(<Textarea ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
	});

	it('handles multiline text', async () => {
		const user = userEvent.setup();
		render(<Textarea />);
		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		
		await user.type(textarea, 'Line 1{Enter}Line 2');
		expect(textarea.value).toContain('Line 1');
		expect(textarea.value).toContain('Line 2');
	});
});




