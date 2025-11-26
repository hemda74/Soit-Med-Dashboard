# مراجعة الكود - Code Review بالعربية

## للمطور المبتدئ في React

---

## 📋 جدول المحتويات

1. [نقاط القوة](#نقاط-القوة)
2. [نقاط التحسين المهمة](#نقاط-التحسين-المهمة)
3. [أفضل الممارسات](#أفضل-الممارسات)
4. [أمثلة عملية](#أمثلة-عملية)

---

## ✅ نقاط القوة

### 1. استخدام TypeScript بشكل جيد

- ✅ استخدام الأنواع (Types) في معظم الأماكن
- ✅ تعريف الـ Interfaces بشكل واضح
- ✅ استخدام Generic Types في بعض الأماكن

### 2. استخدام React Query (TanStack Query)

- ✅ استخدام `useQuery` لإدارة البيانات من الـ API
- ✅ استخدام `staleTime` و `retry` بشكل جيد
- ✅ معالجة حالات Loading و Error

### 3. استخدام Custom Hooks

- ✅ `useTranslation` للترجمة
- ✅ `usePerformance` لقياس الأداء
- ✅ فصل المنطق عن الـ UI

### 4. استخدام Zustand لإدارة الحالة

- ✅ استخدام Store مركزي للـ Authentication
- ✅ استخدام Persist middleware

---

## ⚠️ نقاط التحسين المهمة

### 1. **مشكلة كبيرة: استخدام `document.getElementById` في React**

**الموقع:** `SalesClientsPage.tsx` - السطر 361

```tsx
// ❌ خطأ - لا تستخدم document.getElementById في React
onClick={() => {
    const dropdown = document.getElementById('equipment-categories-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}}
```

**المشكلة:**

- هذا ضد فلسفة React
- React لا يعرف عن التغييرات في DOM مباشرة
- قد يسبب مشاكل في إعادة الرسم (Re-render)
- صعب الصيانة والاختبار

**الحل الصحيح:**

```tsx
// ✅ استخدم useState لإدارة حالة الـ dropdown
const [isDropdownOpen, setIsDropdownOpen] = useState(false);

// في JSX
<div
    className={cn(
        "absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-md max-h-60 overflow-auto",
        isDropdownOpen ? "block" : "hidden"
    )}
>
```

**لماذا هذا أفضل؟**

- React يتحكم في الحالة
- إعادة الرسم تلقائية عند تغيير الحالة
- أسهل في الاختبار والصيانة

---

### 2. **استخدام Dynamic Imports بشكل غير صحيح**

**الموقع:** `SalesClientsPage.tsx` - السطر 73-74

```tsx
// ⚠️ Dynamic import داخل useQuery
const { getGovernorates } = await import(
	'@/services/roleSpecific/baseRoleSpecificApi'
);
const { getAuthToken } = await import('@/utils/authUtils');
```

**المشكلة:**

- Dynamic imports تستخدم عادة للـ Code Splitting
- هنا لا فائدة منها لأنها تُستدعى في كل مرة
- تزيد التعقيد بدون فائدة

**الحل الصحيح:**

```tsx
// ✅ استورد في أعلى الملف
import { getGovernorates } from '@/services/roleSpecific/baseRoleSpecificApi';
import { getAuthToken } from '@/utils/authUtils';

// ثم استخدمها مباشرة
const response = await getGovernorates(token);
```

---

### 3. **عدم استخدام useMemo و useCallback**

**الموقع:** `SalesClientsPage.tsx` - السطر 131-140

```tsx
// ⚠️ يتم إعادة إنشاء الـ filters object في كل render
const filters: ClientSearchFilters = {
	query: debouncedSearchTerm || undefined,
	classification:
		classification && classification !== 'all'
			? (classification as 'A' | 'B' | 'C' | 'D')
			: undefined,
	// ...
};
```

**المشكلة:**

- يتم إنشاء object جديد في كل render
- قد يسبب إعادة fetch غير ضرورية للـ API
- يؤثر على الأداء

**الحل الصحيح:**

```tsx
// ✅ استخدم useMemo لحفظ الـ filters
const filters: ClientSearchFilters = useMemo(
	() => ({
		query: debouncedSearchTerm || undefined,
		classification:
			classification && classification !== 'all'
				? (classification as 'A' | 'B' | 'C' | 'D')
				: undefined,
		assignedSalesmanId:
			assignedSalesmanId && assignedSalesmanId !== 'all'
				? assignedSalesmanId
				: undefined,
		city: city || undefined,
		governorateId:
			governorateId && governorateId !== 'all'
				? Number(governorateId)
				: undefined,
		equipmentCategories:
			equipmentCategories.length > 0
				? equipmentCategories
				: undefined,
		page,
		pageSize,
	}),
	[
		debouncedSearchTerm,
		classification,
		assignedSalesmanId,
		city,
		governorateId,
		equipmentCategories,
		page,
		pageSize,
	]
);
```

**لماذا هذا مهم؟**

- يمنع إعادة إنشاء الـ object إلا عند تغيير القيم
- يحسن الأداء
- يمنع إعادة fetch غير ضرورية

---

### 4. **عدم استخدام useCallback للـ Handlers**

**الموقع:** `SalesClientsPage.tsx` - السطر 169-217

```tsx
// ⚠️ يتم إنشاء function جديدة في كل render
const handleSearch = (value: string) => {
	setSearchTerm(value);
};

const handleClassificationChange = (value: string) => {
	setClassification(value);
	setPage(1);
};
```

**المشكلة:**

- يتم إنشاء function جديدة في كل render
- قد يسبب إعادة render للأطفال (children) غير ضرورية

**الحل الصحيح:**

```tsx
// ✅ استخدم useCallback
const handleSearch = useCallback((value: string) => {
	setSearchTerm(value);
}, []);

const handleClassificationChange = useCallback((value: string) => {
	setClassification(value);
	setPage(1);
}, []);
```

---

### 5. **عدم التحقق من وجود البيانات قبل الوصول إليها**

**الموقع:** `SalesClientsPage.tsx` - السطر 159-167

```tsx
// ⚠️ قد يكون clientsData?.data?.clients undefined
const clients = clientsData?.data?.clients || [];
const pagination = clientsData?.data || {
	totalCount: 0,
	page: 1,
	pageSize: 20,
	totalPages: 0,
	hasNextPage: false,
	hasPreviousPage: false,
};
```

**المشكلة:**

- قد يكون `clientsData?.data` موجود لكن `clients` غير موجود
- قد يسبب أخطاء في Runtime

**الحل الصحيح:**

```tsx
// ✅ تحقق بشكل أفضل
const clients = clientsData?.data?.clients ?? [];
const pagination = clientsData?.data
	? {
			totalCount: clientsData.data.totalCount ?? 0,
			page: clientsData.data.page ?? 1,
			pageSize: clientsData.data.pageSize ?? 20,
			totalPages: clientsData.data.totalPages ?? 0,
			hasNextPage: clientsData.data.hasNextPage ?? false,
			hasPreviousPage:
				clientsData.data.hasPreviousPage ?? false,
	  }
	: {
			totalCount: 0,
			page: 1,
			pageSize: 20,
			totalPages: 0,
			hasNextPage: false,
			hasPreviousPage: false,
	  };
```

---

### 6. **استخدام `any` كثيراً**

**الموقع:** في عدة أماكن

```tsx
// ❌ سيء
{salesmen.map((salesman: any) => {
    // ...
})}

{governorates.map((gov: any) => (
    // ...
))}
```

**المشكلة:**

- يفقد فوائد TypeScript
- قد يسبب أخطاء في Runtime
- صعب الصيانة

**الحل الصحيح:**

```tsx
// ✅ حدد الأنواع
interface Salesman {
    id: string;
    firstName?: string;
    lastName?: string;
    userName?: string;
    email?: string;
}

interface Governorate {
    governorateId?: number;
    id?: number;
    name: string;
}

{salesmen.map((salesman: Salesman) => {
    // ...
})}

{governorates.map((gov: Governorate) => (
    // ...
))}
```

---

### 7. **عدم استخدام Error Boundaries**

**المشكلة:**

- لا توجد Error Boundaries في المشروع
- إذا حدث خطأ في component، قد يتعطل التطبيق بالكامل

**الحل:**

```tsx
// ✅ أنشئ ErrorBoundary component
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Uncaught error:', error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">
							حدث خطأ ما
						</h1>
						<p className="text-gray-600">
							{
								this.state.error
									?.message
							}
						</p>
						<button
							onClick={() =>
								this.setState({
									hasError: false,
								})
							}
							className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
						>
							إعادة المحاولة
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
```

---

### 8. **عدم استخدام React.memo للـ Components**

**المشكلة:**

- Components قد تعيد الرسم حتى لو لم تتغير props
- يؤثر على الأداء

**الحل:**

```tsx
// ✅ استخدم React.memo
import React, { memo } from 'react';

const ClientDetails = memo(({ clientId }: ClientDetailsProps) => {
	// ...
});

export default ClientDetails;
```

---

### 9. **عدم استخدام Loading States بشكل متسق**

**الموقع:** `SalesClientsPage.tsx`

**المشكلة:**

- بعض الـ queries لا تعرض loading state
- تجربة المستخدم غير متسقة

**الحل:**

```tsx
// ✅ استخدم loading state لجميع الـ queries
const { data: salesmenData, isLoading: isLoadingSalesmen } = useQuery({
	// ...
});

if (isLoadingSalesmen) {
	return <LoadingSpinner />;
}
```

---

### 10. **عدم استخدام Debounce Hook مخصص**

**الموقع:** `SalesClientsPage.tsx` - السطر 121-128

```tsx
// ⚠️ Debounce مكرر في كل component
useEffect(() => {
	const timer = setTimeout(() => {
		setDebouncedSearchTerm(searchTerm);
		setPage(1);
	}, 500);
	return () => clearTimeout(timer);
}, [searchTerm]);
```

**الحل:**

```tsx
// ✅ أنشئ custom hook
// hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

// ثم استخدمه
const debouncedSearchTerm = useDebounce(searchTerm, 500);
```

---

## 🎯 أفضل الممارسات

### 1. **تنظيم الملفات**

**الحالي:**

```
components/
  sales/
    ClientDetails.tsx
    SalesClientsPage.tsx
```

**الأفضل:**

```
components/
  sales/
    clients/
      SalesClientsPage.tsx
      ClientDetails.tsx
      ClientCard.tsx
      ClientFilters.tsx
      hooks/
        useClientFilters.ts
        useClientSearch.ts
```

---

### 2. **فصل المنطق عن الـ UI**

**الحالي:**

```tsx
// كل شيء في component واحد
const SalesClientsPage = () => {
	// 600+ سطر من الكود
};
```

**الأفضل:**

```tsx
// فصل الـ logic
// hooks/useClientSearch.ts
export function useClientSearch() {
	// كل المنطق هنا
	return { clients, filters, handlers };
}

// components/sales/clients/SalesClientsPage.tsx
const SalesClientsPage = () => {
	const { clients, filters, handlers } = useClientSearch();

	return (
		<div>
			<ClientFilters
				filters={filters}
				handlers={handlers}
			/>
			<ClientsTable clients={clients} />
		</div>
	);
};
```

---

### 3. **استخدام Constants**

**الحالي:**

```tsx
// قيم مكررة في الكود
staleTime: 5 * 60 * 1000, // 5 minutes
staleTime: 10 * 60 * 1000, // 10 minutes
```

**الأفضل:**

```tsx
// constants/time.ts
export const STALE_TIME = {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 10 * 60 * 1000, // 10 minutes
    LONG: 30 * 60 * 1000, // 30 minutes
} as const;

// ثم استخدمها
staleTime: STALE_TIME.SHORT,
```

---

### 4. **استخدام Enum بدلاً من Strings**

**الحالي:**

```tsx
// ❌ Strings مكررة
classification === 'all';
status === 'Pending';
```

**الأفضل:**

```tsx
// ✅ Enum
enum Classification {
	ALL = 'all',
	A = 'A',
	B = 'B',
	C = 'C',
	D = 'D',
}

enum DealStatus {
	PENDING = 'Pending',
	APPROVED = 'Approved',
	REJECTED = 'Rejected',
}

// ثم استخدمها
classification === Classification.ALL;
```

---

### 5. **استخدام Form Libraries**

**الحالي:**

```tsx
// إدارة الـ form يدوياً
const [searchTerm, setSearchTerm] = useState('');
const [classification, setClassification] = useState('all');
// ...
```

**الأفضل:**

```tsx
// ✅ استخدم react-hook-form
import { useForm } from 'react-hook-form';

const { register, watch, setValue } = useForm({
	defaultValues: {
		searchTerm: '',
		classification: 'all',
		// ...
	},
});

const filters = watch(); // يحصل على جميع القيم تلقائياً
```

---

## 📝 أمثلة عملية

### مثال 1: تحسين Modal

**الحالي:**

```tsx
// ❌ Modal مكرر في كل مكان
{
	showClientDetails && selectedClientId && (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
				{/* ... */}
			</div>
		</div>
	);
}
```

**الأفضل:**

```tsx
// ✅ أنشئ Modal component قابل لإعادة الاستخدام
// components/ui/Modal.tsx
interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	size = 'md',
}) => {
	if (!isOpen) return null;

	const sizeClasses = {
		sm: 'max-w-md',
		md: 'max-w-2xl',
		lg: 'max-w-4xl',
		xl: 'max-w-6xl',
	};

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
			onClick={onClose}
		>
			<div
				className={`bg-white dark:bg-gray-800 rounded-lg ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden flex flex-col`}
				onClick={(e) => e.stopPropagation()}
			>
				{title && (
					<div className="flex items-center justify-between p-4 border-b">
						<h2 className="text-xl font-semibold">
							{title}
						</h2>
						<Button
							variant="ghost"
							size="icon"
							onClick={onClose}
						>
							<XMarkIcon className="h-5 w-5" />
						</Button>
					</div>
				)}
				<div className="flex-1 overflow-y-auto p-4">
					{children}
				</div>
			</div>
		</div>
	);
};

// ثم استخدمه
<Modal
	isOpen={showClientDetails}
	onClose={() => setShowClientDetails(false)}
	title={t('salesClients.title')}
	size="xl"
>
	<ClientDetails clientId={selectedClientId} />
</Modal>;
```

---

### مثال 2: تحسين Filters

**الحالي:**

```tsx
// ❌ Filters مكررة في JSX
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
	{/* Search */}
	<div className="relative">{/* ... */}</div>
	{/* Classification */}
	<Select>{/* ... */}</Select>
	{/* ... */}
</div>
```

**الأفضل:**

```tsx
// ✅ أنشئ Filter component
// components/sales/clients/ClientFilters.tsx
interface ClientFiltersProps {
	filters: ClientSearchFilters;
	onFilterChange: (key: string, value: any) => void;
	salesmen: Salesman[];
	governorates: Governorate[];
	equipmentCategories: string[];
}

export const ClientFilters: React.FC<ClientFiltersProps> = ({
	filters,
	onFilterChange,
	salesmen,
	governorates,
	equipmentCategories,
}) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Filters</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					<SearchInput
						value={filters.query || ''}
						onChange={(value) =>
							onFilterChange(
								'query',
								value
							)
						}
					/>
					<ClassificationFilter
						value={filters.classification}
						onChange={(value) =>
							onFilterChange(
								'classification',
								value
							)
						}
					/>
					<SalesmanFilter
						value={
							filters.assignedSalesmanId
						}
						onChange={(value) =>
							onFilterChange(
								'assignedSalesmanId',
								value
							)
						}
						salesmen={salesmen}
					/>
					{/* ... */}
				</div>
			</CardContent>
		</Card>
	);
};
```

---

### مثال 3: تحسين Error Handling

**الحالي:**

```tsx
// ⚠️ Error handling بسيط
catch (error: any) {
    console.error('Failed to fetch salesmen:', error);
    return [];
}
```

**الأفضل:**

```tsx
// ✅ Error handling أفضل
import { toast } from 'react-hot-toast';

catch (error: unknown) {
    console.error('Failed to fetch salesmen:', error);

    // عرض رسالة خطأ للمستخدم
    if (error instanceof Error) {
        toast.error(`فشل تحميل البيانات: ${error.message}`);
    } else {
        toast.error('حدث خطأ غير متوقع');
    }

    // إرجاع قيمة افتراضية آمنة
    return [];
}
```

---

## 🚀 خطوات التحسين المقترحة

### الأولوية العالية (High Priority)

1. ✅ إزالة `document.getElementById` واستخدام `useState`
2. ✅ استخدام `useMemo` للـ filters
3. ✅ استخدام `useCallback` للـ handlers
4. ✅ إزالة `any` واستخدام أنواع محددة

### الأولوية المتوسطة (Medium Priority)

5. ✅ إنشاء Error Boundaries
6. ✅ استخدام Custom Hooks (useDebounce)
7. ✅ فصل Components الكبيرة
8. ✅ استخدام React.memo

### الأولوية المنخفضة (Low Priority)

9. ✅ تحسين تنظيم الملفات
10. ✅ استخدام Constants و Enums
11. ✅ تحسين Error Handling

---

## 📚 موارد للتعلم

1. **React Hooks:**

      - [React Hooks Documentation](https://react.dev/reference/react)
      - `useMemo` و `useCallback` مهمان جداً

2. **TypeScript:**

      - [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
      - تجنب استخدام `any`

3. **React Query:**

      - [TanStack Query Docs](https://tanstack.com/query/latest)
      - فهم `staleTime` و `cacheTime`

4. **Performance:**
      - [React Performance](https://react.dev/learn/render-and-commit)
      - استخدام React DevTools Profiler

---

## 💡 نصائح عامة

1. **اقرأ الكود قبل الكتابة:**

      - تأكد من فهم الكود الموجود قبل إضافة جديد

2. **اكتب كود قابل للقراءة:**

      - استخدم أسماء واضحة
      - أضف تعليقات عند الحاجة

3. **اختبر الكود:**

      - اكتب Unit Tests
      - اختبر يدوياً قبل الـ commit

4. **استخدم Git بشكل صحيح:**

      - Commit messages واضحة
      - Branches منفصلة للميزات

5. **اطلب المساعدة:**
      - لا تخف من السؤال
      - Code Review من الزملاء

---

## ✅ الخلاصة

الكود بشكل عام جيد، لكن هناك مجال للتحسين. ركز على:

1. ✅ إزالة `document.getElementById`
2. ✅ استخدام `useMemo` و `useCallback`
3. ✅ إزالة `any` واستخدام أنواع محددة
4. ✅ فصل Components الكبيرة
5. ✅ تحسين Error Handling

**تذكر:** الكود الجيد هو الكود الذي:

- ✅ سهل القراءة والفهم
- ✅ سهل الصيانة
- ✅ قابل للاختبار
- ✅ يعمل بشكل صحيح

---

**تاريخ المراجعة:** ${new Date().toLocaleDateString('ar-SA')}
**المراجع:** Senior Software Engineer
