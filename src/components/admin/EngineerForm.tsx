import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createEngineerUser } from '@/services/userCreationApi';
import { getGovernorates } from '@/services/userCreationApi';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

interface EngineerFormProps {
    onBack: () => void;
    onSuccess: (response: any) => void;
}

interface Governorate {
    governorateId: number;
    name: string;
    createdAt: string;
    isActive: boolean;
    engineerCount: number;
}

const engineerSchema = z.object({
    userName: z.string().min(1, 'Username is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    specialty: z.string().min(1, 'Specialty is required'),
    governorateId: z.string().min(1, 'Please select a governorate'),
});

type EngineerFormData = z.infer<typeof engineerSchema>;

export function EngineerForm({ onBack, onSuccess }: EngineerFormProps) {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const { success, error: showError } = useNotificationStore();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [governorates, setGovernorates] = useState<Governorate[]>([]);
    const [loadingGovernorates, setLoadingGovernorates] = useState(true);

    const form = useForm<EngineerFormData>({
        resolver: zodResolver(engineerSchema),
        defaultValues: {
            userName: '',
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            specialty: '',
            governorateId: '',
        },
    });

    // Load governorates on component mount
    useEffect(() => {
        const loadGovernorates = async () => {
            if (!user?.token) return;

            try {
                setLoadingGovernorates(true);
                console.log('🏛️ Loading governorates for Engineer form');
                const govData = await getGovernorates(user.token);
                console.log('📍 Governorates loaded:', govData);
                setGovernorates(govData);
            } catch (error) {
                console.error('❌ Error loading governorates:', error);
                showError('Failed to load governorates', 'Please refresh the page');
            } finally {
                setLoadingGovernorates(false);
            }
        };

        loadGovernorates();
    }, [user?.token, showError]);

    const handleSubmit = async (data: EngineerFormData) => {
        if (!user?.token) {
            showError('Authentication Error', 'No valid token found');
            return;
        }

        setIsLoading(true);
        console.log('🚀 Submitting Engineer form data:', data);

        // Convert single governorateId to array format for API
        const apiData = {
            ...data,
            governorateIds: [parseInt(data.governorateId)]
        };

        console.log('📝 Converted data for API:', apiData);

        try {
            const response = await createEngineerUser(apiData, user.token);
            console.log('✅ Engineer created successfully:', response);

            // Find the selected governorate name for display
            const selectedGovernorate = governorates.find(g => g.governorateId === parseInt(data.governorateId));
            const governorateName = selectedGovernorate?.name || 'selected governorate';

            success(
                'Engineer Created Successfully!',
                `Engineer '${response.userName}' has been created and assigned to ${governorateName}`
            );

            onSuccess(response);
        } catch (error: any) {
            console.error('❌ Error creating Engineer:', error);
            console.error('📝 Full error details:', JSON.stringify(error, null, 2));

            const errorMessage = error.message || 'Failed to create Engineer user';
            showError('Creation Failed', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    if (loadingGovernorates) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading form data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">
                    Create Engineer User
                </h2>
                <p className="text-muted-foreground mt-2">
                    Fill in the details to create a new Engineer user
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                            <CardDescription>Enter the basic user details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter first name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter last name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="userName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter username" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="Enter email address"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password *</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Enter password"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Engineer-Specific Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Engineer Information</CardTitle>
                            <CardDescription>Enter Engineer-specific details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="specialty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Specialty *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter engineering specialty" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="governorateId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assigned Governorate *</FormLabel>
                                        <div className="text-sm text-muted-foreground mb-2">
                                            Select a governorate to assign to this engineer
                                        </div>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a governorate" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-64">
                                                    <SelectGroup>
                                                        <SelectLabel>Egyptian Governorates</SelectLabel>
                                                        {governorates.length === 0 ? (
                                                            <SelectItem value="no-data" disabled>
                                                                No governorates available
                                                            </SelectItem>
                                                        ) : (
                                                            governorates.map((governorate) => (
                                                                <SelectItem
                                                                    key={governorate.governorateId}
                                                                    value={governorate.governorateId.toString()}
                                                                >
                                                                    <div className="flex items-center justify-between w-full">
                                                                        <span>{governorate.name}</span>
                                                                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${governorate.engineerCount === 0
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : 'bg-blue-100 text-blue-800'
                                                                            }`}>
                                                                            {governorate.engineerCount} engineers
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            disabled={isLoading}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="min-w-[120px]"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                                    Creating...
                                </>
                            ) : (
                                'Create Engineer'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
