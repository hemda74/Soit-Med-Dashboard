// Product Categories Management Page - CRUD for Product Categories

import { useEffect, useState } from 'react'
import { productCategoryApi } from '@/services/sales/productCategoryApi'
import type { ProductCategory, CreateProductCategoryDto, UpdateProductCategoryDto } from '@/types/sales.types'
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
import { useAuthStore } from '@/stores/authStore'

export default function ProductCategoriesPage() {
    usePerformance('ProductCategoriesPage');
    const { hasAnyRole } = useAuthStore();
    const isAdmin = hasAnyRole(['SalesManager', 'SuperAdmin']);
    
    const [categories, setCategories] = useState<ProductCategory[]>([])
    const [filteredCategories, setFilteredCategories] = useState<ProductCategory[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'main' | 'sub'>('all')

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)

    // Form state
    const [formData, setFormData] = useState<CreateProductCategoryDto>({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        parentCategoryId: undefined,
        displayOrder: 0,
        isActive: true,
    })

    // Load categories
    useEffect(() => {
        loadCategories()
    }, [])

    // Filter categories client-side
    useEffect(() => {
        let filtered = [...categories]

        // Filter by type
        if (filterType === 'main') {
            filtered = filtered.filter(c => !c.parentCategoryId)
        } else if (filterType === 'sub') {
            filtered = filtered.filter(c => c.parentCategoryId)
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(
                c =>
                    c.name.toLowerCase().includes(term) ||
                    c.nameAr?.toLowerCase().includes(term) ||
                    c.description?.toLowerCase().includes(term)
            )
        }

        setFilteredCategories(filtered)
    }, [categories, searchTerm, filterType])

    const loadCategories = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await productCategoryApi.getAllCategories()
            if (response.success && response.data) {
                setCategories(response.data)
            } else {
                setError(response.message || 'Failed to load categories')
                toast.error(response.message || 'Failed to load categories')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingCategory(null)
        setFormData({
            name: '',
            nameAr: '',
            description: '',
            descriptionAr: '',
            parentCategoryId: undefined,
            displayOrder: 0,
            isActive: true,
        })
        setDialogOpen(true)
    }

    const handleEdit = (category: ProductCategory) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            nameAr: category.nameAr || '',
            description: category.description || '',
            descriptionAr: category.descriptionAr || '',
            parentCategoryId: category.parentCategoryId,
            displayOrder: category.displayOrder,
            isActive: category.isActive,
        })
        setDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (editingCategory) {
                // Update existing category
                const updateData: UpdateProductCategoryDto = {
                    name: formData.name,
                    nameAr: formData.nameAr || undefined,
                    description: formData.description || undefined,
                    descriptionAr: formData.descriptionAr || undefined,
                    parentCategoryId: formData.parentCategoryId,
                    displayOrder: formData.displayOrder,
                    isActive: formData.isActive,
                }
                const response = await productCategoryApi.updateCategory(editingCategory.id, updateData)
                if (response.success) {
                    toast.success('Category updated successfully')
                    setDialogOpen(false)
                    loadCategories()
                } else {
                    toast.error(response.message || 'Failed to update category')
                }
            } else {
                // Create new category
                const response = await productCategoryApi.createCategory(formData)
                if (response.success) {
                    toast.success('Category created successfully')
                    setDialogOpen(false)
                    loadCategories()
                } else {
                    toast.error(response.message || 'Failed to create category')
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (category: ProductCategory) => {
        if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
            return
        }

        setLoading(true)
        try {
            const response = await productCategoryApi.deleteCategory(category.id)
            if (response.success) {
                toast.success('Category deleted successfully')
                loadCategories()
            } else {
                toast.error(response.message || 'Failed to delete category')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const mainCategories = categories.filter(c => !c.parentCategoryId)

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Product Categories</CardTitle>
                    <CardDescription>
                        Manage product categories and subcategories
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters and Actions */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <Input
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="main">Main Categories</SelectItem>
                                <SelectItem value="sub">Subcategories</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleCreate}>
                            Create Category
                        </Button>
                        <Button variant="outline" onClick={loadCategories}>
                            Refresh
                        </Button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Categories Table */}
                    {loading ? (
                        <div className="text-center py-8">Loading categories...</div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No categories found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="text-left p-3 font-semibold">Name</th>
                                        <th className="text-left p-3 font-semibold">Arabic Name</th>
                                        <th className="text-left p-3 font-semibold">Parent</th>
                                        <th className="text-left p-3 font-semibold">Products</th>
                                        <th className="text-left p-3 font-semibold">Order</th>
                                        <th className="text-left p-3 font-semibold">Status</th>
                                        <th className="text-left p-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.map((category) => (
                                        <tr key={category.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="font-medium">{category.name}</div>
                                                {category.description && (
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {category.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 text-gray-600">{category.nameAr || '-'}</td>
                                            <td className="p-3">
                                                {category.parentCategoryName ? (
                                                    <Badge variant="outline">{category.parentCategoryName}</Badge>
                                                ) : (
                                                    <Badge>Main Category</Badge>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="secondary">{category.productCount}</Badge>
                                            </td>
                                            <td className="p-3">{category.displayOrder}</td>
                                            <td className="p-3">
                                                {category.isActive ? (
                                                    <Badge className="bg-green-500">Active</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Inactive</Badge>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(category)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    {isAdmin && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDelete(category)}
                                                            disabled={category.productCount > 0}
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Edit Category' : 'Create Category'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory
                                ? 'Update category information'
                                : 'Add a new product category'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name (English) *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="nameAr">Name (Arabic)</Label>
                            <Input
                                id="nameAr"
                                value={formData.nameAr}
                                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                                dir="rtl"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description (English)</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                            <Textarea
                                id="descriptionAr"
                                value={formData.descriptionAr}
                                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                                rows={3}
                                dir="rtl"
                            />
                        </div>
                        <div>
                            <Label htmlFor="parentCategory">Parent Category</Label>
                            <Select
                                value={formData.parentCategoryId?.toString() || 'none'}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        parentCategoryId: value === 'none' ? undefined : parseInt(value),
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select parent category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None (Main Category)</SelectItem>
                                    {mainCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="displayOrder">Display Order</Label>
                            <Input
                                id="displayOrder"
                                type="number"
                                value={formData.displayOrder}
                                onChange={(e) =>
                                    setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                                }
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

