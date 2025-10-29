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
import { Target, Plus, Pencil, Trash2, Users, User } from 'lucide-react'
import { salesApi } from '@/services/sales/salesApi'
import { useAuthStore } from '@/stores/authStore'
import { weeklyPlanApi } from '@/services/weeklyPlan/weeklyPlanApi'
import type { SalesmanTargetDTO, CreateSalesmanTargetDTO } from '@/types/sales.types'
import type { EmployeeInfo } from '@/types/weeklyPlan.types'
import toast from 'react-hot-toast'

export default function SalesTargetsPage() {
    const { user } = useAuthStore()
    const [targets, setTargets] = useState<SalesmanTargetDTO[]>([])
    const [salesmen, setSalesmen] = useState<EmployeeInfo[]>([])
    const [loading, setLoading] = useState(false)
    const [showDialog, setShowDialog] = useState(false)
    const [editingTarget, setEditingTarget] = useState<SalesmanTargetDTO | null>(null)
    const [targetType, setTargetType] = useState<'individual' | 'team'>('individual')
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
        notes: '',
    })

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
            const response = await weeklyPlanApi.getAllSalesmen()
            if (response.success && response.data) {
                setSalesmen(response.data)
            }
        } catch (error) {
            console.error('Failed to fetch salesmen:', error)
        }
    }

    const handleCreateTarget = () => {
        setEditingTarget(null)
        setTargetType('individual')
        setPeriodType('quarterly')
        setSelectedSalesman('')
        setSelectedQuarter(1)
        setFormData({
            targetVisits: '',
            targetSuccessfulVisits: '',
            targetOffers: '',
            targetDeals: '',
            targetOfferAcceptanceRate: '',
            notes: '',
        })
        setShowDialog(true)
    }

    const handleEditTarget = (target: SalesmanTargetDTO) => {
        setEditingTarget(target)
        setTargetType(target.isTeamTarget ? 'team' : 'individual')
        setPeriodType(target.quarter ? 'quarterly' : 'yearly')
        setSelectedSalesman(target.salesmanId || '')
        setSelectedQuarter(target.quarter || 1)
        setFormData({
            targetVisits: target.targetVisits.toString(),
            targetSuccessfulVisits: target.targetSuccessfulVisits.toString(),
            targetOffers: target.targetOffers.toString(),
            targetDeals: target.targetDeals.toString(),
            targetOfferAcceptanceRate: target.targetOfferAcceptanceRate?.toString() || '',
            notes: target.notes || '',
        })
        setShowDialog(true)
    }

    const handleSubmit = async () => {
        if (!editingTarget && targetType === 'individual' && !selectedSalesman) {
            toast.error('Please select a salesman')
            return
        }

        const targetData: CreateSalesmanTargetDTO = {
            salesmanId: targetType === 'individual' ? selectedSalesman : undefined,
            year: selectedYear,
            quarter: periodType === 'quarterly' ? selectedQuarter : undefined,
            targetVisits: parseInt(formData.targetVisits),
            targetSuccessfulVisits: parseInt(formData.targetSuccessfulVisits),
            targetOffers: parseInt(formData.targetOffers),
            targetDeals: parseInt(formData.targetDeals),
            targetOfferAcceptanceRate: formData.targetOfferAcceptanceRate ? parseFloat(formData.targetOfferAcceptanceRate) : undefined,
            isTeamTarget: targetType === 'team',
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
                        Set and manage performance targets for individual salesmen or the entire team
                    </p>
                </div>
                <Button onClick={handleCreateTarget} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Target
                </Button>
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
                    <TabsTrigger value="all">All Targets</TabsTrigger>
                    <TabsTrigger value="individual">Individual Targets ({individualTargets.length})</TabsTrigger>
                    <TabsTrigger value="team">Team Targets ({teamTargets.length})</TabsTrigger>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Target Type</Label>
                                <Select value={targetType} onValueChange={(value: 'individual' | 'team') => setTargetType(value)} disabled={!!editingTarget}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual"><div className="flex items-center gap-2"><User className="h-4 w-4" />Individual</div></SelectItem>
                                        <SelectItem value="team"><div className="flex items-center gap-2"><Users className="h-4 w-4" />Team</div></SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
                        </div>

                        {targetType === 'individual' && (
                            <div>
                                <Label>Salesman</Label>
                                <Select value={selectedSalesman} onValueChange={setSelectedSalesman} disabled={!!editingTarget}>
                                    <SelectTrigger><SelectValue placeholder="Select salesman" /></SelectTrigger>
                                    <SelectContent>
                                        {salesmen.map((salesman) => (
                                            <SelectItem key={salesman.id} value={salesman.id}>{salesman.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

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

                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Target Visits *</Label><Input type="number" value={formData.targetVisits} onChange={(e) => setFormData({ ...formData, targetVisits: e.target.value })} placeholder="50" /></div>
                            <div><Label>Target Successful Visits *</Label><Input type="number" value={formData.targetSuccessfulVisits} onChange={(e) => setFormData({ ...formData, targetSuccessfulVisits: e.target.value })} placeholder="35" /></div>
                            <div><Label>Target Offers *</Label><Input type="number" value={formData.targetOffers} onChange={(e) => setFormData({ ...formData, targetOffers: e.target.value })} placeholder="30" /></div>
                            <div><Label>Target Deals *</Label><Input type="number" value={formData.targetDeals} onChange={(e) => setFormData({ ...formData, targetDeals: e.target.value })} placeholder="15" /></div>
                            <div className="col-span-2"><Label>Target Offer Acceptance Rate (%)</Label><Input type="number" value={formData.targetOfferAcceptanceRate} onChange={(e) => setFormData({ ...formData, targetOfferAcceptanceRate: e.target.value })} placeholder="60" min="0" max="100" /></div>
                        </div>

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
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {target.isTeamTarget ? (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><Users className="h-3 w-3 mr-1" />Team Target</Badge>
                            ) : (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><User className="h-3 w-3 mr-1" />Individual</Badge>
                            )}
                            {target.quarter && <Badge variant="outline">Q{target.quarter} {target.year}</Badge>}
                            {!target.quarter && <Badge variant="outline">{target.year} - Yearly</Badge>}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{target.isTeamTarget ? 'Team Target' : target.salesmanName}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div><p className="text-sm text-muted-foreground">Target Visits</p><p className="text-lg font-semibold">{target.targetVisits}</p></div>
                            <div><p className="text-sm text-muted-foreground">Successful Visits</p><p className="text-lg font-semibold">{target.targetSuccessfulVisits}</p></div>
                            <div><p className="text-sm text-muted-foreground">Target Offers</p><p className="text-lg font-semibold">{target.targetOffers}</p></div>
                            <div><p className="text-sm text-muted-foreground">Target Deals</p><p className="text-lg font-semibold">{target.targetDeals}</p></div>
                        </div>
                        {target.targetOfferAcceptanceRate && (
                            <div className="mt-2"><p className="text-sm text-muted-foreground">Offer Acceptance Rate</p><p className="text-lg font-semibold">{target.targetOfferAcceptanceRate}%</p></div>
                        )}
                        {target.notes && (
                            <div className="mt-3"><p className="text-sm text-muted-foreground">Notes</p><p className="text-sm">{target.notes}</p></div>
                        )}
                        <div className="mt-4 text-xs text-muted-foreground">Created by {target.createdByManagerName} on {new Date(target.createdAt).toLocaleDateString()}</div>
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
