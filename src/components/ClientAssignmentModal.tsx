import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, AlertCircle } from 'lucide-react';
import clientAccessService from '../services/clientAccessService';
import axios from 'axios';

interface Client {
    id: string;
    name: string;
    type?: string;
    email?: string;
    phone?: string;
    status: string;
}

interface ClientAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    onSuccess: () => void;
}

const ClientAssignmentModal: React.FC<ClientAssignmentModalProps> = ({
    isOpen,
    onClose,
    userId,
    userName,
    onSuccess
}) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedRole, setSelectedRole] = useState('Manager');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchClients();
        }
    }, [isOpen]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5117/api';
            const response = await axios.get(`${API_BASE_URL}/Client`);
            setClients(response.data.data || response.data);
        } catch (err) {
            setError('Failed to load clients');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedClientId) {
            setError('Please select a client');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await clientAccessService.linkUserToClient({
                userId,
                clientId: selectedClientId,
                role: selectedRole
            });
            setSuccess('Client assigned successfully!');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to assign client');
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Assign Client Access</h2>
                        <p className="text-sm text-gray-600 mt-1">Assign {userName} to a client</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Role Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Access Role
                        </label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="Owner">Owner - Full access and management</option>
                            <option value="Manager">Manager - Can manage and view</option>
                            <option value="Viewer">Viewer - Read-only access</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search clients by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Client List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading clients...</div>
                        ) : filteredClients.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No clients found</div>
                        ) : (
                            filteredClients.map((client) => (
                                <div
                                    key={client.id}
                                    onClick={() => setSelectedClientId(client.id)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedClientId === client.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{client.name}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                                {client.type && <span>{client.type}</span>}
                                                {client.email && <span>{client.email}</span>}
                                                {client.phone && <span>{client.phone}</span>}
                                            </div>
                                            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {client.status}
                                            </span>
                                        </div>
                                        {selectedClientId === client.id && (
                                            <div className="ml-4">
                                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                            {success}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedClientId || loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Assign Client
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientAssignmentModal;
