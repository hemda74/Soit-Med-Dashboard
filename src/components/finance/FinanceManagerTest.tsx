import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FinanceManagerTest: React.FC = () => {
    const { user, hasRole, hasAnyRole } = useAuthStore();

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Finance Manager Access Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Current User Info:</h3>
                        <p>Name: {user?.fullName}</p>
                        <p>Roles: {user?.roles.join(', ')}</p>
                        <p>Department: {user?.departmentName}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold">Role Access Tests:</h3>
                        <p>Is Finance Manager: {hasRole('FinanceManager') ? '✅ Yes' : '❌ No'}</p>
                        <p>Is Super Admin: {hasRole('SuperAdmin') ? '✅ Yes' : '❌ No'}</p>
                        <p>Has Finance or Admin Access: {hasAnyRole(['FinanceManager', 'SuperAdmin']) ? '✅ Yes' : '❌ No'}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold">Expected Behavior:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Reports menu should only appear for Finance Manager and Super Admin roles</li>
                            <li>Reports screen should redirect to dashboard if user doesn't have access</li>
                            <li>All other users should not see the Reports menu item</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default FinanceManagerTest;



