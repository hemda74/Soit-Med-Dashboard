import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

describe('Tabs Component', () => {
	it('renders tabs with content', () => {
		render(
			<Tabs defaultValue="tab1">
				<TabsList>
					<TabsTrigger value="tab1">Tab 1</TabsTrigger>
					<TabsTrigger value="tab2">Tab 2</TabsTrigger>
				</TabsList>
				<TabsContent value="tab1">Content 1</TabsContent>
				<TabsContent value="tab2">Content 2</TabsContent>
			</Tabs>
		);

		expect(screen.getByText('Tab 1')).toBeInTheDocument();
		expect(screen.getByText('Tab 2')).toBeInTheDocument();
		expect(screen.getByText('Content 1')).toBeInTheDocument();
	});

	it('shows default tab content', () => {
		render(
			<Tabs defaultValue="tab1">
				<TabsList>
					<TabsTrigger value="tab1">Tab 1</TabsTrigger>
					<TabsTrigger value="tab2">Tab 2</TabsTrigger>
				</TabsList>
				<TabsContent value="tab1">Content 1</TabsContent>
				<TabsContent value="tab2">Content 2</TabsContent>
			</Tabs>
		);

		expect(screen.getByText('Content 1')).toBeVisible();
	});

	it('switches tabs when clicked', async () => {
		const user = userEvent.setup();
		render(
			<Tabs defaultValue="tab1">
				<TabsList>
					<TabsTrigger value="tab1">Tab 1</TabsTrigger>
					<TabsTrigger value="tab2">Tab 2</TabsTrigger>
				</TabsList>
				<TabsContent value="tab1">Content 1</TabsContent>
				<TabsContent value="tab2">Content 2</TabsContent>
			</Tabs>
		);

		await user.click(screen.getByText('Tab 2'));
		expect(screen.getByText('Content 2')).toBeVisible();
	});

	it('calls onValueChange when tab changes', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();
		render(
			<Tabs defaultValue="tab1" onValueChange={handleChange}>
				<TabsList>
					<TabsTrigger value="tab1">Tab 1</TabsTrigger>
					<TabsTrigger value="tab2">Tab 2</TabsTrigger>
				</TabsList>
				<TabsContent value="tab1">Content 1</TabsContent>
				<TabsContent value="tab2">Content 2</TabsContent>
			</Tabs>
		);

		await user.click(screen.getByText('Tab 2'));
		expect(handleChange).toHaveBeenCalledWith('tab2');
	});

	it('applies custom className to TabsList', () => {
		const { container } = render(
			<Tabs defaultValue="tab1">
				<TabsList className="custom-class">
					<TabsTrigger value="tab1">Tab 1</TabsTrigger>
				</TabsList>
			</Tabs>
		);
		const tabsList = container.querySelector('[role="tablist"]');
		expect(tabsList?.className).toContain('custom-class');
	});

	it('applies custom className to TabsTrigger', () => {
		const { container } = render(
			<Tabs defaultValue="tab1">
				<TabsList>
					<TabsTrigger value="tab1" className="custom-trigger">
						Tab 1
					</TabsTrigger>
				</TabsList>
			</Tabs>
		);
		const trigger = container.querySelector('[role="tab"]');
		expect(trigger?.className).toContain('custom-trigger');
	});

	it('applies custom className to TabsContent', () => {
		const { container } = render(
			<Tabs defaultValue="tab1">
				<TabsList>
					<TabsTrigger value="tab1">Tab 1</TabsTrigger>
				</TabsList>
				<TabsContent value="tab1" className="custom-content">
					Content
				</TabsContent>
			</Tabs>
		);
		const content = container.querySelector('[role="tabpanel"]');
		expect(content?.className).toContain('custom-content');
	});
});




