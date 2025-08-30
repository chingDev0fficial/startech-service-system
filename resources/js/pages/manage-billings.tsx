import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';



const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Billings',
        href: '#',
    },
];
import { useState, useEffect } from 'react';

export default function ManageBillings() {
    // Initialization
    const [billings, setBillings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const breadcrumbs = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Manage Billings', href: '/billings' }
    ];

    // Mock data - replace with actual API call
    useEffect(() => {
        const mockBillings = [
            {
                id: 'SR-2024-0156',
                service: 'iPhone 14 Pro - Screen Replacement',
                customer: 'Sarah Johnson',
                status: 'In Progress',
                amount: 299.99,
                date: '2024-08-25',
                
            },
            {
                id: 'SR-2024-0157',
                service: 'MacBook Pro - Deep Clean',
                customer: 'John Doe',
                status: 'Completed',
                amount: 149.99,
                date: '2024-08-20',
                
            },
            {
                id: 'SR-2024-0158',
                service: 'Dell XPS - System Tune-up',
                customer: 'Jane Smith',
                status: 'Waiting Part',
                amount: 89.99,
                date: '2024-08-22',
                
            },
            {
                id: 'SR-2024-0159',
                service: 'HP Laptop - OS Installation',
                customer: 'Bob Wilson',
                status: 'In Progress',
                amount: 129.99,
                date: '2024-08-23',
                
            },
            {
                id: 'SR-2024-0160',
                service: 'Samsung Galaxy - Battery Replace',
                customer: 'Alice Brown',
                status: 'Completed',
                amount: 79.99,
                date: '2024-08-18',
                
            },
            {
                id: 'SR-2024-0161',
                service: 'iPad Air - Charging Port Fix',
                customer: 'Chris Davis',
                status: 'In Progress',
                amount: 199.99,
                date: '2024-08-24',
                
            }
        ];

        setTimeout(() => {
            setBillings(mockBillings);
            setLoading(false);
        }, 1000);
    }, []);

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
            'Completed': 'bg-green-100 text-green-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Waiting Part': 'bg-red-100 text-red-800'
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
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border rounded-md"
                        >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="inprogress">In Progress</option>
                            <option value="waitingpart">Waiting Part</option>
                        </select>
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

                {/* Summary */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold">{billings.length}</div>
                        <div className="text-sm text-gray-500">Total</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-green-600">
                            ₱{billings.filter(b => b.status === 'Completed').reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Completed</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            ₱{billings.filter(b => b.status === 'In Progress').reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Pending</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            ₱{billings.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Total Revenue</div>
                    </div>
                </div>

            </div>
        </AppLayout>
    </>);
}