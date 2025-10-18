import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useState, useEffect } from 'react';
import { useEcho } from '@laravel/echo-react';
import { usePage } from '@inertiajs/react';

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

    // const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = useState<string>('all');  // Fixed: Added closing single quote

    // Updated technicianInfo to use dynamic name from auth.user
    const technicianInfo: TechnicianInfo = {
        name: auth.user?.name || 'Unknown Technician',
        id: auth.user?.id ? auth.user.id.toString() : 'Unknown ID',
        shift: '9:00 AM - 6:00 PM'
    };

    const handleFetchedServices = async () => {
        try {
            // setLoading(true);
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

    // Mock data - replace with actual API call
    useEffect(() => {

        handleFetchedServices()
        .then(data => {
            const transformedData = transformServiceData(data);
            setServices(transformedData);
        })
        .catch(err => console.error(err));

        echo.channel('services')
            .listen('.services.retrieve', (event: any) => {
                const newServices = event.services || [event]; // Adjust based on your event structure
                const transformedNewServices = transformServiceData(newServices);
                
                // Update state with new services (you might want to merge or replace)
                setServices(prev => [...prev, ...transformedNewServices]);
            });

        return () => {
            echo.leaveChannel('services');
        };
    }, [echo]);

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
                },
                device: {
                    name: service.appointment_item_name,
                    warranty: service.warranty,
                    warrantyStatus: service.warranty_status
                },
                issue: service.appointment_description
            }));
    }

    // console.log("Appointments: ", appointments);

    const filteredServices = services.filter(appointment => {
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

    const getCustomerTypeBadge = (type: string) => {
        const typeClasses = {
            'Premium': 'bg-purple-100 text-purple-800',
            'VIP': 'bg-yellow-100 text-yellow-800',
            'Standard': 'bg-gray-100 text-gray-800'
        };

        return `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeClasses[type as keyof typeof typeClasses]}`;
    };

    const getWarrantyStatus = (status: string) => {
        const statusClasses = {
            'valid': 'text-green-600',
            'expired': 'text-red-600',
            'void': 'text-gray-500'
        };

        return statusClasses[status as keyof typeof statusClasses] || 'text-gray-500';
    };

    return (<>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Appointments" />
            <div className="flex h-full flex-1 flex-col gap-[1px] rounded-xl p-4 overflow-x-auto">

                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow mb-4">
                    <div className="flex justify-between items-start">
                        <div>
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
                            <p className="text-gray-600 mt-1">Assigned to {technicianInfo.name}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Shift: {technicianInfo.shift}</div>
                            <div className="text-sm text-gray-500">ID: {technicianInfo.id}</div>
                        </div>
                    </div>
                </div>


                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow mb-4">
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
                </div>

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
                                                    <div className="flex items-center">
                                                        <span className="font-medium">{appointment.customer.name}</span>
                                                        {/* <span className={getCustomerTypeBadge(appointment.customer.type)}> */}
                                                        {/*     {appointment.customer.type} */}
                                                        {/* </span> */}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Phone:</span>
                                                    <span className="font-medium">{appointment.customer.phone}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Email:</span>
                                                    <span className="font-medium">{appointment.customer.email}</span>
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
                                                        {appointment.device.warranty}
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

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-6">
                                        {/* {appointment.status === 'Pending' && ( */}
                                        {/*     <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"> */}
                                        {/*         Start Job */}
                                        {/*     </button> */}
                                        {/* )} */}
                                        {/* {appointment.status === 'In Progress' && ( */}
                                        {/*     <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"> */}
                                        {/*         Update Status */}
                                        {/*     </button> */}
                                        {/* )} */}
                                        {/* <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"> */}
                                        {/*     View History */}
                                        {/* </button> */}
                                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                                            Contact Customer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </AppLayout>
    </>);
}
