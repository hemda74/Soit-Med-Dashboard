import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceChartProps {
    title: string;
    value: number;
    percentage: number;
    isGood?: boolean;
    icon?: React.ReactNode;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
    title,
    value,
    percentage,
    isGood = true,
    icon
}) => {
    const isPositive = percentage > 0;

    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                {icon}
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{title}</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{value.toFixed(1)}%</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{Math.abs(percentage).toFixed(1)}%</span>
                    </div>
                </div>

                {/* Visual bar representation */}
                <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${isGood ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
                                }`}
                            style={{ width: `${Math.min(value, 100)}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PerformanceChart;

