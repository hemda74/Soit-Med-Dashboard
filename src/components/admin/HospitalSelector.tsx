import React from 'react';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';
import type { HospitalInfo } from '@/types/roleSpecificUser.types';

interface HospitalSelectorProps {
    hospitals: HospitalInfo[];
    selectedHospitalId: string;
    onHospitalSelect: (hospitalId: string) => void;
}

const HospitalSelector: React.FC<HospitalSelectorProps> = ({
    hospitals,
    selectedHospitalId,
    onHospitalSelect
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-2">
            <Label>{t('hospital')} *</Label>

            {/* Simple select dropdown */}
            <select
                value={selectedHospitalId || ""}
                onChange={(e) => {
                    console.log('Select onChange called with:', e.target.value);
                    console.log('Selected hospital:', hospitals.find(h => h.id === e.target.value));
                    onHospitalSelect(e.target.value);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                <option value="">{t('selectHospital')}</option>
                {hospitals && hospitals.length > 0 ? (
                    hospitals.map((hospital) => {
                        // Handle different possible field names
                        const hospitalId = hospital.id || hospital.hospitalId || hospital.HospitalId;
                        const hospitalName = hospital.name || hospital.hospitalName || hospital.HospitalName;
                        return (
                            <option key={hospitalId} value={hospitalId}>
                                {hospitalName} (ID: {hospitalId})
                            </option>
                        );
                    })
                ) : (
                    <option value="" disabled>
                        {hospitals ? 'No hospitals available' : 'Loading hospitals...'}
                    </option>
                )}
            </select>

            {/* Debug display */}
            <div className="text-sm text-gray-600 mt-1">
                Current hospitalId: {selectedHospitalId || 'None'}
            </div>
            {selectedHospitalId && (
                <div className="text-sm text-green-600 mt-1">
                    Selected: {hospitals.find(h => (h.id || h.hospitalId || h.HospitalId) === selectedHospitalId)?.name || selectedHospitalId}
                </div>
            )}
        </div>
    );
};

export default HospitalSelector;

