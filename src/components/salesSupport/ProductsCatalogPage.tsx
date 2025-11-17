// Products Catalog Management Page - Full CRUD for SalesSupport

import { useEffect, useState, useMemo } from 'react'
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
    DialogTrigger,
} from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import { usePerformance } from '@/hooks/usePerformance'
import { useTranslation } from '@/hooks/useTranslation'

const CATEGORIES = ['X-Ray', 'Ultrasound', 'CT Scanner', 'MRI', 'Other']

export default function ProductsCatalogPage() {
    usePerformance('ProductsCatalogPage');
    const { t } = useTranslation();
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [inStockFilter, setInStockFilter] = useState<boolean | null>(null)

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
        basePrice: 0,
        description: '',
        year: undefined,
        inStock: true,
    })
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Load products
    useEffect(() => {
        loadProducts()
    }, [selectedCategory, inStockFilter])

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
            const params: { category?: string; inStock?: boolean } = {}
            if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory
            if (inStockFilter !== null) params.inStock = inStockFilter

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
            basePrice: 0,
            description: '',
            year: undefined,
            inStock: true,
        })
        setSelectedImage(null)
        setImagePreview(null)
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
            basePrice: product.basePrice,
            description: product.description || '',
            year: product.year,
            inStock: product.inStock,
        })
        setSelectedImage(null)
        setImagePreview(product.imagePath ? productApi.getImageUrl(product.imagePath) : null)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || formData.basePrice <= 0) {
            toast.error(t('nameAndPriceAreRequired'))
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

                toast.success(t('productUpdatedSuccessfully'))
            } else {
                // Create
                const response = await productApi.createProduct(formData)
                const newProduct = response.data

                // Upload image if selected
                if (selectedImage && newProduct) {
                    await productApi.uploadProductImage(newProduct.id, selectedImage)
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
        }).format(price)
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
                        <div>
                            <Label>{t('stockStatus')}</Label>
                            <Select
                                value={inStockFilter === null ? 'all' : inStockFilter.toString()}
                                onValueChange={(v) =>
                                    setInStockFilter(v === 'all' ? null : v === 'true')
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('all')}</SelectItem>
                                    <SelectItem value="true">{t('inStock')}</SelectItem>
                                    <SelectItem value="false">{t('outOfStock')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('')
                                    setSelectedCategory('all')
                                    setInStockFilter(null)
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
                                            <Badge
                                                variant={product.inStock ? 'default' : 'secondary'}
                                            >
                                                {product.inStock ? t('inStock') : t('outOfStock')}
                                            </Badge>
                                        </div>

                                        {product.provider && (
                                            <p className="text-sm text-muted-foreground mb-1">
                                                {t('provider')}: {product.provider}
                                            </p>
                                        )}
                                        {product.category && (
                                            <Badge variant="outline" className="mr-2 mb-2">
                                                {product.category}
                                            </Badge>
                                        )}
                                        <p className="text-lg font-bold text-primary mb-3">
                                            {formatPrice(product.basePrice)}
                                        </p>

                                        {product.description && (
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}

                                        <div className="flex gap-2">
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
                                <Label>
                                    {t('basePrice')} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.basePrice || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            basePrice: parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    required
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

                            <div className="col-span-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="inStock"
                                    checked={formData.inStock}
                                    onChange={(e) =>
                                        setFormData({ ...formData, inStock: e.target.checked })
                                    }
                                    className="w-4 h-4"
                                />
                                <Label htmlFor="inStock" className="cursor-pointer">
                                    {t('inStock')}
                                </Label>
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
        </div>
    )
}

