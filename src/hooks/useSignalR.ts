import { useEffect, useRef, useState, useCallback } from 'react';
import signalRService from '@/services/signalRService';
import { useAuthStore } from '@/stores/authStore';

interface UseSignalROptions {
	onConnected?: () => void;
	onDisconnected?: () => void;
	onNotification?: (data: any) => void;
}

export const useSignalR = (options: UseSignalROptions = {}) => {
	const { onConnected, onDisconnected, onNotification } = options;
	const [connectionStatus, setConnectionStatus] =
		useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);
	const { user } = useAuthStore();
	const isInitialized = useRef(false);

	const startConnection = useCallback(async () => {
		if (!user?.token) {
			setError(new Error('JWT token is required'));
			return;
		}

		try {
			// Set up listeners before connecting
			if (onNotification) {
				signalRService.addEventListener(
					'notification',
					onNotification
				);
			}

			// Connect to SignalR
			await signalRService.connect();

			console.log('SignalR Connected!');
			setConnectionStatus(true);
			setError(null);
			onConnected?.();
		} catch (err) {
			console.error('SignalR Connection Error:', err);
			setError(err as Error);
			setConnectionStatus(false);
			onDisconnected?.();
		}
	}, [user?.token, onConnected, onDisconnected, onNotification]);

	const stopConnection = useCallback(async () => {
		await signalRService.disconnect();
		setConnectionStatus(false);
	}, []);

	const joinGroup = useCallback(
		async (groupName: string) => {
			if (connectionStatus) {
				await signalRService.joinGroup(groupName);
			}
		},
		[connectionStatus]
	);

	const leaveGroup = useCallback(
		async (groupName: string) => {
			if (connectionStatus) {
				await signalRService.leaveGroup(groupName);
			}
		},
		[connectionStatus]
	);

	useEffect(() => {
		// Listen to connection status changes
		const handleConnectionStatus = (status: any) => {
			setConnectionStatus(status.isConnected);
			if (
				!status.isConnected &&
				status.reconnectAttempts === 0
			) {
				onDisconnected?.();
			} else if (status.isConnected) {
				onConnected?.();
			}
		};

		signalRService.addEventListener(
			'connectionStatus',
			handleConnectionStatus
		);

		// Initialize connection if not already done
		if (!isInitialized.current && user?.token) {
			isInitialized.current = true;
			startConnection();
		}

		return () => {
			signalRService.removeEventListener(
				'connectionStatus',
				handleConnectionStatus
			);
			if (onNotification) {
				signalRService.removeEventListener(
					'notification',
					onNotification
				);
			}
			stopConnection();
		};
	}, [
		startConnection,
		stopConnection,
		user?.token,
		onConnected,
		onDisconnected,
		onNotification,
	]);

	return {
		connectionStatus,
		error,
		joinGroup,
		leaveGroup,
		isConnected: connectionStatus,
	};
};
