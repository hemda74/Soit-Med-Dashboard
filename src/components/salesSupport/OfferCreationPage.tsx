import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { salesApi } from '@/services/sales/salesApi'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
    const [validUntil, setValidUntil] = useState<string>('')

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
    const [showSalesmenList, setShowSalesmenList] = useState(false)

    // Load salesmen function
    const loadSalesmen = async (query: string = '') => {
        setLoadingSalesmen(true)
        try {
            const resp = await salesApi.getOfferSalesmen(query)

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
    }

    // Load salesmen on mount if not a customer request
    useEffect(() => {
        if (!isCustomerRequest) {
            loadSalesmen('')
            setShowSalesmenList(true)
        }
    }, [isCustomerRequest])

    // Search salesmen with debounce when query changes
    useEffect(() => {
        if (!showSalesmenList) return

        const handler = setTimeout(() => {
            loadSalesmen(salesmanQuery)
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

            // Use validUntil from state, or default if empty
            const validUntilDate = validUntil && validUntil.trim() !== ''
                ? validUntil
                : defaultValidUntilStr
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
                    validUntil: [validUntilDate],
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
                    validUntil: [validUntilDate],
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
            toast.error(translate('offerCreationPage.salesManagerApprovalRequired', 'SalesManager must approve the offer before it can be sent to the assigned salesman.'))
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

            toast.success(translate('offerCreationPage.pdfsExportedSuccessfully', 'PDFs exported successfully! Both Arabic and English versions downloaded.'))
        } catch (e: any) {
            toast.error(e.message || translate('offerCreationPage.exportFailed', 'Export failed'))
        }
    }

    return (
        <div className="space-y-6 p-6">
            {/* Main Offer Creation Card */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm">
                {/* Card Header */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {translate('offerCreationPage.title', 'Create New Offer')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {requestId
                            ? translate('offerCreationPage.titleFromRequest', 'Creating offer from Request #{requestId}').replace('{requestId}', requestId)
                            : translate('offerCreationPage.titleStandalone', 'Fill in the details below to create a new offer')}
                    </p>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-6">
                    {/* Prefill Summary */}
                    {loadingRequest ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                            <svg className="animate-spin h-5 w-5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{translate('offerCreationPage.loadingRequestDetails', 'Loading request details...')}</p>
                        </div>
                    ) : requestDetails ? (
                        <div className="p-4 rounded-lg border border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-500/10">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <p className="text-xs font-medium text-brand-700 dark:text-brand-300 uppercase tracking-wide">{translate('offerCreationPage.requestInformation', 'Request Information')}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400">{translate('offerCreationPage.client', 'Client')}</p>
                                            <p className="font-medium text-gray-800 dark:text-white/90">{requestDetails.clientName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400">{translate('offerCreationPage.requestedBy', 'Requested By')}</p>
                                            <p className="font-medium text-gray-800 dark:text-white/90">{requestDetails.requestedByName}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-gray-600 dark:text-gray-400">{translate('offerCreationPage.requestedProducts', 'Requested Products')}</p>
                                            <p className="font-medium text-gray-800 dark:text-white/90">{requestDetails.requestedProducts}</p>
                                        </div>
                                        {requestDetails.requestDate && (
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-400">{translate('offerCreationPage.requestDate', 'Request Date')}</p>
                                                <p className="font-medium text-gray-800 dark:text-white/90">{format(new Date(requestDetails.requestDate), 'MMM dd, yyyy HH:mm')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Client Info Display (from request) */}
                    {clientId && clientName && (
                        <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-500/10">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">{translate('offerCreationPage.clientInformation', 'Client Information')}</p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">{clientName} <span className="text-xs">(ID: #{clientId})</span></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Offer Form */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">{translate('offerCreationPage.assignmentAndDetails', 'Assignment & Details')}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Only show salesman field if NOT a customer request */}
                                {!isCustomerRequest && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                            {translate('offerCreationPage.assignToSalesMan', 'Assign To SalesMan')} <span className="text-error-500">*</span>
                                        </Label>
                                        <Input
                                            value={salesmanQuery}
                                            onChange={(e) => {
                                                setSalesManQuery(e.target.value)
                                                setShowSalesmenList(true)
                                            }}
                                            onFocus={() => {
                                                setShowSalesmenList(true)
                                                if (salesmen.length === 0 && !loadingSalesmen) {
                                                    loadSalesmen(salesmanQuery)
                                                }
                                            }}
                                            onBlur={() => {
                                                // Delay hiding to allow click on list item
                                                setTimeout(() => setShowSalesmenList(false), 200)
                                            }}
                                            placeholder={t('typeToSearchSalesMan')}
                                            className={`h-11 rounded-lg border shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 ${!assignedToSalesManId ? 'border-warning-400 focus:border-warning-400' : 'border-gray-300 dark:border-gray-700 focus:border-brand-300 dark:focus:border-brand-800'
                                                }`}
                                        />
                                        {loadingSalesmen && (
                                            <div className="mt-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {translate('offerCreationPage.loadingSalesmen', 'Loading salesmen...')}
                                            </div>
                                        )}
                                        {showSalesmenList && !loadingSalesmen && salesmen.length > 0 && (
                                            <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto bg-white dark:bg-gray-900 shadow-theme-md">
                                                {salesmen.map((u: any) => (
                                                    <div
                                                        key={u.id}
                                                        className="px-4 py-3 hover:bg-brand-50 dark:hover:bg-brand-500/10 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-colors"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault() // Prevent onBlur from firing
                                                            setAssignedToSalesManId(String(u.id));
                                                            const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName || u.email || '';
                                                            setAssignedToSalesManName(fullName);
                                                            setSalesManQuery(fullName);
                                                            setShowSalesmenList(false);
                                                        }}
                                                    >
                                                        <div className="text-sm font-medium text-gray-800 dark:text-white/90">{`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName || u.email}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{u.email} • ID: {u.id}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {showSalesmenList && !loadingSalesmen && salesmen.length === 0 && salesmanQuery.length > 0 && (
                                            <div className="mt-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                                                {translate('offerCreationPage.noSalesmenFound', 'No salesmen found matching "{query}"').replace('{query}', salesmanQuery)}
                                            </div>
                                        )}
                                        {assignedToSalesManId && assignedToSalesManName && (
                                            <div className="mt-2 px-3 py-2 bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-800 rounded-lg text-xs text-success-700 dark:text-success-300 flex items-center gap-2">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {translate('offerCreationPage.selected', 'Selected:')} {assignedToSalesManName}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Show assigned to info for customer requests */}
                                {isCustomerRequest && assignedToSalesManId && (
                                    <div className="md:col-span-2">
                                        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                                        {translate('offerCreationPage.offerAssignment', 'Offer Assignment')}
                                                    </p>
                                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                        {translate('offerCreationPage.willBeAssignedTo', 'Will be assigned to:')} {requestDetails?.requestedByName || 'Requester'}
                                                    </p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                        {translate('offerCreationPage.customerRequestNote', 'This offer request was created by the customer, so it will be assigned directly to them.')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                        {translate('offerCreationPage.linkToOfferRequest', 'Link to Offer Request')} <span className="text-gray-500 dark:text-gray-500">({translate('offerCreationPage.optional', 'Optional')})</span>
                                    </Label>
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
                                        <SelectTrigger className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900">
                                            <SelectValue placeholder={`-- ${translate('offerCreationPage.noRequestStandalone', 'No Request (Standalone Offer)')} --`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">{`-- ${translate('offerCreationPage.noRequestStandalone', 'No Request (Standalone Offer)')} --`}</SelectItem>
                                            {loadingOfferRequests ? (
                                                <SelectItem value="__loading__" disabled>{translate('offerCreationPage.loadingRequests', 'Loading requests...')}</SelectItem>
                                            ) : availableOfferRequests.length > 0 ? (
                                                availableOfferRequests.map((req: any) => (
                                                    <SelectItem key={req.id} value={String(req.id)}>
                                                        Request #{req.id} - {req.clientName} - {req.status} ({req.requestedByName})
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="__none_available__" disabled>{translate('offerCreationPage.noAvailableRequests', 'No available requests')}</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {selectedOfferRequestId && (
                                        <div className="px-3 py-2 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-800 rounded-lg text-xs text-brand-700 dark:text-brand-300 flex items-center gap-2">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {translate('offerCreationPage.offerLinkedToRequest', 'This offer will be linked to Request #{requestId} for follow-up tracking').replace('{requestId}', selectedOfferRequestId)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Products and Pricing Section */}
                        <div>
                            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">{translate('offerCreationPage.productsAndPricing', 'Products & Pricing')}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                        {translate('offerCreationPage.productsDescription', 'Products Description')} <span className="text-gray-500 dark:text-gray-500">({translate('offerCreationPage.productsDescriptionOptional', 'optional if adding structured products below')})</span>
                                    </Label>
                                    <Textarea
                                        value={products}
                                        onChange={(e) => setProducts(e.target.value)}
                                        rows={3}
                                        placeholder="e.g., X-Ray Machine 400mA, CT Scanner 64-slice, Installation and training included..."
                                        className="resize-y rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                        {translate('offerCreationPage.totalAmount', 'Total Amount')} <span className="text-error-500">*</span>
                                    </Label>
                                    {productItems.length > 0 ? (
                                        <div className="relative">
                                            <Input
                                                value={productItems.reduce((sum, p) => sum + (Number(p.price) || 0), 0).toFixed(2)}
                                                readOnly
                                                className="h-11 bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-800 cursor-not-allowed font-semibold text-success-700 dark:text-success-300"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-success-600 dark:text-success-400 font-medium flex items-center gap-1">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {translate('offerCreationPage.autoCalculated', 'Auto-calculated')}
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
                                            className={`h-11 rounded-lg border shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 ${!totalAmount ? 'border-warning-400 focus:border-warning-400' : 'border-gray-300 dark:border-gray-700 focus:border-brand-300 dark:focus:border-brand-800'
                                                }`}
                                        />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                        {translate('offerCreationPage.discountAmount', 'Discount Amount')} <span className="text-gray-500 dark:text-gray-500">({translate('offerCreationPage.optional', 'optional')})</span>
                                    </Label>
                                    <Input
                                        value={discountAmount}
                                        onChange={(e) => setDiscountAmount(e.target.value)}
                                        placeholder="e.g., 2000"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Terms Sections */}
                        <div>
                            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">{translate('offerCreationPage.termsAndConditions', 'Terms & Conditions')}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Valid Until - Single date input */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                        {translate('offerCreationPage.validUntil', 'Valid Until')} <span className="text-gray-500 dark:text-gray-500">({translate('offerCreationPage.optional', 'optional')})</span>
                                    </Label>
                                    <Input
                                        type="date"
                                        value={validUntil}
                                        onChange={(e) => setValidUntil(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                    />
                                </div>

                                {/* Payment Terms - Array */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                        {translate('offerCreationPage.paymentTerms', 'Payment Terms')} <span className="text-gray-500 dark:text-gray-500">({translate('offerCreationPage.optional', 'optional')})</span>
                                    </Label>
                                    <div className="space-y-2">
                                        {paymentTerms.map((term, idx) => (
                                            <div key={idx} className="flex gap-2 items-start">
                                                <Textarea
                                                    value={term}
                                                    onChange={(e) => {
                                                        const newTerms = [...paymentTerms]
                                                        newTerms[idx] = e.target.value
                                                        setPaymentTerms(newTerms)
                                                    }}
                                                    rows={2}
                                                    placeholder="e.g., 50% upfront, 50% on delivery"
                                                    className="resize-y flex-1 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setPaymentTerms(paymentTerms.filter((_, i) => i !== idx))}
                                                    className="h-[60px] px-4 rounded-lg mt-0"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPaymentTerms([...paymentTerms, ''])}
                                            className="h-11 px-4 rounded-lg border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            {translate('offerCreationPage.addPaymentTerm', 'Add Payment Term')}
                                        </Button>
                                    </div>
                                </div>

                                {/* Delivery Terms - Array */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                        {translate('offerCreationPage.deliveryTerms', 'Delivery Terms')} <span className="text-gray-500 dark:text-gray-500">({translate('offerCreationPage.optional', 'optional')})</span>
                                    </Label>
                                    <div className="space-y-2">
                                        {deliveryTerms.map((term, idx) => (
                                            <div key={idx} className="flex gap-2 items-start">
                                                <Textarea
                                                    value={term}
                                                    onChange={(e) => {
                                                        const newTerms = [...deliveryTerms]
                                                        newTerms[idx] = e.target.value
                                                        setDeliveryTerms(newTerms)
                                                    }}
                                                    rows={2}
                                                    placeholder="e.g., 6-8 weeks after order"
                                                    className="resize-y flex-1 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setDeliveryTerms(deliveryTerms.filter((_, i) => i !== idx))}
                                                    className="h-[60px] px-4 rounded-lg mt-0"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDeliveryTerms([...deliveryTerms, ''])}
                                            className="h-11 px-4 rounded-lg border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            {translate('offerCreationPage.addDeliveryTerm', 'Add Delivery Term')}
                                        </Button>
                                    </div>
                                </div>

                                {/* Warranty Terms - Array */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                        {translate('offerCreationPage.warrantyTerms', 'Warranty Terms')} <span className="text-gray-500 dark:text-gray-500">({translate('offerCreationPage.optional', 'optional')})</span>
                                    </Label>
                                    <div className="space-y-2">
                                        {warrantyTerms.map((term, idx) => (
                                            <div key={idx} className="flex gap-2 items-start">
                                                <Textarea
                                                    value={term}
                                                    onChange={(e) => {
                                                        const newTerms = [...warrantyTerms]
                                                        newTerms[idx] = e.target.value
                                                        setWarrantyTerms(newTerms)
                                                    }}
                                                    rows={2}
                                                    placeholder="e.g., 2 years manufacturer warranty"
                                                    className="resize-y flex-1 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setWarrantyTerms(warrantyTerms.filter((_, i) => i !== idx))}
                                                    className="h-[60px] px-4 rounded-lg mt-0"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setWarrantyTerms([...warrantyTerms, ''])}
                                            className="h-11 px-4 rounded-lg border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            {translate('offerCreationPage.addWarrantyTerm', 'Add Warranty Term')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Products (structured) */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">{translate('offerCreationPage.productsStructured', 'Products (Structured)')}</h4>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="default"
                                        onClick={() => setCatalogDialogOpen(true)}
                                        className="h-11 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-theme-xs"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        {translate('offerCreationPage.selectFromCatalog', 'Select from Catalog')}
                                    </Button>
                                    {!showManualProductForm && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowManualProductForm(true)}
                                            className="h-11 px-4 rounded-lg border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            {translate('offerCreationPage.addCustomProduct', 'Add Custom Product')}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Manual Product Form - Only show when needed */}
                            {showManualProductForm && (
                                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50 mt-3">
                                    <div className="flex items-center justify-between mb-4">
                                        <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90">{translate('offerCreationPage.addCustomProduct', 'Add Custom Product')}</h5>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setShowManualProductForm(false)
                                                setNewProduct({ ...emptyProduct })
                                            }}
                                            className="h-9 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            {translate('offerCreationPage.cancel', 'Cancel')}
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                                {translate('offerCreationPage.productName', 'Name')} <span className="text-error-500">*</span>
                                            </Label>
                                            <Input
                                                value={newProduct.name}
                                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                placeholder={translate('offerCreationPage.productName', 'Product name')}
                                                className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">{translate('offerCreationPage.productModel', 'Model')}</Label>
                                            <Input
                                                value={newProduct.model}
                                                onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                                                placeholder={t('modelNumber')}
                                                className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">{translate('offerCreationPage.productFactory', 'Factory')}</Label>
                                            <Input
                                                value={newProduct.factory}
                                                onChange={(e) => setNewProduct({ ...newProduct, factory: e.target.value })}
                                                placeholder={t('manufacturer')}
                                                className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">{translate('offerCreationPage.productCountry', 'Country')}</Label>
                                            <Input
                                                value={newProduct.country}
                                                onChange={(e) => setNewProduct({ ...newProduct, country: e.target.value })}
                                                placeholder={t('countryOfOrigin')}
                                                className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">{translate('offerCreationPage.productYear', 'Year')}</Label>
                                            <Input
                                                value={newProduct.year as any}
                                                onChange={(e) => setNewProduct({ ...newProduct, year: e.target.value })}
                                                placeholder={t('year')}
                                                className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                                {translate('offerCreationPage.productPrice', 'Price')} <span className="text-error-500">*</span>
                                            </Label>
                                            <Input
                                                type="number"
                                                value={newProduct.price as any}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                placeholder="0.00"
                                                className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">{translate('offerCreationPage.productImageUrl', 'Image URL')}</Label>
                                            <Input
                                                value={newProduct.imageUrl}
                                                onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                                                placeholder="https://..."
                                                className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">{translate('offerCreationPage.productProviderLogoUrl', 'Provider Logo URL')}</Label>
                                            <Input
                                                value={newProduct.providerImagePath || ''}
                                                onChange={(e) => setNewProduct({ ...newProduct, providerImagePath: e.target.value })}
                                                placeholder="https://... or path"
                                                className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                            />
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
                                        <div className="md:col-span-2 space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">{translate('offerCreationPage.productDescription', 'Description')}</Label>
                                            <Textarea
                                                rows={2}
                                                value={newProduct.description}
                                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                                placeholder={t('productDescription')}
                                                className="rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                if (!newProduct.name || !newProduct.price) {
                                                    toast.error(translate('offerCreationPage.productNameAndPriceRequired', 'Product name and price are required'))
                                                    return
                                                }
                                                setProductItems((prev) => [...prev, { ...newProduct }])
                                                setNewProduct({ ...emptyProduct })
                                                setShowManualProductForm(false)
                                                toast.success(translate('offerCreationPage.customProductAdded', 'Custom product added'))
                                            }}
                                            className="h-11 px-6 rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-theme-xs"
                                        >
                                            {translate('offerCreationPage.addProduct', 'Add Product')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Products List */}
                            {productItems.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="text-sm font-semibold text-brand-900 dark:text-brand-100 block">
                                                    {productItems.length} {translate('offerCreationPage.productsAdded', 'Product(s) Added')}
                                                </span>
                                                <span className="text-xs text-brand-700 dark:text-brand-300">
                                                    {translate('offerCreationPage.total', 'Total:')} ${productItems.reduce((sum, p) => sum + (Number(p.price) || 0), 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {productItems.map((p, idx) => (
                                        <div key={idx} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 shadow-theme-xs">
                                            {editingProductIndex === idx ? (
                                                // Edit Mode
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-medium text-primary">{translate('offerCreationPage.editingProduct', 'Editing Product')}</h4>
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
                                                                {translate('offerCreationPage.save', 'Save')}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setEditingProductIndex(null)
                                                                    setEditingProduct({ ...emptyProduct })
                                                                }}
                                                            >
                                                                {translate('offerCreationPage.cancel', 'Cancel')}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label>{translate('offerCreationPage.productName', 'Name')} *</Label>
                                                            <Input
                                                                value={editingProduct.name}
                                                                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                                                placeholder={t('productName')}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>{translate('offerCreationPage.productModel', 'Model')}</Label>
                                                            <Input
                                                                value={editingProduct.model}
                                                                onChange={(e) => setEditingProduct({ ...editingProduct, model: e.target.value })}
                                                                placeholder={t('modelNumber')}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>{translate('offerCreationPage.productFactory', 'Factory/Manufacturer')}</Label>
                                                            <Input
                                                                value={editingProduct.factory}
                                                                onChange={(e) => setEditingProduct({ ...editingProduct, factory: e.target.value })}
                                                                placeholder={t('manufacturer')}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>{translate('offerCreationPage.productCountry', 'Country')}</Label>
                                                            <Input
                                                                value={editingProduct.country}
                                                                onChange={(e) => setEditingProduct({ ...editingProduct, country: e.target.value })}
                                                                placeholder={t('countryOfOrigin')}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>{translate('offerCreationPage.productYear', 'Year')}</Label>
                                                            <Input
                                                                type="number"
                                                                value={editingProduct.year as any}
                                                                onChange={(e) => setEditingProduct({ ...editingProduct, year: e.target.value })}
                                                                placeholder={t('year')}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>{translate('offerCreationPage.productPrice', 'Price')} *</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={editingProduct.price as any}
                                                                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>{translate('offerCreationPage.productImageUrl', 'Image URL')}</Label>
                                                            <Input
                                                                value={editingProduct.imageUrl}
                                                                onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                                                                placeholder="https://..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>{translate('offerCreationPage.productProviderLogoUrl', 'Provider Logo URL')}</Label>
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
                                                        <div className="md:col-span-2">
                                                            <Label>{translate('offerCreationPage.productDescription', 'Description')}</Label>
                                                            <Textarea
                                                                rows={3}
                                                                value={editingProduct.description}
                                                                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                                                placeholder={t('productDescriptionSpecifications')}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`inStock-${idx}`}
                                                                    checked={editingProduct.inStock}
                                                                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                                                                    className="rounded"
                                                                />
                                                                <Label htmlFor={`inStock-${idx}`} className="cursor-pointer">
                                                                    {translate('offerCreationPage.inStock', 'In Stock')}
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
                                                                            size="sm"
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
                                                                setEditingProduct({
                                                                    name: p.name || '',
                                                                    model: p.model || '',
                                                                    factory: p.factory || '',
                                                                    country: p.country || '',
                                                                    year: p.year ? String(p.year) : '',
                                                                    price: p.price ? String(p.price) : '',
                                                                    imageUrl: p.imageUrl || '',
                                                                    providerImagePath: p.providerImagePath || '',
                                                                    description: p.description || '',
                                                                    inStock: p.inStock !== false,
                                                                })
                                                                setEditingProductIndex(idx)
                                                            }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            {translate('offerCreationPage.edit', 'Edit')}
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
                                                            {translate('offerCreationPage.remove', 'Remove')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="mt-6 flex flex-col gap-4">
                            {/* Validation warnings */}
                            {!isCustomerRequest && !assignedToSalesManId && (
                                <div className="px-4 py-3 bg-warning-50 dark:bg-warning-500/10 border border-warning-200 dark:border-warning-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="h-5 w-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-semibold text-warning-800 dark:text-warning-200">{translate('offerCreationPage.requiredField', 'Required field:')}</p>
                                            <ul className="text-xs text-warning-700 dark:text-warning-300 mt-1 ml-4 list-disc">
                                                {!assignedToSalesManId && <li>{translate('offerCreationPage.pleaseAssignSalesman', 'Please assign to a salesman')}</li>}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {!clientId && (
                                <div className="px-4 py-3 bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="h-5 w-5 text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-semibold text-error-800 dark:text-error-200">{translate('offerCreationPage.error', 'Error:')}</p>
                                            <p className="text-xs text-error-700 dark:text-error-300 mt-1">{translate('offerCreationPage.clientInfoMissing', 'Client information is missing. Please ensure the offer request includes a client.')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 items-center pt-4 border-t border-gray-200 dark:border-gray-800">
                                <Button
                                    onClick={() => handleSubmit(createOffer)()}
                                    disabled={creatingOffer || !clientId || (!isCustomerRequest && !assignedToSalesManId)}
                                    className="h-12 px-8 rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={!clientId ? translate('offerCreationPage.clientInfoMissing', 'Client information is missing. Please ensure the offer request includes a client.') : (!isCustomerRequest && !assignedToSalesManId) ? translate('offerCreationPage.pleaseAssignSalesman', 'Please assign to a salesman') : undefined}
                                >
                                    {creatingOffer ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {translate('offerCreationPage.creatingOffer', 'Creating Offer...')}
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {translate('offerCreationPage.createOffer', 'Create Offer')}
                                        </>
                                    )}
                                </Button>
                                {offer && (
                                    <div className="px-4 py-2 bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-800 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <svg className="h-5 w-5 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm font-medium text-success-700 dark:text-success-300">
                                                {translate('offerCreationPage.offerCreatedStatus', 'Offer #{offerId} Created • Status: {status}').replace('{offerId}', String(offer.id)).replace('{status}', offer.status)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {offer && (
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm">
                    {/* Card Header */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            {translate('offerCreationPage.offerStatus', 'Offer Status')}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {offer.status === 'PendingSalesManagerApproval'
                                ? translate('offerCreationPage.offerPendingApproval', 'Offer is pending SalesManager approval. Once approved, you can send it to the salesman.')
                                : offer.status === 'Sent'
                                    ? translate('offerCreationPage.offerApprovedReady', 'Offer has been approved and is ready to send to salesman.')
                                    : translate('offerCreationPage.manageYourOffer', 'Manage your offer')}
                        </p>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Button
                                onClick={sendToSalesMan}
                                disabled={!canSendCurrentOffer}
                                title={!canSendCurrentOffer ? translate('offerCreationPage.salesManagerApprovalRequired', 'SalesManager must approve the offer before it can be sent to the assigned salesman.') : undefined}
                                className="h-11 px-6 rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                {translate('offerCreationPage.sendToSalesMan', 'Send to SalesMan')}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={exportPdf}
                                className="h-11 px-6 rounded-lg border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {translate('offerCreationPage.exportPdf', 'Export PDF')}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/dashboard?tab=my-offers')}
                                className="h-11 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                {translate('offerCreationPage.backToDashboard', 'Back to Dashboard')}
                            </Button>
                        </div>
                        {!canSendCurrentOffer && (
                            <div className="mt-4 px-4 py-3 bg-warning-50 dark:bg-warning-500/10 border border-warning-200 dark:border-warning-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <svg className="h-5 w-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-warning-800 dark:text-warning-200">
                                            {awaitingSalesManagerApproval
                                                ? translate('offerCreationPage.awaitingApproval', 'Awaiting SalesManager approval before you can send this offer.')
                                                : translate('offerCreationPage.canSendAfterApproval', 'You can send the offer after SalesManager has approved it.')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Product Catalog Selection Dialog */}
            <Dialog open={catalogDialogOpen} onOpenChange={setCatalogDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xl">
                    <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-800">
                        <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">{translate('offerCreationPage.selectProductFromCatalog', 'Select Product from Catalog')}</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {translate('offerCreationPage.browseAndSelectProducts', 'Browse and select products from your catalog to add to this offer')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                        {/* Search and Filter */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <Input
                                    value={catalogSearchTerm}
                                    onChange={(e) => setCatalogSearchTerm(e.target.value)}
                                    placeholder={t('searchProductsByNameModel')}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCatalogSearch()}
                                    className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900"
                                />
                            </div>
                            <Button
                                onClick={handleCatalogSearch}
                                className="h-11 px-6 rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-theme-xs"
                            >
                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {translate('offerCreationPage.search', 'Search')}
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-400">{translate('offerCreationPage.filterByCategory', 'Filter by Category')}</Label>
                            <Select
                                value={catalogSelectedCategory}
                                onValueChange={setCatalogSelectedCategory}
                            >
                                <SelectTrigger className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900">
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
                            <div className="text-center py-8">{translate('offerCreationPage.loadingProducts', 'Loading products...')}</div>
                        )}

                        {!loadingCatalog && catalogProducts.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                {translate('offerCreationPage.noProductsFound', 'No products found. Add products to catalog first.')}
                            </div>
                        )}

                        {!loadingCatalog && catalogProducts.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                                {catalogProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="cursor-pointer border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:border-brand-500 dark:hover:border-brand-500 transition-colors shadow-theme-xs overflow-hidden"
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
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 dark:text-white/90">{product.name}</h4>
                                                    {product.model && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                            {product.model}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.inStock
                                                    ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    {product.inStock ? 'In Stock' : 'Out'}
                                                </span>
                                            </div>

                                            {product.provider && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    {product.provider}
                                                </p>
                                            )}

                                            {product.category && (
                                                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 mb-2 mr-2">
                                                    {product.category}
                                                </span>
                                            )}

                                            <p className="text-lg font-bold text-brand-500 dark:text-brand-400">
                                                {product.basePrice !== undefined && product.basePrice !== null
                                                    ? new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'EGP',
                                                        minimumFractionDigits: 0,
                                                    }).format(product.basePrice)
                                                    : 'Price not set'}
                                            </p>

                                            {product.description && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                                                    {product.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
                            <Button
                                variant="outline"
                                onClick={() => setCatalogDialogOpen(false)}
                                className="h-11 px-6 rounded-lg border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                {translate('offerCreationPage.close', 'Close')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
