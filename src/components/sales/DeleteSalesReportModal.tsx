import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { SalesReportResponseDto } from '@/types/salesReport.types';

interface DeleteSalesReportModalProps {
    report: SalesReportResponseDto;
    onClose: () => void;
    onConfirm: (id: number) => Promise<boolean>;
}

const DeleteSalesReportModal: React.FC<DeleteSalesReportModalProps> = ({
    report,
    onClose,
    onConfirm,
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);

        try {
            const success = await onConfirm(report.id);
            if (success) {
                onClose();
            }
        } catch (error) {
            console.error('Error deleting report:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Sales Report
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. The report will be permanently removed from the system.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Report Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">{report.title}</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><strong>Type:</strong> {report.type.charAt(0).toUpperCase() + report.type.slice(1)}</p>
                            <p><strong>Date:</strong> {new Date(report.reportDate).toLocaleDateString()}</p>
                            <p><strong>Employee:</strong> {report.employeeName}</p>
                            <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Warning Message */}
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                                    Are you sure you want to delete this report?
                                </h4>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    This action will permanently remove the report and all associated data.
                                    This cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isDeleting}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Report
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteSalesReportModal;
