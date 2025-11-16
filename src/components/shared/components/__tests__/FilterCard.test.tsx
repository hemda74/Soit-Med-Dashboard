import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterCard } from '../FilterCard';
import { Input } from '@/components/ui/input';

describe('FilterCard Component', () => {
	it('renders with default title', () => {
		render(
			<FilterCard>
				<div>Filter Content</div>
			</FilterCard>
		);
		expect(screen.getByText('Filters & Search')).toBeInTheDocument();
	});

	it('renders with custom title', () => {
		render(
			<FilterCard title="Custom Filters">
				<div>Filter Content</div>
			</FilterCard>
		);
		expect(screen.getByText('Custom Filters')).toBeInTheDocument();
	});

	it('renders children content', () => {
		render(
			<FilterCard>
				<Input placeholder="Search..." />
			</FilterCard>
		);
		expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
	});

	it('renders multiple children', () => {
		render(
			<FilterCard>
				<Input placeholder="Search..." />
				<Input placeholder="Filter..." />
			</FilterCard>
		);
		expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Filter...')).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const { container } = render(
			<FilterCard className="custom-class">
				<div>Content</div>
			</FilterCard>
		);
		const card = container.querySelector('.custom-class');
		expect(card).toBeInTheDocument();
	});

	it('renders filter icon', () => {
		const { container } = render(
			<FilterCard>
				<div>Content</div>
			</FilterCard>
		);
		// Filter icon should be present (from lucide-react)
		const icon = container.querySelector('svg');
		expect(icon).toBeInTheDocument();
	});
});




