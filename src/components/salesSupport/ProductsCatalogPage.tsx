// Products Catalog Management Page - Full CRUD for SalesSupport

import { useEffect, useState } from 'react'
import { productApi } from '@/services/sales/productApi'
import type { Product, CreateProductDto, UpdateProductDto } from '@/types/sales.types'
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
import { usePerformance } from '@/hooks/usePerformance'
import { useTranslation } from '@/hooks/useTranslation'
import ProviderLogo from '@/components/sales/ProviderLogo'
import { getStaticFileUrl, getApiBaseUrl } from '@/utils/apiConfig'
import { useAuthStore } from '@/stores/authStore'

const CATEGORIES = [
    'X-RAY',
    'MOBILE X-RAY',
    'PORTABLE X-RAY',
    'DIGITAL FLAT PANEL',
    'MRI',
    'CT Scanner',
    'C-ARM',
    'U-ARM',
    'DEXA',
    'RADIOGRAPHIC FLUOROSCOPY',
    'MAMMOGRAPHY',
    'ULTRASOUND',
    'Physiotherapy Line',
    'Dermatology Line',
    'IVD Line'
]

export default function ProductsCatalogPage() {
    usePerformance('ProductsCatalogPage');
    const { t } = useTranslation();
    const { hasAnyRole } = useAuthStore();
    const isInventoryManager = hasAnyRole(['InventoryManager', 'SuperAdmin']);
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

    // Form state
    const [formData, setFormData] = useState<CreateProductDto>({
        name: '',
        model: '',
        provider: '',
        country: '',
        category: '',
        description: '',
        year: undefined,
    })
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [providerImageFile, setProviderImageFile] = useState<File | null>(null)
    const [providerImagePreview, setProviderImagePreview] = useState<string | null>(null)
    const [dataSheetFile, setDataSheetFile] = useState<File | null>(null)
    const [catalogFile, setCatalogFile] = useState<File | null>(null)
    const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
    const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null)
    const [editingInventory, setEditingInventory] = useState<{ productId: number; quantity: number } | null>(null)

    // Load products
    useEffect(() => {
        loadProducts()
    }, [selectedCategory])

    // Filter products client-side
    useEffect(() => {
        let filtered = [...products]

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(term) ||
                    p.model?.toLowerCase().includes(term) ||
                    p.provider?.toLowerCase().includes(term) ||
                    p.category?.toLowerCase().includes(term) ||
                    p.description?.toLowerCase().includes(term)
            )
        }

        setFilteredProducts(filtered)
    }, [searchTerm, products])

    const loadProducts = async () => {
        setLoading(true)
        setError(null)
        try {
            const params: { category?: string } = {}
            if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory

            const response = await productApi.getAllProducts(params)
            setProducts(response.data || [])
            setFilteredProducts(response.data || [])
        } catch (err: any) {
            setError(err.message || t('failedToLoadProducts'))
            toast.error(err.message || t('failedToLoadProducts'))
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            loadProducts()
            return
        }

        setLoading(true)
        try {
            const response = await productApi.searchProducts(searchTerm)
            setProducts(response.data || [])
            setFilteredProducts(response.data || [])
        } catch (err: any) {
            toast.error(err.message || t('searchFailed'))
        } finally {
            setLoading(false)
        }
    }

    const openCreateDialog = () => {
        setEditingProduct(null)
        setFormData({
            name: '',
            model: '',
            provider: '',
            country: '',
            category: '',
            description: '',
            year: undefined,
        })
        setSelectedImage(null)
        setImagePreview(null)
        setProviderImageFile(null)
        setProviderImagePreview(null)
        setDataSheetFile(null)
        setCatalogFile(null)
        setDialogOpen(true)
    }

    const openEditDialog = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            model: product.model || '',
            provider: product.provider || '',
            country: product.country || '',
            category: product.category || '',
            description: product.description || '',
            year: product.year,
        })
        setSelectedImage(null)
        setImagePreview(product.imagePath ? productApi.getImageUrl(product.imagePath) : null)
        setProviderImageFile(null)
        setProviderImagePreview(
            product.providerImagePath
                ? productApi.getProviderImageUrl(product.providerImagePath)
                : null
        )
        setDataSheetFile(null)
        setCatalogFile(null)
        setDialogOpen(true)
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            toast.error(t('invalidFileType'))
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('fileSizeMustBeLessThan5MB'))
            return
        }

        setSelectedImage(file)

        // Preview
        const reader = new FileReader()
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleProviderImageSelect = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml']
        if (!allowedTypes.includes(file.type)) {
            toast.error(t('invalidFileType'))
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('fileSizeMustBeLessThan5MB'))
            return
        }

        setProviderImageFile(file)

        const reader = new FileReader()
        reader.onload = (event) => {
            setProviderImagePreview(event.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleDataSheetSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            toast.error(t('invalidFileType') || 'Invalid file type. Only PDF files are allowed.')
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('fileSizeMustBeLessThan5MB') || 'File size must be less than 5MB')
            return
        }

        setDataSheetFile(file)
    }

    const handleCatalogSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            toast.error(t('invalidFileType') || 'Invalid file type. Only PDF files are allowed.')
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('fileSizeMustBeLessThan5MB') || 'File size must be less than 5MB')
            return
        }

        setCatalogFile(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name) {
            toast.error(t('nameIsRequired'))
            return
        }

        try {
            if (editingProduct) {
                // Update
                const updateData: UpdateProductDto = {
                    ...formData,
                    year: formData.year || undefined,
                }
                const response = await productApi.updateProduct(editingProduct.id, updateData)

                // Upload image if selected
                if (selectedImage) {
                    await productApi.uploadProductImage(editingProduct.id, selectedImage)
                }

                if (providerImageFile) {
                    await productApi.uploadProviderImage(editingProduct.id, providerImageFile)
                }

                // Upload PDFs if selected
                if (dataSheetFile) {
                    await productApi.uploadDataSheet(editingProduct.id, dataSheetFile)
                }

                if (catalogFile) {
                    await productApi.uploadCatalog(editingProduct.id, catalogFile)
                }

                toast.success(t('productUpdatedSuccessfully'))
            } else {
                // Create
                const response = await productApi.createProduct(formData)
                const newProduct = response.data

                // Upload image if selected
                if (selectedImage && newProduct) {
                    await productApi.uploadProductImage(newProduct.id, selectedImage)
                }

                if (providerImageFile && newProduct) {
                    await productApi.uploadProviderImage(newProduct.id, providerImageFile)
                }

                // Upload PDFs if selected
                if (dataSheetFile && newProduct) {
                    await productApi.uploadDataSheet(newProduct.id, dataSheetFile)
                }

                if (catalogFile && newProduct) {
                    await productApi.uploadCatalog(newProduct.id, catalogFile)
                }

                toast.success(t('productCreatedSuccessfully'))
            }

            setDialogOpen(false)
            loadProducts()
        } catch (err: any) {
            toast.error(err.message || t('failedToSaveProduct'))
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm(t('areYouSureDeleteProduct'))) {
            return
        }

        try {
            await productApi.deleteProduct(id)
            toast.success(t('productDeletedSuccessfully'))
            loadProducts()
        } catch (err: any) {
            toast.error(err.message || t('failedToDeleteProduct'))
        }
    }

    const openPdfViewer = (url: string) => {
        setCurrentPdfUrl(url)
        setPdfViewerOpen(true)
    }

    const handleUpdateInventory = async (productId: number, quantity: number) => {
        try {
            await productApi.updateInventoryQuantity(productId, { inventoryQuantity: quantity })
            toast.success(t('inventoryUpdated'))
            setEditingInventory(null)
            loadProducts()
        } catch (err: any) {
            toast.error(err.message || t('failedToUpdateInventory'))
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('productsCatalog')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('manageProductCatalogForOfferCreation')}
                    </p>
                </div>
                <Button onClick={openCreateDialog}>+ {t('addProduct')}</Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label>{t('search')}</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('searchProducts')}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button onClick={handleSearch}>{t('search')}</Button>
                            </div>
                        </div>
                        <div>
                            <Label>{t('category')}</Label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('allCategories')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('allCategories')}</SelectItem>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat === 'X-Ray' ? t('xRay') :
                                                cat === 'Ultrasound' ? t('ultrasound') :
                                                    cat === 'CT Scanner' ? t('ctScanner') :
                                                        cat === 'MRI' ? t('mri') :
                                                            t('other')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('')
                                    setSelectedCategory('all')
                                    loadProducts()
                                }}
                            >
                                {t('clearFilters')}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Products Grid */}
            {loading && <div className="text-center py-8">{t('loading')}</div>}
            {error && (
                <div className="text-center py-8 text-destructive">
                    {t('error')}: {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    {filteredProducts.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    {t('noProductsFound')}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredProducts.map((product) => (
                                <Card key={product.id}>
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
                                                <h3 className="font-semibold text-lg">
                                                    {product.name}
                                                </h3>
                                                {product.model && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {t('model')}: {product.model}
                                                    </p>
                                                )}
                                            </div>
                                            {product.inventoryQuantity !== null && product.inventoryQuantity !== undefined && (
                                                <Badge variant="default">
                                                    Qty: {product.inventoryQuantity}
                                                </Badge>
                                            )}
                                        </div>

                                        {(product.providerImagePath ||
                                            product.provider) && (
                                                <div className="mb-2">
                                                    <ProviderLogo
                                                        providerName={product.provider}
                                                        logoPath={
                                                            product.providerImagePath || null
                                                        }
                                                        productId={product.id}
                                                        size="sm"
                                                        showName
                                                    />
                                                </div>
                                            )}
                                        {product.category && (
                                            <Badge variant="outline" className="mr-2 mb-2">
                                                {product.category}
                                            </Badge>
                                        )}

                                        {product.description && (
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}

                                        {/* PDF Viewers */}
                                        {(product.dataSheetPath || product.catalogPath) && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {product.dataSheetPath && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openPdfViewer(productApi.getDataSheetUrl(product.id))}
                                                        className="text-xs"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                        View Data Sheet
                                                    </Button>
                                                )}
                                                {product.catalogPath && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openPdfViewer(productApi.getCatalogUrl(product.id))}
                                                        className="text-xs"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                        View Catalog
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            {isInventoryManager && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingInventory({
                                                        productId: product.id,
                                                        quantity: product.inventoryQuantity || 0
                                                    })}
                                                >
                                                    Edit Inventory
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditDialog(product)}
                                            >
                                                {t('edit')}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                {t('delete')}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct ? t('editProduct') : t('addNewProduct')}
                        </DialogTitle>
                        <DialogDescription>
                            {editingProduct
                                ? t('updateProductInformation')
                                : t('addNewProductToCatalog')}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>
                                    {t('name')} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <Label>{t('model')}</Label>
                                <Input
                                    value={formData.model}
                                    onChange={(e) =>
                                        setFormData({ ...formData, model: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <Label>{t('provider')}</Label>
                                <Input
                                    value={formData.provider}
                                    onChange={(e) =>
                                        setFormData({ ...formData, provider: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <Label>{t('category')}</Label>
                                <Select
                                    value={formData.category || ''}
                                    onValueChange={(v) =>
                                        setFormData({ ...formData, category: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('selectCategory')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>{t('country')}</Label>
                                <Input
                                    value={formData.country}
                                    onChange={(e) =>
                                        setFormData({ ...formData, country: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <Label>{t('year')}</Label>
                                <Input
                                    type="number"
                                    value={formData.year || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            year: parseInt(e.target.value) || undefined,
                                        })
                                    }
                                />
                            </div>

                            <div className="col-span-2">
                                <Label>{t('description')}</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    rows={4}
                                />
                            </div>

                            <div className="col-span-2">
                                <Label>{t('productImage')}</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={imagePreview}
                                            alt={t('preview')}
                                            className="w-32 h-32 object-cover rounded"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="col-span-2">
                                <Label>{t('providerLogo') || 'Provider Logo'}</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProviderImageSelect}
                                />
                                <div className="mt-2">
                                    {providerImagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={providerImagePreview}
                                                alt={t('preview') || 'Provider logo preview'}
                                                className="w-32 h-32 object-contain rounded bg-white p-1 border"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    const currentSrc = target.src;

                                                    // Try alternative URL formats
                                                    if (editingProduct?.providerImagePath) {
                                                        const path = editingProduct.providerImagePath;

                                                        // First retry: Try with leading slash if it doesn't have one
                                                        if (!path.startsWith('/') && !path.startsWith('http') && !currentSrc.includes(`/${path}`)) {
                                                            const alternativeUrl = productApi.getProviderImageUrl(`/${path}`);
                                                            target.src = alternativeUrl;
                                                            return;
                                                        }

                                                        // Second retry: Try direct static file URL
                                                        if (!path.startsWith('http') && !currentSrc.includes(path.replace(/^\/+/, ''))) {
                                                            const baseUrl = getApiBaseUrl();
                                                            const cleanPath = path.startsWith('/') ? path : `/${path}`;
                                                            const staticBaseUrl = baseUrl.replace(/\/api\/?$/, '');
                                                            const apiUrl = `${staticBaseUrl}${cleanPath}`;
                                                            target.src = apiUrl;
                                                            return;
                                                        }

                                                        // Third retry: Use API endpoint if we have product ID
                                                        if (editingProduct.id && !currentSrc.includes('/api/Product/')) {
                                                            const baseUrl = getApiBaseUrl();
                                                            const apiUrl = `${baseUrl}/api/Product/${editingProduct.id}/provider-image-file`;
                                                            target.src = apiUrl;
                                                            return;
                                                        }
                                                    }

                                                    // If all retries failed, show placeholder
                                                    console.error('Failed to load provider logo preview after retries');
                                                    target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {t('preview') || 'Preview'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-span-2">
                                <Label>Data Sheet PDF</Label>
                                <Input
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    onChange={handleDataSheetSelect}
                                />
                                {editingProduct?.dataSheetPath && (
                                    <div className="mt-2">
                                        <a
                                            href={productApi.getDataSheetUrl(editingProduct.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            View current data sheet
                                        </a>
                                    </div>
                                )}
                                {dataSheetFile && (
                                    <div className="mt-2 text-sm text-green-600">
                                        {dataSheetFile.name} ({(dataSheetFile.size / 1024).toFixed(2)} KB)
                                    </div>
                                )}
                            </div>

                            <div className="col-span-2">
                                <Label>Catalog PDF</Label>
                                <Input
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    onChange={handleCatalogSelect}
                                />
                                {editingProduct?.catalogPath && (
                                    <div className="mt-2">
                                        <a
                                            href={productApi.getCatalogUrl(editingProduct.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            View current catalog
                                        </a>
                                    </div>
                                )}
                                {catalogFile && (
                                    <div className="mt-2 text-sm text-green-600">
                                        {catalogFile.name} ({(catalogFile.size / 1024).toFixed(2)} KB)
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit">
                                {editingProduct ? t('update') : t('create')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* PDF Viewer Modal */}
            <Dialog open={pdfViewerOpen} onOpenChange={setPdfViewerOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Document Viewer</DialogTitle>
                        <div className="flex gap-2 mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => currentPdfUrl && window.open(currentPdfUrl, '_blank')}
                            >
                                Open in New Tab
                            </Button>
                        </div>
                    </DialogHeader>
                    {currentPdfUrl && (
                        <div className="w-full h-[70vh] relative">
                            <iframe
                                src={`${currentPdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                                className="w-full h-full border rounded"
                                title="PDF Viewer"
                                style={{ border: '1px solid #e5e7eb' }}
                                onError={(e) => {
                                    console.error('PDF iframe load error:', e);
                                }}
                            />
                            <div className="absolute top-2 right-2 bg-white/90 p-2 rounded shadow text-xs text-gray-600">
                                If PDF doesn't load, click "Open in New Tab"
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Inventory Edit Dialog */}
            <Dialog open={editingInventory !== null} onOpenChange={(open) => !open && setEditingInventory(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Inventory Quantity</DialogTitle>
                    </DialogHeader>
                    {editingInventory && (
                        <div className="space-y-4">
                            <div>
                                <Label>Inventory Quantity</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={editingInventory.quantity}
                                    onChange={(e) => setEditingInventory({
                                        ...editingInventory,
                                        quantity: parseInt(e.target.value) || 0
                                    })}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingInventory(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleUpdateInventory(editingInventory.productId, editingInventory.quantity)}
                                >
                                    Update
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

