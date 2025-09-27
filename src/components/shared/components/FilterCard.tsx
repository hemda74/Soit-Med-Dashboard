import React from 'react';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FilterCardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export const FilterCard: React.FC<FilterCardProps> = ({
    title = "Filters & Search",
    children,
    className = ''
}) => {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        </Card>
    );
};