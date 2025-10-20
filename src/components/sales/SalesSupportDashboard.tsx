// Sales Support Dashboard Component

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import {
    getAllSalesSupport,
    getSalesSupportStatistics,
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
    CheckCircle,
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
            user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLevel = !levelFilter || user.supportLevel === levelFilter;
        const matchesSpecialization = !specializationFilter || user.supportSpecialization === specializationFilter;

        return matchesSearch && matchesLevel && matchesSpecialization;
    });

    const supportLevels = [
        { value: 'Junior', label: 'Junior' },
        { value: 'Senior', label: 'Senior' },
        { value: 'Lead', label: 'Lead' },
        { value: 'Specialist', label: 'Specialist' },
    ];

    const specializations = [
        { value: 'Customer Support', label: 'Customer Support' },
        { value: 'Technical Support', label: 'Technical Support' },
        { value: 'Sales Support', label: 'Sales Support' },
        { value: 'Product Support', label: 'Product Support' },
        { value: 'Billing Support', label: 'Billing Support' },
        { value: 'Account Management', label: 'Account Management' },
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
                                Total Users
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
                                Senior Users
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.byLevel?.Senior || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Senior Level
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Lead Users
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.byLevel?.Lead || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Lead Level
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Specialist Users
                            </CardTitle>
                            <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.byLevel?.Specialist || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Specialist Level
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
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Support Level
                                    </label>
                                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Levels" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Levels</SelectItem>
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
                                        Support Specialization
                                    </label>
                                    <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Specializations" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Specializations</SelectItem>
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
                                {filteredUsers.length} {t('users')} found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('name')}</TableHead>
                                        <TableHead>{t('email')}</TableHead>
                                        <TableHead>Support Level</TableHead>
                                        <TableHead>Support Specialization</TableHead>
                                        <TableHead>{t('status')}</TableHead>
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
                                                            {user.userId}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {user.supportLevel || 'Not Specified'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {user.supportSpecialization || 'Not Specified'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="default">
                                                    {t('active')}
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

