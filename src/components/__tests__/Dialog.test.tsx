import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';

describe('Dialog Component', () => {
	it('renders dialog trigger', () => {
		render(
			<Dialog>
				<DialogTrigger asChild>
					<Button>Open Dialog</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogTitle>Test Dialog</DialogTitle>
				</DialogContent>
			</Dialog>
		);

		expect(screen.getByText('Open Dialog')).toBeInTheDocument();
	});

	it('opens dialog when trigger is clicked', async () => {
		const user = userEvent.setup();
		render(
			<Dialog>
				<DialogTrigger asChild>
					<Button>Open</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogTitle>Dialog Title</DialogTitle>
					<DialogDescription>Dialog Description</DialogDescription>
				</DialogContent>
			</Dialog>
		);

		await user.click(screen.getByText('Open'));
		expect(screen.getByText('Dialog Title')).toBeVisible();
		expect(screen.getByText('Dialog Description')).toBeVisible();
	});

	it('renders dialog title', async () => {
		const user = userEvent.setup();
		render(
			<Dialog>
				<DialogTrigger asChild>
					<Button>Open</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Test Title</DialogTitle>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		);

		await user.click(screen.getByText('Open'));
		expect(screen.getByText('Test Title')).toBeInTheDocument();
	});

	it('renders dialog description', async () => {
		const user = userEvent.setup();
		render(
			<Dialog>
				<DialogTrigger asChild>
					<Button>Open</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Title</DialogTitle>
						<DialogDescription>Test Description</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		);

		await user.click(screen.getByText('Open'));
		expect(screen.getByText('Test Description')).toBeInTheDocument();
	});

	it('renders dialog footer', async () => {
		const user = userEvent.setup();
		render(
			<Dialog>
				<DialogTrigger asChild>
					<Button>Open</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogTitle>Title</DialogTitle>
					<DialogFooter>
						<Button>Cancel</Button>
						<Button>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);

		await user.click(screen.getByText('Open'));
		expect(screen.getByText('Cancel')).toBeInTheDocument();
		expect(screen.getByText('Save')).toBeInTheDocument();
	});

	it('calls onOpenChange when dialog state changes', async () => {
		const handleOpenChange = vi.fn();
		const user = userEvent.setup();
		render(
			<Dialog onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>
					<Button>Open</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogTitle>Title</DialogTitle>
				</DialogContent>
			</Dialog>
		);

		await user.click(screen.getByText('Open'));
		expect(handleOpenChange).toHaveBeenCalled();
	});

	it('closes dialog when close button is clicked', async () => {
		const user = userEvent.setup();
		render(
			<Dialog defaultOpen>
				<DialogContent>
					<DialogTitle>Title</DialogTitle>
				</DialogContent>
			</Dialog>
		);

		const closeButton = screen.getByRole('button', { name: /close/i });
		await user.click(closeButton);
		// Dialog should close - check that content is not in document
		const title = screen.queryByText('Title');
		expect(title).not.toBeInTheDocument();
	});

	it('applies custom className to DialogContent', async () => {
		const user = userEvent.setup();
		render(
			<Dialog>
				<DialogTrigger asChild>
					<Button>Open</Button>
				</DialogTrigger>
				<DialogContent className="custom-dialog">
					<DialogTitle>Title</DialogTitle>
				</DialogContent>
			</Dialog>
		);

		await user.click(screen.getByText('Open'));
		const dialogContent = screen.getByRole('dialog');
		expect(dialogContent.className).toContain('custom-dialog');
	});
});

