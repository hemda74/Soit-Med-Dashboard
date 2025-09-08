import React from 'react';
import { Users, Shield, Stethoscope, Wrench, TrendingUp, Hammer, DollarSign, Scale } from 'lucide-react';
import type { UserRole, RoleObject } from '@/types/userCreation.types';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RoleSelectorProps {
    availableRoles: RoleObject[];
    onRoleSelect: (roleObject: RoleObject) => void;
    isLoading?: boolean;
}

// Role configuration with icons and descriptions
const ROLE_CONFIG: Record<UserRole, {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    description: string;
    category: 'admin' | 'medical' | 'technical' | 'business' | 'legal';
}> = {
    SuperAdmin: {
        icon: Shield,
        color: 'text-red-600',
        description: 'Full system access and control',
        category: 'admin',
    },
    Admin: {
        icon: Users,
        color: 'text-blue-600',
        description: 'Administrative privileges and user management',
        category: 'admin',
    },
    Doctor: {
        icon: Stethoscope,
        color: 'text-green-600',
        description: 'Medical professional with clinical access',
        category: 'medical',
    },
    Technician: {
        icon: Wrench,
        color: 'text-orange-600',
        description: 'Technical support and maintenance',
        category: 'technical',
    },
    Engineer: {
        icon: Hammer,
        color: 'text-purple-600',
        description: 'Engineering and technical development',
        category: 'technical',
    },
    Salesman: {
        icon: TrendingUp,
        color: 'text-cyan-600',
        description: 'Sales and customer relationship management',
        category: 'business',
    },
    FinanceManager: {
        icon: DollarSign,
        color: 'text-emerald-600',
        description: 'Financial management and oversight',
        category: 'business',
    },
    FinanceEmployee: {
        icon: DollarSign,
        color: 'text-emerald-500',
        description: 'Financial operations and accounting',
        category: 'business',
    },
    LegalManager: {
        icon: Scale,
        color: 'text-indigo-600',
        description: 'Legal affairs management',
        category: 'legal',
    },
    LegalEmployee: {
        icon: Scale,
        color: 'text-indigo-500',
        description: 'Legal support and compliance',
        category: 'legal',
    },
    Hello: {
        icon: Users,
        color: 'text-pink-600',
        description: 'Custom role - Hello',
        category: 'admin',
    },
    admin: {
        icon: Users,
        color: 'text-blue-500',
        description: 'Administrative access',
        category: 'admin',
    },
    user: {
        icon: Users,
        color: 'text-gray-600',
        description: 'Basic user access',
        category: 'admin',
    },
};

const CATEGORY_LABELS = {
    admin: 'Administration',
    medical: 'Medical',
    technical: 'Technical',
    business: 'Business',
    legal: 'Legal',
};

export function RoleSelector({ availableRoles, onRoleSelect, isLoading }: RoleSelectorProps) {
    const { t } = useTranslation();

    // Debug logging
    console.log('🎭 RoleSelector received availableRoles:', availableRoles);
    console.log('📊 availableRoles type:', typeof availableRoles);
    console.log('📏 availableRoles length:', Array.isArray(availableRoles) ? availableRoles.length : 'Not an array');
    console.log('🔍 availableRoles content:', JSON.stringify(availableRoles, null, 2));

    // Group roles by category
    const rolesByCategory = availableRoles.reduce((acc, roleObject) => {
        const roleConfig = ROLE_CONFIG[roleObject.name as UserRole];
        if (!roleConfig) {
            // If role is not in config, add it to admin category as fallback
            const category = 'admin';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(roleObject);
            return acc;
        }

        const category = roleConfig.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(roleObject);
        return acc;
    }, {} as Record<string, RoleObject[]>);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">{t('loadingRoles')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">{t('selectUserRole')}</h2>
                <p className="text-muted-foreground mt-2">
                    {t('selectRoleDescription')}
                </p>
            </div>

            {Object.entries(rolesByCategory).map(([category, roles]) => (
                <div key={category} className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                        {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {roles.map((roleObject) => {
                            const config = ROLE_CONFIG[roleObject.name as UserRole] || {
                                icon: Users,
                                color: 'text-gray-600',
                                description: `Role: ${roleObject.name}`,
                                category: 'admin' as const
                            };
                            const Icon = config.icon;

                            return (
                                <Card
                                    key={roleObject.id}
                                    className="cursor-pointer transition-all hover:shadow-md hover:scale-105 border-2 hover:border-primary/50"
                                    onClick={() => onRoleSelect(roleObject)}
                                >
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-3 text-base">
                                            <Icon className={`h-5 w-5 ${config.color}`} />
                                            <span>{roleObject.name}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <CardDescription className="text-sm">
                                            {config.description}
                                        </CardDescription>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full mt-3"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRoleSelect(roleObject);
                                            }}
                                        >
                                            {t('selectRole')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ))}

            {availableRoles.length === 0 && (
                <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('noRolesAvailable')}</p>
                </div>
            )}
        </div>
    );
}
