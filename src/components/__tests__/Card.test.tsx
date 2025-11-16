import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '../ui/card';

describe('Card Component', () => {
	it('renders Card with children', () => {
		render(<Card>Card Content</Card>);
		expect(screen.getByText('Card Content')).toBeInTheDocument();
	});

	it('renders CardHeader', () => {
		render(
			<Card>
				<CardHeader>Header Content</CardHeader>
			</Card>
		);
		expect(screen.getByText('Header Content')).toBeInTheDocument();
	});

	it('renders CardTitle', () => {
		render(
			<Card>
				<CardTitle>Card Title</CardTitle>
			</Card>
		);
		expect(screen.getByText('Card Title')).toBeInTheDocument();
	});

	it('renders CardDescription', () => {
		render(
			<Card>
				<CardDescription>Card Description</CardDescription>
			</Card>
		);
		expect(screen.getByText('Card Description')).toBeInTheDocument();
	});

	it('renders CardContent', () => {
		render(
			<Card>
				<CardContent>Content Text</CardContent>
			</Card>
		);
		expect(screen.getByText('Content Text')).toBeInTheDocument();
	});

	it('renders CardFooter', () => {
		render(
			<Card>
				<CardFooter>Footer Content</CardFooter>
			</Card>
		);
		expect(screen.getByText('Footer Content')).toBeInTheDocument();
	});

	it('renders complete Card structure', () => {
		render(
			<Card>
				<CardHeader>
					<CardTitle>Test Title</CardTitle>
					<CardDescription>Test Description</CardDescription>
				</CardHeader>
				<CardContent>Test Content</CardContent>
				<CardFooter>Test Footer</CardFooter>
			</Card>
		);

		expect(screen.getByText('Test Title')).toBeInTheDocument();
		expect(screen.getByText('Test Description')).toBeInTheDocument();
		expect(screen.getByText('Test Content')).toBeInTheDocument();
		expect(screen.getByText('Test Footer')).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const { container } = render(<Card className="custom-class">Content</Card>);
		const card = container.firstChild as HTMLElement;
		expect(card.className).toContain('custom-class');
	});
});




