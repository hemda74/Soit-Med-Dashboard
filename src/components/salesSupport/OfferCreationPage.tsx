import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { salesApi } from '@/services/sales/salesApi'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { productApi } from '@/services/sales/productApi'
import type { Product } from '@/types/sales.types'
import { usePerformance } from '@/hooks/usePerformance'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/stores/authStore'
import { getApiBaseUrl } from '@/utils/apiConfig'
import ProviderLogo from '@/components/sales/ProviderLogo'
import { getStaticFileUrl } from '@/utils/apiConfig'

function useQuery() {
    const { search } = useLocation()
    return useMemo(() => new URLSearchParams(search), [search])
}

export default function OfferCreationPage() {
    usePerformance('OfferCreationPage');
    const { t } = useTranslation();
    const translate = (key: string, fallback: string) => {
        const value = t(key);
        return value && value !== key ? value : fallback;
    };
    const query = useQuery()
    const navigate = useNavigate()

    const requestId = query.get('requestId') || ''

    // Step 1: Prefill data from request
    const [requestDetails, setRequestDetails] = useState<any | null>(null)
    const [loadingRequest, setLoadingRequest] = useState<boolean>(!!requestId)
    const [isCustomerRequest, setIsCustomerRequest] = useState<boolean>(false)

    // Optional OfferRequest linking (for follow-up)
    const [selectedOfferRequestId, setSelectedOfferRequestId] = useState<string>(requestId || '')
    const [availableOfferRequests, setAvailableOfferRequests] = useState<any[]>([])
    const [loadingOfferRequests, setLoadingOfferRequests] = useState(false)

    // Offer form state
    const [clientId, setClientId] = useState<string>('')
    const [clientName, setClientName] = useState<string>('')
    const [assignedToSalesManId, setAssignedToSalesManId] = useState<string>('')
    const [assignedToSalesManName, setAssignedToSalesManName] = useState<string>('')
    const [products, setProducts] = useState<string>('')
    const [productItems, setProductItems] = useState<Array<{ name: string; model?: string; factory?: string; country?: string; year?: number | string; price: number | string; imageUrl?: string; providerImagePath?: string; description?: string; inStock?: boolean }>>([])
    const emptyProduct = { name: '', model: '', factory: '', country: '', year: '', price: '', imageUrl: '', providerImagePath: '', description: '', inStock: true as boolean }
    const [newProduct, setNewProduct] = useState<typeof emptyProduct>({ ...emptyProduct })
    const [showManualProductForm, setShowManualProductForm] = useState(false)
    const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null)
    const [editingProduct, setEditingProduct] = useState<typeof emptyProduct>({ ...emptyProduct })
    const [totalAmount, setTotalAmount] = useState<string>('')
    const [discountAmount, setDiscountAmount] = useState<string>('')
    const [paymentTerms, setPaymentTerms] = useState<string[]>([])
    const [deliveryTerms, setDeliveryTerms] = useState<string[]>([])
    const [warrantyTerms, setWarrantyTerms] = useState<string[]>([])
    const [validUntil, setValidUntil] = useState<string[]>([])

    // Created offer
    const [offer, setOffer] = useState<any | null>(null)
    const [creatingOffer, setCreatingOffer] = useState(false)

    // Product Catalog Selection
    const [catalogDialogOpen, setCatalogDialogOpen] = useState(false)
    const [catalogProducts, setCatalogProducts] = useState<Product[]>([])
    const [catalogSearchTerm, setCatalogSearchTerm] = useState('')
    const [catalogSelectedCategory, setCatalogSelectedCategory] = useState<string>('all')
    const [loadingCatalog, setLoadingCatalog] = useState(false)

    const CATEGORIES = ['X-Ray', 'Ultrasound', 'CT Scanner', 'MRI', 'Other']

    // Load catalog products
    useEffect(() => {
        if (catalogDialogOpen) {
            loadCatalogProducts()
        }
    }, [catalogDialogOpen, catalogSelectedCategory])

    const loadCatalogProducts = async () => {
        setLoadingCatalog(true)
        try {
            const params: { category?: string; inStock?: boolean } = {}
            if (catalogSelectedCategory && catalogSelectedCategory !== 'all') params.category = catalogSelectedCategory
            params.inStock = true // Only show in-stock products

            const response = await productApi.getAllProducts(params)

            setCatalogProducts(response.data || [])
        } catch (err: any) {
            console.error('Error loading catalog products:', err)
            toast.error(err.message || translate('offerCreationPage.errors.loadProducts', 'Failed to load products'))
            setCatalogProducts([])
        } finally {
            setLoadingCatalog(false)
        }
    }

    const handleCatalogSearch = async () => {
        if (!catalogSearchTerm.trim()) {
            loadCatalogProducts()
            return
        }

        setLoadingCatalog(true)
        try {
            const response = await productApi.searchProducts(catalogSearchTerm)
            setCatalogProducts(response.data || [])
        } catch (err: any) {
            toast.error(err.message || translate('offerCreationPage.errors.searchFailed', 'Search failed'))
        } finally {
            setLoadingCatalog(false)
        }
    }

    const handleSelectFromCatalog = (product: Product) => {
        // Validate required fields
        if (!product.name) {
            toast.error(translate('offerCreationPage.errors.productNameRequired', 'Product name is required'))
            return
        }

        // Handle missing basePrice - default to 0 or show error
        const productPrice = product.basePrice ?? 0
        if (productPrice <= 0) {
            toast.error(translate('offerCreationPage.errors.productBasePriceRequired', 'Product base price is required. Please set a base price for this product in the catalog.'))
            return
        }

        // Convert Product to productItems format
        const productItem = {
            name: product.name,
            model: product.model || '',
            factory: product.provider || '',
            country: product.country || '',
            year: product.year || '',
            price: productPrice.toString(),
            imageUrl: product.imagePath || '',
            providerImagePath: product.providerImagePath || '',
            description: product.description || '',
            inStock: product.inStock !== undefined ? product.inStock : true,
        }

        // Check if already added
        const exists = productItems.some((p) => p.name === product.name && p.model === productItem.model)
        if (exists) {
            toast.error(translate('offerCreationPage.errors.productExists', 'Product already added'))
            return
        }

        setProductItems((prev) => [...prev, productItem])
        toast.success(translate('offerCreationPage.success.productAdded', 'Product added from catalog'))
        setCatalogDialogOpen(false)
    }

    // react-hook-form for offer form validation
    type OfferFormInputs = {
        clientIdHidden: string
        salesmanIdHidden: string
        products: string
        totalAmount: string
        discountAmount?: string
        validUntil?: string
        paymentTerms?: string
        deliveryTerms?: string
        warrantyTerms?: string
    }
    const {
        handleSubmit,
        setValue,
    } = useForm<OfferFormInputs>({
        mode: 'onChange',
        defaultValues: {
            products: '',
            totalAmount: '',
        },
    })


    // Load request details if requestId present
    useEffect(() => {
        async function load() {
            if (!requestId) return
            setLoadingRequest(true)
            try {
                const { data } = await salesApi.getOfferRequestDetails(requestId)
                setRequestDetails(data)
                const cid = String(data.clientId || '')
                setClientId(cid)
                setClientName(data.clientName || '')
                setProducts(data.requestedProducts || '')

                // Auto-assign to requester (will be customer if from customer app, or salesman if from salesman)
                const requesterId = data.requestedBy || ''
                setAssignedToSalesManId(requesterId)

                // Check if this is a customer request - if requestedBy matches a customer pattern or we can infer from context
                // For now, we'll check if the request comes with client info and assume customer requests should be assigned to the requester
                // Customer requests typically come from the customer app, so we'll hide the salesman field when there's a request
                // and auto-assign to the requester
                setIsCustomerRequest(!!requesterId) // If there's a requester, assume it might be a customer request

                // reflect into form
                setValue('clientIdHidden', cid)
                setValue('products', data.requestedProducts || '')
            } catch (e: any) {
                toast.error(e.message || translate('offerCreationPage.errors.loadRequestDetails', 'Failed to load request details'))
            } finally {
                setLoadingRequest(false)
            }
        }
        load()
    }, [requestId])

    // Load available offer requests for optional linking
    useEffect(() => {
        async function loadOfferRequests() {
            setLoadingOfferRequests(true)
            try {
                // Get requests that are not yet completed (can be linked)
                const response = await salesApi.getOfferRequests({
                    status: 'Requested,Assigned,InProgress,Ready',
                    page: 1,
                    pageSize: 100
                })
                if (response.data && Array.isArray(response.data)) {
                    setAvailableOfferRequests(response.data)
                }
            } catch (e: any) {
                console.error('Failed to load offer requests:', e)
                // Don't show error toast - this is optional
            } finally {
                setLoadingOfferRequests(false)
            }
        }
        loadOfferRequests()
    }, [])

    // Update selectedOfferRequestId when requestId from URL changes
    useEffect(() => {
        if (requestId) {
            setSelectedOfferRequestId(requestId)
        }
    }, [requestId])

    // SalesMan search (server-side using /api/Offer/salesmen)
    const [salesmen, setSalesmen] = useState<any[]>([])
    const [salesmanQuery, setSalesManQuery] = useState('')
    const [loadingSalesmen, setLoadingSalesmen] = useState(false)

    useEffect(() => {
        const handler = setTimeout(async () => {
            setLoadingSalesmen(true)
            try {
                const resp = await salesApi.getOfferSalesmen(salesmanQuery)

                if (resp && resp.data) {
                    const salesmenData = Array.isArray(resp.data) ? resp.data : []
                    setSalesmen(salesmenData)
                } else {
                    setSalesmen([])
                }
            } catch (error: any) {
                setSalesmen([])

                // Show toast for specific errors
                if (error.response?.status === 403) {
                    toast.error(translate('offerCreationPage.errors.salesmenAccessDenied', 'Access denied: You do not have permission to view salesmen'))
                } else if (error.response?.status === 401) {
                    toast.error(translate('offerCreationPage.errors.salesmenUnauthorized', 'Unauthorized: Please log in again'))
                } else if (error.message) {
                    toast.error(`${translate('offerCreationPage.errors.salesmenLoadFailedPrefix', 'Failed to load salesmen:')} ${error.message}`)
                }
            } finally {
                setLoadingSalesmen(false)
            }
        }, 300)
        return () => clearTimeout(handler)
    }, [salesmanQuery])

    // Create offer
    const createOffer = async (formData: OfferFormInputs) => {
        // Validation - clientId comes from request
        // For customer requests, assignedToSalesManId is auto-set to requester
        // For salesman requests, we need to validate
        if (!isCustomerRequest && !assignedToSalesManId) {
            toast.error(translate('offerCreationPage.errors.selectSalesMan', 'Please assign to a salesman'))
            return
        }

        // For customer requests, ensure assignedTo is set to requester
        if (isCustomerRequest && requestDetails?.requestedBy) {
            setAssignedToSalesManId(requestDetails.requestedBy)
        }

        // ClientId should come from request, but validate it exists
        if (!clientId) {
            toast.error(translate('offerCreationPage.errors.missingClient', 'Client information is missing. Please ensure the offer request includes a client.'))
            return
        }

        // Generate products string from productItems if available
        let productsString = formData.products || products || ''
        let calculatedTotal = Number(formData.totalAmount) || Number(totalAmount) || 0

        if (productItems.length > 0) {
            // Create products description from productItems
            productsString = productItems.map(p =>
                `${p.name}${p.model ? ` (${p.model})` : ''} - ${p.price}`
            ).join('; ')

            // Calculate total from productItems
            calculatedTotal = productItems.reduce((sum, p) => sum + (Number(p.price) || 0), 0)
        }

        // Final validation
        if (!productsString || productsString.trim() === '') {
            toast.error(translate('offerCreationPage.errors.missingProducts', 'Please add at least one product (from catalog or text description)'))
            return
        }

        if (calculatedTotal <= 0) {
            toast.error(translate('offerCreationPage.errors.invalidTotal', 'Total amount must be greater than 0'))
            return
        }

        setCreatingOffer(true)
        try {
            // Set default validUntil if not provided (30 days from now)
            const defaultValidUntil = new Date()
            defaultValidUntil.setDate(defaultValidUntil.getDate() + 30)
            const defaultValidUntilStr = defaultValidUntil.toISOString().split('T')[0]

            // Filter out empty strings and use arrays from state, or defaults if empty
            const validUntilDates = validUntil.filter(d => d.trim() !== '').length > 0
                ? validUntil.filter(d => d.trim() !== '')
                : [defaultValidUntilStr]
            const paymentTermsList = paymentTerms.filter(t => t.trim() !== '').length > 0
                ? paymentTerms.filter(t => t.trim() !== '')
                : ['Standard payment terms apply']
            const deliveryTermsList = deliveryTerms.filter(t => t.trim() !== '').length > 0
                ? deliveryTerms.filter(t => t.trim() !== '')
                : ['Standard delivery terms apply']
            const warrantyTermsList = warrantyTerms.filter(t => t.trim() !== '').length > 0
                ? warrantyTerms.filter(t => t.trim() !== '')
                : ['Standard warranty applies']

            // Use CreateOfferWithItems if we have productItems with images, otherwise use simple createOffer
            let payload: any;
            if (productItems.length > 0 && productItems.some(p => p.imageUrl)) {
                // Use CreateOfferWithItems to preserve product images
                payload = {
                    clientId: Number(clientId),
                    assignedTo: assignedToSalesManId,
                    products: productItems.map(p => ({
                        name: p.name,
                        model: p.model || '',
                        factory: p.factory || '',
                        country: p.country || '',
                        year: p.year ? Number(p.year) : undefined,
                        price: Number(p.price) || 0,
                        imageUrl: p.imageUrl || '',
                        providerImagePath: p.providerImagePath || '',
                        description: p.description || '',
                        inStock: p.inStock !== false,
                    })),
                    totalAmount: calculatedTotal,
                    validUntil: validUntilDates,
                    paymentTerms: paymentTermsList,
                    deliveryTerms: deliveryTermsList,
                    warrantyTerms: warrantyTermsList,
                };
                // Use selectedOfferRequestId (from dropdown) or requestId (from URL)
                const offerRequestIdToUse = selectedOfferRequestId || requestId;
                if (offerRequestIdToUse) payload.offerRequestId = Number(offerRequestIdToUse);

                // Calculate and apply discount
                const discount = formData.discountAmount ? Number(formData.discountAmount) : 0;
                if (discount > 0) {
                    payload.discountAmount = discount;
                    payload.finalPrice = calculatedTotal - discount;
                }

                // Use the CreateOfferWithItems endpoint
                const resp = await salesApi.createOfferWithItems(payload);
                setOffer(resp.data);
            } else {
                // Fallback to simple createOffer for text-based products
                payload = {
                    clientId: Number(clientId),
                    assignedTo: assignedToSalesManId,
                    products: productsString,
                    totalAmount: calculatedTotal,
                    validUntil: validUntilDates,
                    paymentTerms: paymentTermsList,
                    deliveryTerms: deliveryTermsList,
                    warrantyTerms: warrantyTermsList,
                };
                // Use selectedOfferRequestId (from dropdown) or requestId (from URL)
                const offerRequestIdToUse = selectedOfferRequestId || requestId;
                if (offerRequestIdToUse) payload.offerRequestId = Number(offerRequestIdToUse);

                // Calculate and apply discount
                const discount = formData.discountAmount ? Number(formData.discountAmount) : 0;
                if (discount > 0) {
                    payload.discountAmount = discount;
                    payload.finalPrice = calculatedTotal - discount;
                }

                const resp = await salesApi.createOffer(payload);
                setOffer(resp.data);
            }
            toast.success(translate('offerCreationPage.success.offerCreated', 'Offer created successfully! It is now pending SalesManager approval. Once approved, you can send it to the salesman.'))
        } catch (e: any) {
            toast.error(e.message || translate('offerCreationPage.errors.createOfferFailed', 'Failed to create offer'))
        } finally {
            setCreatingOffer(false)
        }
    }

    const canSendCurrentOffer = offer?.canSendToSalesMan ?? offer?.status === 'Sent'
    const awaitingSalesManagerApproval = offer?.status === 'PendingSalesManagerApproval'

    // Send and Export
    const sendToSalesMan = async () => {
        if (!offer) return
        if (!canSendCurrentOffer) {
            toast.error('SalesManager must approve the offer before it can be sent to the assigned salesman.')
            return
        }

        try {
            await salesApi.sendOfferToSalesMan(offer.id)
            const { data } = await salesApi.getOffer(offer.id)
            setOffer(data)
            toast.success('Sent to salesman')
            // Mark request Completed if applicable
            if (requestId) {
                await salesApi.updateOfferRequestStatus(requestId, { status: 'Ready', notes: 'Offer created and sent' })
            }
        } catch (e: any) {
            toast.error(e.message || 'Failed to send')
        }
    }

    const exportPdf = async () => {
        if (!offer) return
        try {
            // Generate PDF from backend (both EN and AR)
            const authState = useAuthStore.getState();
            const token = authState.user?.token;

            if (!token) {
                toast.error('Authentication required for PDF export');
                return;
            }

            const apiBaseUrl = getApiBaseUrl();
            const languages = ['en', 'ar'];

            for (const lang of languages) {
                try {
                    const response = await fetch(
                        `${apiBaseUrl}/api/Offer/${offer.id}/pdf?language=${lang}`,
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
                        console.error(`Backend PDF generation failed for ${lang}:`, {
                            status: response.status,
                            statusText: response.statusText,
                            error: errorText
                        });
                        continue;
                    }

                    const pdfBlob = await response.blob();

                    if (!pdfBlob || pdfBlob.size === 0) {
                        console.error(`Received empty PDF file for ${lang}`);
                        continue;
                    }

                    const url = window.URL.createObjectURL(pdfBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    const langSuffix = lang === 'ar' ? 'AR' : 'EN';
                    link.download = `Offer_${offer.id}_${langSuffix}_${new Date().toISOString().split('T')[0]}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                } catch (error: any) {
                    console.error(`Error generating backend PDF for ${lang}:`, error);
                }
            }

            toast.success('PDFs exported successfully! Both Arabic and English versions downloaded.')
        } catch (e: any) {
            toast.error(e.message || 'Export failed')
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Offer Creation (Sales Support)</CardTitle>
                    <CardDescription>
                        {requestId ? `From Request #${requestId}` : 'Create an offer'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Prefill Summary */}
                    {loadingRequest ? (
                        <p>Loading request details...</p>
                    ) : requestDetails ? (
                        <div className="mb-6 p-4 rounded-lg border bg-gray-50 dark:bg-gray-800">
                            <p className="text-sm"><strong>Client:</strong> {requestDetails.clientName}</p>
                            <p className="text-sm"><strong>Requested By:</strong> {requestDetails.requestedByName}</p>
                            <p className="text-sm"><strong>Products:</strong> {requestDetails.requestedProducts}</p>
                            <p className="text-xs text-gray-500 mt-1">Request Date: {requestDetails.requestDate ? format(new Date(requestDetails.requestDate), 'MMM dd, yyyy HH:mm') : 'N/A'}</p>
                        </div>
                    ) : null}

                    {/* Client Info Display (from request) */}
                    {clientId && clientName && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Client: {clientName}</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">ID: #{clientId}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Offer Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Only show salesman field if NOT a customer request */}
                        {!isCustomerRequest && (
                            <div>
                                <Label>Assign To SalesMan *</Label>
                                <Input
                                    value={salesmanQuery}
                                    onChange={(e) => setSalesManQuery(e.target.value)}
                                    placeholder={t('typeToSearchSalesMan')}
                                    className={!assignedToSalesManId ? 'border-yellow-400' : ''}
                                />
                                {loadingSalesmen && (
                                    <div className="mt-2 px-3 py-2 text-sm text-gray-500">
                                        <svg className="animate-spin h-4 w-4 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading salesmen...
                                    </div>
                                )}
                                {!loadingSalesmen && salesmen.length > 0 && (
                                    <div className="mt-2 border rounded-md max-h-48 overflow-y-auto bg-white dark:bg-gray-800 shadow-lg">
                                        {salesmen.map((u: any) => (
                                            <div
                                                key={u.id}
                                                className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer border-b last:border-b-0"
                                                onClick={() => {
                                                    setAssignedToSalesManId(String(u.id));
                                                    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName || u.email || '';
                                                    setAssignedToSalesManName(fullName);
                                                    setSalesManQuery(fullName);
                                                }}
                                            >
                                                <div className="text-sm font-medium">{`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName || u.email}</div>
                                                <div className="text-xs text-gray-500">{u.email} • ID: {u.id}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {!loadingSalesmen && salesmen.length === 0 && salesmanQuery.length > 0 && (
                                    <div className="mt-2 px-3 py-2 text-sm text-gray-500 border rounded-md bg-gray-50 dark:bg-gray-800">
                                        No salesmen found matching "{salesmanQuery}"
                                    </div>
                                )}
                                {assignedToSalesManId && assignedToSalesManName && (
                                    <div className="mt-1 px-2 py-1 bg-green-50 dark:bg-green-900 rounded text-xs text-green-700 dark:text-green-200">
                                        ✓ Selected: {assignedToSalesManName}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Show assigned to info for customer requests */}
                        {isCustomerRequest && assignedToSalesManId && (
                            <div className="md:col-span-2">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                Offer will be assigned to: {requestDetails?.requestedByName || 'Requester'}
                                            </p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                This offer request was created by the customer, so it will be assigned directly to them.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <Label>Link to Offer Request (Optional - for follow-up tracking)</Label>
                            <Select
                                value={selectedOfferRequestId || undefined}
                                onValueChange={(value) => {
                                    if (value === '__none__') {
                                        setSelectedOfferRequestId('')
                                    } else {
                                        setSelectedOfferRequestId(value || '')
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="-- No Request (Standalone Offer) --" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">-- No Request (Standalone Offer) --</SelectItem>
                                    {loadingOfferRequests ? (
                                        <SelectItem value="__loading__" disabled>Loading requests...</SelectItem>
                                    ) : availableOfferRequests.length > 0 ? (
                                        availableOfferRequests.map((req: any) => (
                                            <SelectItem key={req.id} value={String(req.id)}>
                                                Request #{req.id} - {req.clientName} - {req.status} ({req.requestedByName})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="__none_available__" disabled>No available requests</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {selectedOfferRequestId && (
                                <div className="mt-1 px-2 py-1 bg-blue-50 dark:bg-blue-900 rounded text-xs text-blue-700 dark:text-blue-200">
                                    ℹ️ This offer will be linked to Request #{selectedOfferRequestId} for follow-up tracking
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <Label>Products Description (optional if adding structured products below)</Label>
                            <Textarea
                                value={products}
                                onChange={(e) => setProducts(e.target.value)}
                                rows={3}
                                placeholder="e.g., X-Ray Machine 400mA, CT Scanner 64-slice, Installation and training included..."
                                className="resize-y"
                            />
                        </div>
                        <div>
                            <Label>Total Amount *</Label>
                            {productItems.length > 0 ? (
                                <div className="relative">
                                    <Input
                                        value={productItems.reduce((sum, p) => sum + (Number(p.price) || 0), 0).toFixed(2)}
                                        readOnly
                                        className="bg-green-50 dark:bg-green-900 cursor-not-allowed font-semibold text-green-700 dark:text-green-200"
                                    />
                                    <div className="absolute right-3 top-2.5 text-xs text-green-600 dark:text-green-300 font-medium">
                                        ✓ Auto-calculated
                                    </div>
                                </div>
                            ) : (
                                <Input
                                    value={totalAmount}
                                    onChange={(e) => setTotalAmount(e.target.value)}
                                    placeholder="e.g., 50000"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className={!totalAmount ? 'border-yellow-400' : ''}
                                />
                            )}
                        </div>
                        <div>
                            <Label>Discount Amount (optional)</Label>
                            <Input
                                value={discountAmount}
                                onChange={(e) => setDiscountAmount(e.target.value)}
                                placeholder="e.g., 2000"
                                type="number"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Terms Sections - 2 columns grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Valid Until - Array of dates */}
                        <div>
                            <Label>Valid Until (optional)</Label>
                            <div className="space-y-2">
                                {validUntil.map((date, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => {
                                                const newDates = [...validUntil]
                                                newDates[idx] = e.target.value
                                                setValidUntil(newDates)
                                            }}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setValidUntil(validUntil.filter((_, i) => i !== idx))}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const defaultDate = new Date()
                                        defaultDate.setDate(defaultDate.getDate() + 30)
                                        setValidUntil([...validUntil, defaultDate.toISOString().split('T')[0]])
                                    }}
                                >
                                    + Add Date
                                </Button>
                            </div>
                        </div>

                        {/* Payment Terms - Array */}
                        <div>
                            <Label>Payment Terms (optional)</Label>
                            <div className="space-y-2">
                                {paymentTerms.map((term, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <Textarea
                                            value={term}
                                            onChange={(e) => {
                                                const newTerms = [...paymentTerms]
                                                newTerms[idx] = e.target.value
                                                setPaymentTerms(newTerms)
                                            }}
                                            rows={2}
                                            placeholder="e.g., 50% upfront, 50% on delivery"
                                            className="resize-y flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setPaymentTerms(paymentTerms.filter((_, i) => i !== idx))}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPaymentTerms([...paymentTerms, ''])}
                                >
                                    + Add Payment Term
                                </Button>
                            </div>
                        </div>

                        {/* Delivery Terms - Array */}
                        <div>
                            <Label>Delivery Terms (optional)</Label>
                            <div className="space-y-2">
                                {deliveryTerms.map((term, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <Textarea
                                            value={term}
                                            onChange={(e) => {
                                                const newTerms = [...deliveryTerms]
                                                newTerms[idx] = e.target.value
                                                setDeliveryTerms(newTerms)
                                            }}
                                            rows={2}
                                            placeholder="e.g., 6-8 weeks after order"
                                            className="resize-y flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setDeliveryTerms(deliveryTerms.filter((_, i) => i !== idx))}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeliveryTerms([...deliveryTerms, ''])}
                                >
                                    + Add Delivery Term
                                </Button>
                            </div>
                        </div>

                        {/* Warranty Terms - Array */}
                        <div>
                            <Label>Warranty Terms (optional)</Label>
                            <div className="space-y-2">
                                {warrantyTerms.map((term, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <Textarea
                                            value={term}
                                            onChange={(e) => {
                                                const newTerms = [...warrantyTerms]
                                                newTerms[idx] = e.target.value
                                                setWarrantyTerms(newTerms)
                                            }}
                                            rows={2}
                                            placeholder="e.g., 2 years manufacturer warranty"
                                            className="resize-y flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setWarrantyTerms(warrantyTerms.filter((_, i) => i !== idx))}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setWarrantyTerms([...warrantyTerms, ''])}
                                >
                                    + Add Warranty Term
                                </Button>
                            </div>
                        </div>
                    </div>
                    {/* Products (structured) */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Products (Structured)</h3>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="default"
                                    onClick={() => setCatalogDialogOpen(true)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Select from Catalog
                                </Button>
                                {!showManualProductForm && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowManualProductForm(true)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Custom Product
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Manual Product Form - Only show when needed */}
                        {showManualProductForm && (
                            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 mt-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium">Add Custom Product</h4>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setShowManualProductForm(false)
                                            setNewProduct({ ...emptyProduct })
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <Label>Name *</Label>
                                        <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Product name" />
                                    </div>
                                    <div>
                                        <Label>Model</Label>
                                        <Input value={newProduct.model} onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })} placeholder={t('modelNumber')} />
                                    </div>
                                    <div>
                                        <Label>Factory</Label>
                                        <Input value={newProduct.factory} onChange={(e) => setNewProduct({ ...newProduct, factory: e.target.value })} placeholder={t('manufacturer')} />
                                    </div>
                                    <div>
                                        <Label>Country</Label>
                                        <Input value={newProduct.country} onChange={(e) => setNewProduct({ ...newProduct, country: e.target.value })} placeholder={t('countryOfOrigin')} />
                                    </div>
                                    <div>
                                        <Label>Year</Label>
                                        <Input value={newProduct.year as any} onChange={(e) => setNewProduct({ ...newProduct, year: e.target.value })} placeholder={t('year')} />
                                    </div>
                                    <div>
                                        <Label>Price *</Label>
                                        <Input type="number" value={newProduct.price as any} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Image URL</Label>
                                        <Input value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} placeholder="https://..." />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Provider Logo URL</Label>
                                        <Input value={newProduct.providerImagePath || ''} onChange={(e) => setNewProduct({ ...newProduct, providerImagePath: e.target.value })} placeholder="https://... or path" />
                                        {newProduct.providerImagePath && (
                                            <div className="mt-2">
                                                <ProviderLogo
                                                    providerName={newProduct.factory}
                                                    logoPath={newProduct.providerImagePath}
                                                    size="sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="md:col-span-3">
                                        <Label>Description</Label>
                                        <Textarea rows={2} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder={t('productDescription')} />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (!newProduct.name || !newProduct.price) {
                                                toast.error('Product name and price are required')
                                                return
                                            }
                                            setProductItems((prev) => [...prev, { ...newProduct }])
                                            setNewProduct({ ...emptyProduct })
                                            setShowManualProductForm(false)
                                            toast.success('Custom product added')
                                        }}
                                    >
                                        Add Product
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Products List */}
                        {productItems.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                            {productItems.length} Product{productItems.length > 1 ? 's' : ''} Added
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                        Total: ${productItems.reduce((sum, p) => sum + (Number(p.price) || 0), 0).toFixed(2)}
                                    </span>
                                </div>
                                {productItems.map((p, idx) => (
                                    <div key={idx} className="p-4 border rounded-md bg-white dark:bg-gray-900">
                                        {editingProductIndex === idx ? (
                                            // Edit Mode
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-primary">Editing Product</h4>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                // Save changes
                                                                setProductItems((prev) => {
                                                                    const updated = [...prev]
                                                                    updated[idx] = { ...editingProduct }
                                                                    return updated
                                                                })
                                                                setEditingProductIndex(null)
                                                                setEditingProduct({ ...emptyProduct })
                                                                toast.success(translate('offerCreationPage.success.productUpdated', 'Product updated'))
                                                            }}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingProductIndex(null)
                                                                setEditingProduct({ ...emptyProduct })
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div>
                                                        <Label>Name *</Label>
                                                        <Input
                                                            value={editingProduct.name}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                                            placeholder={t('productName')}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Model</Label>
                                                        <Input
                                                            value={editingProduct.model}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, model: e.target.value })}
                                                            placeholder={t('modelNumber')}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Factory/Manufacturer</Label>
                                                        <Input
                                                            value={editingProduct.factory}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, factory: e.target.value })}
                                                            placeholder={t('manufacturer')}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Country</Label>
                                                        <Input
                                                            value={editingProduct.country}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, country: e.target.value })}
                                                            placeholder={t('countryOfOrigin')}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Year</Label>
                                                        <Input
                                                            type="number"
                                                            value={editingProduct.year as any}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, year: e.target.value })}
                                                            placeholder={t('year')}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Price *</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={editingProduct.price as any}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <Label>Image URL</Label>
                                                        <Input
                                                            value={editingProduct.imageUrl}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                                                            placeholder="https://..."
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <Label>Provider Logo URL</Label>
                                                        <Input
                                                            value={editingProduct.providerImagePath || ''}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, providerImagePath: e.target.value })}
                                                            placeholder="https://... or path"
                                                        />
                                                        {editingProduct.providerImagePath && (
                                                            <div className="mt-2">
                                                                <ProviderLogo
                                                                    providerName={editingProduct.factory}
                                                                    logoPath={editingProduct.providerImagePath}
                                                                    size="sm"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <Label>Description</Label>
                                                        <Textarea
                                                            rows={3}
                                                            value={editingProduct.description}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                                            placeholder={t('productDescriptionSpecifications')}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`inStock-${idx}`}
                                                                checked={editingProduct.inStock}
                                                                onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                                                                className="rounded"
                                                            />
                                                            <Label htmlFor={`inStock-${idx}`} className="cursor-pointer">
                                                                In Stock
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // View Mode
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <p className="font-medium text-base">{p.name}</p>
                                                        {p.model && <span className="text-sm text-muted-foreground">• {p.model}</span>}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                        {p.factory && (
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-muted-foreground">
                                                                    <span className="font-medium">Factory:</span> {p.factory}
                                                                </p>
                                                                {p.providerImagePath && (
                                                                    <ProviderLogo
                                                                        providerName={p.factory}
                                                                        logoPath={p.providerImagePath}
                                                                        size="xs"
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                        {p.country && (
                                                            <p className="text-muted-foreground">
                                                                <span className="font-medium">Country:</span> {p.country}
                                                            </p>
                                                        )}
                                                        {p.year && (
                                                            <p className="text-muted-foreground">
                                                                <span className="font-medium">Year:</span> {p.year}
                                                            </p>
                                                        )}
                                                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                            <span className="font-medium">Price:</span> ${Number(p.price).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    {p.description && (
                                                        <div className="mt-2 p-2 bg-muted/50 rounded-md">
                                                            <p className="text-xs font-medium text-muted-foreground mb-1">Description:</p>
                                                            <p className="text-sm text-foreground">{p.description}</p>
                                                        </div>
                                                    )}
                                                    {p.imageUrl && (
                                                        <div className="mt-2">
                                                            <img
                                                                src={p.imageUrl}
                                                                alt={p.name}
                                                                className="w-20 h-20 object-cover rounded border"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none'
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingProduct({ ...p })
                                                            setEditingProductIndex(idx)
                                                        }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setProductItems((prev) => prev.filter((_, i) => i !== idx))
                                                            toast.success(translate('offerCreationPage.success.productRemoved', 'Product removed'))
                                                        }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex flex-col gap-3">
                        {/* Validation warnings */}
                        {!isCustomerRequest && !assignedToSalesManId && (
                            <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">⚠️ Required field:</p>
                                <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 ml-4 list-disc">
                                    {!assignedToSalesManId && <li>Please assign to a salesman</li>}
                                </ul>
                            </div>
                        )}
                        {!clientId && (
                            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">❌ Error:</p>
                                <p className="text-xs text-red-700 dark:text-red-300 mt-1">Client information is missing. Please ensure the offer request includes a client.</p>
                            </div>
                        )}

                        <div className="flex gap-2 items-center">
                            <Button
                                onClick={() => handleSubmit(createOffer)()}
                                disabled={creatingOffer || !clientId || (!isCustomerRequest && !assignedToSalesManId)}
                                className="px-6"
                                size="lg"
                                title={!clientId ? 'Client information is required from the offer request' : (!isCustomerRequest && !assignedToSalesManId) ? 'Please assign to a salesman' : undefined}
                            >
                                {creatingOffer ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Offer...
                                    </>
                                ) : (
                                    '✓ Create Offer'
                                )}
                            </Button>
                            {offer && (
                                <Badge variant="default" className="px-3 py-1 text-sm bg-green-500">
                                    ✓ Offer #{offer.id} Created • Status: {offer.status}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {offer && (
                <>
                    {/* Finalize */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Offer Status</CardTitle>
                            <CardDescription>
                                {offer.status === 'PendingSalesManagerApproval'
                                    ? 'Offer is pending SalesManager approval. Once approved, you can send it to the salesman.'
                                    : offer.status === 'Sent'
                                        ? 'Offer has been approved and is ready to send to salesman.'
                                        : 'Manage your offer'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={sendToSalesMan}
                                    disabled={!canSendCurrentOffer}
                                    title={!canSendCurrentOffer ? 'SalesManager has not approved this offer yet' : undefined}
                                >
                                    Send to SalesMan
                                </Button>
                                <Button variant="outline" onClick={exportPdf}>
                                    Export PDF
                                </Button>
                                <Button variant="ghost" onClick={() => navigate('/dashboard?tab=my-offers')}>
                                    Back to Dashboard
                                </Button>
                            </div>
                            {!canSendCurrentOffer && (
                                <div className="mt-3 flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>
                                        {awaitingSalesManagerApproval
                                            ? 'Awaiting SalesManager approval before you can send this offer.'
                                            : 'You can send the offer after SalesManager has approved it.'}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Product Catalog Selection Dialog */}
            <Dialog open={catalogDialogOpen} onOpenChange={setCatalogDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Select Product from Catalog</DialogTitle>
                        <DialogDescription>
                            Browse and select products from your catalog to add to this offer
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Search and Filter */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <Input
                                    value={catalogSearchTerm}
                                    onChange={(e) => setCatalogSearchTerm(e.target.value)}
                                    placeholder={t('searchProductsByNameModel')}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCatalogSearch()}
                                />
                            </div>
                            <Button onClick={handleCatalogSearch}>Search</Button>
                        </div>

                        <div>
                            <Label>Filter by Category</Label>
                            <Select
                                value={catalogSelectedCategory}
                                onValueChange={setCatalogSelectedCategory}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('allCategories')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Products List */}
                        {loadingCatalog && (
                            <div className="text-center py-8">Loading products...</div>
                        )}

                        {!loadingCatalog && catalogProducts.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No products found. Add products to catalog first.
                            </div>
                        )}

                        {!loadingCatalog && catalogProducts.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                                {catalogProducts.map((product) => (
                                    <Card
                                        key={product.id}
                                        className="cursor-pointer hover:border-primary transition-colors"
                                        onClick={() => handleSelectFromCatalog(product)}
                                    >
                                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center relative">
                                            {product.imagePath ? (
                                                <>
                                                    <img
                                                        src={productApi.getImageUrl(product.imagePath)}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer"
                                                        onLoad={() => {
                                                        }}
                                                        onError={(e) => {
                                                            console.error(`Failed to load image for: ${product.name}`, product.imagePath)
                                                            // Fallback to placeholder SVG if image fails to load
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                            target.onerror = null; // Prevent infinite loop
                                                        }}
                                                    />
                                                    {/* Loading overlay */}
                                                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse opacity-0 pointer-events-none" />
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                        <polyline points="21 15 16 10 5 21" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="pt-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold">{product.name}</h4>
                                                    {product.model && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {product.model}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge
                                                    variant={product.inStock ? 'default' : 'secondary'}
                                                >
                                                    {product.inStock ? 'In Stock' : 'Out'}
                                                </Badge>
                                            </div>

                                            {product.provider && (
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    {product.provider}
                                                </p>
                                            )}

                                            {product.category && (
                                                <Badge variant="outline" className="mr-2 mb-2">
                                                    {product.category}
                                                </Badge>
                                            )}

                                            <p className="text-lg font-bold text-primary">
                                                {product.basePrice !== undefined && product.basePrice !== null
                                                    ? new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'EGP',
                                                        minimumFractionDigits: 0,
                                                    }).format(product.basePrice)
                                                    : 'Price not set'}
                                            </p>

                                            {product.description && (
                                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                    {product.description}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setCatalogDialogOpen(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
