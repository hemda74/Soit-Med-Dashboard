import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    OfferPrintTemplate,
    printOfferHtml,
    downloadOfferPdfFromHtml,
} from '@/components/print';
import type {
    OfferData,
    OfferEquipment,
    PDFExportOptions,
    PDFLanguage,
} from '@/components/print';
import { useSalesStore } from '@/stores/salesStore';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Download, Printer } from 'lucide-react';
import type { CheckedState } from '@radix-ui/react-checkbox';

type OfferLocationState = { offer?: OfferData };

const defaultOptions: PDFExportOptions = {
    language: 'en',
    showProductHeaders: true,
    showModel: true,
    showProvider: true,
    showCountry: true,
    showDescription: true,
    showImage: true,
    showPrice: true,
};

type SimpleOfferField =
    | 'clientName'
    | 'assignedToName'
    | 'paymentTerms'
    | 'deliveryTerms'
    | 'warrantyTerms'
    | 'products'
    | 'validUntil';

const optionToggles: Array<{
    key: keyof PDFExportOptions;
    label: string;
    hint?: string;
}> = [
        { key: 'showProductHeaders', label: 'Show table headers' },
        { key: 'showDescription', label: 'Show product description' },
        { key: 'showModel', label: 'Show model column' },
        { key: 'showProvider', label: 'Show provider column' },
        { key: 'showCountry', label: 'Show country column' },
        { key: 'showImage', label: 'Show product image' },
        { key: 'showPrice', label: 'Show price column' },
    ];

function toPreviewEquipment(eq: any): OfferEquipment {
    const id = eq?.id ?? eq?.Id ?? Math.random();
    return {
        id,
        name: eq?.name ?? eq?.Name ?? 'N/A',
        model: eq?.model ?? eq?.Model ?? undefined,
        provider:
            eq?.provider ??
            eq?.Provider ??
            eq?.manufacturer ??
            eq?.Manufacturer ??
            undefined,
        country: eq?.country ?? eq?.Country ?? undefined,
        year: eq?.year ?? eq?.Year ?? undefined,
        price:
            typeof eq?.price === 'number'
                ? eq.price
                : Number(eq?.price ?? eq?.Price ?? eq?.totalPrice ?? eq?.unitPrice) ||
                0,
        description:
            eq?.description ??
            eq?.Description ??
            eq?.specifications ??
            eq?.Specifications ??
            undefined,
        inStock:
            eq?.inStock !== undefined
                ? eq.inStock
                : eq?.InStock !== undefined
                    ? eq.InStock
                    : true,
        imagePath:
            eq?.imagePath ?? eq?.ImagePath ?? eq?.imageUrl ?? eq?.ImageUrl ?? null,
        providerImagePath:
            eq?.providerImagePath ??
            eq?.ProviderImagePath ??
            eq?.providerLogoPath ??
            eq?.ProviderLogoPath ??
            null,
        customDescription: eq?.customDescription,
    };
}

function toPreviewOffer(raw: any): OfferData {
    if (!raw) {
        throw new Error('Offer data is missing');
    }

    const equipmentSource =
        raw.equipment || raw.Equipment || raw.offerEquipments || [];

    return {
        id: raw.id ?? raw.Id ?? 0,
        clientName: raw.clientName ?? raw.ClientName ?? 'Client',
        clientType: raw.clientType ?? raw.ClientType,
        clientLocation: raw.clientLocation ?? raw.ClientLocation,
        products: raw.products ?? raw.Products ?? '',
        totalAmount:
            typeof raw.totalAmount === 'number'
                ? raw.totalAmount
                : Number(raw.totalAmount ?? raw.TotalAmount) || 0,
        discountAmount:
            typeof raw.discountAmount === 'number'
                ? raw.discountAmount
                : raw.discountAmount !== undefined
                    ? Number(raw.discountAmount ?? raw.DiscountAmount) || 0
                    : undefined,
        validUntil:
            raw.validUntil ??
            raw.ValidUntil ??
            raw.expiryDate ??
            new Date().toISOString(),
        paymentTerms: raw.paymentTerms ?? raw.PaymentTerms,
        deliveryTerms: raw.deliveryTerms ?? raw.DeliveryTerms,
        warrantyTerms: raw.warrantyTerms ?? raw.WarrantyTerms,
        createdAt:
            raw.createdAt ??
            raw.CreatedAt ??
            raw.createdDate ??
            new Date().toISOString(),
        status: raw.status ?? raw.Status ?? 'Draft',
        assignedToName:
            raw.assignedToName ??
            raw.assignedTo ??
            raw.AssignedToName ??
            raw.AssignedTo,
        equipment: Array.isArray(equipmentSource)
            ? equipmentSource.map(toPreviewEquipment)
            : undefined,
    };
}

const OfferPrintPreviewPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const stateOffer = (location.state as OfferLocationState | undefined)?.offer;

    const getOffer = useSalesStore((state) => state.getOffer);
    const selectedOffer = useSalesStore((state) => state.selectedOffer);
    const offersLoading = useSalesStore((state) => state.offersLoading);

    const [previewOffer, setPreviewOffer] = useState<OfferData | null>(
        stateOffer ? toPreviewOffer(stateOffer) : null
    );
    const [options, setOptions] = useState<PDFExportOptions>(defaultOptions);
    const [customDescriptions, setCustomDescriptions] = useState<
        Record<number, string>
    >({});
    const [isPrinting, setIsPrinting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (!stateOffer && id) {
            getOffer(id);
        }
    }, [stateOffer, id, getOffer]);

    useEffect(() => {
        if (!stateOffer && selectedOffer) {
            try {
                setPreviewOffer(toPreviewOffer(selectedOffer));
            } catch (error) {
                console.error('Failed to map offer for preview', error);
            }
        }
    }, [selectedOffer, stateOffer]);

    useEffect(() => {
        if (previewOffer?.equipment?.length) {
            setCustomDescriptions((prev) => {
                const next = { ...prev };
                previewOffer.equipment?.forEach((eq) => {
                    if (eq && eq.id && next[eq.id] === undefined) {
                        next[eq.id] = eq.customDescription || '';
                    }
                });
                return next;
            });
        }
    }, [previewOffer]);

    const finalOffer = useMemo(() => {
        if (!previewOffer) return null;
        const equipmentWithOverrides = previewOffer.equipment?.map((eq) => ({
            ...eq,
            customDescription:
                customDescriptions[eq.id] !== undefined
                    ? customDescriptions[eq.id]
                    : eq.customDescription,
        }));
        return {
            ...previewOffer,
            equipment: equipmentWithOverrides,
        };
    }, [previewOffer, customDescriptions]);

    const previewOptions = useMemo<PDFExportOptions>(
        () => ({
            ...options,
            customDescriptions,
        }),
        [options, customDescriptions]
    );

    const updateOption = (key: keyof PDFExportOptions, value: boolean) => {
        setOptions((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const updateOfferField = (field: SimpleOfferField, value: string) => {
        setPreviewOffer((prev) =>
            prev
                ? {
                    ...prev,
                    [field]: value,
                }
                : prev
        );
    };

    const handlePrint = async () => {
        if (!finalOffer) {
            toast.error('Offer data is not ready yet');
            return;
        }
        setIsPrinting(true);
        try {
            await printOfferHtml(finalOffer, previewOptions);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to open print dialog');
        } finally {
            setIsPrinting(false);
        }
    };

    const handleDownload = async () => {
        if (!finalOffer) {
            toast.error('Offer data is not ready yet');
            return;
        }
        setIsDownloading(true);
        try {
            await downloadOfferPdfFromHtml(finalOffer, previewOptions);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to download PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Button
                        variant="ghost"
                        className="mb-2 -ml-2 w-fit"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-semibold">Offer HTML Preview</h1>
                    <p className="text-sm text-muted-foreground">
                        Review and edit the printable version before exporting.
                    </p>
                    {id && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Offer #{id}
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handlePrint} disabled={isPrinting}>
                        {isPrinting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Opening Print Dialog...
                            </>
                        ) : (
                            <>
                                <Printer className="mr-2 h-4 w-4" />
                                Print / Save PDF
                            </>
                        )}
                    </Button>
                    <Button onClick={handleDownload} disabled={isDownloading}>
                        {isDownloading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Display Options</CardTitle>
                    <CardDescription>
                        Customize language and which sections appear in the preview.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label>Language</Label>
                            <Select
                                value={(options.language as PDFLanguage) ?? 'en'}
                                onValueChange={(value: PDFLanguage) =>
                                    setOptions((prev) => ({
                                        ...prev,
                                        language: value,
                                    }))
                                }
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Pick language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="ar">Arabic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {optionToggles.map(({ key, label, hint }) => (
                            <div
                                key={key}
                                className="flex items-center justify-between rounded-lg border px-3 py-2"
                            >
                                <div className="mr-3">
                                    <p className="text-sm font-medium">{label}</p>
                                    {hint && (
                                        <p className="text-xs text-muted-foreground">{hint}</p>
                                    )}
                                </div>
                                <Checkbox
                                    checked={options[key] !== false}
                                    onCheckedChange={(checked: CheckedState) =>
                                        updateOption(key, checked === true)
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Editable Fields</CardTitle>
                    <CardDescription>
                        Updates apply to this preview only and do not change the offer in
                        the database.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Client Name</Label>
                            <Input
                                className="mt-1"
                                value={previewOffer?.clientName ?? ''}
                                onChange={(e) => updateOfferField('clientName', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Salesman</Label>
                            <Input
                                className="mt-1"
                                value={previewOffer?.assignedToName ?? ''}
                                onChange={(e) =>
                                    updateOfferField('assignedToName', e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Valid Until</Label>
                            <Input
                                type="date"
                                className="mt-1"
                                value={
                                    previewOffer?.validUntil
                                        ? previewOffer.validUntil.slice(0, 10)
                                        : ''
                                }
                                onChange={(e) => updateOfferField('validUntil', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Payment Terms</Label>
                            <Input
                                className="mt-1"
                                value={previewOffer?.paymentTerms ?? ''}
                                onChange={(e) =>
                                    updateOfferField('paymentTerms', e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Delivery Terms</Label>
                            <Input
                                className="mt-1"
                                value={previewOffer?.deliveryTerms ?? ''}
                                onChange={(e) =>
                                    updateOfferField('deliveryTerms', e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Warranty Terms</Label>
                            <Input
                                className="mt-1"
                                value={previewOffer?.warrantyTerms ?? ''}
                                onChange={(e) =>
                                    updateOfferField('warrantyTerms', e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Products Summary</Label>
                        <Textarea
                            className="mt-1"
                            rows={3}
                            value={previewOffer?.products ?? ''}
                            onChange={(e) => updateOfferField('products', e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {previewOffer?.equipment?.length ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Product Notes</CardTitle>
                        <CardDescription>
                            Add or override descriptions for individual products.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {previewOffer.equipment.map((eq) => (
                            <div
                                key={eq.id}
                                className="rounded-lg border p-4 space-y-2 bg-muted/30"
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold">{eq.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        Model: {eq.model ?? '—'} • Provider: {eq.provider ?? '—'}
                                    </span>
                                </div>
                                <Textarea
                                    rows={3}
                                    value={customDescriptions[eq.id] ?? ''}
                                    placeholder="Custom description for this product (optional)"
                                    onChange={(e) =>
                                        setCustomDescriptions((prev) => ({
                                            ...prev,
                                            [eq.id]: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ) : null}

            <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between pb-3">
                    <div>
                        <p className="font-semibold">Live Preview</p>
                        <p className="text-sm text-muted-foreground">
                            This is exactly what will be printed or exported.
                        </p>
                    </div>
                </div>
                <div className="overflow-auto bg-background p-4">
                    {offersLoading && !finalOffer ? (
                        <div className="flex flex-col gap-4">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-[400px] w-[210mm]" />
                        </div>
                    ) : finalOffer ? (
                        <div className="mx-auto shadow-lg" style={{ width: '210mm' }}>
                            <OfferPrintTemplate
                                offer={finalOffer}
                                options={previewOptions}
                            />
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                            No offer data found. Please return to the offer page and try
                            again.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OfferPrintPreviewPage;


