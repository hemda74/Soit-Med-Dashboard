import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { salesApi } from '@/services/sales/salesApi';
import toast from 'react-hot-toast';
import { FileText, Upload, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface SalesmanReportFormProps {
	dealId: string | number;
	dealClientName?: string;
	onSuccess?: () => void;
	onCancel?: () => void;
}

const SalesmanReportForm: React.FC<SalesmanReportFormProps> = ({
	dealId,
	dealClientName,
	onSuccess,
	onCancel,
}) => {
	const { user } = useAuthStore();
	const [reportText, setReportText] = useState('');
	const [attachments, setAttachments] = useState<File[]>([]);
	const [uploading, setUploading] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		setAttachments((prev) => [...prev, ...files]);
	};

	const removeAttachment = (index: number) => {
		setAttachments((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!reportText.trim()) {
			toast.error('Please enter a report text');
			return;
		}

		try {
			setSubmitting(true);

			// Upload files if any
			let attachmentsJson: string | undefined;
			if (attachments.length > 0) {
				setUploading(true);
				const filePaths: string[] = [];

				// In a real implementation, you would upload files to a server
				// For now, we'll just store file names
				// TODO: Implement actual file upload to server
				for (const file of attachments) {
					filePaths.push(file.name);
				}

				attachmentsJson = JSON.stringify(filePaths);
				setUploading(false);
			}

			const response = await salesApi.submitSalesmanReport(
				dealId,
				reportText,
				attachmentsJson
			);

			if (response.success) {
				toast.success('Report submitted successfully');
				setReportText('');
				setAttachments([]);
				onSuccess?.();
			} else {
				toast.error(response.message || 'Failed to submit report');
			}
		} catch (error: any) {
			console.error('Error submitting report:', error);
			toast.error(error.message || 'Failed to submit report');
		} finally {
			setSubmitting(false);
			setUploading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText className="h-5 w-5" />
					Submit Report
				</CardTitle>
				<CardDescription>
					{dealClientName
						? `Submit your report for deal with ${dealClientName}`
						: 'Submit your report with the offer'}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="reportText">Report Text *</Label>
						<Textarea
							id="reportText"
							value={reportText}
							onChange={(e) => setReportText(e.target.value)}
							placeholder="Enter your report details here..."
							rows={8}
							required
							className="resize-none"
						/>
						<p className="text-sm text-muted-foreground">
							Please provide a detailed report about the offer and client interaction.
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="attachments">Attachments (Optional)</Label>
						<div className="flex items-center gap-4">
							<label
								htmlFor="file-upload"
								className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
							>
								<Upload className="h-4 w-4" />
								<span>Upload Files</span>
								<input
									id="file-upload"
									type="file"
									multiple
									className="hidden"
									onChange={handleFileSelect}
									accept="image/*,.pdf,.doc,.docx"
								/>
							</label>
						</div>
						{attachments.length > 0 && (
							<div className="mt-2 space-y-2">
								{attachments.map((file, index) => (
									<div
										key={index}
										className="flex items-center justify-between p-2 bg-muted rounded-lg"
									>
										<span className="text-sm truncate flex-1">{file.name}</span>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeAttachment(index)}
											className="h-6 w-6 p-0"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								))}
							</div>
						)}
						<p className="text-sm text-muted-foreground">
							You can attach images, PDFs, or documents related to the offer.
						</p>
					</div>

					<div className="flex items-center justify-end gap-4">
						{onCancel && (
							<Button type="button" variant="outline" onClick={onCancel}>
								Cancel
							</Button>
						)}
						<Button type="submit" disabled={submitting || uploading}>
							{submitting || uploading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									{submitting ? 'Submitting...' : 'Uploading...'}
								</>
							) : (
								'Submit Report'
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};

export default SalesmanReportForm;



