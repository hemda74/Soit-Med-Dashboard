export const translations = {
	en: {
		// Login Form
		welcomeBack: 'Welcome back',
		enterCredentials:
			'Enter your credentials to access your account',
		email: 'Email',
		userName: 'Username',
		password: 'Password',
		enterEmail: 'Enter your email',
		enterUserName: 'Enter your username',
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
		roles: 'Roles',
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

		// User Profile
		refreshData: 'Refresh Data',
		refreshing: 'Refreshing...',
		noUserData: 'No user data available',
		personalInformation: 'Personal Information',
		personalInfoDescription:
			'Your personal details and account information',
		contactInformation: 'Contact Information',
		contactInfoDescription:
			'Your contact details and verification status',
		departmentRole: 'Department & Role',
		departmentRoleDescription:
			'Your organizational role and department',
		accountStatus: 'Account Status',
		accountStatusDescription:
			'Account activity and status information',
		fullName: 'Full Name',
		firstName: 'First Name',
		lastName: 'Last Name',
		username: 'Username',
		userId: 'User ID',
		phone: 'Phone',
		notProvided: 'Not provided',
		department: 'Department',
		description: 'Description',
		active: 'Active',
		inactive: 'Inactive',
		created: 'Created',
		never: 'Never',

		// Validation
		emailRequired: 'Email is required',
		emailInvalid: 'Please enter a valid email address',
		userNameRequired: 'Username is required',
		passwordRequired: 'Password is required',
		passwordMinLength:
			'Password must be at least 6 characters long',
	},
	ar: {
		// Login Form
		welcomeBack: 'مرحباً بعودتك',
		enterCredentials: 'أدخل بياناتك للوصول إلى حسابك',
		email: 'البريد الإلكتروني',
		userName: 'اسم المستخدم',
		password: 'كلمة المرور',
		enterEmail: 'أدخل بريدك الإلكتروني',
		enterUserName: 'أدخل اسم المستخدم',
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
		roles: 'الأدوار',
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

		// User Profile
		refreshData: 'تحديث البيانات',
		refreshing: 'جاري التحديث...',
		noUserData: 'لا توجد بيانات مستخدم متاحة',
		personalInformation: 'المعلومات الشخصية',
		personalInfoDescription: 'تفاصيلك الشخصية ومعلومات الحساب',
		contactInformation: 'معلومات الاتصال',
		contactInfoDescription: 'تفاصيل الاتصال وحالة التحقق',
		departmentRole: 'القسم والدور',
		departmentRoleDescription: 'دورك التنظيمي والقسم',
		accountStatus: 'حالة الحساب',
		accountStatusDescription: 'نشاط الحساب ومعلومات الحالة',
		fullName: 'الاسم الكامل',
		firstName: 'الاسم الأول',
		lastName: 'اسم العائلة',
		username: 'اسم المستخدم',
		userId: 'معرف المستخدم',
		phone: 'الهاتف',
		notProvided: 'غير متوفر',
		department: 'القسم',
		description: 'الوصف',
		active: 'نشط',
		inactive: 'غير نشط',
		created: 'تم الإنشاء',
		never: 'أبداً',

		// Validation
		emailRequired: 'البريد الإلكتروني مطلوب',
		emailInvalid: 'يرجى إدخال عنوان بريد إلكتروني صحيح',
		userNameRequired: 'اسم المستخدم مطلوب',
		passwordRequired: 'كلمة المرور مطلوبة',
		passwordMinLength: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف',
	},
};

export type TranslationKey = keyof typeof translations.en;
