import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useEcho } from '@laravel/echo-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Billings',
        href: '#',
    },
];
import { useState, useEffect } from 'react';

const apiBase = `${window.location.protocol}//${window.location.hostname}:8000`;

export default function ManageBillings() {
    // Initialization
    const echo = useEcho();
    const [billings, setBillings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [fetchedAppointments, setFetchedAppointments] = useState<any[]>([]);

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
                data.filter(appointment => appointment.price && appointment.price !== 'null')
                    .map(appointment => ({
                        id: appointment.id,
                        service: `${appointment.item} - ${appointment.service_type}`,
                        customer: appointment.client_name,
                        status: appointment.status,
                        amount: parseInt(appointment.price),
                        date: '2024-08-25',
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
                        .filter(appointment => appointment.price && appointment.price !== 'null')
                        .map(appointment => ({
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
    const filteredBillings = billings.filter(billing => {
        const matchesSearch = billing.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            billing.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            billing.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || billing.status.toLowerCase().replace(' ', '') === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const statusClasses = {
            'completed': 'bg-green-100 text-green-800',
            'in-progress': 'bg-yellow-100 text-yellow-800',
            // 'Waiting Part': 'bg-red-100 text-red-800'
        };

        return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
    };

    return (<>
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
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
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
                                                <button className="text-blue-600 hover:text-blue-900 text-sm mr-3">
                                                    View
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
        </AppLayout>
    </>);
}
