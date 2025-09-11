import { User, Users, UserPlus, Settings, TestTube } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { user, hasRole } = useAuthStore()
    const { t } = useTranslation()
    const isAdmin = hasRole('SuperAdmin') || hasRole('Admin')

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 animate-slideIn">
                <h1 className="text-3xl font-bold text-foreground">{t('dashboard')}</h1>
                <p className="text-muted-foreground mt-2">{t('welcomeBackUser')}, {user?.firstName}!</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
                {/* Profile Card */}
                <Link to="/profile">
                    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {t('profile')}
                            </CardTitle>
                            <CardDescription>
                                {t('profileDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{t('fullName')}</span>
                                    <span className="text-muted-foreground">{user?.fullName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{t('department')}</span>
                                    <span className="text-muted-foreground">{user?.departmentName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{t('role')}</span>
                                    <span className="text-muted-foreground">{user?.roles.join(', ')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Users Management Card */}
                {isAdmin && (
                    <Link to="/admin/users">
                        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Users Management
                                </CardTitle>
                                <CardDescription>
                                    View and manage all users
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Browse, search, and manage user accounts across all departments.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                )}

                {/* User Creation Card */}
                {isAdmin && (
                    <Link to="/admin/create-role-user">
                        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    Create User
                                </CardTitle>
                                <CardDescription>
                                    Create new users with specific roles
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Create doctors, engineers, technicians, and other role-specific users.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                )}

                {/* API Test Card */}
                {isAdmin && (
                    <Link to="/admin/test-user-creation">
                        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TestTube className="h-5 w-5" />
                                    API Testing
                                </CardTitle>
                                <CardDescription>
                                    Test user creation APIs
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Test the role-specific user creation endpoints with sample data.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                )}

                {/* Legacy Create User Card */}
                {isAdmin && (
                    <Link to="/admin/create-user">
                        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Legacy User Creation
                                </CardTitle>
                                <CardDescription>
                                    Original user creation system
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Use the original dynamic form-based user creation system.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                )}
            </div>
        </div>
    )
}
