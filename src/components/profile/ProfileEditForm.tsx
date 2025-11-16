import { useState, useEffect } from 'react';
import { User, Mail, ChevronDownIcon, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Profile validation schema
const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phoneNumber: z.string().optional(),
    personalMail: z.string().email('Invalid email address').optional().or(z.literal('')),
    dateOfBirth: z.date().optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProfileFormData) => Promise<void>;
    user: {
        firstName: string;
        lastName: string;
        phoneNumber: string | null;
        personalMail?: string | null;
        dateOfBirth?: string | null;
    };
}

export default function ProfileEditForm({ isOpen, onClose, onSubmit, user }: ProfileEditFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    // Parse dateOfBirth string to Date object if it exists
    // Handle timezone properly - create date at midnight local time
    const parseDateOfBirth = (dateString: string | null | undefined): Date | undefined => {
        if (!dateString) return undefined;
        try {
            // Parse ISO string and extract date components
            // This handles dates stored as "YYYY-MM-DD" or ISO strings
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return undefined;
            // Create date using local date components to match what user selected
            // This ensures the displayed date matches the selected date
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        } catch {
            return undefined;
        }
    };

    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phoneNumber: user.phoneNumber || '',
            personalMail: user.personalMail || '',
            dateOfBirth: parseDateOfBirth(user.dateOfBirth),
        }
    });

    // Reset form values when dialog opens or user data changes
    useEffect(() => {
        if (isOpen) {
            profileForm.reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phoneNumber: user.phoneNumber || '',
                personalMail: user.personalMail || '',
                dateOfBirth: parseDateOfBirth(user.dateOfBirth),
            });
            setDatePickerOpen(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, user.firstName, user.lastName, user.phoneNumber, user.personalMail, user.dateOfBirth]);

    const handleClose = () => {
        profileForm.reset({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phoneNumber: user.phoneNumber || '',
            personalMail: user.personalMail || '',
            dateOfBirth: parseDateOfBirth(user.dateOfBirth),
        });
        setDatePickerOpen(false);
        onClose();
    };

    const handleSubmit = async (data: ProfileFormData) => {
        setIsSubmitting(true);
        try {
            // Ensure date is properly formatted (normalize to midnight local time)
            let dateOfBirth: Date | undefined = undefined;
            if (data.dateOfBirth) {
                const date = new Date(data.dateOfBirth);
                // Normalize to midnight local time using date components
                // This ensures the date stays consistent regardless of timezone
                dateOfBirth = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            }

            // Convert empty strings and null to undefined for optional fields
            const submitData: ProfileFormData = {
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber?.trim() || undefined,
                personalMail: data.personalMail?.trim() || undefined,
                dateOfBirth: dateOfBirth,
            };
            await onSubmit(submitData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
                        <User className="h-6 w-6 text-primary" />
                        Edit Profile Information
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Update your personal information and contact details
                    </DialogDescription>
                </DialogHeader>

                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* First Name */}
                            <FormField
                                control={profileForm.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            First Name <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    {...field}
                                                    className="pl-10"
                                                    placeholder="Enter first name"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Last Name */}
                            <FormField
                                control={profileForm.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Last Name <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    {...field}
                                                    className="pl-10"
                                                    placeholder="Enter last name"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Phone Number */}
                            <FormField
                                control={profileForm.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    {...field}
                                                    type="tel"
                                                    className="pl-10"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Personal Mail */}
                            <FormField
                                control={profileForm.control}
                                name="personalMail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Personal Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    className="pl-10"
                                                    placeholder="Enter personal email"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Date of Birth */}
                            <FormField
                                control={profileForm.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col md:col-span-2">
                                        <FormLabel htmlFor="dateOfBirth" className="px-1">
                                            Date of Birth
                                        </FormLabel>
                                        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        id="dateOfBirth"
                                                        className="w-full justify-between font-normal"
                                                    >
                                                        {field.value ? field.value.toLocaleDateString() : "Select date"}
                                                        <ChevronDownIcon />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value || undefined}
                                                    captionLayout="dropdown"
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            // Use the date directly from calendar, but normalize to midnight local time
                                                            // to avoid timezone shifts when converting to ISO string
                                                            const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                                            field.onChange(selectedDate);
                                                            setDatePickerOpen(false);
                                                        } else {
                                                            field.onChange(undefined);
                                                        }
                                                    }}
                                                    disabled={(date) => {
                                                        const today = new Date();
                                                        today.setHours(23, 59, 59, 999);
                                                        return date > today || date < new Date("1900-01-01");
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="border-border text-foreground hover:bg-primary"
                                disabled={isSubmitting}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

