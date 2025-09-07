import { z } from 'zod';

export const createLoginSchema = (t: (key: string) => string) =>
	z.object({
		userName: z.string().min(1, t('userNameRequired')),
		password: z
			.string()
			.min(1, t('passwordRequired'))
			.min(6, t('passwordMinLength')),
	});

export const loginSchema = z.object({
	userName: z.string().min(1, 'Username is required'),
	password: z
		.string()
		.min(1, 'Password is required')
		.min(6, 'Password must be at least 6 characters long'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
