import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Appointments',
        href: '#',
    },
];


interface Appointment {
  id: string;
  time: string;
  serviceType: string;
  location: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  customer: {
    name: string;
    phone: string;
    email: string;
    type: 'Premium' | 'Standard' | 'VIP';
  };
  device: {
    name: string;
    serial: string;
    issue: string;
    warranty: string;
    warrantyStatus: 'Valid' | 'Expired' | 'Void';
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
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [technicianInfo] = useState<TechnicianInfo>({
        name: 'Mike Rodriguez',
        id: 'TECH001',
        shift: '9:00 AM - 6:00 PM'
    });

    const breadcrumbs = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'My Appointments', href: '/appointments' }
    ];

    // Mock data - replace with actual API call
    useEffect(() => {
        const mockAppointments: Appointment[] = [
            {
                id: 'APPT-2024-001',
                time: '9:00 AM',
                serviceType: 'In-Store Service',
                location: 'Service Center',
                status: 'Pending',
                customer: {
                    name: 'John Smith',
                    phone: '(555) 123-4567',
                    email: 'john.smith@email.com',
                    type: 'Premium'
                },
                device: {
                    name: 'MacBook Pro 2021',
                    serial: 'MBP2021-ABC123',
                    issue: 'Screen flickering',
                    warranty: 'Valid until Jan 15, 2025',
                    warrantyStatus: 'Valid'
                },
                notes: 'Screen started flickering yesterday during video calls. Issue seems to worsen when laptop gets warm.'
            },
            {
                id: 'APPT-2024-002',
                time: '',
                serviceType: 'On-Site Service',
                location: 'Customer Location',
                status: 'In Progress',
                customer: {
                    name: 'Sarah Johnson',
                    phone: '(555) 987-6543',
                    email: 'sarah.j@company.com',
                    type: 'VIP'
                },
                device: {
                    name: 'Dell XPS 15',
                    serial: 'DXP2023-DEF456',
                    issue: 'Won\'t boot up',
                    warranty: 'Expired on Oct 20, 2024',
                    warrantyStatus: 'Expired'
                },
                notes: 'Computer suddenly shut down and won\'t turn back on. Customer mentioned power issues in the building recently.'
            },
            {
                id: 'APPT-2024-003',
                time: '1:00 PM',
                serviceType: 'Remote Support',
                location: 'Remote',
                status: 'Pending',
                customer: {
                    name: 'Michael Chen',
                    phone: '(555) 456-7890',
                    email: 'mchen@startup.io',
                    type: 'Standard'
                },
                device: {
                    name: 'iPhone 14 Pro',
                    serial: 'IP14P-GHI789',
                    issue: 'Battery draining quickly',
                    warranty: 'Valid until Mar 10, 2025',
                    warrantyStatus: 'Valid'
                },
                notes: 'Battery percentage drops rapidly even with minimal usage. Phone gets warm during charging.'
            },
            {
                id: 'APPT-2024-004',
                time: '3:30 PM',
                serviceType: 'In-Store Service',
                location: 'Service Center',
                status: 'Completed',
                customer: {
                    name: 'Lisa Brown',
                    phone: '(555) 321-0987',
                    email: 'lisa.brown@email.com',
                    type: 'Premium'
                },
                device: {
                    name: 'iPad Air 5th Gen',
                    serial: 'IPA5-JKL012',
                    issue: 'Charging port not working',
                    warranty: 'Valid until Dec 30, 2024',
                    warrantyStatus: 'Valid'
                },
                notes: 'Charging cable doesn\'t stay connected properly. Customer has tried multiple cables.'
            }
        ];

        setTimeout(() => {
            setAppointments(mockAppointments);
            setLoading(false);
        }, 1000);
    }, [selectedDate]);

    const filteredAppointments = appointments.filter(appointment => {
        return statusFilter === 'all' || appointment.status.toLowerCase().replace(' ', '') === statusFilter;
    });

    const getStatusBadge = (status: string) => {
        const statusClasses = {
            'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
            'Completed': 'bg-green-100 text-green-800 border-green-200',
            'Cancelled': 'bg-red-100 text-red-800 border-red-200'
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
            'Valid': 'text-green-600',
            'Expired': 'text-red-600',
            'Void': 'text-gray-500'
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
                                My Appointments - {new Date(selectedDate).toLocaleDateString('en-US', { 
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
                            {filteredAppointments.length} appointments
                        </div>
                    </div>
                </div>

{/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
                        <div className="text-sm text-gray-500">Total Today</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {appointments.filter(a => a.status === 'Pending').length}
                        </div>
                        <div className="text-sm text-gray-500">Pending</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {appointments.filter(a => a.status === 'In Progress').length}
                        </div>
                        <div className="text-sm text-gray-500">In Progress</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {appointments.filter(a => a.status === 'Completed').length}
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
                    ) : filteredAppointments.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow text-center">
                            <p className="text-gray-500">No appointments found for the selected criteria.</p>
                        </div>
                    ) : (
                        filteredAppointments.map((appointment) => (
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
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{appointment.customer.name}</span>
                                                        <span className={getCustomerTypeBadge(appointment.customer.type)}>
                                                            {appointment.customer.type}
                                                        </span>
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
                                                    <span className="text-gray-600">Serial:</span>
                                                    <span className="font-medium font-mono text-xs">{appointment.device.serial}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Issue:</span>
                                                    <span className="font-medium">{appointment.device.issue}</span>
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
                                                "{appointment.notes}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-6">
                                        {appointment.status === 'Pending' && (
                                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                                Start Job
                                            </button>
                                        )}
                                        {appointment.status === 'In Progress' && (
                                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                                Update Status
                                            </button>
                                        )}
                                        <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                            View History
                                        </button>
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