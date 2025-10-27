import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { API_CONFIG } from '@/config/api';
import toast from 'react-hot-toast';

interface TestNotification {
    targetType: 'user' | 'role';
    targetId: string;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

const SendTestNotification: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<TestNotification>({
        targetType: 'user',
        targetId: '',
        title: 'Test Notification',
        message: 'This is a test notification message',
        type: 'info',
    });

    const { user } = useAuthStore();

    const handleSend = async () => {
        if (!formData.targetId || !formData.title || !formData.message) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // This would need a backend endpoint to send notifications
            // For now, we'll show you the structure
            const response = await fetch(`${API_CONFIG.BASE_URL}/Notification/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({
                    targetType: formData.targetType,
                    target: formData.targetId,
                    title: formData.title,
                    message: formData.message,
                    type: formData.type,
                }),
            });

            if (response.ok) {
                toast.success('Notification sent successfully!');
                // Reset form
                setFormData({
                    targetType: 'user',
                    targetId: '',
                    title: 'Test Notification',
                    message: 'This is a test notification message',
                    type: 'info',
                });
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to send notification');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error('Failed to send notification. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickSend = async (quickType: string) => {
        setLoading(true);
        try {
            const quickNotifications = {
                userPersonal: {
                    targetType: 'user',
                    target: user?.id || '',
                    title: 'Personal Notification',
                    message: 'This notification is sent directly to you!',
                    type: 'info',
                },
                roleAll: {
                    targetType: 'role',
                    target: 'SuperAdmin',
                    title: 'Role Notification',
                    message: 'This notification is sent to all SuperAdmins',
                    type: 'success',
                },
                broadcast: {
                    targetType: 'broadcast',
                    target: 'all',
                    title: 'Broadcast',
                    message: 'This is a broadcast to all users',
                    type: 'warning',
                },
            };

            const payload = quickNotifications[quickType as keyof typeof quickNotifications];

            const response = await fetch(`${API_CONFIG.BASE_URL}/Notification/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success('Notification sent successfully!');
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to send notification');
            }
        } catch (error) {
            console.error('Error sending quick notification:', error);
            toast.error('Failed to send notification. Backend endpoint may not exist yet.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Send Test Notification</CardTitle>
                <CardDescription>
                    Test the notification system by sending notifications to users or roles
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Quick Send Buttons */}
                <div>
                    <Label className="mb-2 block">Quick Send</Label>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={() => handleQuickSend('userPersonal')}
                            disabled={loading}
                            variant="outline"
                            size="sm"
                        >
                            Send to Me
                        </Button>
                        <Button
                            onClick={() => handleQuickSend('roleAll')}
                            disabled={loading}
                            variant="outline"
                            size="sm"
                        >
                            Send to SuperAdmins
                        </Button>
                        <Button
                            onClick={() => handleQuickSend('broadcast')}
                            disabled={loading}
                            variant="outline"
                            size="sm"
                        >
                            Broadcast to All
                        </Button>
                    </div>
                </div>

                <hr />

                {/* Custom Notification Form */}
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="targetType">Target Type</Label>
                        <Select
                            value={formData.targetType}
                            onValueChange={(value: 'user' | 'role') =>
                                setFormData({ ...formData, targetType: value })
                            }
                        >
                            <SelectTrigger id="targetType">
                                <SelectValue placeholder="Select target type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">Specific User</SelectItem>
                                <SelectItem value="role">Role (All Users)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="targetId">
                            {formData.targetType === 'user'
                                ? 'User ID'
                                : 'Role Name'}
                        </Label>
                        <Input
                            id="targetId"
                            placeholder={
                                formData.targetType === 'user'
                                    ? 'e.g., Ahmed_Hemdan_Sales_002'
                                    : 'e.g., SuperAdmin, SalesManager'
                            }
                            value={formData.targetId}
                            onChange={(e) =>
                                setFormData({ ...formData, targetId: e.target.value })
                            }
                        />
                        {formData.targetType === 'user' && user && (
                            <p className="text-xs text-gray-500 mt-1">
                                Your ID: {user.id}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="notificationType">Notification Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value: 'success' | 'error' | 'warning' | 'info') =>
                                setFormData({ ...formData, type: value })
                            }
                        >
                            <SelectTrigger id="notificationType">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Notification title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Notification message"
                            value={formData.message}
                            onChange={(e) =>
                                setFormData({ ...formData, message: e.target.value })
                            }
                            rows={3}
                        />
                    </div>

                    <Button
                        onClick={handleSend}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? 'Sending...' : 'Send Notification'}
                    </Button>
                </div>

                {/* Info Box */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Note:</strong> This requires a backend endpoint at{' '}
                        <code className="text-xs bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">
                            POST /api/Notification/send
                        </code>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default SendTestNotification;

