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
                    onDepartmentChange(e.target.value);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="">{t('selectMedicalDepartment')}</option>
                {MEDICAL_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                        {dept}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default MedicalDepartmentSelector;

