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
import { Separator } from '@/components/ui/separator'
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

function useQuery() {
    const { search } = useLocation()
    return useMemo(() => new URLSearchParams(search), [search])
}

export default function OfferCreationPage() {
    const query = useQuery()
    const navigate = useNavigate()

    const requestId = query.get('requestId') || ''

    // Step 1: Prefill data from request
    const [requestDetails, setRequestDetails] = useState<any | null>(null)
    const [loadingRequest, setLoadingRequest] = useState<boolean>(!!requestId)

    // Offer form state
    const [clientId, setClientId] = useState<string>('')
    const [clientName, setClientName] = useState<string>('')
    const [assignedToSalesmanId, setAssignedToSalesmanId] = useState<string>('')
    const [assignedToSalesmanName, setAssignedToSalesmanName] = useState<string>('')
    const [products, setProducts] = useState<string>('')
    const [productItems, setProductItems] = useState<Array<{ name: string; model?: string; factory?: string; country?: string; year?: number | string; price: number | string; imageUrl?: string; description?: string; inStock?: boolean }>>([])
    const emptyProduct = { name: '', model: '', factory: '', country: '', year: '', price: '', imageUrl: '', description: '', inStock: true as boolean }
    const [newProduct, setNewProduct] = useState<typeof emptyProduct>({ ...emptyProduct })
    const [totalAmount, setTotalAmount] = useState<string>('')
    const [discountAmount, setDiscountAmount] = useState<string>('')
    const [paymentTerms, setPaymentTerms] = useState<string>('')
    const [deliveryTerms, setDeliveryTerms] = useState<string>('')
    const [warrantyTerms, setWarrantyTerms] = useState<string>('')
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

    // Equipment
    const [equipment, setEquipment] = useState<any[]>([])
    const [equipmentForm, setEquipmentForm] = useState({
        name: '',
        model: '',
        manufacturer: '',
        quantity: '1',
        unitPrice: '0',
        specifications: '',
        warrantyPeriod: '',
    })
    const [addingEquipment, setAddingEquipment] = useState(false)

    // Terms
    const [terms, setTerms] = useState({
        warrantyPeriod: '',
        deliveryTime: '',
        installationIncluded: '',
        trainingIncluded: '',
        maintenanceTerms: '',
        paymentTerms: '',
        deliveryTerms: '',
        returnPolicy: '',
    })
    const [deliveryTermsPoints, setDeliveryTermsPoints] = useState<string>('')
    const [warrantyTermsPoints, setWarrantyTermsPoints] = useState<string>('')
    const [savingTerms, setSavingTerms] = useState(false)

    // Installments
    const [installmentsForm, setInstallmentsForm] = useState({
        numberOfInstallments: '2',
        firstPaymentAmount: '0',
        firstPaymentDate: '',
        paymentFrequency: 'Monthly',
        totalAmount: '',
    })
    const [creatingInstallments, setCreatingInstallments] = useState(false)
    const [installmentPlan, setInstallmentPlan] = useState<any | null>(null)

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

    // Helpers
    const parseNumber = (v: string) => (v && !isNaN(Number(v)) ? Number(v) : undefined)

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

    // Client search
    const [clientQuery, setClientQuery] = useState('')
    const [clientResults, setClientResults] = useState<any[]>([])
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (!clientQuery || clientQuery.length < 2) { setClientResults([]); return }
            try {
                const resp = await salesApi.searchClients({ query: clientQuery, page: 1, pageSize: 10 })
                setClientResults(resp.data.clients)
            } catch { }
        }, 300)
        return () => clearTimeout(handler)
    }, [clientQuery])

    // Salesman search (server-side using /api/Offer/salesmen)
    const [salesmen, setSalesmen] = useState<any[]>([])
    const [salesmanQuery, setSalesmanQuery] = useState('')
    useEffect(() => {
        const handler = setTimeout(async () => {
            try {
                const resp = await salesApi.getOfferSalesmen(salesmanQuery)
                setSalesmen(Array.isArray(resp.data) ? resp.data : [])
            } catch {
                setSalesmen([])
            }
        }, 300)
        return () => clearTimeout(handler)
    }, [salesmanQuery])

    // Create offer
    const createOffer = async (formData: OfferFormInputs) => {
        if (!clientId || !assignedToSalesmanId || !products || !totalAmount) {
            toast.error('Please fill required fields: client, salesman, products, total')
            return
        }
        setCreatingOffer(true)
        try {
            const payload: any = {
                clientId: Number(clientId),
                assignedTo: assignedToSalesmanId,
                products: formData.products,
                totalAmount: Number(formData.totalAmount),
                validUntil: formData.validUntil || undefined,
                paymentTerms: formData.paymentTerms || undefined,
                deliveryTerms: formData.deliveryTerms || undefined,
                warrantyTerms: formData.warrantyTerms || undefined,
            }
            if (requestId) payload.offerRequestId = Number(requestId)
            if (formData.discountAmount) payload.discountAmount = Number(formData.discountAmount)

            const resp = await salesApi.createOffer(payload)
            setOffer(resp.data)
            toast.success('Offer created')

            // If productItems provided, add as equipment automatically
            if (productItems.length > 0) {
                for (const p of productItems) {
                    try {
                        await salesApi.addOfferEquipment(resp.data.id, {
                            name: p.name,
                            model: p.model || undefined,
                            manufacturer: p.factory || undefined,
                            quantity: 1,
                            unitPrice: Number(p.price) || 0,
                            specifications: p.description || undefined,
                            warrantyPeriod: undefined,
                        })
                    } catch { }
                }
                const list = await salesApi.getOfferEquipment(resp.data.id)
                setEquipment(list.data || [])
            }
        } catch (e: any) {
            toast.error(e.message || 'Failed to create offer')
        } finally {
            setCreatingOffer(false)
        }
    }

    // Equipment handlers
    const addEquipment = async () => {
        if (!offer) return
        if (!equipmentForm.name || !parseNumber(equipmentForm.quantity) || !parseNumber(equipmentForm.unitPrice)) {
            toast.error('Name, quantity and unit price are required')
            return
        }
        setAddingEquipment(true)
        try {
            const payload = {
                name: equipmentForm.name,
                model: equipmentForm.model || undefined,
                manufacturer: equipmentForm.manufacturer || undefined,
                quantity: Number(equipmentForm.quantity),
                unitPrice: Number(equipmentForm.unitPrice),
                specifications: equipmentForm.specifications || undefined,
                warrantyPeriod: equipmentForm.warrantyPeriod || undefined,
            }
            await salesApi.addOfferEquipment(offer.id, payload)
            const list = await salesApi.getOfferEquipment(offer.id)
            setEquipment(list.data || [])
            toast.success('Equipment added')
            setEquipmentForm({ name: '', model: '', manufacturer: '', quantity: '1', unitPrice: '0', specifications: '', warrantyPeriod: '' })
        } catch (e: any) {
            toast.error(e.message || 'Failed to add equipment')
        } finally {
            setAddingEquipment(false)
        }
    }

    const deleteEquipment = async (equipmentId: number) => {
        if (!offer) return
        try {
            await salesApi.deleteOfferEquipment(offer.id, equipmentId)
            const list = await salesApi.getOfferEquipment(offer.id)
            setEquipment(list.data || [])
            toast.success('Deleted')
        } catch (e: any) {
            toast.error(e.message || 'Delete failed')
        }
    }

    // per-equipment file selection and upload
    const [equipmentFiles, setEquipmentFiles] = useState<Record<number, File | undefined>>({})

    const uploadImage = async (equipmentId: number, file?: File | null) => {
        if (!offer || !file) return
        try {
            await salesApi.uploadEquipmentImage(offer.id, equipmentId, file)
            const list = await salesApi.getOfferEquipment(offer.id)
            setEquipment(list.data || [])
            toast.success('Image uploaded')
        } catch (e: any) {
            toast.error(e.message || 'Upload failed')
        }
    }

    // Terms save
    const saveTerms = async () => {
        if (!offer) return
        setSavingTerms(true)
        try {
            const payload: any = {
                warrantyPeriod: terms.warrantyPeriod || undefined,
                deliveryTime: terms.deliveryTime || undefined,
                installationIncluded: terms.installationIncluded === 'true' ? true : terms.installationIncluded === 'false' ? false : undefined,
                trainingIncluded: terms.trainingIncluded === 'true' ? true : terms.trainingIncluded === 'false' ? false : undefined,
                maintenanceTerms: (warrantyTermsPoints || terms.maintenanceTerms) || undefined,
                paymentTerms: terms.paymentTerms || undefined,
                deliveryTerms: (deliveryTermsPoints || terms.deliveryTerms) || undefined,
                returnPolicy: terms.returnPolicy || undefined,
            }
            await salesApi.updateOfferTerms(offer.id, payload)
            toast.success('Terms saved')
        } catch (e: any) {
            toast.error(e.message || 'Failed to save terms')
        } finally {
            setSavingTerms(false)
        }
    }

    // Installments
    const createInstallments = async () => {
        if (!offer) return
        if (!installmentsForm.numberOfInstallments || !installmentsForm.firstPaymentAmount || !installmentsForm.firstPaymentDate || !installmentsForm.totalAmount) {
            toast.error('Fill all required installment fields')
            return
        }
        setCreatingInstallments(true)
        try {
            const payload = {
                numberOfInstallments: Number(installmentsForm.numberOfInstallments),
                firstPaymentAmount: Number(installmentsForm.firstPaymentAmount),
                firstPaymentDate: installmentsForm.firstPaymentDate,
                paymentFrequency: installmentsForm.paymentFrequency as 'Monthly' | 'Quarterly' | 'Yearly',
                totalAmount: Number(installmentsForm.totalAmount),
            }
            const { data } = await salesApi.createInstallmentPlan(offer.id, payload)
            setInstallmentPlan(data)
            toast.success('Installment plan created')
        } catch (e: any) {
            toast.error(e.message || 'Failed to create installment plan')
        } finally {
            setCreatingInstallments(false)
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
                await salesApi.updateOfferRequestStatus(requestId, { status: 'Completed', notes: 'Offer created and sent' })
            }
        } catch (e: any) {
            toast.error(e.message || 'Failed to send')
        }
    }

    const exportPdf = async () => {
        if (!offer) return
        try {
            const blob = await salesApi.exportOfferPdf(offer.id)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `offer-${offer.id}.pdf`
            a.click()
            window.URL.revokeObjectURL(url)
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
                            <Label>Client</Label>
                            <Input value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} placeholder="Search client by name..." />
                            {clientResults.length > 0 && (
                                <div className="mt-2 border rounded-md max-h-48 overflow-y-auto bg-white dark:bg-gray-800">
                                    {clientResults.map((c) => (
                                        <div key={c.id} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => { setClientId(String(c.id)); setClientName(c.name); setClientResults([]); setClientQuery(c.name); }}>
                                            <div className="text-sm font-medium">{c.name}</div>
                                            <div className="text-xs text-gray-500">{c.type} • {c.location}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {clientId && clientName && (
                                <p className="text-xs text-gray-500 mt-1">Selected: #{clientId} • {clientName}</p>
                            )}
                        </div>
                        <div>
                            <Label>Assign To Salesman</Label>
                            <Input value={salesmanQuery} onChange={(e) => setSalesmanQuery(e.target.value)} placeholder="Search salesman by name..." />
                            <div className="mt-2 border rounded-md max-h-48 overflow-y-auto bg-white dark:bg-gray-800">
                                {salesmen.map((u: any) => (
                                    <div key={u.id} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => { setAssignedToSalesmanId(String(u.id)); setAssignedToSalesmanName(`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName || u.email || ''); setSalesmanQuery(`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName || u.email || ''); }}>
                                        <div className="text-sm font-medium">{`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName || u.email}</div>
                                        <div className="text-xs text-gray-500">ID: {u.id}</div>
                                    </div>
                                ))}
                                {salesmen.length === 0 && (
                                    <div className="px-3 py-2 text-sm text-gray-500">No salesmen found</div>
                                )}
                            </div>
                            {assignedToSalesmanId && assignedToSalesmanName && (
                                <p className="text-xs text-gray-500 mt-1">Selected: {assignedToSalesmanName} • {assignedToSalesmanId}</p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <Label>Products</Label>
                            <Textarea value={products} onChange={(e) => setProducts(e.target.value)} rows={3} placeholder="Describe products/services" />
                        </div>
                        <div>
                            <Label>Total Amount</Label>
                            <Input value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="50000" />
                        </div>
                        <div>
                            <Label>Discount Amount (optional)</Label>
                            <Input value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} placeholder="2000" />
                        </div>
                        <div>
                            <Label>Valid Until (ISO date)</Label>
                            <Input value={validUntil} onChange={(e) => setValidUntil(e.target.value)} placeholder="2025-11-15T23:59:59Z" />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Payment Terms</Label>
                                <Textarea value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} rows={2} />
                            </div>
                            <div>
                                <Label>Delivery Terms</Label>
                                <Textarea value={deliveryTerms} onChange={(e) => setDeliveryTerms(e.target.value)} rows={2} />
                            </div>
                            <div>
                                <Label>Warranty Terms</Label>
                                <Textarea value={warrantyTerms} onChange={(e) => setWarrantyTerms(e.target.value)} rows={2} />
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
                                    variant="outline"
                                    onClick={() => setCatalogDialogOpen(true)}
                                >
                                    Select from Catalog
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (!newProduct.name || !newProduct.price) { toast.error('Product name and price are required'); return }
                                        setProductItems((prev) => [...prev, { ...newProduct }])
                                        setNewProduct({ ...emptyProduct })
                                    }}
                                >Add Custom Product</Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            <div>
                                <Label>Name</Label>
                                <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                            </div>
                            <div>
                                <Label>Model</Label>
                                <Input value={newProduct.model} onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })} />
                            </div>
                            <div>
                                <Label>Factory</Label>
                                <Input value={newProduct.factory} onChange={(e) => setNewProduct({ ...newProduct, factory: e.target.value })} />
                            </div>
                            <div>
                                <Label>Country</Label>
                                <Input value={newProduct.country} onChange={(e) => setNewProduct({ ...newProduct, country: e.target.value })} />
                            </div>
                            <div>
                                <Label>Year</Label>
                                <Input value={newProduct.year as any} onChange={(e) => setNewProduct({ ...newProduct, year: e.target.value })} />
                            </div>
                            <div>
                                <Label>Price</Label>
                                <Input value={newProduct.price as any} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Image URL</Label>
                                <Input value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} />
                            </div>
                            <div className="md:col-span-3">
                                <Label>Description</Label>
                                <Textarea rows={2} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="mt-3 space-y-2">
                            {productItems.map((p, idx) => (
                                <div key={idx} className="p-3 border rounded-md flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-medium">{p.name} {p.model && `• ${p.model}`}</p>
                                        <p className="text-xs text-gray-500">{p.factory} • {p.country} • {p.year}</p>
                                        <p className="text-xs text-gray-500">Price: {p.price}</p>
                                        {p.description && <p className="text-xs text-gray-500 mt-1">{p.description}</p>}
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={() => setProductItems((prev) => prev.filter((_, i) => i !== idx))}>Remove</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Button onClick={() => handleSubmit(createOffer)()} disabled={creatingOffer}>{creatingOffer ? 'Creating...' : 'Create Offer'}</Button>
                        {offer && <Badge variant="outline" className="ml-2">Offer #{offer.id} • {offer.status}</Badge>}
                    </div>
                </CardContent>
            </Card>

            {offer && (
                <>
                    {/* Equipment Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Equipment</CardTitle>
                            <CardDescription>Add equipment items to this offer</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <Label>Name</Label>
                                    <Input value={equipmentForm.name} onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Model</Label>
                                    <Input value={equipmentForm.model} onChange={(e) => setEquipmentForm({ ...equipmentForm, model: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Manufacturer</Label>
                                    <Input value={equipmentForm.manufacturer} onChange={(e) => setEquipmentForm({ ...equipmentForm, manufacturer: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Quantity</Label>
                                    <Input value={equipmentForm.quantity} onChange={(e) => setEquipmentForm({ ...equipmentForm, quantity: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Unit Price</Label>
                                    <Input value={equipmentForm.unitPrice} onChange={(e) => setEquipmentForm({ ...equipmentForm, unitPrice: e.target.value })} />
                                </div>
                                <div className="md:col-span-3">
                                    <Label>Specifications</Label>
                                    <Textarea rows={2} value={equipmentForm.specifications} onChange={(e) => setEquipmentForm({ ...equipmentForm, specifications: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Warranty Period</Label>
                                    <Input value={equipmentForm.warrantyPeriod} onChange={(e) => setEquipmentForm({ ...equipmentForm, warrantyPeriod: e.target.value })} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <Button onClick={addEquipment} disabled={addingEquipment}>{addingEquipment ? 'Adding...' : 'Add Equipment'}</Button>
                            </div>

                            <Separator className="my-4" />

                            {/* Equipment List */}
                            <div className="space-y-3">
                                {equipment.length === 0 ? (
                                    <p className="text-sm text-gray-500">No equipment added yet</p>
                                ) : equipment.map((item) => (
                                    <div key={item.id} className="p-3 border rounded-md flex items-center justify-between gap-4">
                                        <div>
                                            <p className="font-medium">{item.name} {item.model && `• ${item.model}`}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity} • Unit: {item.unitPrice} • Total: {item.totalPrice}</p>
                                            {item.specifications && <p className="text-xs text-gray-500 mt-1">{item.specifications}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setEquipmentFiles((prev) => ({ ...prev, [item.id]: e.target.files?.[0] }))}
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => uploadImage(item.id, equipmentFiles[item.id])}
                                                disabled={!equipmentFiles[item.id]}
                                            >Upload</Button>
                                            <Button variant="destructive" size="sm" onClick={() => deleteEquipment(item.id)}>Delete</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Terms Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Terms and Conditions</CardTitle>
                            <CardDescription>Payment, delivery, warranty, and other terms</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <Label>Warranty Period</Label>
                                    <Input value={terms.warrantyPeriod} onChange={(e) => setTerms({ ...terms, warrantyPeriod: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Delivery Time</Label>
                                    <Input value={terms.deliveryTime} onChange={(e) => setTerms({ ...terms, deliveryTime: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Installation Included</Label>
                                    <Select value={terms.installationIncluded} onValueChange={(v) => setTerms({ ...terms, installationIncluded: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Training Included</Label>
                                    <Select value={terms.trainingIncluded} onValueChange={(v) => setTerms({ ...terms, trainingIncluded: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-3">
                                    <Label>Maintenance Terms</Label>
                                    <Textarea rows={2} value={terms.maintenanceTerms} onChange={(e) => setTerms({ ...terms, maintenanceTerms: e.target.value })} />
                                </div>
                                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <Label>Payment Terms</Label>
                                        <Textarea rows={2} value={terms.paymentTerms} onChange={(e) => setTerms({ ...terms, paymentTerms: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Delivery Terms (list; separated by ;)</Label>
                                        <Textarea rows={2} value={deliveryTermsPoints} onChange={(e) => setDeliveryTermsPoints(e.target.value)} placeholder="e.g. Delivery within 2 weeks; Installation included; Training included" />
                                    </div>
                                    <div>
                                        <Label>Warranty Terms (list; separated by ;)</Label>
                                        <Textarea rows={2} value={warrantyTermsPoints} onChange={(e) => setWarrantyTermsPoints(e.target.value)} placeholder="e.g. 2 years warranty; On-site support; Spare parts included" />
                                    </div>
                                    <div>
                                        <Label>Return Policy</Label>
                                        <Textarea rows={2} value={terms.returnPolicy} onChange={(e) => setTerms({ ...terms, returnPolicy: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3">
                                <Button onClick={saveTerms} disabled={savingTerms}>{savingTerms ? 'Saving...' : 'Save Terms'}</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Installments Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Installment Plan</CardTitle>
                            <CardDescription>Create installments for this offer</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                <div>
                                    <Label># of Installments</Label>
                                    <Input value={installmentsForm.numberOfInstallments} onChange={(e) => setInstallmentsForm({ ...installmentsForm, numberOfInstallments: e.target.value })} />
                                </div>
                                <div>
                                    <Label>First Payment Amount</Label>
                                    <Input value={installmentsForm.firstPaymentAmount} onChange={(e) => setInstallmentsForm({ ...installmentsForm, firstPaymentAmount: e.target.value })} />
                                </div>
                                <div>
                                    <Label>First Payment Date (ISO)</Label>
                                    <Input value={installmentsForm.firstPaymentDate} onChange={(e) => setInstallmentsForm({ ...installmentsForm, firstPaymentDate: e.target.value })} placeholder="2025-11-15T00:00:00Z" />
                                </div>
                                <div>
                                    <Label>Frequency</Label>
                                    <Select value={installmentsForm.paymentFrequency} onValueChange={(v) => setInstallmentsForm({ ...installmentsForm, paymentFrequency: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Monthly">Monthly</SelectItem>
                                            <SelectItem value="Quarterly">Quarterly</SelectItem>
                                            <SelectItem value="Yearly">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Total Amount</Label>
                                    <Input value={installmentsForm.totalAmount} onChange={(e) => setInstallmentsForm({ ...installmentsForm, totalAmount: e.target.value })} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <Button onClick={createInstallments} disabled={creatingInstallments}>{creatingInstallments ? 'Creating...' : 'Create Plan'}</Button>
                            </div>

                            {installmentPlan && (
                                <div className="mt-4 p-3 border rounded-md">
                                    <p className="font-medium">Plan: {installmentPlan.numberOfInstallments} installments • Total {installmentPlan.totalAmount}</p>
                                    <div className="mt-2 space-y-1">
                                        {installmentPlan.installments?.map((it: any) => (
                                            <div key={it.installmentNumber} className="text-sm text-gray-700 dark:text-gray-200">
                                                #{it.installmentNumber} • {it.amount} • {it.dueDate ? format(new Date(it.dueDate), 'MMM dd, yyyy') : 'N/A'} • {it.status}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Finalize */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Finalize Offer</CardTitle>
                            <CardDescription>Send to salesman or export as PDF</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Button onClick={sendToSalesman} disabled={offer.status === 'Sent'}>Send to Salesman</Button>
                                <Button variant="outline" onClick={exportPdf}>Export PDF</Button>
                                <Button variant="ghost" onClick={() => navigate('/sales-support')}>Back to Dashboard</Button>
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
                                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                            <img
                                                src={productApi.getImageUrl(product.imagePath || null)}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Fallback to placeholder SVG if image fails to load
                                                    ; (e.target as HTMLImageElement).src =
                                                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E'
                                                }}
                                            />
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














