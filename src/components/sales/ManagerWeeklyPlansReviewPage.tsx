import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ManagerWeeklyPlansReviewPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Manager Weekly Plans Review</CardTitle>
          <CardDescription>
            Review and approve weekly plans from your sales team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page is under development. Weekly plans review functionality will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerWeeklyPlansReviewPage;


