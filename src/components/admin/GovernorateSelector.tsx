import React, { useEffect } from 'react';
import { CheckCircle, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';

interface GovernorateInfo {
    governorateId: number;
    name: string;
    createdAt: string;
    isActive: boolean;
    engineerCount: number;
}

interface GovernorateSelectorProps {
    governorates: GovernorateInfo[];
    selectedGovernorateIds: number[];
    showDropdown: boolean;
    onToggleDropdown: () => void;
    onGovernorateToggle: (governorateId: number) => void;
    onRemoveGovernorate: (governorateId: number) => void;
    onClearAll: () => void;
    dropdownRef: React.RefObject<HTMLDivElement>;
}

const GovernorateSelector: React.FC<GovernorateSelectorProps> = ({
    governorates,
    selectedGovernorateIds,
    showDropdown,
    onToggleDropdown,
    onGovernorateToggle,
    onRemoveGovernorate,
    onClearAll,
    dropdownRef
}) => {
    const { t } = useTranslation();

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onToggleDropdown();
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown, onToggleDropdown, dropdownRef]);

    return (
        <div className="space-y-2">
            <Label>{t('governorates')} * (Select multiple)</Label>

            {/* Multi-select dropdown with better visual feedback */}
            <div className="relative" ref={dropdownRef}>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onToggleDropdown}
                    className="w-full justify-between text-left hover:bg-primary hover:text-white hover:border-primary transition-colors duration-200"
                >
                    <span className={selectedGovernorateIds?.length === 0 ? "text-muted-foreground" : ""}>
                        {selectedGovernorateIds?.length === 0
                            ? t('selectGovernorates')
                            : t('governoratesSelected').replace('{count}', selectedGovernorateIds?.length.toString() || '0')
                        }
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                </Button>

                {showDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {governorates && governorates.length > 0 ? (
                            governorates.map((governorate) => {
                                const isSelected = selectedGovernorateIds?.includes(governorate.governorateId) || false;
                                return (
                                    <div
                                        key={governorate.governorateId}
                                        className={`flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                        onClick={() => onGovernorateToggle(governorate.governorateId)}
                                    >
                                        {/* Custom checkbox with better visual feedback */}
                                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${isSelected
                                            ? 'bg-blue-500 border-blue-500 text-white'
                                            : 'border-gray-300 hover:border-blue-400'
                                            }`}>
                                            {isSelected && (
                                                <CheckCircle className="w-3 h-3 text-white" />
                                            )}
                                        </div>
                                        <label
                                            className={`text-sm font-medium cursor-pointer flex-1 ${isSelected ? 'text-blue-700' : 'text-gray-700'
                                                }`}
                                        >
                                            {governorate.name}
                                        </label>
                                        {isSelected && (
                                            <span className="text-xs text-blue-600 font-medium">✓ Selected</span>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-3 text-sm text-gray-500 text-center">
                                {governorates ? 'No governorates available' : 'Loading governorates...'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Selected Governorates Display */}
            {selectedGovernorateIds && selectedGovernorateIds.length > 0 && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-800">
                            {t('selectedGovernorates').replace('{count}', selectedGovernorateIds.length.toString())}
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClearAll}
                            className="text-blue-600  hover:bg-primary hover:text-white text-xs transition-colors duration-200"
                        >
                            {t('clearAll')}
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedGovernorateIds.map((id) => {
                            const governorate = governorates.find(g => g.governorateId === id);
                            return governorate ? (
                                <div
                                    key={id}
                                    className="flex items-center gap-2 bg-white border border-blue-300 text-blue-800 px-3 py-2 rounded-lg text-sm shadow-sm"
                                >
                                    <CheckCircle className="h-3 w-3 text-blue-600" />
                                    <span className="font-medium">{governorate.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveGovernorate(id)}
                                        className="ml-1 hover:bg-red-100 rounded-full p-1 transition-colors"
                                        aria-label={`Remove ${governorate.name}`}
                                    >
                                        <X className="h-3 w-3 text-red-600 hover:text-red-800" />
                                    </button>
                                </div>
                            ) : null;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GovernorateSelector;

