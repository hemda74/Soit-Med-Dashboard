import React from 'react';
import { UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RoleSpecificUserRole } from '@/types/roleSpecificUser.types';

interface RoleConfig {
    name: string;
    description: string;
    fields: string[];
    requiresHospital: boolean;
    requiresDepartment: boolean;
    requiresGovernorates?: boolean;
    requiresMedicalDepartment?: boolean;
    autoDepartmentId: number;
    role?: string;
}

interface RoleSelectionCardProps {
    roleKey: string;
    config: RoleConfig;
    index: number;
    onSelect: (role: RoleSpecificUserRole) => void;
}

const RoleSelectionCard: React.FC<RoleSelectionCardProps> = ({
    roleKey,
    config,
    index,
    onSelect
}) => {
    const colorScheme = {
        bg: 'bg-white',
        border: 'border-2 border-border',
        icon: 'bg-gradient-to-br from-primary to-primary/80'
    };

    return (
        <Card
            className={`cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-110 ${colorScheme.bg} ${colorScheme.border} group shadow-lg`}
            onClick={() => onSelect(roleKey as RoleSpecificUserRole)}
        >
            <CardHeader>
                <CardTitle className="flex items-center gap-4 text-foreground group-hover:scale-105 transition-transform font-bold text-lg">
                    <div className={`w-12 h-12 ${colorScheme.icon} rounded-xl flex items-center justify-center shadow-lg`}>
                        <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    {config.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground font-medium opacity-90">{config.description}</p>
            </CardContent>
        </Card>
    );
};

export default RoleSelectionCard;

