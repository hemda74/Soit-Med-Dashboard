import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, UserPlus, RefreshCw, Search } from 'lucide-react';
import clientAccessService, { type OrphanedClientDTO } from '../services/clientAccessService';
import ClientAssignmentModal from '../components/ClientAssignmentModal';
import axios from 'axios';

interface User {
    id: string;
    userName: string;
    fullName: string;
    email: string;
}

const OrphanedClientsPage: React.FC = () => {
    const [orphanedClients, setOrphanedClients] = useState<OrphanedClientDTO[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<OrphanedClientDTO | null>(null);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [clientsData, usersData] = await Promise.all([
                clientAccessService.getOrphanedClients(),
                fetchUsers()
            ]);
            setOrphanedClients(clientsData);
            setUsers(usersData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (): Promise<User[]> => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5117/api';
            const response = await axios.get(`${API_BASE_URL}/User/all`);
            return response.data.users || [];
        } catch (error) {
            console.error('Failed to fetch users:', error);
            return [];
        }
    };

    const handleAssignUser = async (clientId: string, userId: string) => {
        try {
            await clientAccessService.linkUserToClient({
                userId,
                clientId,
                role: 'Manager'
            });
            await fetchData(); // Refresh the list
        } catch (error) {
            console.error('Failed to assign user:', error);
        }
    };

    const filteredClients = orphanedClients.filter(client =>
        client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Orphaned Clients</h1>
                                <p className="text-gray-600 mt-1">
                                    Clients without any authorized user accounts ({orphanedClients.length} total)
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by client name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Clients List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                            Loading orphaned clients...
                        </div>
                    ) : filteredClients.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-medium">No orphaned clients found</p>
                            <p className="text-sm mt-2">All clients have authorized users assigned</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredClients.map((client) => (
                                        <tr key={client.clientId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{client.clientName}</div>
                                                <div className="text-sm text-gray-500">{client.clientId}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">{client.clientType || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{client.clientEmail || 'No email'}</div>
                                                <div className="text-sm text-gray-500">{client.clientPhone || 'No phone'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${client.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {client.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(client.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={selectedClient?.clientId === client.clientId ? selectedUserId : ''}
                                                        onChange={(e) => {
                                                            setSelectedClient(client);
                                                            setSelectedUserId(e.target.value);
                                                        }}
                                                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">Select user...</option>
                                                        {users.map(user => (
                                                            <option key={user.id} value={user.id}>
                                                                {user.fullName || user.userName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => {
                                                            if (selectedUserId && selectedClient?.clientId === client.clientId) {
                                                                handleAssignUser(client.clientId, selectedUserId);
                                                            }
                                                        }}
                                                        disabled={!selectedUserId || selectedClient?.clientId !== client.clientId}
                                                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <UserPlus className="w-4 h-4" />
                                                        Assign
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Assignment Modal */}
            {showAssignModal && selectedClient && (
                <ClientAssignmentModal
                    isOpen={showAssignModal}
                    onClose={() => {
                        setShowAssignModal(false);
                        setSelectedClient(null);
                    }}
                    userId={selectedUserId}
                    userName={users.find(u => u.id === selectedUserId)?.fullName || ''}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
};

export default OrphanedClientsPage;
