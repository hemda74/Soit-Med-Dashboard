import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { salesApi } from '@/services/sales/salesApi';
import toast from 'react-hot-toast';
import { Key, Loader2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface SetClientCredentialsFormProps {
	dealId: string | number;
	dealClientName?: string;
	onSuccess?: () => void;
	onCancel?: () => void;
}

const SetClientCredentialsForm: React.FC<SetClientCredentialsFormProps> = ({
	dealId,
	dealClientName,
	onSuccess,
	onCancel,
}) => {
	const { t } = useTranslation();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!username.trim()) {
			toast.error(t('pleaseEnterUsername') || 'Please enter username');
			return;
		}

		if (!password.trim() || password.length < 6) {
			toast.error(
				t('passwordMustBeAtLeast6Characters') ||
					'Password must be at least 6 characters'
			);
			return;
		}

		try {
			setSubmitting(true);

			const response = await salesApi.setClientCredentials(
				dealId,
				username,
				password
			);

			if (response.success) {
				toast.success(
					t('credentialsSetSuccessfully') ||
						'Client credentials set successfully'
				);
				setUsername('');
				setPassword('');
				onSuccess?.();
			} else {
				toast.error(
					response.message ||
						t('failedToSetCredentials') ||
						'Failed to set credentials'
				);
			}
		} catch (error: any) {
			console.error('Error setting credentials:', error);
			toast.error(
				error.message ||
					t('failedToSetCredentials') ||
					'Failed to set credentials'
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Key className="h-5 w-5" />
					{t('setClientCredentials') || 'Set Client Credentials'}
				</CardTitle>
				<CardDescription>
					{t('setUsernameAndPasswordForClient') ||
						'Set username and password for the client account'}
					{dealClientName && ` - ${dealClientName}`}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="username">
							{t('username') || 'Username'} *
						</Label>
						<Input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder={t('enterUsername') || 'Enter username'}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">
							{t('password') || 'Password'} *
						</Label>
						<div className="relative">
							<Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder={t('enterPassword') || 'Enter password (min 6 characters)'}
								required
								minLength={6}
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute right-0 top-0 h-full px-3"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</Button>
						</div>
						<p className="text-sm text-muted-foreground">
							{t('passwordMustBeAtLeast6Characters') ||
								'Password must be at least 6 characters long'}
						</p>
					</div>

					<div className="flex items-center justify-end gap-4">
						{onCancel && (
							<Button type="button" variant="outline" onClick={onCancel}>
								{t('cancel') || 'Cancel'}
							</Button>
						)}
						<Button type="submit" disabled={submitting}>
							{submitting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									{t('setting') || 'Setting...'}
								</>
							) : (
								t('setCredentials') || 'Set Credentials'
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};

export default SetClientCredentialsForm;

