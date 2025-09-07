export const translations = {
	en: {
		// Login Form
		welcomeBack: 'Welcome back',
		enterCredentials:
			'Enter your credentials to access your account',
		email: 'Email',
		password: 'Password',
		enterEmail: 'Enter your email',
		enterPassword: 'Enter your password',
		signIn: 'Sign in',
		signingIn: 'Signing in...',
		demoCredentials: 'Demo credentials:',
		invalidCredentials: 'Invalid credentials',

		// Dashboard
		dashboard: 'Dashboard',
		welcomeBackUser: 'Welcome back',
		profile: 'Profile',
		profileDescription: 'Your account information',
		name: 'Name',
		id: 'ID',
		medicalDashboard: 'Medical Dashboard',
		soitronMedical: 'Soitron Medical System',
		dashboardDescription:
			'This is your medical dashboard. You can add more components and features here.',
		quickStats: 'Quick Stats',
		systemOverview: 'System overview',
		status: 'Status',
		online: 'Online',
		lastLogin: 'Last login',
		justNow: 'Just now',
		signOut: 'Sign out',

		// Theme & Language
		darkMode: 'Dark Mode',
		lightMode: 'Light Mode',
		language: 'Language',
		english: 'English',
		arabic: 'العربية',

		// Validation
		emailRequired: 'Email is required',
		emailInvalid: 'Please enter a valid email address',
		passwordRequired: 'Password is required',
		passwordMinLength:
			'Password must be at least 6 characters long',
	},
	ar: {
		// Login Form
		welcomeBack: 'مرحباً بعودتك',
		enterCredentials: 'أدخل بياناتك للوصول إلى حسابك',
		email: 'البريد الإلكتروني',
		password: 'كلمة المرور',
		enterEmail: 'أدخل بريدك الإلكتروني',
		enterPassword: 'أدخل كلمة المرور',
		signIn: 'تسجيل الدخول',
		signingIn: 'جاري تسجيل الدخول...',
		demoCredentials: 'بيانات التجربة:',
		invalidCredentials: 'بيانات غير صحيحة',

		// Dashboard
		dashboard: 'لوحة التحكم',
		welcomeBackUser: 'مرحباً بعودتك',
		profile: 'الملف الشخصي',
		profileDescription: 'معلومات حسابك',
		name: 'الاسم',
		id: 'المعرف',
		medicalDashboard: 'لوحة التحكم الطبية',
		soitronMedical: 'نظام سويترون الطبي',
		dashboardDescription:
			'هذه لوحة التحكم الطبية الخاصة بك. يمكنك إضافة المزيد من المكونات والميزات هنا.',
		quickStats: 'إحصائيات سريعة',
		systemOverview: 'نظرة عامة على النظام',
		status: 'الحالة',
		online: 'متصل',
		lastLogin: 'آخر تسجيل دخول',
		justNow: 'الآن',
		signOut: 'تسجيل الخروج',

		// Theme & Language
		darkMode: 'الوضع المظلم',
		lightMode: 'الوضع الفاتح',
		language: 'اللغة',
		english: 'English',
		arabic: 'العربية',

		// Validation
		emailRequired: 'البريد الإلكتروني مطلوب',
		emailInvalid: 'يرجى إدخال عنوان بريد إلكتروني صحيح',
		passwordRequired: 'كلمة المرور مطلوبة',
		passwordMinLength: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف',
	},
};

export type TranslationKey = keyof typeof translations.en;
