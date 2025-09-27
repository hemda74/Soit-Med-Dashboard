import { useState, useEffect } from 'react';
import { ChevronDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchRoles } from '@/services';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import type { Role } from '@/types/department.types';

interface RoleSelectorProps {
    onRoleSelect: (role: Role) => void;
    selectedRole: Role | null;
}

export function RoleSelector({ onRoleSelect, selectedRole }: RoleSelectorProps) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();
    const { setLoading } = useAppStore();

    useEffect(() => {
        const loadRoles = async () => {
            if (!user?.token) {
                setError('No authentication token found');
                return;
            }

            try {
                const rolesData = await fetchRoles(user.token, setLoading);
                setRoles(rolesData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load roles');
            }
        };

        loadRoles();
    }, [user?.token, setLoading]);

    const handleRoleClick = (role: Role) => {
        onRoleSelect(role);
        setIsOpen(false);
    };

    if (error) {
        return (
            <Card className="p-4 border-destructive">
                <p className="text-destructive text-sm">Error: {error}</p>
            </Card>
        );
    }

    return (
        <div className="relative">
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full justify-between"
                disabled={roles.length === 0}
            >
                <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4" />
                    <span>
                        {selectedRole ? selectedRole.name : 'Select Role'}
                    </span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isOpen && (
                <Card className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-y-auto">
                    <CardContent className="p-0">
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => handleRoleClick(role)}
                                className="w-full text-start px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{role.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {role.normalizedName}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default RoleSelector;
