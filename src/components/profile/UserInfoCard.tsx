import { User, Mail, Building, Shield, CheckCircle, XCircle, Key } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface UserInfoCardProps {
    user: any;
    t: (key: any) => string;
    onEditPassword: () => void;
}

export default function UserInfoCard({ user, t, onEditPassword }: UserInfoCardProps) {
    return (
        <div className="space-y-6">
            {/* Personal Information Section */}
            <Card className="bg-card shadow-lg">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Personal Information</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">{t('fullName')}</label>
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <User className="h-5 w-5 text-primary" />
                                <span className="text-foreground font-medium">{user.fullName}</span>
                            </div>
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">{t('username')}</label>
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <User className="h-5 w-5 text-primary" />
                                <span className="text-foreground font-medium">{user.userName}</span>
                            </div>
                        </div>

                        {/* User ID */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">{t('userId')}</label>
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <User className="h-5 w-5 text-primary" />
                                <span className="text-foreground font-mono text-sm">{user.id}</span>
                            </div>
                        </div>

                        {/* Department */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">{t('department')}</label>
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Building className="h-5 w-5 text-primary" />
                                <span className="text-foreground font-medium">{user.departmentName}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information Section */}
            <Card className="bg-card shadow-lg">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Contact Information</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">{t('email')}</label>
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Mail className="h-5 w-5 text-primary" />
                                <div className="flex-1 flex items-center gap-2">
                                    <span className="text-foreground font-medium truncate">{user.email}</span>
                                    {user.emailConfirmed ? (
                                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">{t('phone')}</label>
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Mail className="h-5 w-5 text-primary" />
                                <div className="flex-1 flex items-center gap-2">
                                    <span className="text-foreground font-medium">
                                        {user.phoneNumber || t('notProvided')}
                                    </span>
                                    {user.phoneNumber && (
                                        user.phoneNumberConfirmed ? (
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Roles and Security Section */}
            <Card className="bg-card shadow-lg">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Roles & Security</h3>
                    <div className="space-y-6">
                        {/* Roles */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">{t('role')}</label>
                            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                <Shield className="h-5 w-5 text-primary mt-1" />
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.map((role: string, index: number) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full font-medium"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Password</label>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Key className="h-5 w-5 text-primary" />
                                    <span className="text-foreground font-medium">••••••••</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onEditPassword}
                                    className="bg-card border-border text-card-foreground hover:bg-accent"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Change
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
