import React, { useRef, useCallback, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OfferPrintTemplate } from './OfferPrintTemplate';
import type { PDFExportOptions, PDFLanguage } from './OfferPrintTemplate';
import { printOfferHtml, previewOfferHtml, downloadOfferPdfFromHtml } from '@/utils/pdfGeneratorHtml';
import { Printer, Download, ExternalLink, Languages } from 'lucide-react';

interface OfferData {
	id: number;
	clientName: string;
	clientType?: string;
	clientLocation?: string;
	products: string;
	totalAmount: number;
	discountAmount?: number;
	validUntil: string;
	paymentTerms?: string;
	deliveryTerms?: string;
	warrantyTerms?: string;
	createdAt: string;
	status: string;
	assignedToName?: string;
	equipment?: any[];
}

interface OfferPreviewDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	offer: OfferData;
	options?: PDFExportOptions;
}

export const OfferPreviewDialog: React.FC<OfferPreviewDialogProps> = ({
	open,
	onOpenChange,
	offer,
	options = {},
}) => {
	const printContainerRef = useRef<HTMLDivElement>(null);
	const [language, setLanguage] = useState<PDFLanguage>(options.language || 'en');
	const [isExporting, setIsExporting] = useState(false);

	const currentOptions: PDFExportOptions = {
		...options,
		language,
	};

	// Handle print via browser dialog
	const handlePrint = useCallback(async () => {
		try {
			await printOfferHtml(offer, currentOptions);
		} catch (error) {
			console.error('Print error:', error);
		}
	}, [offer, currentOptions]);

	// Handle open in new window
	const handleOpenInNewWindow = useCallback(() => {
		previewOfferHtml(offer, currentOptions);
	}, [offer, currentOptions]);

	// Handle download as PDF
	const handleDownload = useCallback(async () => {
		setIsExporting(true);
		try {
			await downloadOfferPdfFromHtml(offer, currentOptions);
		} catch (error) {
			console.error('Download error:', error);
		} finally {
			setIsExporting(false);
		}
	}, [offer, currentOptions]);

	// Toggle language
	const toggleLanguage = () => {
		setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[900px] max-h-[90vh] p-0 overflow-hidden">
				<DialogHeader className="px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="flex items-center justify-between">
						<DialogTitle className="text-lg font-semibold">
							{language === 'ar' ? 'معاينة العرض' : 'Offer Preview'}
							<span className="ml-2 text-muted-foreground font-normal">
								#{offer.id}
							</span>
						</DialogTitle>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={toggleLanguage}
								className="gap-2"
							>
								<Languages className="h-4 w-4" />
								{language === 'en' ? 'العربية' : 'English'}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleOpenInNewWindow}
								className="gap-2"
							>
								<ExternalLink className="h-4 w-4" />
								{language === 'ar' ? 'نافذة جديدة' : 'New Window'}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleDownload}
								disabled={isExporting}
								className="gap-2"
							>
								<Download className="h-4 w-4" />
								{isExporting
									? language === 'ar'
										? 'جاري التصدير...'
										: 'Exporting...'
									: language === 'ar'
									? 'تحميل PDF'
									: 'Download PDF'}
							</Button>
							<Button
								variant="default"
								size="sm"
								onClick={handlePrint}
								className="gap-2"
							>
								<Printer className="h-4 w-4" />
								{language === 'ar' ? 'طباعة' : 'Print'}
							</Button>
						</div>
					</div>
				</DialogHeader>

				{/* Preview Container */}
				<div className="overflow-auto bg-gray-100 p-4" style={{ maxHeight: 'calc(90vh - 80px)' }}>
					<div
						ref={printContainerRef}
						className="mx-auto shadow-lg"
						style={{
							width: '210mm',
							minHeight: '297mm',
							backgroundColor: 'white',
							transform: 'scale(0.7)',
							transformOrigin: 'top center',
							marginBottom: '-30%', // Compensate for scale
						}}
					>
						<OfferPrintTemplate offer={offer} options={currentOptions} />
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default OfferPreviewDialog;

