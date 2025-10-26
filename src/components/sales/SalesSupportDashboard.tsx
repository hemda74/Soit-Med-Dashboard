// Sales Support Dashboard Component

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import {
    getAllSalesSupport,
    getSalesSupportStatistics,
    getSalesSupportByLevel,
    getSalesSupportBySpecialization
} from '@/services/roleSpecific/salesSupportRoleApi';
import type { SalesSupportUserResponse } from '@/types/roleSpecificUser.types';
import toast from 'react-hot-toast';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    HeadphonesIcon,
    Users,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    Search,
    Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SalesSupportDashboardProps {
    className?: string;
}

const SalesSupportDashboard: React.FC<SalesSupportDashboardProps> = ({ className }) => {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [salesSupportUsers, setSalesSupportUsers] = useState<SalesSupportUserResponse[]>([]);
    const [statistics, setStatistics] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('');

    useEffect(() => {
        if (user?.token) {
            loadData();
        }
    }, [user?.token]);

    const loadData = async () => {
        if (!user?.token) return;

        setLoading(true);
        try {
            const [usersData, statsData] = await Promise.all([
                getAllSalesSupport(user.token),
                getSalesSupportStatistics(user.token)
            ]);

            setSalesSupportUsers(usersData);
            setStatistics(statsData);
        } catch (error: any) {
            console.error('Error loading sales support data:', error);
            toast.error(error.message || 'Failed to load sales support data');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = salesSupportUsers.filter(user => {
        const matchesSearch =
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLevel = !levelFilter || user.supportLevel === levelFilter;
        const matchesSpecialization = !specializationFilter || user.supportSpecialization === specializationFilter;

        return matchesSearch && matchesLevel && matchesSpecialization;
    });

    const supportLevels = [
        { value: 'Junior', label: t('salesSupportLevels.junior') },
        { value: 'Senior', label: t('salesSupportLevels.senior') },
        { value: 'Lead', label: t('salesSupportLevels.lead') },
        { value: 'Specialist', label: t('salesSupportLevels.specialist') },
    ];

    const specializations = [
        { value: 'Customer Support', label: t('salesSupportSpecializations.customerSupport') },
        { value: 'Technical Support', label: t('salesSupportSpecializations.technicalSupport') },
        { value: 'Sales Support', label: t('salesSupportSpecializations.salesSupport') },
        { value: 'Product Support', label: t('salesSupportSpecializations.productSupport') },
        { value: 'Billing Support', label: t('salesSupportSpecializations.billingSupport') },
        { value: 'Account Management', label: t('salesSupportSpecializations.accountManagement') },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading sales support data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {t('salesSupportDashboard')}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {t('salesSupportDashboardDescription')}
                    </p>
                </div>
                <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t('createSalesSupportUser')}
                </Button>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('totalUsers')}
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.totalCount}</div>
                            <p className="text-xs text-muted-foreground">
                                {t('salesSupportUsers')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('salesSupportLevels.senior')} {t('users')}
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.byLevel?.Senior || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('salesSupportLevels.senior')} {t('level')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('salesSupportLevels.lead')} {t('users')}
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.byLevel?.Lead || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('salesSupportLevels.lead')} {t('level')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('salesSupportLevels.specialist')} {t('users')}
                            </CardTitle>
                            <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.byLevel?.Specialist || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('salesSupportLevels.specialist')} {t('level')}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content */}
            <Tabs defaultValue="users" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="users">{t('salesSupportUsers')}</TabsTrigger>
                    <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
                    <TabsTrigger value="management">{t('salesSupportManagement')}</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                {t('filters')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        {t('search')}
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder={t('searchPlaceholder')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        {t('supportLevel')}
                                    </label>
                                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('allLevels')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">{t('allLevels')}</SelectItem>
                                            {supportLevels.map((level) => (
                                                <SelectItem key={level.value} value={level.value}>
                                                    {level.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        {t('supportSpecialization')}
                                    </label>
                                    <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('allSpecializations')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">{t('allSpecializations')}</SelectItem>
                                            {specializations.map((spec) => (
                                                <SelectItem key={spec.value} value={spec.value}>
                                                    {spec.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('salesSupportUsers')}</CardTitle>
                            <CardDescription>
                                {filteredUsers.length} users found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Support Level</TableHead>
                                        <TableHead>Specialization</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.userId}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {user.profileImage ? (
                                                        <img
                                                            src={user.profileImage.filePath}
                                                            alt={user.profileImage.altText}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <HeadphonesIcon className="h-4 w-4 text-gray-500" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium">
                                                            {user.email}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.userId}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {user.supportLevel || 'Not specified'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {user.supportSpecialization || 'Not specified'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="default">
                                                    Active
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm">
                                                        View
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('analytics')}</CardTitle>
                            <CardDescription>
                                {t('salesSupportDashboardDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <HeadphonesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">
                                    Coming Soon
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="management">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('salesSupportManagement')}</CardTitle>
                            <CardDescription>
                                {t('salesSupportManagementDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <HeadphonesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">
                                    Coming Soon
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SalesSupportDashboard;
