import React, { useEffect, useState } from 'react';
import { salesApi } from '@/services/sales/salesApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, TrendingUp, Target, DollarSign, CheckCircle, XCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import type { SalesmanStatisticsDTO, SalesmanProgressDTO } from '@/types/sales.types';
import SalesmanCard from './statistics/SalesmanCard';
import ProgressChart from './statistics/ProgressChart';
import PerformanceChart from './statistics/PerformanceChart';

const SalesStatisticsPage: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedQuarter, setSelectedQuarter] = useState<number | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [statistics, setStatistics] = useState<SalesmanStatisticsDTO[]>([]);
    const [selectedSalesman, setSelectedSalesman] = useState<SalesmanStatisticsDTO | null>(null);
    const [progress, setProgress] = useState<SalesmanProgressDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        loadAllStatistics();
    }, [selectedYear, selectedQuarter]);

    const loadAllStatistics = async () => {
        setLoading(true);
        try {
            const response = await salesApi.getAllSalesmanStatistics(selectedYear, selectedQuarter);
            if (response.success && Array.isArray(response.data)) {
                // Filter to only include salesmen (the API should already return salesmen)
                // Filter out any entries that don't have a valid salesmanId
                const salesmanStats = response.data.filter((stat: any) => {
                    // Only include if it has a salesmanId and is not null
                    return stat && stat.salesmanId && typeof stat.salesmanId === 'string';
                });
                setStatistics(salesmanStats);
            } else {
                toast.error(response.message || 'Failed to load statistics');
                setStatistics([]);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load statistics');
            setStatistics([]);
        } finally {
            setLoading(false);
        }
    };

    const loadSalesmanProgress = async (salesmanId: string) => {
        try {
            const response = await salesApi.getSalesmanProgress(salesmanId, selectedYear, selectedQuarter);
            if (response.success) {
                setProgress(response.data);
            } else {
                toast.error(response.message || 'Failed to load progress');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load progress');
        }
    };

    const handleSalesmanClick = (salesman: SalesmanStatisticsDTO) => {
        setSelectedSalesman(salesman);
        setActiveTab('details');
        loadSalesmanProgress(salesman.salesmanId);
    };

    const handleBackToOverview = () => {
        setActiveTab('overview');
        setSelectedSalesman(null);
        setProgress(null);
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        Sales Statistics
                    </h1>
                    <p className="text-muted-foreground mt-2 ml-14">
                        Analyze salesman performance metrics and progress
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="px-3 py-1.5 border-0 rounded-md bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <select
                        value={selectedQuarter || ''}
                        onChange={(e) => setSelectedQuarter(e.target.value ? Number(e.target.value) : undefined)}
                        className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Quarters</option>
                        <option value="1">Q1</option>
                        <option value="2">Q2</option>
                        <option value="3">Q3</option>
                        <option value="4">Q4</option>
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="details" disabled={!selectedSalesman} className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Details
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="text-muted-foreground mt-4">Loading statistics...</p>
                        </div>
                    ) : statistics.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="py-16 text-center">
                                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <p className="text-muted-foreground text-lg">No statistics available for this period</p>
                                <p className="text-muted-foreground text-sm mt-1">Try selecting a different year or quarter</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {statistics.map((salesman) => (
                                <SalesmanCard
                                    key={salesman.salesmanId}
                                    salesman={salesman}
                                    onViewDetails={handleSalesmanClick}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6 mt-6">
                    {selectedSalesman && progress && !loading ? (
                        <div className="space-y-6">
                            {/* Header with Back Button */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <Button variant="ghost" size="sm" onClick={handleBackToOverview} className="mb-2">
                                        ← Back to Overview
                                    </Button>
                                    <h2 className="text-2xl font-bold text-foreground">{selectedSalesman.salesmanName}</h2>
                                    <p className="text-muted-foreground">
                                        Performance details for {selectedYear}{selectedQuarter ? ` Q${selectedQuarter}` : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Performance Charts */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <PerformanceChart
                                    title="Success Rate"
                                    value={progress.currentStatistics.successRate}
                                    percentage={progress.currentStatistics.successRate}
                                    isGood={progress.currentStatistics.successRate >= 70}
                                    icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                                />
                                <PerformanceChart
                                    title="Offer Acceptance"
                                    value={progress.currentStatistics.offerAcceptanceRate}
                                    percentage={progress.currentStatistics.offerAcceptanceRate}
                                    isGood={progress.currentStatistics.offerAcceptanceRate >= 60}
                                    icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                                />
                            </div>

                            {/* Progress Charts */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <ProgressChart
                                    title="Visits Progress"
                                    current={progress.currentStatistics.totalVisits}
                                    target={progress.individualTarget?.targetVisits || progress.teamTarget?.targetVisits || 0}
                                    progress={progress.visitsProgress}
                                    unit=" visits"
                                />
                                <ProgressChart
                                    title="Offers Progress"
                                    current={progress.currentStatistics.totalOffers}
                                    target={progress.individualTarget?.targetOffers || progress.teamTarget?.targetOffers || 0}
                                    progress={progress.offersProgress}
                                    unit=" offers"
                                />
                                <ProgressChart
                                    title="Deals Progress"
                                    current={progress.currentStatistics.totalDeals}
                                    target={progress.individualTarget?.targetDeals || progress.teamTarget?.targetDeals || 0}
                                    progress={progress.dealsProgress}
                                    unit=" deals"
                                />
                            </div>

                            {/* Statistics Cards */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Visit Statistics</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                            <span className="text-muted-foreground">Total</span>
                                            <span className="font-semibold">{progress.currentStatistics.totalVisits}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                            <span className="text-muted-foreground">Successful</span>
                                            <Badge className="bg-green-100 text-green-800">
                                                {progress.currentStatistics.successfulVisits}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-muted-foreground">Failed</span>
                                            <Badge className="bg-red-100 text-red-800">
                                                {progress.currentStatistics.failedVisits}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Offer Statistics</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                            <span className="text-muted-foreground">Total</span>
                                            <span className="font-semibold">{progress.currentStatistics.totalOffers}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                            <span className="text-muted-foreground">Accepted</span>
                                            <Badge className="bg-green-100 text-green-800">
                                                {progress.currentStatistics.acceptedOffers}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-muted-foreground">Rejected</span>
                                            <Badge className="bg-red-100 text-red-800">
                                                {progress.currentStatistics.rejectedOffers}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Deal Statistics</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                            <span className="text-muted-foreground">Total Deals</span>
                                            <span className="font-semibold">{progress.currentStatistics.totalDeals}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                            <span className="text-muted-foreground">Total Value</span>
                                            <span className="font-semibold">${(progress.currentStatistics.totalDealValue / 1000).toFixed(0)}K</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-muted-foreground">Avg Value</span>
                                            <span className="font-semibold">
                                                ${progress.currentStatistics.totalDeals > 0 ?
                                                    (progress.currentStatistics.totalDealValue / progress.currentStatistics.totalDeals / 1000).toFixed(1) : 0}K
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="py-16 text-center">
                                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <p className="text-muted-foreground text-lg">Select a salesman from overview to view details</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SalesStatisticsPage;
