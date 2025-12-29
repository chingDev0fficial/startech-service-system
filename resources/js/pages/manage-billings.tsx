import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useEcho } from '@laravel/echo-react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Billings',
        href: '#',
    },
];
import { useState, useEffect } from 'react';

const apiBase = `${window.location.protocol}//${window.location.hostname}:8000`;

interface Billing {
    id: string;
    service: string;
    item: string;
    serviceType: string;
    serviceLocation: string;
    customer: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    status: string;
    amount: number;
    description: string;
    scheduleAt: string;
    createdAt: string;
    updatedAt: string;
    date: string;
}

export default function ManageBillings() {
    // Initialization
    const echo = useEcho();
    const [billings, setBillings] = useState<Billing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [fetchedAppointments, setFetchedAppointments] = useState<any[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedBilling, setSelectedBilling] = useState<any>(null);

    const handleFetchedAppointments = async () => {
        try {
            const response = await fetch(`${apiBase}/manage-appointments/fetch`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();

            return result.retrieved;

        } catch ( err ) {
            throw err instanceof Error ? err : new Error(String(err));
        }
    }

    useEffect(() => {
        handleFetchedAppointments()
            .then(data => setFetchedAppointments(
                data.filter((appointment: any) => appointment.price && appointment.price !== 'null')
                    .map((appointment: any) => ({
                        id: appointment.id,
                        service: `${appointment.item} - ${appointment.service_type}`,
                        item: appointment.item,
                        serviceType: appointment.service_type,
                        serviceLocation: appointment.service_location,
                        customer: appointment.client_name,
                        customerEmail: appointment.client_email,
                        customerPhone: appointment.phone_number,
                        address: appointment.address,
                        status: appointment.status,
                        amount: parseInt(appointment.price),
                        description: appointment.description,
                        scheduleAt: appointment.schedule_at,
                        createdAt: appointment.created_at,
                        updatedAt: appointment.updated_at,
                        date: new Date(appointment.schedule_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }),
                    }))

            ))
            .catch(err => {
                console.error('Failed to fetch appointments:', err);
            });

        if (echo) {
            echo.channel('appointments')
                .listen('.appointments.retrieve', (event: any) => {
                    setFetchedAppointments(prev =>
                    prev
                        .filter((appointment: any) => appointment.price && appointment.price !== 'null')
                        .map((appointment: any) => ({
                            id: appointment.id,
                            service: `${appointment.item} - ${appointment.service_type}`,
                            customer: appointment.client_name,
                            status: appointment.status,
                            amount: parseInt(appointment.price),
                            date: '2024-08-25',
                        }))
                    );
            });
        }

        setBillings(fetchedAppointments);
        setLoading(false);

        // Cleanup listener on unmount
        return () => {
            if (echo) {
                echo.channel('appointments').stopListening('.appointments.retrieve');
            }
        };
    }, [echo]);

    // Filter billings
    const filteredBillings = billings
        .filter(billing => {
            const matchesSearch = billing.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                billing.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                billing.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || billing.status.toLowerCase().replace(' ', '') === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleViewBilling = (billing: any) => {
        setSelectedBilling(billing);
        setIsViewModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsViewModalOpen(false);
        setSelectedBilling(null);
    };

    const getStatusBadge = (status: string) => {
        const statusClasses: Record<string, string> = {
            'completed': 'bg-green-100 text-green-800',
            'in-progress': 'bg-yellow-100 text-yellow-800',
            // 'Waiting Part': 'bg-red-100 text-red-800'
        };

        return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
    };

    return (<>
        {/* View Details Modal */}
        <Modal
            open={isViewModalOpen}
            onClose={handleCloseModal}
            aria-labelledby="billing-details-modal"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', sm: '85%', md: 700 },
                maxWidth: '700px',
                maxHeight: { xs: '95vh', sm: '90vh', md: '100vh' },
                bgcolor: 'background.paper',
                boxShadow: 24,
                borderRadius: 2,
                overflow: 'hidden'
            }}>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 flex justify-between items-center">
                    <Typography variant="h5" component="h2" className="text-white font-bold text-base sm:text-xl">
                        Billing Details
                    </Typography>
                    <button
                        onClick={handleCloseModal}
                        className="text-white hover:bg-blue-800 rounded-full p-1 sm:p-2 transition-colors"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {selectedBilling && (
                    <div className="p-3 sm:p-4 md:p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 60px)' }}>
                        {/* Billing ID and Status */}
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Billing ID</p>
                                    <p className="text-base sm:text-lg font-bold text-gray-900">#{selectedBilling.id}</p>
                                </div>
                                <span className={getStatusBadge(selectedBilling.status)}>
                                    {selectedBilling.status}
                                </span>
                            </div>
                        </div>

                        {/* Service Information */}
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 pb-2 border-b flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                Service Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Item</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedBilling.item}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Service Type</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedBilling.serviceType}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Service Location</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedBilling.serviceLocation}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Scheduled Date</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedBilling.date}</p>
                                </div>
                            </div>
                            {selectedBilling.description && (
                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 mb-1">Description</p>
                                    <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">{selectedBilling.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Customer Information */}
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 pb-2 border-b flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                Customer Information
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500">Name</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedBilling.customer}</p>
                                </div>
                                {selectedBilling.customerEmail && (
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedBilling.customerEmail}</p>
                                    </div>
                                )}
                                {selectedBilling.customerPhone && (
                                    <div>
                                        <p className="text-xs text-gray-500">Phone</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedBilling.customerPhone}</p>
                                    </div>
                                )}
                                {selectedBilling.address && (
                                    <div>
                                        <p className="text-xs text-gray-500">Address</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedBilling.address}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 pb-2 border-b flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                                Payment Information
                            </h3>
                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 sm:p-4 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                                <p className="text-2xl sm:text-3xl font-bold text-green-700">₱{selectedBilling.amount.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 pb-2 border-b flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                                Timeline
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Created:</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(selectedBilling.createdAt).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Last Updated:</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(selectedBilling.updatedAt).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Close Button */}
                        {/* <div className="mt-6 pt-4 border-t flex justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div> */}
                    </div>
                )}
            </Box>
        </Modal>

        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Billings" />
            <div className="flex h-full flex-1 flex-col gap-[1px] rounded-xl p-4 overflow-x-auto">

                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow mb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Manage Billings</h1>
                            <p className="text-gray-600 mt-1">Track and manage service billing requests</p>
                        </div>

                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold">{billings.length}</div>
                        <div className="text-sm text-gray-500">Total</div>
                    </div>
                    {/* <div className="bg-white p-4 rounded-lg shadow text-center"> */}
                    {/*     <div className="text-2xl font-bold text-green-600"> */}
                    {/*         ₱{billings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0).toFixed(2)} */}
                    {/*     </div> */}
                    {/*     <div className="text-sm text-gray-500">Completed</div> */}
                    {/* </div> */}
                    {/* <div className="bg-white p-4 rounded-lg shadow text-center"> */}
                    {/*     <div className="text-2xl font-bold text-yellow-600"> */}
                    {/*         ₱{billings.filter(b => b.status === 'in-progress').reduce((sum, b) => sum + b.amount, 0).toFixed(2)} */}
                    {/*     </div> */}
                    {/*     <div className="text-sm text-gray-500">In Progress</div> */}
                    {/* </div> */}
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            ₱{billings.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Total Revenue</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search by customer, service, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-3 py-2 border rounded-md"
                        />
                        {/* <select */}
                        {/*     value={statusFilter} */}
                        {/*     onChange={(e) => setStatusFilter(e.target.value)} */}
                        {/*     className="px-3 py-2 border rounded-md" */}
                        {/* > */}
                        {/*     <option value="all">All Status</option> */}
                        {/*     <option value="completed">Completed</option> */}
                        {/*     <option value="inprogress">In Progress</option> */}
                        {/*     <option value="waitingpart">Waiting Part</option> */}
                        {/* </select> */}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-2">Loading...</p>
                        </div>
                    ) : (
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Service Request
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredBillings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No billing records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBillings.map((billing) => (
                                        <tr key={billing.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {billing.service}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {billing.id}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {billing.customer}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={getStatusBadge(billing.status)}>
                                                    {billing.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                ₱{billing.amount.toFixed(2)}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleViewBilling(billing)}
                                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium hover:underline"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                    </div>
                </div>

            </div>
        </AppLayout>
    
    </>);
}
