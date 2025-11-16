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

export default function SalesTargetsPage() {
    usePerformance('SalesTargetsPage');
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
            toast.error('Failed to load targets')
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
                    toast.error('No active salesmen found')
                }
            } else {
                console.error('Failed to fetch salesmen: No data returned')
                toast.error('Failed to load salesmen list')
            }
        } catch (error: any) {
            console.error('Failed to fetch salesmen:', error)
            toast.error(error.message || 'Failed to load salesmen list')
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
                toast.error('Only managers can set money targets')
                return
            }
            if (!formData.targetRevenue || parseFloat(formData.targetRevenue) <= 0) {
                toast.error('Please enter a valid target revenue amount')
                return
            }
            // For individual money targets, salesman must be selected
            if (targetScope === 'individual' && !selectedSalesman) {
                toast.error('Please select a salesman for individual money target')
                return
            }
        }

        // Validate required fields for activity targets
        if (targetCategory === 'activity') {
            if (!isSalesman) {
                toast.error('Only salesmen can set activity targets')
                return
            }
            if (!formData.targetVisits || !formData.targetSuccessfulVisits || !formData.targetOffers || !formData.targetDeals) {
                toast.error('Please fill in all required activity target fields')
                return
            }
            // For activity targets set by salesman, ensure they're setting for themselves
            if (isSalesman && !editingTarget && targetScope === 'individual') {
                if (selectedSalesman !== user?.id) {
                    toast.error('You can only set activity targets for yourself')
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
                toast.success('Target updated successfully')
            } else {
                await salesApi.createSalesmanTarget(targetData)
                toast.success('Target created successfully')
            }
            setShowDialog(false)
            fetchTargets()
        } catch (error: any) {
            console.error('Failed to save target:', error)
            toast.error(error.message || 'Failed to save target')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteTarget = async (target: SalesmanTargetDTO) => {
        if (!window.confirm('Are you sure you want to delete this target?')) {
            return
        }

        try {
            setLoading(true)
            await salesApi.deleteSalesmanTarget(target.id)
            toast.success('Target deleted successfully')
            fetchTargets()
        } catch (error: any) {
            console.error('Failed to delete target:', error)
            toast.error(error.message || 'Failed to delete target')
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                        <Target className="h-8 w-8 text-primary" />
                        Sales Targets
                    </h1>
                    <p className="text-muted-foreground">
                        Money targets are set by managers. Activity targets (visits/offers/deals) are set by salesmen themselves.
                    </p>
                </div>
                <div className="flex gap-2">
                    {isManager && (
                        <Button onClick={() => handleCreateTarget('money')} className="flex items-center gap-2" variant="default">
                            <DollarSign className="h-4 w-4" />
                            Create Money Target
                        </Button>
                    )}
                    {isSalesman && (
                        <Button onClick={() => handleCreateTarget('activity')} className="flex items-center gap-2" variant="outline">
                            <Activity className="h-4 w-4" />
                            Set My Activity Target
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filter by Year</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All Targets ({targets.length})</TabsTrigger>
                    <TabsTrigger value="money">Money Targets ({moneyTargets.length})</TabsTrigger>
                    <TabsTrigger value="activity">Activity Targets ({activityTargets.length})</TabsTrigger>
                    <TabsTrigger value="individual">Individual ({individualTargets.length})</TabsTrigger>
                    <TabsTrigger value="team">Team ({teamTargets.length})</TabsTrigger>
                    <TabsTrigger value="quarterly">Quarterly ({quarterlyTargets.length})</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly ({yearlyTargets.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    {targets.length > 0 ? (
                        targets.map((target) => (
                            <TargetCard
                                key={target.id}
                                target={target}
                                onEdit={handleEditTarget}
                                onDelete={handleDeleteTarget}
                            />
                        ))
                    ) : (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No targets found for {selectedYear}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="money" className="space-y-4">
                    {moneyTargets.length > 0 ? (
                        moneyTargets.map((target) => (
                            <TargetCard key={target.id} target={target} onEdit={handleEditTarget} onDelete={handleDeleteTarget} />
                        ))
                    ) : (
                        <Card><CardContent className="py-8 text-center text-muted-foreground">No money targets found</CardContent></Card>
                    )}
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                    {activityTargets.length > 0 ? (
                        activityTargets.map((target) => (
                            <TargetCard key={target.id} target={target} onEdit={handleEditTarget} onDelete={handleDeleteTarget} />
                        ))
                    ) : (
                        <Card><CardContent className="py-8 text-center text-muted-foreground">No activity targets found</CardContent></Card>
                    )}
                </TabsContent>

                <TabsContent value="individual" className="space-y-4">
                    {individualTargets.length > 0 ? (
                        individualTargets.map((target) => (
                            <TargetCard key={target.id} target={target} onEdit={handleEditTarget} onDelete={handleDeleteTarget} />
                        ))
                    ) : (
                        <Card><CardContent className="py-8 text-center text-muted-foreground">No individual targets found</CardContent></Card>
                    )}
                </TabsContent>

                <TabsContent value="team" className="space-y-4">
                    {teamTargets.length > 0 ? (
                        teamTargets.map((target) => (
                            <TargetCard key={target.id} target={target} onEdit={handleEditTarget} onDelete={handleDeleteTarget} />
                        ))
                    ) : (
                        <Card><CardContent className="py-8 text-center text-muted-foreground">No team targets found</CardContent></Card>
                    )}
                </TabsContent>

                <TabsContent value="quarterly" className="space-y-4">
                    {quarterlyTargets.length > 0 ? (
                        quarterlyTargets.map((target) => (
                            <TargetCard key={target.id} target={target} onEdit={handleEditTarget} onDelete={handleDeleteTarget} />
                        ))
                    ) : (
                        <Card><CardContent className="py-8 text-center text-muted-foreground">No quarterly targets found</CardContent></Card>
                    )}
                </TabsContent>

                <TabsContent value="yearly" className="space-y-4">
                    {yearlyTargets.length > 0 ? (
                        yearlyTargets.map((target) => (
                            <TargetCard key={target.id} target={target} onEdit={handleEditTarget} onDelete={handleDeleteTarget} />
                        ))
                    ) : (
                        <Card><CardContent className="py-8 text-center text-muted-foreground">No yearly targets found</CardContent></Card>
                    )}
                </TabsContent>
            </Tabs>

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
                                        <p className="font-semibold text-blue-900 dark:text-blue-100">Creating Money Target</p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                            As a manager, you can set money targets for individual salesmen or for the entire team. 
                                            Select "Individual" to set a target for a specific salesman, or "Team" for a team-wide target.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Target Category</Label>
                                <Select value={targetCategory} onValueChange={(value: 'money' | 'activity') => setTargetCategory(value)} disabled={!!editingTarget}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="money"><div className="flex items-center gap-2"><DollarSign className="h-4 w-4" />Money Target</div></SelectItem>
                                        <SelectItem value="activity"><div className="flex items-center gap-2"><Activity className="h-4 w-4" />Activity Target</div></SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Target Scope</Label>
                                <Select value={targetScope} onValueChange={(value: 'individual' | 'team') => setTargetScope(value)} disabled={!!editingTarget || (targetCategory === 'activity' && isSalesman)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual"><div className="flex items-center gap-2"><User className="h-4 w-4" />Individual</div></SelectItem>
                                        <SelectItem value="team"><div className="flex items-center gap-2"><Users className="h-4 w-4" />Team</div></SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Period</Label>
                                <Select value={periodType} onValueChange={(value: 'quarterly' | 'yearly') => setPeriodType(value)} disabled={!!editingTarget}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Year</Label>
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
                                <Label>Salesman {targetCategory === 'money' && '*'}</Label>
                                <Select 
                                    value={selectedSalesman} 
                                    onValueChange={setSelectedSalesman} 
                                    disabled={!!editingTarget || (targetCategory === 'activity' && isSalesman) || loadingSalesmen}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingSalesmen ? "Loading salesmen..." : "Select salesman"} />
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
                                                {loadingSalesmen ? "Loading..." : "No salesmen available"}
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {targetCategory === 'money' && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {salesmen.length === 0 
                                            ? "No salesmen available. Please ensure there are active salesmen in the system."
                                            : "Select a salesman to set an individual money target"
                                        }
                                    </p>
                                )}
                                {targetCategory === 'activity' && isSalesman && !editingTarget && (
                                    <p className="text-sm text-muted-foreground mt-1">You can only set activity targets for yourself</p>
                                )}
                            </div>
                        )}

                        {periodType === 'quarterly' && (
                            <div>
                                <Label>Quarter</Label>
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
                                <Label>Target Revenue (Money) *</Label>
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
                                <div><Label>Target Visits *</Label><Input type="number" value={formData.targetVisits} onChange={(e) => setFormData({ ...formData, targetVisits: e.target.value })} placeholder="50" /></div>
                                <div><Label>Target Successful Visits *</Label><Input type="number" value={formData.targetSuccessfulVisits} onChange={(e) => setFormData({ ...formData, targetSuccessfulVisits: e.target.value })} placeholder="35" /></div>
                                <div><Label>Target Offers *</Label><Input type="number" value={formData.targetOffers} onChange={(e) => setFormData({ ...formData, targetOffers: e.target.value })} placeholder="30" /></div>
                                <div><Label>Target Deals *</Label><Input type="number" value={formData.targetDeals} onChange={(e) => setFormData({ ...formData, targetDeals: e.target.value })} placeholder="15" /></div>
                                <div className="col-span-2"><Label>Target Offer Acceptance Rate (%)</Label><Input type="number" value={formData.targetOfferAcceptanceRate} onChange={(e) => setFormData({ ...formData, targetOfferAcceptanceRate: e.target.value })} placeholder="60" min="0" max="100" /></div>
                            </div>
                        )}

                        <div><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes about this target..." rows={3} /></div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)} disabled={loading}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : editingTarget ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function TargetCard({ target, onEdit, onDelete }: { target: SalesmanTargetDTO; onEdit: (target: SalesmanTargetDTO) => void; onDelete: (target: SalesmanTargetDTO) => void }) {
    const isMoneyTarget = target.targetType === TargetTypeEnum.Money
    const creatorName = target.createdByManagerName || target.createdBySalesmanName || 'Unknown'
    
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {isMoneyTarget ? (
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><DollarSign className="h-3 w-3 mr-1" />Money Target</Badge>
                            ) : (
                                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"><Activity className="h-3 w-3 mr-1" />Activity Target</Badge>
                            )}
                            {target.isTeamTarget ? (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><Users className="h-3 w-3 mr-1" />Team</Badge>
                            ) : (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><User className="h-3 w-3 mr-1" />Individual</Badge>
                            )}
                            {target.quarter && <Badge variant="outline">Q{target.quarter} {target.year}</Badge>}
                            {!target.quarter && <Badge variant="outline">{target.year} - Yearly</Badge>}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{target.isTeamTarget ? 'Team Target' : target.salesmanName}</h3>
                        
                        {isMoneyTarget ? (
                            <div className="mt-4">
                                <div><p className="text-sm text-muted-foreground">Target Revenue</p><p className="text-lg font-semibold">${target.targetRevenue?.toLocaleString() || '0'}</p></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div><p className="text-sm text-muted-foreground">Target Visits</p><p className="text-lg font-semibold">{target.targetVisits}</p></div>
                                <div><p className="text-sm text-muted-foreground">Successful Visits</p><p className="text-lg font-semibold">{target.targetSuccessfulVisits}</p></div>
                                <div><p className="text-sm text-muted-foreground">Target Offers</p><p className="text-lg font-semibold">{target.targetOffers}</p></div>
                                <div><p className="text-sm text-muted-foreground">Target Deals</p><p className="text-lg font-semibold">{target.targetDeals}</p></div>
                            </div>
                        )}
                        
                        {!isMoneyTarget && target.targetOfferAcceptanceRate && (
                            <div className="mt-2"><p className="text-sm text-muted-foreground">Offer Acceptance Rate</p><p className="text-lg font-semibold">{target.targetOfferAcceptanceRate}%</p></div>
                        )}
                        {target.notes && (
                            <div className="mt-3"><p className="text-sm text-muted-foreground">Notes</p><p className="text-sm">{target.notes}</p></div>
                        )}
                        <div className="mt-4 text-xs text-muted-foreground">
                            Created by {creatorName} on {new Date(target.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(target)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => onDelete(target)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
