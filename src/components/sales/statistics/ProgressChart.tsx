import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressChartProps {
    title: string;
    current: number;
    target: number;
    progress: number;
    unit?: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ title, current, target, progress, unit = '' }) => {
    const getProgressColor = () => {
        if (progress >= 100) return 'bg-gradient-to-r from-green-500 to-emerald-500';
        if (progress >= 75) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
        if (progress >= 50) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
        return 'bg-gradient-to-r from-red-500 to-pink-500';
    };

    return (
        <Card className="border-l-4 border-l-primary/50">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                        {current.toLocaleString()}{unit} / {target.toLocaleString()}{unit}
                    </span>
                    <span className={`text-sm font-semibold ${progress >= 100 ? 'text-green-600' :
                            progress >= 75 ? 'text-blue-600' :
                                progress >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {progress.toFixed(1)}%
                    </span>
                </div>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                    {progress > 100 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">Target Exceeded!</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ProgressChart;

