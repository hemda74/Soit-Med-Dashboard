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
                    onHospitalSelect(e.target.value);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>
    );
};

export default HospitalSelector;

