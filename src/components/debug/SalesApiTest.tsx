import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { salesReportApi } from '@/services';
import { useSalesReports } from '@/hooks/useSalesReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, CheckCircle, XCircle, Loader2, Users } from 'lucide-react';

const SalesApiTest: React.FC = () => {
  const { user, hasAnyRole } = useAuthStore();
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Test the useSalesReports hook
  const {
    reports,
    loading: hookLoading,
    error: hookError,
    canCreate,
    canEdit,
    canDelete,
    canRate
  } = useSalesReports();

  const testApiCall = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      console.log('Testing Sales Reports API...');
      console.log('User:', user);
      console.log('User roles:', user?.roles);
      console.log('Has Salesman role (Sales Employee):', hasAnyRole(['Salesman']));
      console.log('Has SalesManager role (Sales Manager):', hasAnyRole(['SalesManager']));
      console.log('Has SuperAdmin role:', hasAnyRole(['SuperAdmin']));
      console.log('Has access to sales reports:', hasAnyRole(['Salesman', 'SalesManager', 'SuperAdmin']));

      const response = await salesReportApi.getReports({
        page: 1,
        pageSize: 5
      });

      console.log('API Response:', response);
      setTestResult({
        success: true,
        data: response,
        message: 'API call successful'
      });
    } catch (error) {
      console.error('API Error:', error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'API call failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Sales Reports API Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* User Info */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Current User Info:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>ID:</strong> {user?.id}</p>
                <p><strong>Roles:</strong> {user?.roles?.join(', ') || 'No roles'}</p>
                <p><strong>Has Salesman (Sales Employee):</strong> {hasAnyRole(['Salesman']) ? 'Yes' : 'No'}</p>
                <p><strong>Has SalesManager (Sales Manager):</strong> {hasAnyRole(['SalesManager']) ? 'Yes' : 'No'}</p>
                <p><strong>Has SuperAdmin:</strong> {hasAnyRole(['SuperAdmin']) ? 'Yes' : 'No'}</p>
                <p><strong>Has Sales Reports Access:</strong> {hasAnyRole(['Salesman', 'SalesManager', 'SuperAdmin']) ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {/* Test Button */}
            <Button
              onClick={testApiCall}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing API...
                </>
              ) : (
                'Test Sales Reports API'
              )}
            </Button>

            {/* Test Results */}
            {testResult && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">
                    {testResult.success ? 'Success' : 'Failed'}
                  </span>
                  <Badge variant={testResult.success ? 'default' : 'destructive'}>
                    {testResult.success ? 'Success' : 'Error'}
                  </Badge>
                </div>

                <div className="text-sm space-y-2">
                  <p><strong>Message:</strong> {testResult.message}</p>

                  {testResult.error && (
                    <p className="text-red-600"><strong>Error:</strong> {testResult.error}</p>
                  )}

                  {testResult.data && (
                    <div>
                      <p><strong>Response Data:</strong></p>
                      <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hook Test Results */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                useSalesReports Hook Test:
              </h4>
              <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <p><strong>Loading:</strong> {hookLoading ? 'Yes' : 'No'}</p>
                  <p><strong>Error:</strong> {hookError || 'None'}</p>
                  <p><strong>Reports Count:</strong> {reports.length}</p>
                  <p><strong>Can Create:</strong> {canCreate ? 'Yes' : 'No'}</p>
                  <p><strong>Can Rate:</strong> {canRate ? 'Yes' : 'No'}</p>
                </div>

                {reports.length > 0 && (
                  <div className="mt-3">
                    <p><strong>Sample Report Permissions:</strong></p>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded text-xs">
                      <p>Can Edit: {canEdit(reports[0]) ? 'Yes' : 'No'}</p>
                      <p>Can Delete: {canDelete(reports[0]) ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* API Endpoint Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                API Endpoint Information:
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p><strong>Endpoint:</strong> GET /api/SalesReport</p>
                <p><strong>Base URL:</strong> http://localhost:5117</p>
                <p><strong>Full URL:</strong> http://localhost:5117/api/SalesReport</p>
                <p><strong>Expected Response:</strong> PaginatedSalesReportsResponseDto</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesApiTest;


