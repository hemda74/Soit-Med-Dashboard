import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ActivateDeactivateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    userName: string;
    userEmail: string;
    isActive: boolean;
    isLoading?: boolean;
}

export function ActivateDeactivateModal({
    isOpen,
    onClose,
    onConfirm,
    userName,
    userEmail,
    isActive,
    isLoading = false,
}: ActivateDeactivateModalProps) {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        if (reason.trim()) {
            onConfirm(reason.trim());
        }
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    const action = isActive ? 'deactivate' : 'activate';
    const actionCapitalized = action.charAt(0).toUpperCase() + action.slice(1);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isActive ? (
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        ) : (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {actionCapitalized} User
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to {action} this user? This action can be reversed.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">User Details</Label>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="font-medium">{userName}</p>
                            <p className="text-sm text-muted-foreground">{userEmail}</p>
                            <p className="text-sm text-muted-foreground">
                                Status: <span className={isActive ? 'text-green-600' : 'text-destructive'}>
                                    {isActive ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-sm font-medium">
                            Reason for {actionCapitalized}ing *
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder={`Enter reason for ${action}ing this user...`}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={isActive ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        disabled={!reason.trim() || isLoading}
                    >
                        {isLoading ? 'Processing...' : `${actionCapitalized} User`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


