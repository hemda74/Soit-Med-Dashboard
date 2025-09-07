import { z } from 'zod';

export const createLoginSchema = (t: (key: string) => string) =>
	z.object({
		email: z
			.string()
			.min(1, t('emailRequired'))
			.email(t('emailInvalid')),
		password: z
			.string()
			.min(1, t('passwordRequired'))
			.min(6, t('passwordMinLength')),
	});

export const loginSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address'),
	password: z
		.string()
		.min(1, 'Password is required')
		.min(6, 'Password must be at least 6 characters long'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
