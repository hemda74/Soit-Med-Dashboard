import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Target, CheckCircle, DollarSign } from 'lucide-react';
import type { SalesManStatisticsDTO } from '@/types/sales.types';

interface SalesManCardProps {
    salesman: SalesManStatisticsDTO;
    onViewDetails: (salesman: SalesManStatisticsDTO) => void;
}

const SalesManCard: React.FC<SalesManCardProps> = ({ salesman, onViewDetails }) => {
    return (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 group">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">{salesman.salesmanName}</h3>
                            <p className="text-sm text-muted-foreground">
                                {salesman.year}{salesman.quarter ? ` • Q${salesman.quarter}` : ' • Annual'}
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => onViewDetails(salesman)} variant="outline" size="sm">
                        View Details
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Visits</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{salesman.totalVisits}</p>
                        <Badge
                            variant="outline"
                            className={salesman.successRate >= 70 ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}
                        >
                            {salesman.successRate.toFixed(1)}%
                        </Badge>
                    </div>

                    <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Target className="w-3.5 h-3.5" />
                            <span>Offers</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{salesman.totalOffers}</p>
                        <Badge variant="outline" className="border-blue-500 text-blue-700">
                            {salesman.offerAcceptanceRate.toFixed(1)}%
                        </Badge>
                    </div>

                    <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Deals</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{salesman.totalDeals}</p>
                    </div>

                    <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Revenue</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">${(salesman.totalDealValue / 1000).toFixed(0)}K</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SalesManCard;


