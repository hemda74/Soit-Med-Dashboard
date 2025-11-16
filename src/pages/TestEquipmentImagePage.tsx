import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePerformance } from '@/hooks/usePerformance';
import { salesApi } from '@/services/sales/salesApi';
import { getStaticFileUrl, getStaticFileBaseUrl, getApiBaseUrl } from '@/utils/apiConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestEquipmentImagePage: React.FC = () => {
	usePerformance('TestEquipmentImagePage');
	const { t } = useTranslation();
	const [offerId, setOfferId] = useState<string>('103');
	const [equipmentId, setEquipmentId] = useState<string>('25');
	const [loading, setLoading] = useState(false);
	const [imagePath, setImagePath] = useState<string | null>(null);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [apiImageUrl, setApiImageUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [logs, setLogs] = useState<string[]>([]);

	const addLog = (message: string) => {
		const timestamp = new Date().toLocaleTimeString();
		setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
		console.log(message);
	};

	const testImagePath = async () => {
		setLoading(true);
		setError(null);
		setImagePath(null);
		setImageUrl(null);
		setApiImageUrl(null);
		setLogs([]);

		try {
			addLog(`Testing image path for Offer ${offerId}, Equipment ${equipmentId}`);

			// Test 1: Get image path from API
			addLog('Step 1: Calling getEquipmentImage API...');
			const response = await salesApi.getEquipmentImage(
				parseInt(offerId),
				parseInt(equipmentId)
			);

			addLog(`API Response: ${JSON.stringify(response, null, 2)}`);

			if (response.success && response.data) {
				const path =
					response.data.imagePath ||
					(response.data as any).ImagePath ||
					(response.data as any).imagePath;

				if (path) {
					setImagePath(path);
					addLog(`✅ Image path retrieved: ${path}`);

					// Test 2: Construct static file URL
					const staticUrl = getStaticFileUrl(path);
					setImageUrl(staticUrl);
					addLog(`✅ Static URL constructed: ${staticUrl}`);

					// Test 3: Construct API endpoint URL
					const directApiUrl = `${getApiBaseUrl()}/api/Offer/${offerId}/equipment/${equipmentId}/image-file`;
					setApiImageUrl(directApiUrl);
					addLog(`✅ Direct API URL: ${directApiUrl}`);

					addLog('✅ All tests passed!');
				} else {
					const errorMsg = 'No image path in response';
					setError(errorMsg);
					addLog(`❌ ${errorMsg}`);
				}
			} else {
				const errorMsg = response.message || 'Failed to get image path';
				setError(errorMsg);
				addLog(`❌ ${errorMsg}`);
			}
		} catch (err: any) {
			const errorMsg = err.message || 'Unknown error occurred';
			setError(errorMsg);
			addLog(`❌ Error: ${errorMsg}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Test Equipment Image Endpoint</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-2">Offer ID</label>
							<Input
								type="number"
								value={offerId}
								onChange={(e) => setOfferId(e.target.value)}
								placeholder="103"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-2">
								Equipment ID
							</label>
							<Input
								type="number"
								value={equipmentId}
								onChange={(e) => setEquipmentId(e.target.value)}
								placeholder="25"
							/>
						</div>
					</div>

					<Button onClick={testImagePath} disabled={loading} className="w-full">
						{loading ? 'Testing...' : 'Test Image Path'}
					</Button>

					{error && (
						<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
							<p className="text-red-800 dark:text-red-200 font-semibold">
								Error: {error}
							</p>
						</div>
					)}

					{imagePath && (
						<div className="space-y-4">
							<div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
								<p className="text-green-800 dark:text-green-200 font-semibold mb-2">
									✅ Image Path Found:
								</p>
								<code className="text-sm break-all">{imagePath}</code>
							</div>

							{imageUrl && (
								<div className="space-y-2">
									<p className="font-semibold">Static File URL:</p>
									<code className="text-sm break-all block p-2 bg-gray-100 dark:bg-gray-800 rounded">
										{imageUrl}
									</code>
									<div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
										<p className="text-sm mb-2">Image Preview (Static URL):</p>
										<img
											src={imageUrl}
											alt="Equipment"
											className="max-w-full h-auto rounded border"
											onLoad={() => addLog('✅ Static URL image loaded successfully')}
											onError={(e) => {
												addLog('❌ Static URL image failed to load');
												const target = e.target as HTMLImageElement;
												target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage Failed to Load%3C/text%3E%3C/svg%3E';
											}}
										/>
									</div>
								</div>
							)}

							{apiImageUrl && (
								<div className="space-y-2">
									<p className="font-semibold">Direct API URL:</p>
									<code className="text-sm break-all block p-2 bg-gray-100 dark:bg-gray-800 rounded">
										{apiImageUrl}
									</code>
									<div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
										<p className="text-sm mb-2">Image Preview (Direct API):</p>
										<img
											src={apiImageUrl}
											alt="Equipment"
											className="max-w-full h-auto rounded border"
											onLoad={() => addLog('✅ Direct API image loaded successfully')}
											onError={(e) => {
												addLog('❌ Direct API image failed to load');
												const target = e.target as HTMLImageElement;
												target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage Failed to Load%3C/text%3E%3C/svg%3E';
											}}
										/>
									</div>
								</div>
							)}
						</div>
					)}

					{logs.length > 0 && (
						<div className="mt-4">
							<p className="font-semibold mb-2">Test Logs:</p>
							<div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
								{logs.map((log, index) => (
									<div key={index} className="mb-1">
										{log}
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default TestEquipmentImagePage;

