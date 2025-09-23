import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { createLoginSchema, type LoginFormData } from '@/schemas/loginSchema'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const { login } = useAuthStore()
    const { loading: isLoading } = useAppStore()
    const { t } = useTranslation()

    const form = useForm<LoginFormData>({
        resolver: zodResolver(createLoginSchema(t)),
        defaultValues: {
            userName: '',
            password: '',
        },
    })

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data.userName, data.password)
        } catch (error) {
            form.setError('root', {
                message: error instanceof Error ? error.message : t('invalidCredentials')
            })
        }
    }

    return (
        <>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
                <Card className="w-full max-w-md shadow-lg animate-fadeIn">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <LogIn className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">{t('welcomeBack')}</CardTitle>
                        <CardDescription className="text-center">
                            {t('enterCredentials')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="userName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('userName')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder={t('enterUserName')}
                                                    {...field}
                                                    disabled={isLoading}
                                                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                                            <FormLabel>{t('password')}</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder={t('enterPassword')}
                                                        {...field}
                                                        disabled={isLoading}
                                                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 pr-10"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        disabled={isLoading}
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

                                {form.formState.errors.root && (
                                    <div className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-md">
                                        {form.formState.errors.root.message}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('signingIn')}
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="mr-2 h-4 w-4" />
                                            {t('signIn')}
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            <p className="mb-2">{t('demoCredentials')}</p>
                            <div className="font-mono text-xs bg-muted p-3 rounded-md">
                                <p>{t('userName')}: Hemdan</p>
                                <p>{t('password')}: 356120Ahmed@shraf</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
