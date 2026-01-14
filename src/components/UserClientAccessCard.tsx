import React, { useState } from 'react';
import { Users, UserPlus, Shield } from 'lucide-react';
import ClientAssignmentModal from './ClientAssignmentModal';

interface UserClientAccessCardProps {
    userId: string;
    userName: string;
    fullName: string;
    linkedClientNames: string[];
    linkedClientsCount: number;
    onUpdate: () => void;
}

const UserClientAccessCard: React.FC<UserClientAccessCardProps> = ({
    userId,
    userName,
    fullName,
    linkedClientNames,
    linkedClientsCount,
    onUpdate
}) => {
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{fullName || userName}</h3>
                                <p className="text-sm text-gray-500">@{userName}</p>
                            </div>
                        </div>

                        {/* Client Access Summary */}
                        <div className="mt-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                                {linkedClientsCount === 0 ? (
                                    <span className="text-orange-600 font-medium">No clients assigned</span>
                                ) : (
                                    <span>
                                        Access to <span className="font-medium text-blue-600">{linkedClientsCount}</span> client{linkedClientsCount !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </span>
                        </div>

                        {/* Client Names List */}
                        {linkedClientsCount > 0 && (
                            <div className="mt-3">
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {expanded ? 'Hide' : 'Show'} clients
                                </button>
                                {expanded && (
                                    <div className="mt-2 space-y-1">
                                        {linkedClientNames.map((clientName, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded"
                                            >
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                {clientName}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <button
                        onClick={() => setShowAssignModal(true)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Assign client access"
                    >
                        <UserPlus className="w-4 h-4" />
                        Assign
                    </button>
                </div>
            </div>

            {/* Assignment Modal */}
            <ClientAssignmentModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                userId={userId}
                userName={fullName || userName}
                onSuccess={() => {
                    onUpdate();
                    setShowAssignModal(false);
                }}
            />
        </>
    );
};

export default UserClientAccessCard;
