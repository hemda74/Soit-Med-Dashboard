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
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLevel = !levelFilter || user.supportLevel === levelFilter;
        const matchesSpecialization = !specializationFilter || user.supportSpecialization === specializationFilter;

        return matchesSearch && matchesLevel && matchesSpecialization;
    });

    const supportLevels = [
        { value: 'Junior', label: t('salesSupport.levels.junior') },
        { value: 'Senior', label: t('salesSupport.levels.senior') },
        { value: 'Lead', label: t('salesSupport.levels.lead') },
        { value: 'Specialist', label: t('salesSupport.levels.specialist') },
    ];

    const specializations = [
        { value: 'Customer Support', label: t('salesSupport.specializations.customerSupport') },
        { value: 'Technical Support', label: t('salesSupport.specializations.technicalSupport') },
        { value: 'Sales Support', label: t('salesSupport.specializations.salesSupport') },
        { value: 'Product Support', label: t('salesSupport.specializations.productSupport') },
        { value: 'Billing Support', label: t('salesSupport.specializations.billingSupport') },
        { value: 'Account Management', label: t('salesSupport.specializations.accountManagement') },
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
                                {t('common.fields.totalUsers')}
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
                                {t('salesSupport.levels.senior')} {t('common.fields.users')}
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.byLevel?.Senior || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('salesSupport.levels.senior')} {t('common.fields.level')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('salesSupport.levels.lead')} {t('common.fields.users')}
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.byLevel?.Lead || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('salesSupport.levels.lead')} {t('common.fields.level')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('salesSupport.levels.specialist')} {t('common.fields.users')}
                            </CardTitle>
                            <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.byLevel?.Specialist || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('salesSupport.levels.specialist')} {t('common.fields.level')}
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
                                {t('common.fields.filters')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        {t('common.fields.search')}
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder={t('common.fields.searchPlaceholder')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        {t('salesSupport.fields.supportLevel')}
                                    </label>
                                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('common.fields.allLevels')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">{t('common.fields.allLevels')}</SelectItem>
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
                                        {t('salesSupport.fields.supportSpecialization')}
                                    </label>
                                    <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('common.fields.allSpecializations')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">{t('common.fields.allSpecializations')}</SelectItem>
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
                                {filteredUsers.length} {t('common.fields.users')} {t('common.fields.found')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('common.fields.name')}</TableHead>
                                        <TableHead>{t('common.fields.email')}</TableHead>
                                        <TableHead>{t('salesSupport.fields.supportLevel')}</TableHead>
                                        <TableHead>{t('salesSupport.fields.supportSpecialization')}</TableHead>
                                        <TableHead>{t('common.fields.status')}</TableHead>
                                        <TableHead>{t('common.fields.actions')}</TableHead>
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
                                                            {user.firstName} {user.lastName}
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
                                                    {user.supportLevel || t('common.fields.notSpecified')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {user.supportSpecialization || t('common.fields.notSpecified')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="default">
                                                    {t('common.fields.active')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm">
                                                        {t('common.actions.view')}
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        {t('common.actions.edit')}
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
                                    {t('common.messages.comingSoon')}
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
                                    {t('common.messages.comingSoon')}
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
