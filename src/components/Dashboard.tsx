import { User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { user } = useAuthStore()
    const { t } = useTranslation()

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 animate-slideIn">
                <h1 className="text-3xl font-bold text-foreground">{t('dashboard')}</h1>
                <p className="text-muted-foreground mt-2">{t('welcomeBackUser')}, {user?.firstName}!</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
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
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <Link to="/admin/create-user">

                        <CardHeader>
                            <CardTitle>{t('medicalDashboard')}</CardTitle>
                            <CardDescription>
                                {t('soitronMedical')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                {t('dashboardDescription')}
                            </p>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <CardHeader>
                        <CardTitle>{t('quickStats')}</CardTitle>
                        <CardDescription>
                            {t('systemOverview')}
                        </CardDescription>
                    </CardHeader>
                    {/* <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{t('status')}:</span>
                                <span className="text-green-600 font-medium">{t('online')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{t('lastLogin')}:</span>
                                <span className="text-muted-foreground">{t('justNow')}</span>
                            </div>
                        </div>
                    </CardContent> */}
                </Card>
            </div>
        </div>
    )
}
