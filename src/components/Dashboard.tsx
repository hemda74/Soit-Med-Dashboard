import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/Header'

export default function Dashboard() {
    const { user, logout } = useAuthStore()
    const { t } = useTranslation()

    return (
        <>
            <Header />
            <div className="min-h-screen bg-background p-4 transition-colors duration-300">
                <div className="max-w-4xl mx-auto pt-16">
                    <div className="flex justify-between items-center mb-8 animate-slideIn">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{t('dashboard')}</h1>
                            <p className="text-muted-foreground mt-2">{t('welcomeBackUser')}, {user?.name}!</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={logout}
                            className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
                        >
                            <LogOut className="h-4 w-4" />
                            {t('signOut')}
                        </Button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
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
                                        <span className="font-medium">{t('name')}:</span>
                                        <span className="text-muted-foreground">{user?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{t('email')}:</span>
                                        <span className="text-muted-foreground">{user?.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{t('id')}:</span>
                                        <span className="text-muted-foreground">{user?.id}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
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
                        </Card>

                        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                            <CardHeader>
                                <CardTitle>{t('quickStats')}</CardTitle>
                                <CardDescription>
                                    {t('systemOverview')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}
