import React, { useState, useEffect } from 'react';
import { useSalesStore } from '@/stores/salesStore';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';

const CLASSIFICATIONS = ['A', 'B', 'C', 'D'] as const;
type Classification = typeof CLASSIFICATIONS[number] | '';

interface ClientSearchProps {
    onClientSelect?: (client: any) => void;
    placeholder?: string;
    className?: string;
    showClassificationFilter?: boolean;
}

const ClientSearch: React.FC<ClientSearchProps> = ({
    onClientSelect,
    placeholder,
    className = '',
    showClassificationFilter = true,
}) => {
    const { searchClients, clientSearchResults, clientsLoading, clientsError } = useSalesStore();
    const { t } = useTranslation();
    const searchPlaceholder = placeholder ?? t('clientSearch.searchPlaceholder');
    const [query, setQuery] = useState('');
    const [classification, setClassification] = useState<Classification>('');
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.length >= 2 || classification) {
                searchClients({ 
                    query: query.length >= 2 ? query : undefined,
                    classification: classification || undefined 
                });
                setShowResults(true);
            } else {
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, classification, searchClients]);

    const handleClientSelect = (client: any) => {
        setQuery(client.name);
        setShowResults(false);
        onClientSelect?.(client);
    };

    const handleInputFocus = () => {
        if (query.length >= 2 && clientSearchResults?.clients) {
            setShowResults(true);
        }
    };

    const handleInputBlur = () => {
        // Delay hiding results to allow for click events
        setTimeout(() => setShowResults(false), 200);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            {showClassificationFilter && (
                <Select value={classification} onValueChange={(value) => setClassification(value as Classification)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('clientSearch.filterPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">{t('clientSearch.allClassifications')}</SelectItem>
                        {CLASSIFICATIONS.map((cls) => (
                            <SelectItem key={cls} value={cls}>
                                {t('clientSearch.classificationOption').replace('{{value}}', cls)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {showResults && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {clientsLoading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                {t('clientSearch.searching')}
                            </div>
                        </div>
                    ) : clientsError ? (
                        <div className="p-4 text-center text-red-500">
                            {clientsError}
                        </div>
                    ) : clientSearchResults?.clients && clientSearchResults.clients.length > 0 ? (
                        clientSearchResults.clients.map((client) => (
                            <div
                                key={client.id}
                                onClick={() => handleClientSelect(client)}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                                <div className="font-medium text-gray-900">
                                    {client.name}
                                </div>
                                {client.organizationName && (
                                    <div className="text-sm text-gray-500">
                                        {client.organizationName}
                                    </div>
                                )}
                                {client.classification && (
                                    <div className="text-sm text-gray-500">
                                        {t('clientSearch.classificationLabel').replace('{{value}}', client.classification)}
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="text-xs text-gray-400">
                                        {client.phone}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            {t('clientSearch.noResults')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientSearch;