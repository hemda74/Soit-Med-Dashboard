import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Target, Plus, Pencil, Trash2, Users, User, DollarSign, Activity } from 'lucide-react'
import { salesApi } from '@/services/sales/salesApi'
import { useAuthStore } from '@/stores/authStore'
import type { SalesmanTargetDTO, CreateSalesmanTargetDTO, TargetType } from '@/types/sales.types'
import { TargetType as TargetTypeEnum } from '@/types/sales.types'
import type { EmployeeInfo } from '@/types/weeklyPlan.types'
import toast from 'react-hot-toast'
import { usePerformance } from '@/hooks/usePerformance'
import { useTranslation } from '@/hooks/useTranslation'

export default function SalesTargetsPage() {
    usePerformance('SalesTargetsPage');
    const { t } = useTranslation();
    const { user } = useAuthStore()
    const [targets, setTargets] = useState<SalesmanTargetDTO[]>([])
    const [salesmen, setSalesmen] = useState<EmployeeInfo[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingSalesmen, setLoadingSalesmen] = useState(false)
    const [showDialog, setShowDialog] = useState(false)
    const [editingTarget, setEditingTarget] = useState<SalesmanTargetDTO | null>(null)
    const [targetCategory, setTargetCategory] = useState<'money' | 'activity'>('activity')
    const [targetScope, setTargetScope] = useState<'individual' | 'team'>('individual')
    const [periodType, setPeriodType] = useState<'quarterly' | 'yearly'>('quarterly')
    const [selectedSalesman, setSelectedSalesman] = useState<string>('')
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
    const [selectedQuarter, setSelectedQuarter] = useState<number>(1)

    const [formData, setFormData] = useState({
        targetVisits: '',
        targetSuccessfulVisits: '',
        targetOffers: '',
        targetDeals: '',
        targetOfferAcceptanceRate: '',
        targetRevenue: '',
        notes: '',
    })

    const isManager = user?.roles.includes('SalesManager') || user?.roles.includes('SuperAdmin')
    const isSalesman = user?.roles.includes('Salesman')

    useEffect(() => {
        fetchSalesmen()
    }, [])

    useEffect(() => {
        if (salesmen.length > 0) {
            fetchTargets()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYear, salesmen.length])

    const fetchTargets = async () => {
        try {
            setLoading(true)
            const allTargets: SalesmanTargetDTO[] = []

            for (const salesman of salesmen) {
                try {
                    const response = await salesApi.getSalesmanTargets(salesman.id, selectedYear)
                    if (response.success && response.data) {
                        allTargets.push(...response.data)
                    }
                } catch (error) {
                    console.error(`Failed to fetch targets for ${salesman.id}:`, error)
                }
            }

            // Fetch quarterly team targets
            for (let q = 1; q <= 4; q++) {
                try {
                    const response = await salesApi.getTeamTarget(selectedYear, q)
                    if (response.success && response.data) {
                        allTargets.push(response.data)
                    }
                } catch (error) {
                    // Team target might not exist for this quarter
                }
            }

            // Fetch yearly team target (without quarter)
            try {
                const response = await salesApi.getTeamTarget(selectedYear)
                if (response.success && response.data) {
                    allTargets.push(response.data)
                }
            } catch (error) {
                // Yearly team target might not exist
            }

            // Deduplicate targets by id to avoid duplicate keys
            const uniqueTargetsMap = new Map<number, SalesmanTargetDTO>()
            allTargets.forEach(target => {
                if (!uniqueTargetsMap.has(target.id)) {
                    uniqueTargetsMap.set(target.id, target)
                }
            })

            setTargets(Array.from(uniqueTargetsMap.values()))
        } catch (error) {
            console.error('Failed to fetch targets:', error)
            toast.error(t('failedToLoadTargets'))
        } finally {
            setLoading(false)
        }
    }

    const fetchSalesmen = async () => {
        try {
            setLoadingSalesmen(true)
            const response = await salesApi.getOfferSalesmen()
            if (response.success && response.data) {
                // Transform the salesmen data to match EmployeeInfo format
                const transformedSalesmen = response.data
                    .filter((salesman: any) => salesman.isActive !== false) // Only show active salesmen
                    .map((salesman: any) => ({
                        id: salesman.id,
                        name: `${salesman.firstName || ''} ${salesman.lastName || ''}`.trim() || salesman.userName || salesman.email,
                        firstName: salesman.firstName,
                        lastName: salesman.lastName,
                        email: salesman.email,
                        phoneNumber: salesman.phoneNumber,
                        userName: salesman.userName,
                        isActive: salesman.isActive
                    }))
                setSalesmen(transformedSalesmen)
                if (transformedSalesmen.length === 0) {
                    toast.error(t('noActiveSalesmenFound'))
                }
            } else {
                console.error('Failed to fetch salesmen: No data returned')
                toast.error(t('failedToLoadSalesmenList'))
            }
        } catch (error: any) {
            console.error('Failed to fetch salesmen:', error)
            toast.error(error.message || t('failedToLoadSalesmenList'))
        } finally {
            setLoadingSalesmen(false)
        }
    }

    const handleCreateTarget = (category: 'money' | 'activity') => {
        setEditingTarget(null)
        setTargetCategory(category)
        setTargetScope('individual')
        setPeriodType('quarterly')
        // For activity targets set by salesman, auto-select themselves
        if (category === 'activity' && isSalesman) {
            setSelectedSalesman(user?.id || '')
        } else {
            setSelectedSalesman('')
        }
        setSelectedQuarter(1)
        setFormData({
            targetVisits: '',
            targetSuccessfulVisits: '',
            targetOffers: '',
            targetDeals: '',
            targetOfferAcceptanceRate: '',
            targetRevenue: '',
            notes: '',
        })
        setShowDialog(true)
    }

    const handleEditTarget = (target: SalesmanTargetDTO) => {
        setEditingTarget(target)
        setTargetCategory(target.targetType === TargetTypeEnum.Money ? 'money' : 'activity')
        setTargetScope(target.isTeamTarget ? 'team' : 'individual')
        setPeriodType(target.quarter ? 'quarterly' : 'yearly')
        setSelectedSalesman(target.salesmanId || '')
        setSelectedQuarter(target.quarter || 1)
        setFormData({
            targetVisits: target.targetVisits.toString(),
            targetSuccessfulVisits: target.targetSuccessfulVisits.toString(),
            targetOffers: target.targetOffers.toString(),
            targetDeals: target.targetDeals.toString(),
            targetOfferAcceptanceRate: target.targetOfferAcceptanceRate?.toString() || '',
            targetRevenue: target.targetRevenue?.toString() || '',
            notes: target.notes || '',
        })
        setShowDialog(true)
    }

    const handleSubmit = async () => {
        // Validate required fields for money targets
        if (targetCategory === 'money') {
            if (!isManager) {
                toast.error(t('onlyManagersCanSetMoneyTargets'))
                return
            }
            if (!formData.targetRevenue || parseFloat(formData.targetRevenue) <= 0) {
                toast.error(t('pleaseEnterValidTargetRevenue'))
                return
            }
            // For individual money targets, salesman must be selected
            if (targetScope === 'individual' && !selectedSalesman) {
                toast.error(t('pleaseSelectSalesmanForIndividualTarget'))
                return
            }
        }

        // Validate required fields for activity targets
        if (targetCategory === 'activity') {
            if (!isSalesman) {
                toast.error(t('onlySalesmenCanSetActivityTargets'))
                return
            }
            if (!formData.targetVisits || !formData.targetSuccessfulVisits || !formData.targetOffers || !formData.targetDeals) {
                toast.error(t('pleaseFillAllRequiredActivityFields'))
                return
            }
            // For activity targets set by salesman, ensure they're setting for themselves
            if (isSalesman && !editingTarget && targetScope === 'individual') {
                if (selectedSalesman !== user?.id) {
                    toast.error(t('youCanOnlySetActivityTargetsForYourself'))
                    return
                }
            }
        }

        const targetData: CreateSalesmanTargetDTO = {
            salesmanId: targetScope === 'individual' ? selectedSalesman : undefined,
            year: selectedYear,
            quarter: periodType === 'quarterly' ? selectedQuarter : undefined,
            targetType: targetCategory === 'money' ? TargetTypeEnum.Money : TargetTypeEnum.Activity,
            targetVisits: parseInt(formData.targetVisits) || 0,
            targetSuccessfulVisits: parseInt(formData.targetSuccessfulVisits) || 0,
            targetOffers: parseInt(formData.targetOffers) || 0,
            targetDeals: parseInt(formData.targetDeals) || 0,
            targetOfferAcceptanceRate: formData.targetOfferAcceptanceRate ? parseFloat(formData.targetOfferAcceptanceRate) : undefined,
            targetRevenue: targetCategory === 'money' && formData.targetRevenue ? parseFloat(formData.targetRevenue) : undefined,
            isTeamTarget: targetScope === 'team',
            notes: formData.notes || undefined,
        }

        try {
            setLoading(true)
            if (editingTarget) {
                await salesApi.updateSalesmanTarget(editingTarget.id, targetData)
                toast.success(t('targetUpdatedSuccessfully'))
            } else {
                await salesApi.createSalesmanTarget(targetData)
                toast.success(t('targetCreatedSuccessfully'))
            }
            setShowDialog(false)
            fetchTargets()
        } catch (error: any) {
            console.error('Failed to save target:', error)
            toast.error(error.message || t('failedToSaveTarget'))
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteTarget = async (target: SalesmanTargetDTO) => {
        if (!window.confirm(t('areYouSureDeleteTarget'))) {
            return
        }

        try {
            setLoading(true)
            await salesApi.deleteSalesmanTarget(target.id)
            toast.success(t('targetDeletedSuccessfully'))
            fetchTargets()
        } catch (error: any) {
            console.error('Failed to delete target:', error)
            toast.error(error.message || t('failedToDeleteTarget'))
        } finally {
            setLoading(false)
        }
    }

    const moneyTargets = targets.filter(t => t.targetType === TargetTypeEnum.Money)
    const activityTargets = targets.filter(t => t.targetType === TargetTypeEnum.Activity)
    const individualTargets = targets.filter(t => !t.isTeamTarget)
    const teamTargets = targets.filter(t => t.isTeamTarget)
    const quarterlyTargets = targets.filter(t => t.quarter)
    const yearlyTargets = targets.filter(t => !t.quarter)

    // Calculate statistics
    const totalRevenueTarget = moneyTargets.reduce((sum, t) => sum + (t.targetRevenue || 0), 0)
    const totalVisitsTarget = activityTargets.reduce((sum, t) => sum + t.targetVisits, 0)
    const totalOffersTarget = activityTargets.reduce((sum, t) => sum + t.targetOffers, 0)
    const totalDealsTarget = activityTargets.reduce((sum, t) => sum + t.targetDeals, 0)

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90 mb-2 flex items-center gap-2">
                        <Target className="h-8 w-8 text-primary" />
                        Sales Targets
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Money targets are set by managers. Activity targets (visits/offers/deals) are set by salesmen themselves.
                    </p>
                </div>
                <div className="flex gap-2">
                    {isManager && (
                        <Button onClick={() => handleCreateTarget('money')} className="flex items-center gap-2" variant="default">
                            <DollarSign className="h-4 w-4" />
                            {t('createMoneyTarget')}
                        </Button>
                    )}
                    {isSalesman && (
                        <Button onClick={() => handleCreateTarget('activity')} className="flex items-center gap-2" variant="outline">
                            <Activity className="h-4 w-4" />
                            {t('setMyActivityTarget')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
                    <CardContent className="p-5 md:p-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30 mb-5">
                            <Target className="text-blue-600 h-6 w-6 dark:text-blue-400" />
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{t('totalTargets')}</span>
                                <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                                    {targets.length}
                                </h4>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
                    <CardContent className="p-5 md:p-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl dark:bg-yellow-900/30 mb-5">
                            <DollarSign className="text-yellow-600 h-6 w-6 dark:text-yellow-400" />
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{t('revenueTarget')}</span>
                                <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                                    ${totalRevenueTarget.toLocaleString()}
                                </h4>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
                    <CardContent className="p-5 md:p-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/30 mb-5">
                            <Activity className="text-purple-600 h-6 w-6 dark:text-purple-400" />
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{t('activityTargets')}</span>
                                <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                                    {activityTargets.length}
                                </h4>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
                    <CardContent className="p-5 md:p-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30 mb-5">
                            <Users className="text-green-600 h-6 w-6 dark:text-green-400" />
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{t('teamTargets')}</span>
                                <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                                    {teamTargets.length}
                                </h4>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Section */}
            <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">{t('filters')}</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('filterTargetsByYearAndCategory')}</p>
                        </div>
                        <Select
                            value={selectedYear.toString()}
                            onValueChange={(value) => setSelectedYear(parseInt(value))}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[2024, 2025, 2026].map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
            </Card>

            {/* Targets Section */}
            <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">{t('targetsOverview')}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('viewAndManageAllSalesTargets')}</p>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-6">
                            <TabsTrigger value="all" className="text-xs sm:text-sm">{t('all')} ({targets.length})</TabsTrigger>
                            <TabsTrigger value="money" className="text-xs sm:text-sm">{t('money')} ({moneyTargets.length})</TabsTrigger>
                            <TabsTrigger value="activity" className="text-xs sm:text-sm">{t('activityTargets')} ({activityTargets.length})</TabsTrigger>
                            <TabsTrigger value="individual" className="text-xs sm:text-sm">{t('individual')} ({individualTargets.length})</TabsTrigger>
                            <TabsTrigger value="team" className="text-xs sm:text-sm">{t('team')} ({teamTargets.length})</TabsTrigger>
                            <TabsTrigger value="quarterly" className="text-xs sm:text-sm">{t('quarterly')} ({quarterlyTargets.length})</TabsTrigger>
                            <TabsTrigger value="yearly" className="text-xs sm:text-sm">{t('yearly')} ({yearlyTargets.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-4 mt-0">
                            {loading ? (
                                <div className="py-12 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">{t('loadingTargets')}</p>
                                </div>
                            ) : targets.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {targets.map((target) => (
                                        <TargetCard
                                            key={target.id}
                                            target={target}
                                            onEdit={handleEditTarget}
                                            onDelete={handleDeleteTarget}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Target className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">{t('noTargetsFoundForYear')} {selectedYear}</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="money" className="space-y-4 mt-0">
                            {loading ? (
                                <div className="py-12 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">{t('loadingTargets')}</p>
                                </div>
                            ) : moneyTargets.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {moneyTargets.map((target) => (
                                        <TargetCard key={target.id} target={target} onEdit={handleEditTarget} onDelete={handleDeleteTarget} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <DollarSign className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">{t('noMoneyTargetsFound')}</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="activity" className="space-y-4 mt-0">
                            {loading ? (
                                <div className="py-12 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">{t('loadingTargets')}</p>
                                </div>
                            ) : activityTargets.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {activityTargets.map((target) => (
                                        <TargetCard key={target.id} target={target} onEdit={handleEditTarget} onDelete={handleDeleteTarget} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Activity className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">{t('noActivityTargetsFound')}</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="individual" className="space-y-4 mt-0">
                            {loading ? (
                                <div className="py-12 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">{t('loadingTargets')}</p>
                                </div>
                            ) : individualTargets.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {individualTargets.map((target) => (
                                        <TargetCard key={target.id} target={target} onEdit={handleEditTarget} onDelete={handleDeleteTarget} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <User className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">{t('noIndividualTargetsFound')}</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="team" className="space-y-4 mt-0">
                            {loading ? (
                                <div className="py-12 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">{t('loadingTargets')}</p>
                                </div>
                            ) : teamTargets.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {teamTargets.map((target) => (
                                        <TargetCard key={target.id} target={target} onEdit={handleEditTarget} onDelete={handleDeleteTarget} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">{t('noTeamTargetsFound')}</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="quarterly" className="space-y-4 mt-0">
                            {loading ? (
                                <div className="py-12 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">{t('loadingTargets')}</p>
                                </div>
                            ) : quarterlyTargets.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {quarterlyTargets.map((target) => (
                                        <TargetCard key={target.id} target={target} onEdit={handleEditTarget} onDelete={handleDeleteTarget} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Target className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">{t('noQuarterlyTargetsFound')}</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="yearly" className="space-y-4 mt-0">
                            {loading ? (
                                <div className="py-12 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">{t('loadingTargets')}</p>
                                </div>
                            ) : yearlyTargets.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {yearlyTargets.map((target) => (
                                        <TargetCard key={target.id} target={target} onEdit={handleEditTarget} onDelete={handleDeleteTarget} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Target className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">{t('noYearlyTargetsFound')}</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingTarget ? 'Edit Target' : 'Create New Target'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {targetCategory === 'money' && isManager && !editingTarget && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-blue-900 dark:text-blue-100">{t('creatingMoneyTarget')}</p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                            As a manager, you can set money targets for individual salesmen or for the entire team. 
                                            {t('selectIndividualToSetTarget')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>{t('targetCategory')}</Label>
                                <Select value={targetCategory} onValueChange={(value: 'money' | 'activity') => setTargetCategory(value)} disabled={!!editingTarget}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="money"><div className="flex items-center gap-2"><DollarSign className="h-4 w-4" />{t('revenueTarget')}</div></SelectItem>
                                        <SelectItem value="activity"><div className="flex items-center gap-2"><Activity className="h-4 w-4" />{t('activityTargets')}</div></SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{t('targetScope')}</Label>
                                <Select value={targetScope} onValueChange={(value: 'individual' | 'team') => setTargetScope(value)} disabled={!!editingTarget || (targetCategory === 'activity' && isSalesman)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual"><div className="flex items-center gap-2"><User className="h-4 w-4" />{t('individual')}</div></SelectItem>
                                        <SelectItem value="team"><div className="flex items-center gap-2"><Users className="h-4 w-4" />{t('team')}</div></SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>{t('period')}</Label>
                                <Select value={periodType} onValueChange={(value: 'quarterly' | 'yearly') => setPeriodType(value)} disabled={!!editingTarget}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="quarterly">{t('quarterly')}</SelectItem>
                                        <SelectItem value="yearly">{t('yearly')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{t('year')}</Label>
                                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))} disabled={!!editingTarget}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[2024, 2025, 2026].map((year) => (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {targetScope === 'individual' && (
                            <div>
                                <Label>{t('salesman')} {targetCategory === 'money' && '*'}</Label>
                                <Select 
                                    value={selectedSalesman} 
                                    onValueChange={setSelectedSalesman} 
                                    disabled={!!editingTarget || (targetCategory === 'activity' && isSalesman) || loadingSalesmen}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingSalesmen ? t('loadingSalesmen') : t('selectSalesman')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {salesmen.length > 0 ? (
                                            salesmen.map((salesman) => (
                                                <SelectItem key={salesman.id} value={salesman.id}>
                                                    {salesman.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-salesmen" disabled>
                                                {loadingSalesmen ? t('loading') : t('noSalesmenAvailable')}
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {targetCategory === 'money' && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {salesmen.length === 0 
                                            ? t('noSalesmenAvailableMessage')
                                            : t('selectSalesmanForIndividualTarget')
                                        }
                                    </p>
                                )}
                                {targetCategory === 'activity' && isSalesman && !editingTarget && (
                                    <p className="text-sm text-muted-foreground mt-1">{t('youCanOnlySetActivityTargetsForYourself')}</p>
                                )}
                            </div>
                        )}

                        {periodType === 'quarterly' && (
                            <div>
                                <Label>{t('quarter')}</Label>
                                <Select value={selectedQuarter.toString()} onValueChange={(value) => setSelectedQuarter(parseInt(value))} disabled={!!editingTarget}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4].map((q) => (
                                            <SelectItem key={q} value={q.toString()}>Q{q}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {targetCategory === 'money' ? (
                            <div>
                                <Label>{t('targetRevenueMoney')} *</Label>
                                <Input 
                                    type="number" 
                                    value={formData.targetRevenue} 
                                    onChange={(e) => setFormData({ ...formData, targetRevenue: e.target.value })} 
                                    placeholder="100000" 
                                    step="0.01"
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>{t('targetVisits')} *</Label><Input type="number" value={formData.targetVisits} onChange={(e) => setFormData({ ...formData, targetVisits: e.target.value })} placeholder="50" /></div>
                                <div><Label>{t('targetSuccessfulVisits')} *</Label><Input type="number" value={formData.targetSuccessfulVisits} onChange={(e) => setFormData({ ...formData, targetSuccessfulVisits: e.target.value })} placeholder="35" /></div>
                                <div><Label>{t('targetOffers')} *</Label><Input type="number" value={formData.targetOffers} onChange={(e) => setFormData({ ...formData, targetOffers: e.target.value })} placeholder="30" /></div>
                                <div><Label>{t('targetDeals')} *</Label><Input type="number" value={formData.targetDeals} onChange={(e) => setFormData({ ...formData, targetDeals: e.target.value })} placeholder="15" /></div>
                                <div className="col-span-2"><Label>{t('targetOfferAcceptanceRate')}</Label><Input type="number" value={formData.targetOfferAcceptanceRate} onChange={(e) => setFormData({ ...formData, targetOfferAcceptanceRate: e.target.value })} placeholder="60" min="0" max="100" /></div>
                            </div>
                        )}

                        <div><Label>{t('notes')}</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder={t('additionalNotesAboutTarget')} rows={3} /></div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)} disabled={loading}>{t('common.cancel')}</Button>
                        <Button onClick={handleSubmit} disabled={loading}>{loading ? t('saving') : editingTarget ? t('update') : t('create')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function TargetCard({ target, onEdit, onDelete }: { target: SalesmanTargetDTO; onEdit: (target: SalesmanTargetDTO) => void; onDelete: (target: SalesmanTargetDTO) => void }) {
    const { t } = useTranslation();
    const isMoneyTarget = target.targetType === TargetTypeEnum.Money
    const creatorName = target.createdByManagerName || target.createdBySalesmanName || 'Unknown'
    
    return (
        <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all duration-200 overflow-hidden">
            <CardContent className="p-5 md:p-6">
                {/* Header with badges */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                        {isMoneyTarget ? (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-0">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Money
                            </Badge>
                        ) : (
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-0">
                                <Activity className="h-3 w-3 mr-1" />
                                Activity
                            </Badge>
                        )}
                        {target.isTeamTarget ? (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-0">
                                <Users className="h-3 w-3 mr-1" />
                                Team
                            </Badge>
                        ) : (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-0">
                                <User className="h-3 w-3 mr-1" />
                                {t('individual')}
                            </Badge>
                        )}
                        {target.quarter ? (
                            <Badge variant="outline" className="text-xs">
                                Q{target.quarter} {target.year}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-xs">
                                {target.year} {t('yearly')}
                            </Badge>
                        )}
                    </div>
                    <div className="flex gap-1">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onEdit(target)}
                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onDelete(target)}
                            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg text-gray-800 dark:text-white/90 mb-4">
                    {target.isTeamTarget ? t('teamTarget') : target.salesmanName || t('unknownSalesman')}
                </h3>
                
                {/* Content based on target type */}
                {isMoneyTarget ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-xl dark:bg-yellow-900/30 mx-auto mb-3">
                            <DollarSign className="text-yellow-600 h-8 w-8 dark:text-yellow-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('revenueTarget')}</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                ${target.targetRevenue?.toLocaleString() || '0'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('targetVisits')}</p>
                                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">{target.targetVisits}</p>
                            </div>
                            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('targetSuccessfulVisits')}</p>
                                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">{target.targetSuccessfulVisits}</p>
                            </div>
                            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('targetOffers')}</p>
                                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">{target.targetOffers}</p>
                            </div>
                            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('targetDeals')}</p>
                                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">{target.targetDeals}</p>
                            </div>
                        </div>
                        {target.targetOfferAcceptanceRate && (
                            <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-3 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('targetOfferAcceptanceRate')}</p>
                                <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                                    {target.targetOfferAcceptanceRate}%
                                </p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Notes */}
                {target.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('notes')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{target.notes}</p>
                    </div>
                )}
                
                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Created by <span className="font-medium">{creatorName}</span> on {new Date(target.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
