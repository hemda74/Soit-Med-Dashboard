import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import {
    createDoctor,
    createEngineer,
    createTechnician,
    createAdmin,
    createFinanceManager,
    createLegalManager,
    createSalesman,
} from '@/services/roleSpecificUserApi';

const UserCreationTest: React.FC = () => {
    const { user } = useAuthStore();
    const { success, error: showError } = useNotificationStore();
    const [selectedRole, setSelectedRole] = useState<string>('doctor');
    const [isLoading, setIsLoading] = useState(false);
    const [testResults, setTestResults] = useState<any[]>([]);

    const testUsers = {
        doctor: {
            email: 'dr.test@hospital.com',
            password: 'Doctor123!',
            firstName: 'Test',
            lastName: 'Doctor',
            specialty: 'Cardiology',
            hospitalId: 'HOSP001',
        },
        engineer: {
            email: 'eng.test@company.com',
            password: 'Engineer123!',
            firstName: 'Test',
            lastName: 'Engineer',
            departmentId: '4', // Engineering
        },
        technician: {
            email: 'tech.test@hospital.com',
            password: 'Technician123!',
            firstName: 'Test',
            lastName: 'Technician',
            hospitalId: 'HOSP001',
        },
        admin: {
            email: 'admin.test@company.com',
            password: 'Admin123!',
            firstName: 'Test',
            lastName: 'Admin',
            departmentId: '1', // Administration
        },
        'finance-manager': {
            email: 'finance.test@company.com',
            password: 'Finance123!',
            firstName: 'Test',
            lastName: 'Finance',
            departmentId: '5', // Finance
        },
        'legal-manager': {
            email: 'legal.test@company.com',
            password: 'Legal123!',
            firstName: 'Test',
            lastName: 'Legal',
            departmentId: '6', // Legal
        },
        salesman: {
            email: 'sales.test@company.com',
            password: 'Sales123!',
            firstName: 'Test',
            lastName: 'Sales',
            departmentId: '3', // Sales
        },
    };

    const handleTestUserCreation = async () => {
        if (!user?.token) {
            showError('Error', 'No authentication token found');
            return;
        }

        setIsLoading(true);
        const testData = testUsers[selectedRole as keyof typeof testUsers];

        try {
            let response;
            const startTime = Date.now();

            switch (selectedRole) {
                case 'doctor':
                    response = await createDoctor(testData as any, user.token);
                    break;
                case 'engineer':
                    response = await createEngineer(testData as any, user.token);
                    break;
                case 'technician':
                    response = await createTechnician(testData as any, user.token);
                    break;
                case 'admin':
                    response = await createAdmin(testData as any, user.token);
                    break;
                case 'finance-manager':
                    response = await createFinanceManager(testData as any, user.token);
                    break;
                case 'legal-manager':
                    response = await createLegalManager(testData as any, user.token);
                    break;
                case 'salesman':
                    response = await createSalesman(testData as any, user.token);
                    break;
                default:
                    throw new Error('Invalid role selected');
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            const result = {
                role: selectedRole,
                success: true,
                response,
                duration: `${duration}ms`,
                timestamp: new Date().toLocaleString(),
            };

            setTestResults(prev => [result, ...prev]);
            success('Test Successful', `Successfully created ${selectedRole} user in ${duration}ms`);
        } catch (err: any) {
            const result = {
                role: selectedRole,
                success: false,
                error: err.message || 'Unknown error',
                timestamp: new Date().toLocaleString(),
            };

            setTestResults(prev => [result, ...prev]);
            showError('Test Failed', err.message || 'Failed to create user');
        } finally {
            setIsLoading(false);
        }
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-6">User Creation API Test</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Test Controls */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="role-select">Select Role to Test</Label>
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="doctor">Doctor</SelectItem>
                                        <SelectItem value="engineer">Engineer</SelectItem>
                                        <SelectItem value="technician">Technician</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="finance-manager">Finance Manager</SelectItem>
                                        <SelectItem value="legal-manager">Legal Manager</SelectItem>
                                        <SelectItem value="salesman">Salesman</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Test Data Preview</Label>
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
                                    <pre>{JSON.stringify(testUsers[selectedRole as keyof typeof testUsers], null, 2)}</pre>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleTestUserCreation}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    {isLoading ? 'Testing...' : 'Test User Creation'}
                                </Button>
                                <Button
                                    onClick={clearResults}
                                    variant="outline"
                                    disabled={testResults.length === 0}
                                >
                                    Clear Results
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Test Results */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Results ({testResults.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {testResults.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No tests run yet. Select a role and click "Test User Creation".
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {testResults.map((result, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-md border ${result.success
                                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium capitalize">{result.role}</span>
                                                <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                                            </div>

                                            {result.success ? (
                                                <div className="text-sm">
                                                    <p className="text-green-700 dark:text-green-400">
                                                        ✅ Success ({result.duration})
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        User ID: {result.response?.data?.id}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-sm">
                                                    <p className="text-red-700 dark:text-red-400">
                                                        ❌ Failed
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Error: {result.error}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* API Endpoints Reference */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>API Endpoints Reference</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="font-medium mb-2">Role-Specific Endpoints</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>POST /api/RoleSpecificUser/doctor</li>
                                    <li>POST /api/RoleSpecificUser/engineer</li>
                                    <li>POST /api/RoleSpecificUser/technician</li>
                                    <li>POST /api/RoleSpecificUser/admin</li>
                                    <li>POST /api/RoleSpecificUser/finance-manager</li>
                                    <li>POST /api/RoleSpecificUser/legal-manager</li>
                                    <li>POST /api/RoleSpecificUser/salesman</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Other Endpoints</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>POST /api/Account/change-password</li>
                                    <li>GET /api/User/me</li>
                                    <li>GET /api/User/all</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserCreationTest;

