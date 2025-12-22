import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import type { WeeklyPlan } from '@/types/weeklyPlan.types';
import { useTranslation } from '@/hooks/useTranslation';

interface DeleteWeeklyPlanModalProps {
    plan: WeeklyPlan;
    onClose: () => void;
    onConfirm: () => Promise<boolean>;
}

const DeleteWeeklyPlanModal: React.FC<DeleteWeeklyPlanModalProps> = ({
    plan,
    onClose,
    onConfirm,
}) => {
    const { t } = useTranslation();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const success = await onConfirm();
            if (success) {
                onClose();
            }
        } catch (error) {
            console.error('Error deleting plan:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <DialogTitle className="text-2xl">
                            Delete Weekly Plan
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        Are you sure you want to delete this weekly plan?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-1">{plan.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        This will permanently delete:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside mt-2 space-y-1">
                        <li>{plan.tasks?.length || 0} tasks</li>
                        <li>{t('allAssociatedData')}</li>
                    </ul>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
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
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Delete Plan
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteWeeklyPlanModal;




