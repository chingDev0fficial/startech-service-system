import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage History',
        href: '#',
    },
];

interface HistoryRecord {
  id: string;
  service: string;
  customer: string;
  serviceDate: string;
  completionDate: string | null;
  status: string;
  technician: string;
  amount: number;
  rating: number | null;
  serviceType: string;
}

interface SearchFilters {
  globalSearch: string;
  dateRange: { from: string; to: string };
  status: string[];
  serviceType: string;
  technician: string;
  amountRange: { min: number; max: number };
}

import { useState, useEffect } from 'react';

export default function ManageHistory() {
    // Initialization
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchFilters, setSearchFilters] = useState({
        globalSearch: '',
        dateRange: { from: '', to: '' },
        status: [],
        serviceType: '',
        technician: '',
        amountRange: { min: 0, max: 1000 }
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const breadcrumbs = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Service History', href: '/history' }
    ];


    useEffect(() => {
        const mockHistory = [
            {
                id: 'SR-2024-0145',
                service: 'iPhone 13 - Battery Replacement',
                customer: 'Mike Chen',
                serviceDate: '2024-08-10',
                completionDate: '2024-08-12',
                status: 'Completed',
                technician: 'Alex Rodriguez',
                amount: 129.99,
                rating: 5,
                serviceType: 'Battery Repair'
            },
            {
                id: 'SR-2024-0146',
                service: 'MacBook Air - Keyboard Fix',
                customer: 'Emily Davis',
                serviceDate: '2024-08-08',
                completionDate: '2024-08-15',
                status: 'Completed',
                technician: 'Sarah Kim',
                amount: 249.99,
                rating: 4,
                serviceType: 'Hardware Repair'
            },
            {
                id: 'SR-2024-0147',
                service: 'Samsung S23 - Screen Crack',
                customer: 'David Wilson',
                serviceDate: '2024-08-05',
                completionDate: null,
                status: 'Cancelled',
                technician: 'Mike Johnson',
                amount: 0,
                rating: null,
                serviceType: 'Screen Repair'
            },
            {
                id: 'SR-2024-0148',
                service: 'iPad Pro - Water Damage',
                customer: 'Lisa Thompson',
                serviceDate: '2024-07-28',
                completionDate: '2024-08-02',
                status: 'Completed',
                technician: 'Alex Rodriguez',
                amount: 399.99,
                rating: 5,
                serviceType: 'Water Damage'
            },
            {
                id: 'SR-2024-0149',
                service: 'HP Pavilion - Virus Removal',
                customer: 'Robert Garcia',
                serviceDate: '2024-07-25',
                completionDate: '2024-07-26',
                status: 'Completed',
                technician: 'Sarah Kim',
                amount: 89.99,
                rating: 2,
                serviceType: 'Software'
            },
            {
                id: 'SR-2024-0150',
                service: 'MacBook Pro - Logic Board',
                customer: 'Jennifer Lee',
                serviceDate: '2024-07-20',
                completionDate: '2024-07-30',
                status: 'Completed',
                technician: 'Mike Johnson',
                amount: 599.99,
                rating: 5,
                serviceType: 'Hardware Repair'
            }
        ];

        setTimeout(() => {
            setHistory(mockHistory);
            setLoading(false);
        }, 1000);
    }, []);

    
    // Advanced filtering logic
    const filteredHistory = history.filter(record => {
        // Global search
        const globalMatch = !searchFilters.globalSearch || 
            record.customer.toLowerCase().includes(searchFilters.globalSearch.toLowerCase()) ||
            record.service.toLowerCase().includes(searchFilters.globalSearch.toLowerCase()) ||
            record.id.toLowerCase().includes(searchFilters.globalSearch.toLowerCase()) ||
            record.technician.toLowerCase().includes(searchFilters.globalSearch.toLowerCase());

        // Date range filter
        const dateMatch = (!searchFilters.dateRange.from || new Date(record.serviceDate) >= new Date(searchFilters.dateRange.from)) &&
                         (!searchFilters.dateRange.to || new Date(record.serviceDate) <= new Date(searchFilters.dateRange.to));

        // Status filter
        const statusMatch = searchFilters.status.length === 0 || searchFilters.status.includes(record.status);

        // Service type filter
        const serviceTypeMatch = !searchFilters.serviceType || record.serviceType === searchFilters.serviceType;

        // Technician filter
        const technicianMatch = !searchFilters.technician || record.technician === searchFilters.technician;

        // Amount range filter
        const amountMatch = record.amount >= searchFilters.amountRange.min && record.amount <= searchFilters.amountRange.max;

        return globalMatch && dateMatch && statusMatch && serviceTypeMatch && technicianMatch && amountMatch;
    });

    const getStatusBadge = (status) => {
        const statusClasses = {
            'Completed': 'bg-green-100 text-green-800',
            'Cancelled': 'bg-red-100 text-red-800',
            'In Review': 'bg-blue-100 text-blue-800'
        };
        
        return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
    };

    const handleStatusToggle = (status) => {
        setSearchFilters(prev => ({
            ...prev,
            status: prev.status.includes(status) 
                ? prev.status.filter(s => s !== status)
                : [...prev.status, status]
        }));
    };

    const clearAllFilters = () => {
        setSearchFilters({
            globalSearch: '',
            dateRange: { from: '', to: '' },
            status: [],
            serviceType: '',
            technician: '',
            amountRange: { min: 0, max: 1000 }
        });
    };

    const activeFiltersCount = Object.values(searchFilters).filter(value => 
        value && (Array.isArray(value) ? value.length > 0 : value !== '' && value !== 0)
    ).length;

    return (<>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service History" />
            <div className="flex h-full flex-1 flex-col gap-[1px] rounded-xl p-4 overflow-x-auto">
                
                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow mb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Service History</h1>
                            <p className="text-gray-600 mt-1">Complete record of all service requests</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg relative"
                            >
                                Advanced Filters
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>
                            {/* <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                                Export Report
                            </button> */}
                        </div>
                    </div>
                </div>

{/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-gray-900">{history.length}</div>
                        <div className="text-sm text-gray-500">Total Services</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {history.filter(h => h.status === 'Completed').length}
                        </div>
                        <div className="text-sm text-gray-500">Completed</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            ₱{history.filter(h => h.status === 'Completed').reduce((sum, h) => sum + h.amount, 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Total Revenue</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {history.filter(h => h.rating).length > 0 
                                ? (history.filter(h => h.rating).reduce((sum, h) => sum + h.rating, 0) / history.filter(h => h.rating).length).toFixed(1)
                                : '0.0'
                            }
                        </div>
                        <div className="text-sm text-gray-500">Avg Rating</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {filteredHistory.length}
                        </div>
                        <div className="text-sm text-gray-500">Filtered Results</div>
                    </div>
                </div>

                {/* Quick Search */}
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by customer, service, ID, or technician..."
                                value={searchFilters.globalSearch}
                                onChange={(e) => setSearchFilters(prev => ({...prev, globalSearch: e.target.value}))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        {activeFiltersCount > 0 && (
                            <button 
                                onClick={clearAllFilters}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Clear All ({activeFiltersCount})
                            </button>
                        )}
                        <div className="text-sm text-gray-500">
                            {filteredHistory.length} results
                        </div>
                    </div>
                </div>

                {/* Advanced Filters Panel */}
                {showAdvancedFilters && (
                    <div className="bg-white p-6 rounded-lg shadow mb-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Filters</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Service Date Range</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={searchFilters.dateRange.from}
                                        onChange={(e) => setSearchFilters(prev => ({
                                            ...prev, 
                                            dateRange: {...prev.dateRange, from: e.target.value}
                                        }))}
                                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    />
                                    <input
                                        type="date"
                                        value={searchFilters.dateRange.to}
                                        onChange={(e) => setSearchFilters(prev => ({
                                            ...prev, 
                                            dateRange: {...prev.dateRange, to: e.target.value}
                                        }))}
                                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    />
                                </div>
                            </div>

                            {/* Service Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                                <select
                                    value={searchFilters.serviceType}
                                    onChange={(e) => setSearchFilters(prev => ({...prev, serviceType: e.target.value}))}
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                >
                                    <option value="">All Types</option>
                                    <option value="Screen Repair">Screen Repair</option>
                                    <option value="Battery Repair">Battery Repair</option>
                                    <option value="Hardware Repair">Hardware Repair</option>
                                    <option value="Software">Software</option>
                                    <option value="Water Damage">Water Damage</option>
                                </select>
                            </div>

                            {/* Technician */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Technician</label>
                                <select
                                    value={searchFilters.technician}
                                    onChange={(e) => setSearchFilters(prev => ({...prev, technician: e.target.value}))}
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                >
                                    <option value="">All Technicians</option>
                                    <option value="Alex Rodriguez">Alex Rodriguez</option>
                                    <option value="Sarah Kim">Sarah Kim</option>
                                    <option value="Mike Johnson">Mike Johnson</option>
                                </select>
                            </div>

                            {/* Status Multi-select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Completed', 'Cancelled', 'In Review'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusToggle(status)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                                searchFilters.status.includes(status)
                                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                            }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amount Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount Range: ₱{searchFilters.amountRange.min} - ₱{searchFilters.amountRange.max}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={searchFilters.amountRange.min}
                                        onChange={(e) => setSearchFilters(prev => ({
                                            ...prev, 
                                            amountRange: {...prev.amountRange, min: Number(e.target.value)}
                                        }))}
                                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={searchFilters.amountRange.max}
                                        onChange={(e) => setSearchFilters(prev => ({
                                            ...prev, 
                                            amountRange: {...prev.amountRange, max: Number(e.target.value)}
                                        }))}
                                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                            {searchFilters.globalSearch && (
                                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                                    Search: "{searchFilters.globalSearch}"
                                </span>
                            )}
                            {searchFilters.serviceType && (
                                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                                    Type: {searchFilters.serviceType}
                                </span>
                            )}
                            {searchFilters.technician && (
                                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                                    Tech: {searchFilters.technician}
                                </span>
                            )}
                            {searchFilters.status.map(status => (
                                <span key={status} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                                    {status}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-2">Loading history...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
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
                                            Technician
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Service Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Rating
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                                No service history found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredHistory.map((record) => (
                                            <tr key={record.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {record.service}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {record.id}
                                                        </div>
                                                        <div className="text-xs text-blue-600">
                                                            {record.serviceType}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {record.customer}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {record.technician}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(record.serviceDate).toLocaleDateString()}
                                                    </div>
                                                    {record.completionDate && (
                                                        <div className="text-xs text-gray-500">
                                                            Completed: {new Date(record.completionDate).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={getStatusBadge(record.status)}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    ₱{record.amount.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {record.rating ? (
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i} className={`text-sm ${i < record.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                                    ★
                                                                </span>
                                                            ))}
                                                            <span className="ml-1 text-xs text-gray-500">({record.rating})</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">No rating</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button className="text-blue-600 hover:text-blue-900 text-sm">
                                                            View
                                                        </button>
                                                        {/* {record.status === 'Completed' && (
                                                            <button className="text-green-600 hover:text-green-900 text-sm">
                                                                Invoice
                                                            </button>
                                                        )} */}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                

            </div>
        </AppLayout>
    </>);
}
