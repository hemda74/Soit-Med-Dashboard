// Offer Approval Form Component - SalesManager approves/rejects offers

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { salesApi } from '@/services/sales/salesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, Edit, FileText, Download, Plus, Trash2, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { getApiBaseUrl, getStaticFileUrl } from '@/utils/apiConfig';
import type { OfferEquipment } from '@/types/sales.types';
import toast from 'react-hot-toast';

// Validation schema for offer approval
const approvalSchema = z.object({
    comments: z.string().optional(),
    rejectionReason: z.string().optional(),
}).refine((data) => {
    // If rejecting, rejectionReason is required
    return true; // We'll handle this in the submit handler
}, {
    message: 'Rejection reason is required when rejecting',
});

type ApprovalFormValues = z.infer<typeof approvalSchema>;

interface Offer {
    id: string;
    clientId: string;
    clientName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    createdBy: string;
    createdByName: string;
    products?: string;
    assignedTo?: string;
    assignedToName?: string;
}

interface OfferApprovalFormProps {
    offer: Offer;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function OfferApprovalForm({ offer, onSuccess, onCancel }: OfferApprovalFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [exportingLanguage, setExportingLanguage] = useState<'en' | 'ar' | null>(null);
    const [showEquipmentSection, setShowEquipmentSection] = useState(false);
    const [equipment, setEquipment] = useState<OfferEquipment[]>([]);
    const [loadingEquipment, setLoadingEquipment] = useState(false);
    const [showAddEquipmentForm, setShowAddEquipmentForm] = useState(false);
    const [newEquipment, setNewEquipment] = useState({
        name: '',
        model: '',
        provider: '',
        country: '',
        year: '',
        price: '',
        description: '',
        inStock: true,
    });
    const [deletingEquipmentId, setDeletingEquipmentId] = useState<number | null>(null);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const form = useForm<ApprovalFormValues>({
        resolver: zodResolver(approvalSchema),
        defaultValues: {
            comments: '',
            rejectionReason: '',
        },
    });

    // Load equipment when component mounts
    useEffect(() => {
        if (offer.id) {
            loadEquipment();
        }
    }, [offer.id]);

    const loadEquipment = async () => {
        if (!offer.id) return;
        try {
            setLoadingEquipment(true);
            const response = await salesApi.getOfferEquipment(offer.id);
            if (response.success && response.data) {
                setEquipment(response.data || []);
            }
        } catch (error: any) {
            console.error('Failed to load equipment:', error);
            toast.error('Failed to load equipment');
        } finally {
            setLoadingEquipment(false);
        }
    };

    const handleAddEquipment = async () => {
        if (!newEquipment.name || !newEquipment.price) {
            toast.error('Equipment name and price are required');
            return;
        }

        try {
            const price = parseFloat(newEquipment.price);
            if (isNaN(price) || price <= 0) {
                toast.error('Please enter a valid price');
                return;
            }

            // Use direct API call to match backend DTO structure
            const token = user?.token;
            if (!token) {
                toast.error('Authentication required');
                return;
            }

            const apiBaseUrl = getApiBaseUrl();
            const equipmentData = {
                name: newEquipment.name,
                model: newEquipment.model || null,
                provider: newEquipment.provider || null,
                country: newEquipment.country || null,
                year: newEquipment.year ? parseInt(newEquipment.year) : null,
                price: price,
                description: newEquipment.description || null,
                inStock: newEquipment.inStock,
            };

            const response = await fetch(`${apiBaseUrl}/api/Offer/${offer.id}/equipment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(equipmentData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to add equipment');
            }

            toast.success('Equipment added successfully');
            setNewEquipment({
                name: '',
                model: '',
                provider: '',
                country: '',
                year: '',
                price: '',
                description: '',
                inStock: true,
            });
            setShowAddEquipmentForm(false);
            loadEquipment();
        } catch (error: any) {
            console.error('Failed to add equipment:', error);
            toast.error(error.message || 'Failed to add equipment');
        }
    };

    const handleDeleteEquipment = async (equipmentId: number) => {
        if (!confirm('Are you sure you want to delete this equipment?')) {
            return;
        }

        try {
            setDeletingEquipmentId(equipmentId);
            await salesApi.deleteOfferEquipment(offer.id, equipmentId);
            toast.success('Equipment deleted successfully');
            loadEquipment();
        } catch (error: any) {
            console.error('Failed to delete equipment:', error);
            toast.error(error.message || 'Failed to delete equipment');
        } finally {
            setDeletingEquipmentId(null);
        }
    };

    const onSubmit = async (data: ApprovalFormValues) => {
        if (!action) return;

        if (action === 'reject' && !data.rejectionReason?.trim()) {
            toast.error('Rejection reason is required when rejecting an offer');
            return;
        }

        setIsSubmitting(true);
        try {
            const approvalData = {
                approved: action === 'approve',
                comments: data.comments,
                rejectionReason: action === 'reject' ? data.rejectionReason : undefined,
            };

            await salesApi.salesManagerApproval(offer.id, approvalData);
            toast.success(action === 'approve' ? 'Offer approved successfully' : 'Offer rejected successfully');
            onSuccess?.();
        } catch (error: any) {
            console.error('Failed to process offer approval:', error);
            toast.error(error.message || 'Failed to process offer approval');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectClick = async () => {
        // If action is already set to reject, try to submit
        if (action === 'reject') {
            const values = form.getValues();
            if (!values.rejectionReason?.trim()) {
                toast.error('Please provide a rejection reason before submitting');
                form.setFocus('rejectionReason');
                return;
            }
            // Submit the form
            form.handleSubmit(onSubmit)();
        } else {
            // First click: just set action to show rejection reason field
            setAction('reject');
        }
    };

    const handleEditOffer = () => {
        navigate(`/sales-manager/offers/${offer.id}/edit`);
    };

    const handleExportPdf = async (language: 'en' | 'ar' = 'en') => {
        if (!offer.id || isExportingPdf) return;

        try {
            setIsExportingPdf(true);
            setExportingLanguage(language);
            const token = user?.token;

            if (!token) {
                toast.error('Authentication required for PDF export');
                return;
            }

            const apiBaseUrl = getApiBaseUrl();
            const loadingToast = toast.loading(`Generating PDF (${language.toUpperCase()})...`);

            try {
                const response = await fetch(
                    `${apiBaseUrl}/api/Offer/${offer.id}/pdf?language=${language}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/pdf',
                        },
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`PDF generation failed for ${language}:`, {
                        status: response.status,
                        statusText: response.statusText,
                        error: errorText
                    });
                    toast.error(`Failed to generate PDF (${language.toUpperCase()})`);
                    return;
                }

                const pdfBlob = await response.blob();

                if (!pdfBlob || pdfBlob.size === 0) {
                    console.error(`Received empty PDF file for ${language}`);
                    toast.error(`Received empty PDF file (${language.toUpperCase()})`);
                    return;
                }

                // Create download link
                const url = window.URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = url;
                const langSuffix = language === 'ar' ? 'AR' : 'EN';
                link.download = `Offer_${offer.id}_${langSuffix}_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast.dismiss(loadingToast);
                toast.success(`PDF downloaded successfully (${language.toUpperCase()})`);
            } catch (error: any) {
                console.error(`Error generating PDF for ${language}:`, error);
                toast.dismiss(loadingToast);
                toast.error(`Error generating PDF (${language.toUpperCase()}): ${error.message}`);
            }
        } catch (error: any) {
            console.error('Error exporting PDF:', error);
            toast.error(error.message || 'Failed to export PDF');
        } finally {
            setIsExportingPdf(false);
            setExportingLanguage(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PendingSalesManagerApproval':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'Sent':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'Rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PendingSalesManagerApproval':
                return <AlertCircle className="h-4 w-4" />;
            case 'Sent':
                return <CheckCircle className="h-4 w-4" />;
            case 'Rejected':
                return <XCircle className="h-4 w-4" />;
            default:
                return null;
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Review Offer
                    <Badge className={getStatusColor(offer.status)}>
                        {getStatusIcon(offer.status)}
                        <span className="ml-1">{offer.status}</span>
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Offer Information */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Client</label>
                            <p className="text-sm font-semibold">{offer.clientName}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                EGP {offer.totalAmount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    {offer.assignedToName && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                            <p className="text-sm">{offer.assignedToName}</p>
                        </div>
                    )}
                    {offer.products && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Products</label>
                            <p className="text-sm">{offer.products}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Created By</label>
                            <p className="text-sm">{offer.createdByName || 'SalesSupport'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Created</label>
                            <p className="text-sm">
                                {offer.createdAt && !isNaN(new Date(offer.createdAt).getTime())
                                    ? format(new Date(offer.createdAt), 'PPP')
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Equipment Section */}
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowEquipmentSection(!showEquipmentSection)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            <span className="font-medium">Equipment ({equipment.length})</span>
                        </div>
                        {showEquipmentSection ? (
                            <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        )}
                    </button>

                    {showEquipmentSection && (
                        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            {loadingEquipment ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading equipment...</p>
                                </div>
                            ) : equipment.length > 0 ? (
                                <div className="space-y-3">
                                    {equipment.map((eq) => (
                                        <div
                                            key={eq.id}
                                            className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 flex items-start justify-between gap-4"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3">
                                                    {eq.imagePath && (
                                                        <img
                                                            src={getStaticFileUrl(eq.imagePath)}
                                                            alt={eq.name}
                                                            className="w-16 h-16 object-cover rounded border border-gray-200 dark:border-gray-700"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-semibold text-sm">{eq.name}</h4>
                                                            {eq.inStock === false && (
                                                                <Badge variant="secondary" className="text-xs">Out of Stock</Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                            {eq.model && <p>Model: {eq.model}</p>}
                                                            {eq.provider && <p>Provider: {eq.provider}</p>}
                                                            {eq.country && <p>Country: {eq.country}</p>}
                                                            {eq.year && <p>Year: {eq.year}</p>}
                                                            {eq.price && (
                                                                <p className="font-semibold text-green-600 dark:text-green-400">
                                                                    Price: EGP {eq.price.toLocaleString()}
                                                                </p>
                                                            )}
                                                            {eq.description && (
                                                                <p className="mt-2 text-gray-700 dark:text-gray-300">{eq.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteEquipment(eq.id)}
                                                disabled={deletingEquipmentId === eq.id}
                                            >
                                                {deletingEquipmentId === eq.id ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No equipment added yet</p>
                                </div>
                            )}

                            {!showAddEquipmentForm ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddEquipmentForm(true)}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Equipment
                                </Button>
                            ) : (
                                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-sm">Add New Equipment</h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setShowAddEquipmentForm(false);
                                                setNewEquipment({
                                                    name: '',
                                                    model: '',
                                                    provider: '',
                                                    country: '',
                                                    year: '',
                                                    price: '',
                                                    description: '',
                                                    inStock: true,
                                                });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">Name *</Label>
                                            <Input
                                                value={newEquipment.name}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                                                placeholder="Equipment name"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Price *</Label>
                                            <Input
                                                type="number"
                                                value={newEquipment.price}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, price: e.target.value })}
                                                placeholder="0.00"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Model</Label>
                                            <Input
                                                value={newEquipment.model}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                                                placeholder="Model number"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Provider</Label>
                                            <Input
                                                value={newEquipment.provider}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, provider: e.target.value })}
                                                placeholder="Manufacturer"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Country</Label>
                                            <Input
                                                value={newEquipment.country}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, country: e.target.value })}
                                                placeholder="Country"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Year</Label>
                                            <Input
                                                value={newEquipment.year}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, year: e.target.value })}
                                                placeholder="Year"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Description</Label>
                                        <Textarea
                                            value={newEquipment.description}
                                            onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
                                            placeholder="Equipment description"
                                            rows={2}
                                            className="text-sm"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleAddEquipment}
                                        className="w-full"
                                        size="sm"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Equipment
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <Separator />

                {/* Action Buttons - Edit and PDF */}
                <div className="flex gap-2 pb-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleEditOffer}
                        className="flex-1"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Offer
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleExportPdf('en')}
                        disabled={isExportingPdf}
                        className="flex-1"
                    >
                        {isExportingPdf && exportingLanguage === 'en' ? (
                            <>
                                <FileText className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF (EN)
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleExportPdf('ar')}
                        disabled={isExportingPdf}
                        className="flex-1"
                    >
                        {isExportingPdf && exportingLanguage === 'ar' ? (
                            <>
                                <FileText className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF (AR)
                            </>
                        )}
                    </Button>
                </div>

                <Separator />

                {/* Approval Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {action === 'reject' && (
                            <FormField
                                control={form.control}
                                name="rejectionReason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rejection Reason *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Please provide a reason for rejection (e.g., Pricing, Terms, Other)"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="comments"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comments {action === 'approve' ? '(Optional)' : ''}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={action === 'approve' 
                                                ? 'Add any comments or notes about this approval...'
                                                : 'Add any additional comments...'}
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2">
                            {onCancel && (
                                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleRejectClick}
                                disabled={isSubmitting || action === 'approve'}
                                className={action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                {isSubmitting && action === 'reject' 
                                    ? 'Rejecting...' 
                                    : action === 'reject' 
                                        ? 'Confirm Rejection' 
                                        : 'Reject'}
                            </Button>
                            <Button
                                type="submit"
                                onClick={() => setAction('approve')}
                                disabled={isSubmitting || action === 'reject'}
                                className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {isSubmitting && action === 'approve' ? 'Processing...' : 'Approve'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

