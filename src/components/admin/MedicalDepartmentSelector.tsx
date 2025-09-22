import React from 'react';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';

// Medical department options for technicians
const MEDICAL_DEPARTMENTS = [
    'Radiology',
    'Laboratory',
    'Biomedical Engineering',
    'Cardiology',
    'Respiratory Therapy',
    'Emergency Department',
    'Operating Room',
    'ICU/Critical Care',
    'Blood Bank',
    'Equipment Maintenance'
];

interface MedicalDepartmentSelectorProps {
    selectedDepartment: string;
    onDepartmentChange: (department: string) => void;
}

const MedicalDepartmentSelector: React.FC<MedicalDepartmentSelectorProps> = ({
    selectedDepartment,
    onDepartmentChange
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-2">
            <Label>{t('medicalDepartment')} *</Label>
            <select
                value={selectedDepartment || ""}
                onChange={(e) => {
                    console.log('Medical department selected:', e.target.value);
                    onDepartmentChange(e.target.value);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-blue-800 hover:text-white transition-colors duration-200"
            >
                <option value="">{t('selectMedicalDepartment')}</option>
                {MEDICAL_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                        {dept}
                    </option>
                ))}
            </select>

            {/* Debug display */}
            <div className="text-sm text-gray-600 mt-1">
                Current department: {selectedDepartment || 'None'}
            </div>
            {selectedDepartment && (
                <div className="text-sm text-green-600 mt-1">
                    Selected: {selectedDepartment}
                </div>
            )}
        </div>
    );
};

export default MedicalDepartmentSelector;

