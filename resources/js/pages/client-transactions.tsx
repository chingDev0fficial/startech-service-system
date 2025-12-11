import * as React from 'react';
import {usePage} from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { NavBar } from "@/components/nav-bar";
import { CustomFooter } from "@/components/custom-footer";
import { LaptopMinimal, LoaderCircle } from 'lucide-react';
import { Rating, Textarea } from "@material-tailwind/react";
import { Label } from '@/components/ui/label';
import { FormEventHandler } from 'react';

import { X, ArrowLeft } from 'lucide-react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/ui/button';
// import { CircularProgress } from '@mui/material';

interface HistoryRecord {
    id: string;
    service: string;
    customer: string;
    serviceDate: string;
    completionDate: string | null;
    status: string;
    technician: string;
    amount: number;
    rating: 5;
    serviceType: string;
    serviceLocation: string;
    technicianNote?: string | null;
    noteSentAt?: string | null;
}

interface appointmentRating {
    rated: number;
    comment: string;
}

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    // maxHeight: '75vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

function TransactionDetailModal({ transaction, isOpen, onClose }: { transaction: HistoryRecord | null; isOpen: boolean; onClose: () => void }) {
    const handleClose = () => {
        onClose();
    };

    if (!transaction) {
        return null;
    }

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="transaction-detail-modal"
            aria-describedby="transaction-detail-description"
        >
            <Box sx={style}>
                <Typography id="transaction-detail-modal" variant="h6" component="h2" className="flex items-center justify-between mb-4">
                    Transaction Details
                    <Button 
                        type="button"
                        className="text-[#ffffff] !bg-[#393E46]" 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleClose();
                        }}
                    >
                        <X />
                    </Button>
                </Typography>
                <Box sx={{ mt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
                    <div className="space-y-4">
                        {/* Transaction ID */}
                        <div className="border-b pb-3">
                            <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                            <p className="text-sm font-semibold text-gray-900">{transaction.id}</p>
                        </div>

                        {/* Service Information */}
                        <div className="border-b pb-3">
                            <p className="text-xs text-gray-500 mb-1">Service</p>
                            <p className="text-sm font-medium text-gray-900">{transaction.service}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                    {transaction.serviceType}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                    {transaction.serviceLocation}
                                </span>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="border-b pb-3">
                            <p className="text-xs text-gray-500 mb-1">Customer</p>
                            <p className="text-sm font-medium text-gray-900">{transaction.customer}</p>
                        </div>

                        {/* Technician Information */}
                        <div className="border-b pb-3">
                            <p className="text-xs text-gray-500 mb-1">Assigned Technician</p>
                            <p className="text-sm font-medium text-gray-900">{transaction.technician}</p>
                        </div>

                        {/* Dates */}
                        <div className="border-b pb-3">
                            <p className="text-xs text-gray-500 mb-1">Service Date</p>
                            <p className="text-sm font-medium text-gray-900">{transaction.serviceDate}</p>
                            {transaction.completionDate && (
                                <>
                                    <p className="text-xs text-gray-500 mt-2 mb-1">Completion Date</p>
                                    <p className="text-sm font-medium text-gray-900">{transaction.completionDate}</p>
                                </>
                            )}
                        </div>

                        {/* Status */}
                        <div className="border-b pb-3">
                            <p className="text-xs text-gray-500 mb-2">Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                transaction.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                                transaction.status.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                                transaction.status.toLowerCase() === 'in-progress' || transaction.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                transaction.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {transaction.status}
                            </span>
                        </div>

                        {/* Amount */}
                        <div className="border-b pb-3">
                            <p className="text-xs text-gray-500 mb-1">Amount</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ₱{(Number(transaction.amount) || 0)?.toFixed(2) || '0.00'}
                            </p>
                        </div>

                        {/* Rating */}
                        <div className="pb-3">
                            <p className="text-xs text-gray-500 mb-2">Rating</p>
                            {transaction.rating ? (
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={`text-2xl ${i < transaction.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                                        >
                                            ★
                                        </span>
                                    ))}
                                    <span className="text-sm text-gray-500 ml-2">
                                        ({transaction.rating} out of 5)
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400">No rating yet</span>
                            )}
                        </div>

                        {/* Technician Note */}
                        {transaction.technicianNote && (
                            <div className="border-t pt-3">
                                <p className="text-xs text-gray-500 mb-2">Technician Note</p>
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                    <div className="flex items-start gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-sm text-blue-900 whitespace-pre-wrap">{transaction.technicianNote}</p>
                                            {transaction.noteSentAt && (
                                                <p className="text-xs text-blue-700 mt-2">
                                                    Sent: {new Date(transaction.noteSentAt).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Box>
            </Box>
        </Modal>
    );
}

function RatingsModal({ appointmentId, isOpen, onClose, onRatingSuccess }: { appointmentId: number; isOpen: boolean; onClose: () => void; onRatingSuccess: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm<appointmentRating>({
        appointment_id: appointmentId,
        rated: 0,
        comment: '',
    });

    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
         if (typeof e === 'number') {
            setData('rated', e);
        } 
        // Otherwise it's a regular form event
        else if (e.target) {
            const { name, value } = e.target;
            setData(name as keyof appointmentRating, value);
        }
    };

    const handleClose = () => {
        setIsError(false);
        setErrorMessage(null);
        reset();
        onClose();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // console.log('Rating check:', data.rated);
        // console.log('Comment check:', data.comment);
        // Handle form submission

        // console.log('Rated:', rated);
        // console.log('Comment:', comment);
        // Close the modal after submission
        // onClose();
        setIsLoading(true);

        post(route('client.appointment.rate.submit', {appointmentId: appointmentId, rated: data.rated, comment: data.comment}), {
            onSuccess: () => {
                setIsError(false);
                onRatingSuccess();
                reset();
                onClose();
            },
            onError: () => {
                // Handle error
                setIsError(true);
                setErrorMessage('Failed to submit rating. Please try again.');
            },
            onFinish: () => {
                setIsLoading(false);
            }
        });

        
    };

    const RatingWithText = () => {
        return (
            <div className="flex items-center gap-2 font-bold text-blue-gray-500">
                {data.rated}
                <Rating id='rated' name='rated' value={data.rated} onChange={handleChange} />
                <Typography color="blue-gray" className="font-medium text-blue-gray-500">
                    Rate the service
                </Typography>
            </div>
        );
    }

    return (
        <Modal
            keepMounted
            open={isOpen}
            onClose={onClose}
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"
        >
            <Box sx={style}>
                <Typography id="keep-mounted-modal-title" variant="h6" component="h2" className="flex items-center justify-between">
                    Rate Service
                    <Button className="text-[#ffffff] !bg-[#393E46]" onClick={handleClose}>
                        <X />
                    </Button>
                </Typography>
                <Box sx={{ mt: 2 }}>

                    <form onSubmit={submit} className="space-y-4">
                        {/* Rating selection */}
                        {/* I want a clickable star rating and a comment */}
                        <RatingWithText />
                        <div className='grid grid-col-1 gap-1'>
                            <Label htmlFor="comment">Comment</Label>
                            <Textarea 
                                className='w-full border-gray-300 focus:border-[#393E46] focus:ring-2 focus:ring-[#393E46]/20 rounded-lg resize-none transition-all duration-200 text-[#222831]'
                                id="comment"
                                name="comment"
                                value={data.comment}
                                placeholder="Leave a comment..."
                                rows={4}
                                onChange={handleChange}
                            />
                        </div>

                        {isError && errorMessage && (
                            <Typography 
                                id="error-message"
                                sx={{ color: 'red', mb: 2 }}
                                className='p-[15px] text-red-600 font-medium bg-red-100 rounded-lg'
                            >
                                {errorMessage}
                            </Typography>
                        )}

                        <Button type="submit">
                            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Submit Rating"}
                        </Button>
                    </form>
                </Box>
            </Box>
        </Modal>
    );
}

export default function ClientTransactions(){
    const { auth } = usePage().props;
    const echo = useEcho();
    const [appointments, setAppointments] = useState([])
    const [transactions, setTransactions] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [openRatingModal, setOpenRatingModal] = useState(false);
    const [appointmentId, setAppointmentId] = useState<number>(0);
    
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<HistoryRecord | null>(null);

    // const [removeRatedButtonId, setRemoveRatedButtonId] = useState<number[]>([]);

    const client = auth.client;

    const tabs = [
        {
            component: "link",
            name: `Welcome, ${client.name}`,
            href: null,
            className: "transition-colors whitespace-nowrap ml-2"
        },
        {
            component: "text",
            name: "Transactions",
            href: undefined,
            className: `transition-colors whitespace-nowrap ml-2 ${client ? "" : "hover:underline"}`
        },
        {
            component: "link",
            name: "Logout",
            href: "/client-logout",
            className: "hover:underline transition-colors whitespace-nowrap ml-2"
        },
        { component: "link", name: "Contact Us", href: "/contact-us", className: "hover:underline transition-colors whitespace-nowrap ml-2" }
    ];

    const handleFetchTransactions = async () => {
        try {
            const response = await fetch(route('client.appointment.transactions.fetch'), {
                method: 'GET',
                headers: {
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error('Expected JSON but got:', text);
                throw new TypeError("Response is not JSON!");
            }

            const result = await response.json();
            return result.retrieved || [];
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch transactions');
            return [];
        }
    };

    // const loadTransactions = async () => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const fetchedAppointments = await handleFetchTransactions();
    //         setAppointments(fetchedAppointments);

    //         // Transform data immediately after fetching
    //         if (fetchedAppointments.length > 0) {
    //             const clientTransactions = fetchedAppointments
    //                 .filter((service: Jobs) => service.client_id === client.id) // Only completed services for history
    //                 .map((service: any) => ({
    //                 id: service.id.toString(),
    //                 service: `${service.appointment_item_name} - ${service.appointment_service_type}`,
    //                 customer: service.client_name,
    //                 serviceDate: new Date(service.appointment_date).toLocaleDateString('en-US', {
    //                     year: 'numeric',
    //                     month: 'long',
    //                     day: 'numeric'
    //                 }),
    //                 completionDate: service.completion_date ? new Date(service.completion_date).toLocaleDateString('en-US', {
    //                     year: 'numeric',
    //                     month: 'long',
    //                     day: 'numeric'
    //                 }) : null,
    //                 status: service.service_status,
    //                 technician: service.technician_name || 'Not Assigned',
    //                 amount: service.amount || 0,
    //                 rating: service.rating || null,
    //                 serviceType: service.appointment_service_type,
    //                 serviceLocation: service.appointment_service_location
    //             }))
    //             .reverse();

    //             setTransactions(clientTransactions);
    //         }
    //     } catch (err) {
    //         console.error('Failed to fetch services:', err);
    //         setError('Failed to load transactions');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

// Only run once on mount
    useEffect(() => {
        // loadTransactions();
        handleFetchTransactions()
            .then(data => {
                const clientTransactions = data
                    .filter((service: any) => service.client_id === client.id)
                    .map((service: any) => ({
                        id: service.id.toString(),
                        service: `${service.appointment_item_name} - ${service.appointment_service_type}`,
                        customer: service.client_name,
                        serviceDate: new Date(service.appointment_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }),
                        completionDate: service.completion_date ? new Date(service.completion_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : null,
                        status: service.service_status,
                        technician: service.technician_name || 'Not Assigned',
                        amount: service.amount || 0,
                        rating: service.rating || null,
                        serviceType: service.appointment_service_type,
                        serviceLocation: service.appointment_service_location,
                        technicianNote: service.technician_note || null,
                        noteSentAt: service.note_sent_at || null
                    }))
                    .reverse();
                
                setTransactions(clientTransactions);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch transactions:', err);
                setError('Failed to load transactions');
                setLoading(false);
            });

        console.log(transactions)

        echo.channel("transactions")
            .listen(".transactions.retrieve", (event: any) => {
                setTransactions(prev => 
                    prev.filter((service: Jobs) => service.client_id === client.id)
                        .map((service: any) => ({
                            id: service.id.toString(),
                            service: `${service.appointment_item_name} - ${service.appointment_service_type}`,
                            customer: service.client_name,
                            serviceDate: new Date(service.appointment_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }),
                            completionDate: service.completion_date ? new Date(service.completion_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : null,
                            status: service.service_status,
                            technician: service.technician_name || 'Not Assigned',
                            amount: service.amount || 0,
                            rating: service.rating || null,
                            serviceType: service.appointment_service_type,
                            serviceLocation: service.appointment_service_location
                        }))
                        .reverse());
            })
        // Cleanup listener on unmount
        return () => {
            echo.leaveChannel('transactions');
        };
    }, [echo]);

    const getStatusBadge = (status: string) => {
        const statusClasses: Record<string, string> = {
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

    const ratedTransactions = transactions.filter(h => h.rating);
    const avgRating = ratedTransactions.length > 0
        ? (ratedTransactions.reduce((sum, h) => sum + (h.rating || 0), 0) / ratedTransactions.length).toFixed(1)
        : '0.0';

    const loadTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await handleFetchTransactions();
            const clientTransactions = data
                .filter((service: any) => service.client_id === client.id)
                .map((service: any) => ({
                    id: service.id.toString(),
                    service: `${service.appointment_item_name} - ${service.appointment_service_type}`,
                    customer: service.client_name,
                    serviceDate: new Date(service.appointment_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    completionDate: service.completion_date ? new Date(service.completion_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : null,
                    status: service.service_status,
                    technician: service.technician_name || 'Not Assigned',
                    amount: service.amount || 0,
                    rating: service.rating || null,
                    serviceType: service.appointment_service_type,
                    serviceLocation: service.appointment_service_location
                }))
                .reverse();
            
            setTransactions(clientTransactions);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
            setError('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const ratingAction = (record: any) => {
        // Open rating modal or redirect to rating page
        // alert('Open rating modal or redirect to rating page');
        setOpenRatingModal(true);
        setAppointmentId(parseInt(record.id));
        // console.log('Rating modal opened?: ', openRatingModal);
    }

    const handleRatingSuccess = () => {
        // After successful rating submission, reload transactions to reflect the new rating
        loadTransactions();
    }

    const handleViewTransaction = (record: HistoryRecord) => {
        setSelectedTransaction(record);
        setOpenDetailModal(true);
    }

    const handleCloseDetailModal = () => {
        setOpenDetailModal(false);
        setSelectedTransaction(null);
    }

    const handleBackToHomeClient = () => {
        window.location.href = "/client";   
    }

    // console.log('Transactions:', transactions);

    return (
        <>
            <RatingsModal appointmentId={appointmentId} isOpen={openRatingModal} onClose={() => setOpenRatingModal(false)} onRatingSuccess={handleRatingSuccess} />
            <TransactionDetailModal transaction={selectedTransaction} isOpen={openDetailModal} onClose={handleCloseDetailModal} />
            <div className="min-h-screen bg-[#F0F1F2] flex flex-col">
                <div className="sticky top-0 left-0 right-0 z-50">
                    <NavBar tabs={tabs} />
                </div>

                <div className="mt-8 ml-5">
                        <Link
                            href="/client"
                            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-light">Back to Home</span>
                        </Link>
                    </div>

                {/* <div className='w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
                    <Button
                        type="button"
                        className="text-[#ffffff] !bg-[#393E46]" 
                        // href="/client"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // handleClose();
                            handleBackToHomeClient();
                        }}
                    >
                        <ArrowLeft />
                    </Button>
                </div> */}

                <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#222831]">
                                My Transactions
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-2">
                                Track and manage your service history
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <p className="text-red-700 text-sm font-medium">{error}</p>
                                    <button
                                        onClick={loadTransactions}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium underline whitespace-nowrap"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Transactions Table/Cards */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="p-8 sm:p-12 text-center">
                                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="text-gray-500 mt-4 text-sm sm:text-base">Loading transactions...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table View */}
                                    <div className="hidden lg:block overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Service Request
                                                </th>
                                                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Customer
                                                </th>
                                                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Technician
                                                </th>
                                                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Service Date
                                                </th>
                                                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Rating
                                                </th>
                                                <th className="px-4 xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {transactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                                        No transactions found
                                                    </td>
                                                </tr>
                                            ) : (
                                                transactions.map((record) => (
                                                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 xl:px-6 py-4">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                                    {record.service}
                                                                    {record.technicianNote && (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800" title="Technician has left a note">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                            </svg>
                                                                            <span className="ml-1">Note</span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {record.id}
                                                                </div>
                                                                <div className="text-xs text-blue-600 mt-1">
                                                                    {record.serviceType}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 xl:px-6 py-4 text-sm text-gray-900">
                                                            {record.customer}
                                                        </td>
                                                        <td className="px-4 xl:px-6 py-4 text-sm text-gray-900">
                                                            {record.technician}
                                                        </td>
                                                        <td className="px-4 xl:px-6 py-4">
                                                            <div className="text-sm text-gray-900">
                                                                {record.serviceDate}
                                                            </div>
                                                            {record.completionDate && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    Completed: {record.completionDate}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 xl:px-6 py-4">
                                                                <span className={getStatusBadge(record.status)}>
                                                                    {record.status}
                                                                </span>
                                                        </td>
                                                        <td className="px-4 xl:px-6 py-4 text-sm font-medium text-gray-900">
                                                            ₱{(Number(record.amount) || 0)?.toFixed(2) || '0.00'}
                                                        </td>
                                                        <td className="px-4 xl:px-6 py-4">
                                                            {record.rating ? (
                                                                <div className="flex items-center">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className={`text-sm ${i < record.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                                                                        >
                                                                                ★
                                                                            </span>
                                                                    ))}
                                                                    <span className="ml-1 text-xs text-gray-500">
                                                                            ({record.rating})
                                                                        </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">No rating</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 xl:px-6 py-4 text-right">
                                                            <button 
                                                                onClick={() => handleViewTransaction(record)}
                                                                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                            >
                                                                View
                                                            </button>

                                                            {record.status === 'completed' && !record.rating && (
                                                                <button onClick={() => ratingAction(record)} className="ml-4 text-green-600 hover:text-green-900 text-sm font-medium">
                                                                    Rate
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile/Tablet Card View */}
                                    <div className="lg:hidden divide-y divide-gray-200">
                                        {transactions.length === 0 ? (
                                            <div className="p-8 sm:p-12 text-center text-gray-500">
                                                <LaptopMinimal className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                                                <p className="text-sm sm:text-base">No transactions found</p>
                                            </div>
                                        ) : (
                                            transactions.map((record) => (
                                                <div key={record.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                                                    {/* Header Row */}
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                                                {record.service}
                                                            </h3>
                                                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                                                ID: {record.id}
                                                            </p>
                                                        </div>
                                                        <span className={getStatusBadge(record.status)}>
                                                            {record.status}
                                                        </span>
                                                    </div>

                                                    {/* Details Grid */}
                                                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Customer</p>
                                                            <p className="text-sm font-medium text-gray-900">{record.customer}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Technician</p>
                                                            <p className="text-sm font-medium text-gray-900">{record.technician}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Service Date</p>
                                                            <p className="text-sm font-medium text-gray-900">{record.serviceDate}</p>
                                                            {record.completionDate && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Completed: {record.completionDate}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Amount</p>
                                                            <p className="text-base sm:text-lg font-bold text-gray-900">
                                                                ₱{(Number(record.amount) || 0)?.toFixed(2) || '0.00'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Service Type & Rating */}
                                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                                {record.serviceType}
                                                            </span>
                                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                                                {record.serviceLocation}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {record.rating ? (
                                                                <div className="flex items-center gap-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className={`text-sm ${i < record.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                                                                        >
                                                                            ★
                                                                        </span>
                                                                    ))}
                                                                    <span className="text-xs text-gray-500 ml-1">
                                                                        ({record.rating})
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">No rating</span>
                                                            )}
                                                            <button 
                                                                onClick={() => handleViewTransaction(record)}
                                                                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                            >
                                                                View
                                                            </button>

                                                            {record.status.toLowerCase() === 'completed' && !record.rating && (
                                                                <button onClick={() => ratingAction(record)} className="ml-4 text-green-600 hover:text-green-900 text-sm font-medium">
                                                                    Rate
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <CustomFooter />
            </div>
        </>
    );
}

