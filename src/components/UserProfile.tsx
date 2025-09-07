import { useEffect } from 'react';
import { User, Mail, Building, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserProfile() {
    const { user, fetchUserData, isLoading } = useAuthStore();
    const { t } = useTranslation();

    useEffect(() => {
        // Refresh user data when component mounts
        fetchUserData();
    }, [fetchUserData]);

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-muted-foreground">{t('noUserData')}</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t('profile')}</h1>
                    <p className="text-muted-foreground mt-2">{t('profileDescription')}</p>
                </div>
                <Button
                    onClick={fetchUserData}
                    disabled={isLoading}
                    variant="outline"
                >
                    {isLoading ? t('refreshing') : t('refreshData')}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {t('personalInformation')}
                        </CardTitle>
                        <CardDescription>
                            {t('personalInfoDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{t('fullName')}:</span>
                                <span className="text-muted-foreground">{user.fullName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{t('firstName')}:</span>
                                <span className="text-muted-foreground">{user.firstName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{t('lastName')}:</span>
                                <span className="text-muted-foreground">{user.lastName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{t('username')}:</span>
                                <span className="text-muted-foreground">{user.userName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{t('userId')}:</span>
                                <span className="text-muted-foreground text-xs">{user.id}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            {t('contactInformation')}
                        </CardTitle>
                        <CardDescription>
                            {t('contactInfoDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{t('email')}:</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{user.email}</span>
                                    {user.emailConfirmed ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{t('phone')}:</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">
                                        {user.phoneNumber || t('notProvided')}
                                    </span>
                                    {user.phoneNumber && (
                                        user.phoneNumberConfirmed ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Department & Role Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            {t('departmentRole')}
                        </CardTitle>
                        <CardDescription>
                            {t('departmentRoleDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{t('department')}:</span>
                                <span className="text-muted-foreground">{user.departmentName}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-medium">{t('description')}:</span>
                                <span className="text-muted-foreground text-right max-w-[200px]">
                                    {user.departmentDescription}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    {t('roles')}:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                    {user.roles.map((role, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>


            </div>
        </div>
    );
}
