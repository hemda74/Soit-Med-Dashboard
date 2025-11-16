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
import { downloadOfferPDF } from '@/utils/pdfGenerator'
import { usePerformance } from '@/hooks/usePerformance'

function useQuery() {
    const { search } = useLocation()
    return useMemo(() => new URLSearchParams(search), [search])
}

export default function OfferCreationPage() {
    usePerformance('OfferCreationPage');
    const query = useQuery()
    const navigate = useNavigate()

    const requestId = query.get('requestId') || ''

    // Step 1: Prefill data from request
    const [requestDetails, setRequestDetails] = useState<any | null>(null)
    const [loadingRequest, setLoadingRequest] = useState<boolean>(!!requestId)

    // Optional OfferRequest linking (for follow-up)
    const [selectedOfferRequestId, setSelectedOfferRequestId] = useState<string>(requestId || '')
    const [availableOfferRequests, setAvailableOfferRequests] = useState<any[]>([])
    const [loadingOfferRequests, setLoadingOfferRequests] = useState(false)

    // Offer form state
    const [clientId, setClientId] = useState<string>('')
    const [clientName, setClientName] = useState<string>('')
    const [assignedToSalesmanId, setAssignedToSalesmanId] = useState<string>('')
    const [assignedToSalesmanName, setAssignedToSalesmanName] = useState<string>('')
    const [products, setProducts] = useState<string>('')
    const [productItems, setProductItems] = useState<Array<{ name: string; model?: string; factory?: string; country?: string; year?: number | string; price: number | string; imageUrl?: string; description?: string; inStock?: boolean }>>([])
    const emptyProduct = { name: '', model: '', factory: '', country: '', year: '', price: '', imageUrl: '', description: '', inStock: true as boolean }
    const [newProduct, setNewProduct] = useState<typeof emptyProduct>({ ...emptyProduct })
    const [showManualProductForm, setShowManualProductForm] = useState(false)
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

            console.log('Loading products with params:', params)
            const response = await productApi.getAllProducts(params)
            console.log('Products loaded:', response.data?.length || 0, 'products')

            if (response.data && response.data.length > 0) {
                // Log image paths for debugging
                response.data.forEach((product, index) => {
                    console.log(`Product ${index + 1}: ${product.name}, imagePath: ${product.imagePath || 'none'}`)
                })
            }

            setCatalogProducts(response.data || [])
        } catch (err: any) {
            console.error('Error loading catalog products:', err)
            toast.error(err.message || 'Failed to load products')
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
            toast.error(err.message || 'Search failed')
        } finally {
            setLoadingCatalog(false)
        }
    }

    const handleSelectFromCatalog = (product: Product) => {
        // Convert Product to productItems format
        const productItem = {
            name: product.name,
            model: product.model || '',
            factory: product.provider || '',
            country: product.country || '',
            year: product.year || '',
            price: product.basePrice.toString(),
            imageUrl: product.imagePath || '',
            description: product.description || '',
            inStock: product.inStock,
        }

        // Check if already added
        const exists = productItems.some((p) => p.name === product.name && p.model === productItem.model)
        if (exists) {
            toast.error('Product already added')
            return
        }

        setProductItems((prev) => [...prev, productItem])
        toast.success('Product added from catalog')
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
                setProducts(data.requestedProducts || '')
                setAssignedToSalesmanId(data.requestedBy || '')
                // reflect into form
                setValue('clientIdHidden', cid)
                setValue('products', data.requestedProducts || '')
            } catch (e: any) {
                toast.error(e.message || 'Failed to load request details')
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

    // Client search
    const [clientQuery, setClientQuery] = useState('')
    const [clientResults, setClientResults] = useState<any[]>([])
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (!clientQuery || clientQuery.length < 2) { setClientResults([]); return }
            try {
                const resp = await salesApi.searchClients({ query: clientQuery, page: 1, pageSize: 10 })
                setClientResults(resp.data.clients)
            } catch {
                // Client search failed silently
            }
        }, 300)
        return () => clearTimeout(handler)
    }, [clientQuery])

    // Salesman search (server-side using /api/Offer/salesmen)
    const [salesmen, setSalesmen] = useState<any[]>([])
    const [salesmanQuery, setSalesmanQuery] = useState('')
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
                    toast.error('Access denied: You do not have permission to view salesmen')
                } else if (error.response?.status === 401) {
                    toast.error('Unauthorized: Please log in again')
                } else if (error.message) {
                    toast.error(`Failed to load salesmen: ${error.message}`)
                }
            } finally {
                setLoadingSalesmen(false)
            }
        }, 300)
        return () => clearTimeout(handler)
    }, [salesmanQuery])

    // Create offer
    const createOffer = async (formData: OfferFormInputs) => {
        // Validation
        if (!clientId || !assignedToSalesmanId) {
            toast.error('Please select client and salesman')
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
            toast.error('Please add at least one product (from catalog or text description)')
            return
        }

        if (calculatedTotal <= 0) {
            toast.error('Total amount must be greater than 0')
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
                    assignedTo: assignedToSalesmanId,
                    products: productItems.map(p => ({
                        name: p.name,
                        model: p.model || '',
                        factory: p.factory || '',
                        country: p.country || '',
                        year: p.year ? Number(p.year) : undefined,
                        price: Number(p.price) || 0,
                        imageUrl: p.imageUrl || '',
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
                if (formData.discountAmount) payload.discountAmount = Number(formData.discountAmount);

                // Use the CreateOfferWithItems endpoint
                const resp = await salesApi.createOfferWithItems(payload);
                setOffer(resp.data);
            } else {
                // Fallback to simple createOffer for text-based products
                payload = {
                    clientId: Number(clientId),
                    assignedTo: assignedToSalesmanId,
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
                if (formData.discountAmount) payload.discountAmount = Number(formData.discountAmount);

                const resp = await salesApi.createOffer(payload);
                setOffer(resp.data);
            }
            toast.success('Offer created successfully! You can now send it to the salesman or export as PDF.')
        } catch (e: any) {
            toast.error(e.message || 'Failed to create offer')
        } finally {
            setCreatingOffer(false)
        }
    }

    // Send and Export
    const sendToSalesman = async () => {
        if (!offer) return
        try {
            await salesApi.sendOfferToSalesman(offer.id)
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
            // Handle arrays - convert to string for PDF display
            const formatArray = (arr: string[] | string | undefined): string => {
                if (!arr) return ''
                if (Array.isArray(arr)) {
                    return arr.filter(item => item && item.trim()).join('; ')
                }
                return String(arr)
            }

            // Fetch equipment data for PDF
            let equipmentData: any[] = [];
            try {
                const equipmentResponse = await salesApi.getOfferEquipment(offer.id);
                if (equipmentResponse.success && equipmentResponse.data) {
                    // Normalize equipment data to match PDF generator interface
                    equipmentData = equipmentResponse.data.map((eq: any) => ({
                        id: eq.id,
                        name: eq.name || 'N/A',
                        model: eq.model,
                        provider: eq.provider || eq.Provider || eq.manufacturer,
                        country: eq.country || eq.Country,
                        year: eq.year ?? eq.Year,
                        price: eq.price ?? eq.Price ?? eq.totalPrice ?? eq.unitPrice ?? 0,
                        description: eq.description || eq.Description || eq.specifications,
                        inStock: eq.inStock !== undefined ? eq.inStock : (eq.InStock !== undefined ? eq.InStock : true),
                        imagePath: eq.imagePath || eq.ImagePath,
                    }));
                }
            } catch (e) {
                // Equipment data not available for PDF
            }

            // Generate PDF from frontend (using existing data)
            // Generate both Arabic and English versions
            await downloadOfferPDF({
                id: offer.id,
                clientName: clientName || 'Client',
                clientType: undefined,
                clientLocation: undefined,
                products: offer.products,
                totalAmount: offer.totalAmount,
                discountAmount: offer.discountAmount,
                validUntil: formatArray(offer.validUntil),
                paymentTerms: formatArray(offer.paymentTerms),
                deliveryTerms: formatArray(offer.deliveryTerms),
                warrantyTerms: formatArray(offer.warrantyTerms),
                createdAt: offer.createdAt,
                status: offer.status,
                assignedToName: assignedToSalesmanName || offer.assignedTo,
                equipment: equipmentData, // Add equipment data
            }, {
                generateBothLanguages: true, // Generate both Arabic and English versions
                showProductHeaders: true,
            })
            toast.success('PDF exported successfully! Both Arabic and English versions downloaded.')
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

                    {/* Offer Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Client *</Label>
                            <Input
                                value={clientQuery}
                                onChange={(e) => setClientQuery(e.target.value)}
                                placeholder="Type to search client (min 2 chars)..."
                                className={!clientId ? 'border-yellow-400' : ''}
                            />
                            {clientResults.length > 0 && (
                                <div className="mt-2 border rounded-md max-h-48 overflow-y-auto bg-white dark:bg-gray-800 shadow-lg">
                                    {clientResults.map((c) => (
                                        <div
                                            key={c.id}
                                            className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer border-b last:border-b-0"
                                            onClick={() => {
                                                setClientId(String(c.id));
                                                setClientName(c.name);
                                                setClientResults([]);
                                                setClientQuery(c.name);
                                            }}
                                        >
                                            <div className="text-sm font-medium">{c.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {c.organizationName || 'N/A'} {c.classification ? `• ${c.classification}` : ''} • #{c.id}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {clientId && clientName && (
                                <div className="mt-1 px-2 py-1 bg-green-50 dark:bg-green-900 rounded text-xs text-green-700 dark:text-green-200">
                                    ✓ Selected: {clientName} (#{clientId})
                                </div>
                            )}
                        </div>
                        <div>
                            <Label>Assign To Salesman *</Label>
                            <Input
                                value={salesmanQuery}
                                onChange={(e) => setSalesmanQuery(e.target.value)}
                                placeholder="Type to search salesman..."
                                className={!assignedToSalesmanId ? 'border-yellow-400' : ''}
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
                                                setAssignedToSalesmanId(String(u.id));
                                                const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName || u.email || '';
                                                setAssignedToSalesmanName(fullName);
                                                setSalesmanQuery(fullName);
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
                            {assignedToSalesmanId && assignedToSalesmanName && (
                                <div className="mt-1 px-2 py-1 bg-green-50 dark:bg-green-900 rounded text-xs text-green-700 dark:text-green-200">
                                    ✓ Selected: {assignedToSalesmanName}
                                </div>
                            )}
                        </div>
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
                                        <Input value={newProduct.model} onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })} placeholder="Model number" />
                                    </div>
                                    <div>
                                        <Label>Factory</Label>
                                        <Input value={newProduct.factory} onChange={(e) => setNewProduct({ ...newProduct, factory: e.target.value })} placeholder="Manufacturer" />
                                    </div>
                                    <div>
                                        <Label>Country</Label>
                                        <Input value={newProduct.country} onChange={(e) => setNewProduct({ ...newProduct, country: e.target.value })} placeholder="Country of origin" />
                                    </div>
                                    <div>
                                        <Label>Year</Label>
                                        <Input value={newProduct.year as any} onChange={(e) => setNewProduct({ ...newProduct, year: e.target.value })} placeholder="Year" />
                                    </div>
                                    <div>
                                        <Label>Price *</Label>
                                        <Input type="number" value={newProduct.price as any} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Image URL</Label>
                                        <Input value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} placeholder="https://..." />
                                    </div>
                                    <div className="md:col-span-3">
                                        <Label>Description</Label>
                                        <Textarea rows={2} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Product description..." />
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
                                    <div key={idx} className="p-3 border rounded-md flex items-center justify-between gap-4 bg-white dark:bg-gray-900">
                                        <div className="flex-1">
                                            <p className="font-medium">{p.name} {p.model && `• ${p.model}`}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{p.factory} • {p.country} • {p.year}</p>
                                            <p className="text-xs font-semibold text-green-600 dark:text-green-400">Price: ${Number(p.price).toFixed(2)}</p>
                                            {p.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{p.description}</p>}
                                        </div>
                                        <Button variant="destructive" size="sm" onClick={() => setProductItems((prev) => prev.filter((_, i) => i !== idx))}>Remove</Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex flex-col gap-3">
                        {/* Validation warnings */}
                        {(!clientId || !assignedToSalesmanId) && (
                            <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">⚠️ Required fields:</p>
                                <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 ml-4 list-disc">
                                    {!clientId && <li>Please select a client</li>}
                                    {!assignedToSalesmanId && <li>Please assign to a salesman</li>}
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-2 items-center">
                            <Button
                                onClick={() => handleSubmit(createOffer)()}
                                disabled={creatingOffer || !clientId || !assignedToSalesmanId}
                                className="px-6"
                                size="lg"
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
                            <CardTitle>Finalize Offer</CardTitle>
                            <CardDescription>Send to salesman or export as PDF</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Button onClick={sendToSalesman}>
                                    Send to Salesman
                                </Button>
                                <Button variant="outline" onClick={exportPdf}>
                                    Export PDF
                                </Button>
                                <Button variant="ghost" onClick={() => navigate('/sales-support')}>
                                    Back to Dashboard
                                </Button>
                            </div>
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
                                    placeholder="Search products by name, model, provider..."
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
                                    <SelectValue placeholder="All Categories" />
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
                                                            console.log(`Image loaded successfully for: ${product.name}`)
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
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'EGP',
                                                    minimumFractionDigits: 0,
                                                }).format(product.basePrice)}
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
