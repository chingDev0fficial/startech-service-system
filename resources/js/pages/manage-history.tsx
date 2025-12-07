import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/ui/button';
import { X, Eye } from 'lucide-react';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflow: 'auto',
};

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
    warranty: string | null;
    warrantyStatus: string | null;
}

interface Jobs {
    amount: number;
    id: number;
    appointment_id: number;
    client_name: string;
    appointment_item_name: string;
    appointment_date: string;
    appointment_service_type: string;
    appointment_service_location: string;
    appointment_description: string;
    service_status: string;
    technician_name: string;
    user_id: number;
    warranty: string;
    warranty_status: string;
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
        amountRange: { min: 0, max: Number.MAX_SAFE_INTEGER }
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [services, setServices] = useState<Jobs[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

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

    const handleFetchedServices = async () => {
        try {
            // setLoading(true);
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
            console.error('Error fetching users:', err);
            setHistory([]);
            throw err instanceof Error ? err : new Error(String(err));
        } finally {
            setLoading(false);
        }
    }

    const transaformServiceData = (services: Jobs[]) => {
        return services
            .filter((service: Jobs) => {
                return service.appointment_service_location === serviceLocation;
            }) // Only completed services for history
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
                status: service.service_status,
                technician: service.technician_name || 'Not Assigned',
                amount: parseInt(service.amount) || 0, // You might want to get this from your service data
                rating: service.rating || null, // You might want to get this from your service data
                serviceType: service.appointment_service_type,
                serviceLocation: serviceLocation, // Set based on current route
                warranty: service.warranty || null,
                warrantyStatus: service.warranty_status || null
            }));
    }

    useEffect(() => {
        handleFetchedServices()
            .then(fetchedServices => {
                const transformedData = transaformServiceData(fetchedServices);
                setHistory(transformedData);
            })
            .catch(err => console.error(err));

    }, [services, echo, serviceLocation]);

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

    const reversedHistory = [...filteredHistory].reverse();

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

    const activeFiltersCount = Object.values(searchFilters).filter(value =>
        value && (Array.isArray(value) ? value.length > 0 : value !== '' && value !== 0)
    ).length;

    const handleViewDetails = (record: HistoryRecord) => {
        setSelectedRecord(record);
        setIsViewModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsViewModalOpen(false);
        setSelectedRecord(null);
    };

    return (
        <>
            {/* View Details Modal */}
            <Modal
                open={isViewModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="appointment-details-modal"
            >
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" className="flex items-center justify-between mb-4">
                        Appointment Details
                        <Button className="text-[#ffffff] !bg-[#393E46]" onClick={handleCloseModal}>
                            <X />
                        </Button>
                    </Typography>

                    {selectedRecord && (
                        <div className="grid grid-cols-1 gap-4">
                            {/* Service Information */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3 text-blue-900">Service Information</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Appointment ID</p>
                                        <p className="font-medium">{selectedRecord.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Service Type</p>
                                        <p className="font-medium capitalize">{selectedRecord.serviceType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Service Location</p>
                                        <p className="font-medium capitalize">{selectedRecord.serviceLocation.replace('-', ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Service Details</p>
                                        <p className="font-medium">{selectedRecord.service}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3 text-green-900">Customer Information</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Customer Name</p>
                                        <p className="font-medium">{selectedRecord.customer}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Technician Information */}
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3 text-purple-900">Technician Information</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Assigned Technician</p>
                                        <p className="font-medium">{selectedRecord.technician}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Date & Status Information */}
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3 text-yellow-900">Date & Status Information</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Service Date</p>
                                        <p className="font-medium">{selectedRecord.serviceDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Completion Date</p>
                                        <p className="font-medium">{selectedRecord.completionDate || 'Not completed'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <span className={`${
                                            selectedRecord.status.toLowerCase() === 'completed' ? 'bg-green-200 text-green-800' :
                                            selectedRecord.status.toLowerCase() === 'in-progress' ? 'bg-blue-200 text-blue-800' :
                                            selectedRecord.status.toLowerCase() === 'cancelled' ? 'bg-red-200 text-red-800' :
                                            'bg-yellow-200 text-yellow-800'
                                        } px-3 py-1 rounded-full text-sm font-medium inline-block capitalize`}>
                                            {selectedRecord.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Warranty Information */}
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3 text-orange-900">Warranty Information</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Warranty Status</p>
                                        {selectedRecord.warrantyStatus ? (
                                            <span className={`${
                                                selectedRecord.warrantyStatus.toLowerCase() === 'valid' ? 'bg-green-200 text-green-800' :
                                                selectedRecord.warrantyStatus.toLowerCase() === 'expired' ? 'bg-red-200 text-red-800' :
                                                'bg-gray-200 text-gray-800'
                                            } px-3 py-1 rounded-full text-sm font-medium inline-block capitalize`}>
                                                {selectedRecord.warrantyStatus == 'valid' ? "valid" : "No Warranty"}
                                            </span>
                                        ) : (
                                            <p className="text-gray-500 italic">No warranty information</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3 text-indigo-900">Payment Information</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Amount</p>
                                        <p className="font-medium text-xl text-indigo-700">₱{selectedRecord.amount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Customer Rating</p>
                                        {selectedRecord.rating ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={`text-lg ${i < selectedRecord.rating! ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="font-medium text-gray-700">({selectedRecord.rating}/5)</span>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">No rating yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Box>
            </Modal>

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
                                </button>
                            </div>
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
                                        <option value="hardware repair">Hardware Repair</option>
                                        <option value="software solution">Software Solution</option>
                                        <option value="maintenance">Maintenance</option>
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
                                            reversedHistory.map((record) => (
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
                                                            <button 
                                                                onClick={() => handleViewDetails(record)}
                                                                className="text-blue-600 hover:text-blue-900 text-sm flex items-center gap-1"
                                                            >
                                                                <Eye className="w-4 h-4" />
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
