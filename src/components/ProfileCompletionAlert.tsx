import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileCompletionAlertProps {
    progress: number;
    remainingSteps: number;
    missingFields?: string[];
    className?: string;
}

export const ProfileCompletionAlert: React.FC<ProfileCompletionAlertProps> = ({
    progress,
    remainingSteps,
    missingFields = [],
    className = '',
}) => {
    const navigate = useNavigate();

    // Don't show if profile is complete
    if (progress >= 100) {
        return null;
    }

    const getAlertVariant = () => {
        if (progress < 40) return 'destructive';
        if (progress < 70) return 'default';
        return 'default';
    };

    const getIcon = () => {
        if (progress < 40) return <AlertCircle className="h-4 w-4" />;
        if (progress < 70) return <Info className="h-4 w-4" />;
        return <CheckCircle2 className="h-4 w-4" />;
    };

    return (
        <Alert variant={getAlertVariant()} className={`${className}`}>
            <div className="flex items-start gap-3 w-full">
                <div className="mt-0.5">{getIcon()}</div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <AlertDescription className="font-medium text-sm">
                            Complete your profile - {remainingSteps} of 5 steps remaining
                        </AlertDescription>
                        <span className="text-sm font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    {missingFields.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                            Missing: {missingFields.join(', ')}
                        </div>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/profile')}
                        className="mt-2"
                    >
                        Complete Profile
                    </Button>
                </div>
            </div>
        </Alert>
    );
};

export default ProfileCompletionAlert;

