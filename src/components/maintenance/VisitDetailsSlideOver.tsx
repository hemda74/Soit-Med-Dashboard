import React from 'react';
import { X, Calendar, User, Wrench, FileText, DollarSign, CheckCircle, XCircle, Clock, Image, Download, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface VisitDetailsSlideOverProps {
    visit: any;
    isOpen: boolean;
    onClose: () => void;
    isRTL?: boolean;
}

const VisitDetailsSlideOver: React.FC<VisitDetailsSlideOverProps> = ({ visit, isOpen, onClose, isRTL = false }) => {
    if (!visit) return null;

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode }> = {
            'Completed': { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
            'Pending': { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
            'Cancelled': { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> },
            'Scheduled': { variant: 'outline', icon: <Calendar className="h-3 w-3 mr-1" /> },
        };

        const config = statusConfig[status] || statusConfig['Pending'];
        return (
            <Badge variant={config.variant} className="flex items-center w-fit">
                {config.icon}
                {status}
            </Badge>
        );
    };

    const getOutcomeBadge = (outcome: string) => {
        const outcomeConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' }> = {
            'Completed': { variant: 'default' },
            'Cancelled': { variant: 'destructive' },
            'Pending': { variant: 'secondary' },
        };

        const config = outcomeConfig[outcome] || outcomeConfig['Pending'];
        return <Badge variant={config.variant}>{outcome}</Badge>;
    };

    // Parse media files if they exist
    const mediaFiles = visit.mediaFiles ? (typeof visit.mediaFiles === 'string' ? JSON.parse(visit.mediaFiles) : visit.mediaFiles) : [];

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            {/* Slide Over Panel */}
            <div
                className={cn(
                    'fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-background shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto',
                    isOpen ? 'translate-x-0' : 'translate-x-full',
                    isRTL && 'right-auto left-0',
                    isRTL && (isOpen ? 'translate-x-0' : '-translate-x-full')
                )}
            >
                {/* Header */}
                <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-2xl font-bold">
                            {isRTL ? 'تفاصيل الزيارة' : 'Visit Details'}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {isRTL ? 'رقم الزيارة:' : 'Visit ID:'} {visit.id}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(visit.status)}
                        <Badge variant="outline" className="text-xs">
                            {visit.source}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Visit Information */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Calendar className="h-5 w-5" />
                            {isRTL ? 'معلومات الزيارة' : 'Visit Information'}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground text-xs">
                                    {isRTL ? 'تاريخ الزيارة' : 'Visit Date'}
                                </Label>
                                <p className="font-medium">
                                    {visit.visitDate
                                        ? format(new Date(visit.visitDate), 'PPP')
                                        : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">
                                    {isRTL ? 'التاريخ المجدول' : 'Scheduled Date'}
                                </Label>
                                <p className="font-medium">
                                    {visit.scheduledDate
                                        ? format(new Date(visit.scheduledDate), 'PPP')
                                        : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">
                                    {isRTL ? 'الحالة' : 'Status'}
                                </Label>
                                <div className="mt-1">
                                    {getStatusBadge(visit.status)}
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">
                                    {isRTL ? 'النتيجة' : 'Outcome'}
                                </Label>
                                <div className="mt-1">
                                    {getOutcomeBadge(visit.outcome)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Engineer Information */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <User className="h-5 w-5" />
                            {isRTL ? 'معلومات المهندس' : 'Engineer Information'}
                        </div>
                        <div>
                            <Label className="text-muted-foreground text-xs">
                                {isRTL ? 'اسم المهندس' : 'Engineer Name'}
                            </Label>
                            <p className="font-medium">{visit.engineerName || (isRTL ? 'غير محدد' : 'Not assigned')}</p>
                        </div>
                    </div>

                    {/* Visit Details */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <FileText className="h-5 w-5" />
                            {isRTL ? 'تفاصيل الزيارة' : 'Visit Details'}
                        </div>
                        {visit.report && (
                            <div>
                                <Label className="text-muted-foreground text-xs">
                                    {isRTL ? 'التقرير / وصف المشكلة' : 'Report / Issue Description'}
                                </Label>
                                <p className="mt-1 p-3 bg-background rounded-md whitespace-pre-wrap text-sm">
                                    {visit.report}
                                </p>
                            </div>
                        )}
                        {visit.actionsTaken && (
                            <div>
                                <Label className="text-muted-foreground text-xs">
                                    {isRTL ? 'الإجراءات المتخذة' : 'Actions Taken'}
                                </Label>
                                <p className="mt-1 p-3 bg-background rounded-md whitespace-pre-wrap text-sm">
                                    {visit.actionsTaken}
                                </p>
                            </div>
                        )}
                        {!visit.report && !visit.actionsTaken && (
                            <p className="text-muted-foreground text-sm">
                                {isRTL ? 'لا يوجد تقرير مفصل' : 'No detailed report available'}
                            </p>
                        )}
                    </div>

                    {/* Parts Used */}
                    {visit.partsUsed && Array.isArray(visit.partsUsed) && visit.partsUsed.length > 0 && (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2 text-lg font-semibold">
                                <Wrench className="h-5 w-5" />
                                {isRTL ? 'الأجزاء المستخدمة' : 'Parts Used'}
                            </div>
                            <div className="space-y-2">
                                {visit.partsUsed.map((part: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-background rounded">
                                        <div>
                                            <p className="font-medium text-sm">{part.partName || part.name || (isRTL ? 'جزء غير معروف' : 'Unknown Part')}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {isRTL ? 'الكمية:' : 'Quantity:'} {part.quantity || 1}
                                            </p>
                                        </div>
                                        {part.cost && (
                                            <p className="font-medium text-sm">${part.cost.toFixed(2)}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Financial Information */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <DollarSign className="h-5 w-5" />
                            {isRTL ? 'المعلومات المالية' : 'Financial Information'}
                        </div>
                        <div>
                            <Label className="text-muted-foreground text-xs">
                                {isRTL ? 'رسوم الخدمة' : 'Service Fee'}
                            </Label>
                            <p className="font-bold text-2xl text-primary mt-1">
                                {visit.serviceFee
                                    ? `$${visit.serviceFee.toFixed(2)}`
                                    : (isRTL ? 'غير محدد' : 'N/A')}
                            </p>
                        </div>
                    </div>

                    {/* Media Files */}
                    {mediaFiles && mediaFiles.length > 0 && (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2 text-lg font-semibold">
                                <Image className="h-5 w-5" />
                                {isRTL ? 'الملفات المرفقة' : 'Media Files'}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {mediaFiles.map((file: any, index: number) => (
                                    <div key={index} className="relative group">
                                        {file.type?.startsWith('image/') ? (
                                            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                                                <img
                                                    src={file.url}
                                                    alt={file.name || `Image ${index + 1}`}
                                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button size="icon" variant="secondary" asChild>
                                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <Button size="icon" variant="secondary" asChild>
                                                        <a href={file.url} download={file.name}>
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="aspect-square rounded-lg bg-muted flex flex-col items-center justify-center p-3">
                                                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                                                <p className="text-xs text-center truncate w-full">{file.name}</p>
                                                <div className="flex gap-1 mt-2">
                                                    <Button size="sm" variant="secondary" asChild>
                                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                    <Button size="sm" variant="secondary" asChild>
                                                        <a href={file.url} download={file.name}>
                                                            <Download className="h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Media Files Message */}
                    {(!mediaFiles || mediaFiles.length === 0) && (
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                            <Image className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                            <p className="text-sm text-muted-foreground">
                                {isRTL ? 'لا توجد ملفات مرفقة لهذه الزيارة' : 'No media files attached to this visit'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default VisitDetailsSlideOver;
