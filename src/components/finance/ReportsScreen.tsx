import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChartIcon, BarChartIcon, TrendingUpIcon, FileTextIcon, BarChart3 } from 'lucide-react';
import SalesReportsScreen from '@/components/sales/SalesReportsScreen';

const ReportsScreen: React.FC = () => {
    const { user, hasAnyRole } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'financial' | 'sales'>('financial');

    // Check if user has access to reports (Sales Manager, Sales Employee, or Super Admin)
    const hasAccess = hasAnyRole(['SalesManager', 'Salesman', 'SuperAdmin']);

    if (!hasAccess) {
        return <Navigate to="/dashboard" replace />;
    }

    // Check specific access for different report types
    const canAccessFinancial = hasAnyRole(['FinanceManager', 'SuperAdmin']);
    const canAccessSales = hasAnyRole(['SalesManager', 'Salesman', 'SuperAdmin']); // Sales Manager, Sales Employee, and Super Admin

    const reportCategories = [
        {
            id: 'financial',
            title: 'Financial Reports',
            description: 'Revenue, expenses, and financial analytics',
            icon: <PieChartIcon className="h-6 w-6" />,
            reports: [
                { name: 'Monthly Revenue Report', description: 'Detailed monthly revenue breakdown' },
                { name: 'Expense Analysis', description: 'Department-wise expense tracking' },
                { name: 'Profit & Loss Statement', description: 'Comprehensive P&L overview' },
                { name: 'Budget vs Actual', description: 'Budget performance analysis' }
            ]
        },
        {
            id: 'operational',
            title: 'Operational Reports',
            description: 'Hospital operations and efficiency metrics',
            icon: <BarChartIcon className="h-6 w-6" />,
            reports: [
                { name: 'Patient Volume Report', description: 'Daily, weekly, monthly patient statistics' },
                { name: 'Department Performance', description: 'Department efficiency and workload' },
                { name: 'Resource Utilization', description: 'Equipment and staff utilization rates' },
                { name: 'Appointment Analytics', description: 'Appointment scheduling and completion rates' }
            ]
        },
        {
            id: 'clinical',
            title: 'Clinical Reports',
            description: 'Medical outcomes and quality metrics',
            icon: <TrendingUpIcon className="h-6 w-6" />,
            reports: [
                { name: 'Treatment Outcomes', description: 'Success rates and patient outcomes' },
                { name: 'Quality Metrics', description: 'Clinical quality indicators' },
                { name: 'Medication Usage', description: 'Prescription and medication tracking' },
                { name: 'Readmission Rates', description: 'Patient readmission statistics' }
            ]
        },
        {
            id: 'compliance',
            title: 'Compliance Reports',
            description: 'Regulatory compliance and audit reports',
            icon: <FileTextIcon className="h-6 w-6" />,
            reports: [
                { name: 'Regulatory Compliance', description: 'Healthcare regulation adherence' },
                { name: 'Audit Trail', description: 'System access and activity logs' },
                { name: 'Data Privacy Report', description: 'Patient data protection compliance' },
                { name: 'Safety Incidents', description: 'Safety and incident reporting' }
            ]
        }
    ];

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Access comprehensive reports and analytics for {user?.departmentName || 'your department'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <FileTextIcon className="h-4 w-4 mr-2" />
                        Export All
                    </Button>
                    <Button>
                        <TrendingUpIcon className="h-4 w-4 mr-2" />
                        Generate Custom Report
                    </Button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {canAccessFinancial && (
                        <button
                            onClick={() => setActiveTab('financial')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'financial'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <PieChartIcon className="h-4 w-4 inline mr-2" />
                            Financial Reports
                        </button>
                    )}
                    {canAccessSales && (
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'sales'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <BarChart3 className="h-4 w-4 inline mr-2" />
                            Sales Reports
                        </button>
                    )}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'sales' ? (
                <SalesReportsScreen />
            ) : (
                <div className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {reportCategories.map((category) => (
                            <Card key={category.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                            {category.icon}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{category.title}</CardTitle>
                                            <CardDescription>{category.description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {category.reports.map((report, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                            >
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {report.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {report.description}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="sm">
                                                    View
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Quick Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Total Revenue
                                        </p>
                                        <p className="text-2xl font-bold text-green-600">$2,450,000</p>
                                        <p className="text-xs text-green-600">+12% from last month</p>
                                    </div>
                                    <TrendingUpIcon className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Total Expenses
                                        </p>
                                        <p className="text-2xl font-bold text-red-600">$1,890,000</p>
                                        <p className="text-xs text-red-600">+8% from last month</p>
                                    </div>
                                    <BarChartIcon className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Net Profit
                                        </p>
                                        <p className="text-2xl font-bold text-blue-600">$560,000</p>
                                        <p className="text-xs text-blue-600">+15% from last month</p>
                                    </div>
                                    <PieChartIcon className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Patient Count
                                        </p>
                                        <p className="text-2xl font-bold text-purple-600">12,450</p>
                                        <p className="text-xs text-purple-600">+5% from last month</p>
                                    </div>
                                    <FileTextIcon className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsScreen;
