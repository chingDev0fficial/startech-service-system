import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useState, useEffect } from 'react';

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
    serviceLocation: string;
}

interface Jobs {
    amount: number;
    id: number;
    appointment_id: number;
    client_name: string;
    appointment_item_name: string;
    appointment_date: string;
    appointment_service_type: string;
    appointment_description: string;
    appointment_status: string;
    technician_name: string;
    user_id: number;
}

interface SearchFilters {
    globalSearch: string;
    dateRange: { from: string; to: string };
    status: string[];
    serviceType: string;
    technician: string;
    amountRange: { min: number; max: number };
}

export default function ManageHistory() {
    // Initialization
    const { auth } = usePage<SharedData>().props;
    const currentUserId = auth.user?.id;
    const echo = useEcho();

    const { props } = usePage();
    const serviceLocation = props.service_location || 'in-store';

    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        globalSearch: '',
        dateRange: { from: '', to: '' },
        status: [],
        serviceType: '',
        technician: '',
        amountRange: { min: 0, max: 1000 }
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [services, setServices] = useState<Jobs[]>([]);

    // Dynamic breadcrumbs based on service location
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: serviceLocation === 'in-store' ? 'In Store History' : 'Home Service History',
            href: '#',
        },
    ];

    // Dynamic page title
    const pageTitle = serviceLocation === 'in-store' ? 'In Store Service History' : 'Home Service History';
    const pageDescription = serviceLocation === 'in-store'
        ? 'Complete record of all in-store service requests'
        : 'Complete record of all home service requests';

    // Fetch services function
    const handleFetchedServices = async () => {
        try {
            const response = await fetch(route('manage-history.fetch'), {
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
            console.error('Error fetching services:', err);
            throw err instanceof Error ? err : new Error(String(err));
        }
    }

    const loadServices = async () => {
        try {
            const fetchedServices = await handleFetchedServices();
            setServices(fetchedServices);
        } catch (err) {
            console.error('Failed to fetch services:', err);
        }
    }

    // Load services when echo changes
    useEffect(() => {
        loadServices();
    }, [echo]);

    // Process services data when services change
    useEffect(() => {
        console.log(services);
        console.log(serviceLocation);
        if (services.length > 0) {
            const serviceAppointments = services
                .filter((service: Jobs) => service.appointment_service_location === serviceLocation) // Only completed services for history
                .map((service: Jobs) => ({
                    id: service.id.toString(),
                    service: `${service.appointment_item_name} - ${service.appointment_service_type}`,
                    customer: service.client_name,
                    serviceDate: new Date(service.appointment_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    completionDate: new Date(service.completion_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    status: service.appointment_status,
                    technician: service.technician_name || 'Not Assigned',
                    amount: service.amount || 0, // You might want to get this from your service data
                    rating: service.rating || null, // You might want to get this from your service data
                    serviceType: service.appointment_service_type,
                    serviceLocation: serviceLocation // Set based on current route
                }));

            setTimeout(() => {
                setHistory(serviceAppointments);
                setLoading(false);
            }, 1000);
        } else {
            // If no services, set empty array and stop loading
            setTimeout(() => {
                setHistory([]);
                setLoading(false);
            }, 1000);
        }
    }, [services, serviceLocation]);

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

    const getStatusBadge = (status: string) => {
        const statusClasses = {
            'completed': 'bg-green-100 text-green-800',
            'Completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'Cancelled': 'bg-red-100 text-red-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            'In Progress': 'bg-blue-100 text-blue-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'Pending': 'bg-yellow-100 text-yellow-800'
        };

        return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
    };

    const handleStatusToggle = (status: string) => {
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

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={pageTitle} />
                <div className="flex h-full flex-1 flex-col gap-[1px] rounded-xl p-4 overflow-x-auto">

                    {/* Header - Updated with dynamic content */}
                    <div className="bg-white p-6 rounded-lg shadow mb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
                                <p className="text-gray-600 mt-1">{pageDescription}</p>
                                <div className="mt-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        serviceLocation === 'in-store'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {serviceLocation === 'in-store' ? 'In Store Services' : 'Home Services'}
                                    </span>
                                </div>
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
                            </div>
                        </div>
                    </div>

                    {/* Summary Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <div className="text-2xl font-bold text-gray-900">{history.length}</div>
                            <div className="text-sm text-gray-500">
                                Total {serviceLocation === 'in-store' ? 'In-Store' : 'Home'} Services
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {history.filter(h => h.status.toLowerCase() === 'completed').length}
                            </div>
                            <div className="text-sm text-gray-500">Completed</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                ₱{history.filter(h => h.status.toLowerCase() === 'completed').reduce((sum, h) => sum + h.amount, 0).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">Total Revenue</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {history.filter(h => h.rating).length > 0
                                    ? (history.filter(h => h.rating).reduce((sum, h) => sum + (h.rating || 0), 0) / history.filter(h => h.rating).length).toFixed(1)
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
                                        {/* Dynamic technician options based on your data */}
                                        {Array.from(new Set(history.map(h => h.technician))).map(tech => (
                                            <option key={tech} value={tech}>{tech}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Multi-select */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['completed', 'cancelled', 'in-progress', 'pending'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusToggle(status)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize ${
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
                                    <span key={status} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs capitalize">
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
                                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                                    No {serviceLocation === 'in-store' ? 'in-store' : 'home service'} history found
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
                                                            {record.serviceDate}
                                                        </div>
                                                        {record.completionDate && (
                                                            <div className="text-xs text-gray-500">
                                                                Completed: {record.completionDate}
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
                                                                    <span key={i} className={`text-sm ${i < record.rating! ? 'text-yellow-400' : 'text-gray-300'}`}>
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
        </>
    );
}
