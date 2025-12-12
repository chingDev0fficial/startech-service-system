import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useState, useEffect } from 'react';
import { useEcho } from '@laravel/echo-react';
import { usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Appointments',
        href: '#',
    },
];

const apiBase = `${window.location.protocol}//${window.location.hostname}:8000`;

interface Service {
    id: number;
    appointment_id: number;
    user_id: number;
    warranty: string;
    warrantyStatus: string;
    appointment_date: string;
    appointment_time: string;
    appointment_issue: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    client_address: string
    service_created_at: string;
    service_status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    appointment_service_type: string;
    appointment_service_location: string;
    appointment_item_name: string;
    appointment_description: string;
    warranty_status: 'valid' | 'expired' | null;
}

interface Appointment {
    id: string;
    time: string;
    serviceType: string;
    location: string;
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    customer: {
        name: string;
        phone: string;
        email: string;
        address: string
    };
    device: {
        name: string;
        warranty: string;
        warrantyStatus: 'valid' | 'expired' | null;
    };
    notes: string;
}

interface TechnicianInfo {
    name: string;
    id: string;
    shift: string;
}

export default function TechnicianAppointments() {
    // Initialization
    const echo = useEcho();

    const { auth } = usePage<SharedData>().props;
    const currentUserId = auth.user?.id;

    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    // Initialize as 'available' by default to prevent uncontrolled to controlled warning
    const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'unavailable'>('available');
    const [updatingAvailability, setUpdatingAvailability] = useState<boolean>(false);
    const [scheduledUnavailableDate, setScheduledUnavailableDate] = useState<string>('');
    const [savingSchedule, setSavingSchedule] = useState<boolean>(false);
    
    const [technicianInfo] = useState<TechnicianInfo>({
        name: auth.user?.name || 'Technician Name',
        id: 'TECH001',
        shift: '9:00 AM - 6:00 PM'
    });
    
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const now = new Date();
        const philippinesDate = new Date(now.getTime() + (8 * 60 * 60 * 1000));
        return philippinesDate.toISOString().split('T')[0];
    });

    // Fetch current availability status on mount
    useEffect(() => {
        fetchAvailabilityStatus();
    }, []);

    const fetchAvailabilityStatus = async () => {
        try {
            const response = await fetch(route('my-appointments.availability.status'), {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    // Added: Include CSRF token for POST request
                    // "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // Handle different possible response structures
            let status = null;
            
            if (result.status) {
                status = result.status;
            } else if (result.data && result.data.status) {
                status = result.data.status;
            } else if (result.availability_status) {
                status = result.availability_status;
            } else if (typeof result === 'string') {
                status = result;
            }
            
            // Ensure status is either 'available' or 'unavailable'
            if (status === 'available' || status === 'unavailable') {
                setAvailabilityStatus(status);
            } else {
                console.warn('Unexpected status format:', result);
                // Fallback to available if status format is unexpected
                setAvailabilityStatus('available');
            }

            // Get scheduled unavailable date if exists
            if (result.scheduled_unavailable_date) {
                setScheduledUnavailableDate(result.scheduled_unavailable_date);
            } else if (result.data && result.data.scheduled_unavailable_date) {
                setScheduledUnavailableDate(result.data.scheduled_unavailable_date);
            } else {
                setScheduledUnavailableDate('');
            }
        } catch (err) {
            console.error('Error fetching availability status:', err);
            // Fallback to available on error
            setAvailabilityStatus('available');
        }
    };

    const handleAvailabilityChange = async (newStatus: 'available' | 'unavailable') => {
        setUpdatingAvailability(true);
        
        try {
            const response = await fetch(route('my-appointments.availability.update'), {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    status: newStatus
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                setAvailabilityStatus(newStatus);
            } else {
                throw new Error(result.message || 'Failed to update availability');
            }
        } catch (err) {
            console.error('Error updating availability:', err);
            await fetchAvailabilityStatus();
            alert('Failed to update availability status. Please try again.');
        } finally {
            setUpdatingAvailability(false);
        }
    };

    const handleScheduleUnavailable = async () => {
        if (!scheduledUnavailableDate) {
            // Clear the schedule if date is empty
            await handleClearSchedule();
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(scheduledUnavailableDate);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate <= today) {
            alert('Please select a future date');
            return;
        }

        setSavingSchedule(true);
        
        try {
            const response = await fetch(route('my-appointments.availability.update'), {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    scheduled_unavailable_date: scheduledUnavailableDate
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                alert('Schedule saved! Your account will automatically become unavailable on ' + 
                    new Date(scheduledUnavailableDate).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }));
            } else {
                throw new Error(result.message || 'Failed to schedule unavailability');
            }
        } catch (err) {
            console.error('Error scheduling unavailability:', err);
            alert('Failed to save schedule. Please try again.');
        } finally {
            setSavingSchedule(false);
        }
    };

    const handleClearSchedule = async () => {
        setSavingSchedule(true);
        
        try {
            const response = await fetch(route('my-appointments.availability.update'), {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    scheduled_unavailable_date: null
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                setScheduledUnavailableDate('');
                alert('Schedule cleared successfully!');
            } else {
                throw new Error(result.message || 'Failed to clear schedule');
            }
        } catch (err) {
            console.error('Error clearing schedule:', err);
            alert('Failed to clear schedule. Please try again.');
        } finally {
            setSavingSchedule(false);
        }
    };

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const handleFetchedServices = async () => {
        try {
            const response = await fetch(route('my-appointments.fetch'), {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.retrieved;

        } catch (err) {
            console.error('Error fetching users:', err);
            throw err instanceof Error ? err : new Error(String(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        handleFetchedServices()
        .then(data => {
            const transformedData = transformServiceData(data);
            setServices(transformedData);
        })
        .catch(err => console.error(err));

        echo.channel('services')
            .listen('.services.retrieve', (event: any) => {
                const newServices = event.services || [event];
                const transformedNewServices = transformServiceData(newServices);
                
                setServices(prev => [...prev, ...transformedNewServices]);
            });

        return () => {
            echo.leaveChannel('services');
        };
    }, [echo, selectedDate]);

    const transformServiceData = (services: any[]) => {
        return services
            .filter((service: Service) => {
                if (!service.service_created_at) return false;
                
                const createdDate = new Date(service.service_created_at);
                const formattedCreatedDate = new Date(createdDate.getTime() - createdDate.getTimezoneOffset() * 60000)
                    .toISOString()
                    .split('T')[0];

                return service.user_id === currentUserId && formattedCreatedDate === selectedDate;
            })
            .map((service: Service) => ({
                id: service.id.toString(),
                time: service.appointment_date,
                serviceType: service.appointment_service_type,
                location: service.appointment_service_location,
                status: service.service_status,
                customer: {
                    name: service.client_name,
                    phone: service.client_phone,
                    email: service.client_email,
                    address: service.client_address
                },
                device: {
                    name: service.appointment_item_name,
                    warranty: service.warranty,
                    warrantyStatus: service.warranty_status
                },
                issue: service.appointment_description
            }));
    }



    const filteredServices = services.filter(appointment => {
        // Exclude completed appointments from display
        if (appointment.status === 'completed') {
            return false;
        }
        return statusFilter === 'all' || appointment.status.toLowerCase().replace(' ', '') === statusFilter;
    });

    const getStatusBadge = (status: string) => {
        const statusClasses = {
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
            'completed': 'bg-green-100 text-green-800 border-green-200',
            'cancelled': 'bg-red-100 text-red-800 border-red-200'
        };

        return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800 border-gray-200'}`;
    };

    const getWarrantyStatus = (status: string) => {
        const statusClasses = {
            'valid': 'text-green-600',
            'expired': 'text-red-600',
            'void': 'text-gray-500'
        };

        return statusClasses[status as keyof typeof statusClasses] || 'text-gray-500';
    };

    // Added: Show loading state while fetching availability status
    const isLoadingStatus = availabilityStatus === null;

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="My Appointments" />
            <div className="flex h-full flex-1 flex-col gap-[1px] rounded-xl p-4 overflow-x-auto">

                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow mb-4">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                    My Appointments
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                My Appointments - {new Date(selectedDate).toLocaleDateString('en-PH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </h1>
                            <div className='flex justify-between items-center mt-2'>
                                <p className="text-gray-600">Assigned to {technicianInfo.name}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600">Status:</span>
                                    {availabilityStatus === null ? (
                                        <div className="flex items-center gap-2 px-4 py-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                            <span className="text-sm text-gray-500">Loading...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <select 
                                                name="technician_status" 
                                                value={availabilityStatus}
                                                onChange={(e) => handleAvailabilityChange(e.target.value as 'available' | 'unavailable')}
                                                disabled={updatingAvailability}
                                                className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                                                    availabilityStatus === 'available' 
                                                        ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100' 
                                                        : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                                                } ${updatingAvailability ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <option value="available">✓ Available</option>
                                                <option value="unavailable">✗ Unavailable</option>
                                            </select>
                                            {updatingAvailability && (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Shift: {technicianInfo.shift}</div>
                            <div className="text-sm text-gray-500">ID: {technicianInfo.id}</div>
                        </div>
                    </div>
                    
                    {/* Schedule Unavailability Section */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Schedule Auto-Unavailability</h3>
                        <p className="text-xs text-gray-600 mb-3">
                            Set a future date when your account should automatically become unavailable.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <input
                                    type="date"
                                    value={scheduledUnavailableDate}
                                    onChange={(e) => setScheduledUnavailableDate(e.target.value)}
                                    min={getMinDate()}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Select date"
                                />
                            </div>
                            <button
                                onClick={handleScheduleUnavailable}
                                disabled={savingSchedule}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                            >
                                {savingSchedule ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Schedule'
                                )}
                            </button>
                            {scheduledUnavailableDate && (
                                <button
                                    onClick={handleClearSchedule}
                                    disabled={savingSchedule}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        {scheduledUnavailableDate && (
                            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-amber-700">
                                    Scheduled: Your account will automatically become <strong>unavailable</strong> on <strong>{new Date(scheduledUnavailableDate).toLocaleDateString('en-PH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</strong>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Availability Warning Banner */}
                {availabilityStatus === 'unavailable' && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    You are currently marked as <strong>Unavailable</strong>. You will not receive new appointment assignments.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                {/* <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <div className="flex gap-4 items-center">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="inprogress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex-1"></div>
                        <div className="text-sm text-gray-500">
                            {filteredServices.length} appointments
                        </div>
                    </div>
                </div> */}

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-gray-900">{services.length}</div>
                        <div className="text-sm text-gray-500">Total Today</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {services.filter(a => a.status === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-500">Pending</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {services.filter(a => a.status === 'in-progress').length}
                        </div>
                        <div className="text-sm text-gray-500">In Progress</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {services.filter(a => a.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-500">Completed</div>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="bg-white p-8 rounded-lg shadow text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-2">Loading appointments...</p>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow text-center">
                            <p className="text-gray-500">No appointments found for the selected criteria.</p>
                        </div>
                    ) : (
                        filteredServices.map((appointment) => (
                            <div key={appointment.id} className="bg-white rounded-lg shadow overflow-hidden">
                                {/* Appointment Header */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                <span className="font-semibold text-lg">
                                                    {appointment.time} - {appointment.serviceType}
                                                </span>
                                            </div>
                                            <span className="text-blue-600 text-sm">📍 {appointment.location}</span>
                                        </div>
                                        <span className={getStatusBadge(appointment.status)}>
                                            {appointment.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Appointment Content */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Customer Information */}
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Name:</span>
                                                    <span className="font-medium">{appointment.customer.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Phone:</span>
                                                    <span className="font-medium">{appointment.customer.phone}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Email:</span>
                                                    <span className="font-medium">{appointment.customer.email}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Address:</span>
                                                    <span className="font-medium">{appointment.customer.address}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Device & Issue */}
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-3">Device & Issue</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Device:</span>
                                                    <span className="font-medium">{appointment.device.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Warranty:</span>
                                                    <span className={`font-medium ${getWarrantyStatus(appointment.device.warrantyStatus)}`}>
                                                        {appointment.device.warrantyStatus == "valid" ? "Warranty" : appointment.device.warrantyStatus == "expired" ? "No Warranty" : null}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Notes */}
                                    <div className="mt-6">
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Customer Notes</h3>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-800 italic">
                                                "{appointment.issue}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Transfer Button
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={() => handleTransferAppointment(parseInt(appointment.id))}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                                            </svg>
                                            Transfer Appointment
                                        </button>
                                    </div> */}
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
            </AppLayout>
        </>
    );
}