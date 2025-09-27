import { useState, useEffect } from 'react';
import { ChevronDown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchDepartments } from '@/services';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import type { Department } from '@/types/department.types';

interface DepartmentSelectorProps {
    onDepartmentSelect: (department: Department) => void;
    selectedDepartment: Department | null;
}

export function DepartmentSelector({ onDepartmentSelect, selectedDepartment }: DepartmentSelectorProps) {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();
    const { setLoading } = useAppStore();

    useEffect(() => {
        const loadDepartments = async () => {
            if (!user?.token) {
                setError('No authentication token found');
                return;
            }

            try {
                const departmentsData = await fetchDepartments(user.token, setLoading);
                setDepartments(departmentsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load departments');
            }
        };

        loadDepartments();
    }, [user?.token, setLoading]);

    const handleDepartmentClick = (department: Department) => {
        onDepartmentSelect(department);
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
                disabled={departments.length === 0}
            >
                <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>
                        {selectedDepartment ? selectedDepartment.name : 'Select Department'}
                    </span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isOpen && (
                <Card className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-y-auto">
                    <CardContent className="p-0">
                        {departments.map((department) => (
                            <button
                                key={department.id}
                                onClick={() => handleDepartmentClick(department)}
                                className="w-full text-start px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{department.name}</p>
                                        <p className="text-sm text-muted-foreground">{department.description}</p>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {department.userCount} users
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

export default DepartmentSelector;
