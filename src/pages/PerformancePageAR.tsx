import { useState, useEffect } from 'react';
import { usePerformanceMetrics } from '@/hooks/usePerformance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Performance Monitoring Page - Arabic Version
 * صفحة مراقبة الأداء - النسخة العربية
 */
export default function PerformancePageAR() {
    const { getMetrics, getAverageMetric, clearMetrics } = usePerformanceMetrics();
    const [metrics, setMetrics] = useState(getMetrics());
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(getMetrics());
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const webVitals = {
        LCP: getAverageMetric('LCP'),
        FID: getAverageMetric('FID'),
        CLS: getAverageMetric('CLS'),
        FCP: getAverageMetric('FCP'),
        TTFB: getAverageMetric('TTFB'),
        INP: getAverageMetric('INP'),
    };

    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'good':
                return 'bg-green-500';
            case 'needs-improvement':
                return 'bg-yellow-500';
            case 'poor':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getRatingText = (rating: string) => {
        switch (rating) {
            case 'good':
                return 'جيد';
            case 'needs-improvement':
                return 'يحتاج تحسين';
            case 'poor':
                return 'ضعيف';
            default:
                return 'غير محدد';
        }
    };

    const getMetricNameAR = (name: string) => {
        const names: Record<string, string> = {
            LCP: 'أكبر عنصر مرئي',
            FID: 'تأخير أول تفاعل',
            CLS: 'التحول التراكمي للتصميم',
            FCP: 'أول محتوى مرئي',
            TTFB: 'وقت أول بايت',
            INP: 'التفاعل حتى الرسم التالي',
        };
        return names[name] || name;
    };

    const getRatingBadge = (rating: string) => {
        return (
            <Badge className={`${getRatingColor(rating)} text-white`}>
                {getRatingText(rating)}
            </Badge>
        );
    };

    const filteredMetrics = selectedMetric
        ? metrics.filter((m) => m.name === selectedMetric)
        : metrics;

    const metricGroups = metrics.reduce((acc, metric) => {
        const group = metric.name.split('_')[0];
        if (!acc[group]) acc[group] = [];
        acc[group].push(metric);
        return acc;
    }, {} as Record<string, typeof metrics>);

    const stats = {
        total: metrics.length,
        good: metrics.filter((m) => m.rating === 'good').length,
        needsImprovement: metrics.filter((m) => m.rating === 'needs-improvement').length,
        poor: metrics.filter((m) => m.rating === 'poor').length,
    };

    return (
        <div className="container mx-auto p-6 space-y-6" dir="rtl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">مراقبة الأداء</h1>
                <Button onClick={clearMetrics} variant="outline">
                    مسح المقاييس
                </Button>
            </div>

            {/* Web Vitals Section */}
            <Card>
                <CardHeader>
                    <CardTitle>مؤشرات الأداء الأساسية</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(webVitals).map(([name, value]) => (
                            <div key={name} className="p-4 border rounded-lg">
                                <div className="text-sm text-muted-foreground">
                                    {getMetricNameAR(name)}
                                </div>
                                <div className="text-xs text-muted-foreground mb-1">({name})</div>
                                <div className="text-2xl font-bold mt-1">
                                    {value > 0 ? `${value.toFixed(0)}ms` : 'غير متاح'}
                                </div>
                                {value > 0 && (
                                    <div className="mt-2">
                                        {getRatingBadge(
                                            value < 1000 ? 'good' : value < 2000 ? 'needs-improvement' : 'poor'
                                        )}
                                    </div>
                                )}
                                {value === 0 && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        لم يتم تسجيل قيمة بعد
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>الإحصائيات</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-sm text-muted-foreground">إجمالي المقاييس</div>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">جيد</div>
                            <div className="text-2xl font-bold text-green-500">{stats.good}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">يحتاج تحسين</div>
                            <div className="text-2xl font-bold text-yellow-500">
                                {stats.needsImprovement}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">ضعيف</div>
                            <div className="text-2xl font-bold text-red-500">{stats.poor}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Metric Groups */}
            <Card>
                <CardHeader>
                    <CardTitle>مجموعات المقاييس</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Button
                            variant={selectedMetric === null ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedMetric(null)}
                        >
                            الكل ({metrics.length})
                        </Button>
                        {Object.keys(metricGroups).map((group) => (
                            <Button
                                key={group}
                                variant={selectedMetric === group ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedMetric(group)}
                            >
                                {group} ({metricGroups[group].length})
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Metrics List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {selectedMetric ? `المقاييس: ${selectedMetric}` : 'جميع المقاييس'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredMetrics.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                لم يتم تسجيل أي مقاييس بعد. ابدأ باستخدام التطبيق لرؤية بيانات الأداء.
                            </div>
                        ) : (
                            filteredMetrics.map((metric, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium">{metric.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(metric.timestamp).toLocaleString('ar-SA')}
                                            {metric.url && (
                                                <span className="ml-2 text-xs">({metric.url})</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-mono font-bold">
                                                {metric.value.toFixed(2)}ms
                                            </div>
                                        </div>
                                        {getRatingBadge(metric.rating)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Explanation Card */}
            <Card>
                <CardHeader>
                    <CardTitle>شرح المقاييس</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div>
                        <strong>LCP (أكبر عنصر مرئي):</strong> الوقت الذي استغرقته أكبر عنصر مرئي
                        للظهور. جيد إذا كان أقل من 2500ms.
                    </div>
                    <div>
                        <strong>FID (تأخير أول تفاعل):</strong> الوقت بين نقر المستخدم وبدء الاستجابة.
                        جيد إذا كان أقل من 100ms.
                    </div>
                    <div>
                        <strong>FCP (أول محتوى مرئي):</strong> الوقت الذي استغرقته أول عناصر الصفحة
                        للظهور. جيد إذا كان أقل من 1800ms.
                    </div>
                    <div>
                        <strong>TTFB (وقت أول بايت):</strong> الوقت الذي استغرقته الخادم للرد على
                        الطلب الأول. جيد إذا كان أقل من 800ms.
                    </div>
                    <div>
                        <strong>CLS (التحول التراكمي):</strong> قياس استقرار التصميم. جيد إذا كان أقل
                        من 0.1.
                    </div>
                    <div>
                        <strong>INP (التفاعل حتى الرسم):</strong> الوقت بين التفاعل ورسم التحديث التالي.
                        جيد إذا كان أقل من 200ms.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

