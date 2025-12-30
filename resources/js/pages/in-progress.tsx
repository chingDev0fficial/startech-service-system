import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { LoaderCircle } from 'lucide-react';

import { useEffect, useState } from 'react';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'In Progress',
        href: '#',
    },
];

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: '85%', md: 700, lg: 800 },
    maxWidth: '95vw',
    maxHeight: { xs: '90vh', sm: '85vh' },
    overflowY: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: { xs: 2, sm: 3, md: 4 },
    borderRadius: 2,
};

interface Jobs {
    id: number;
    appointmentId: number;
    customer: string;
    device: string;
    startTime: string;
    serviceType: string;
    description: string;
    status: string;
}

interface SetCompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (amount: number, note: string) => void;
    isLoading: boolean;
    fixPrice: number;
}

const SetCompleteModal = ({ isOpen, onClose, onSave, isLoading, fixPrice }: SetCompleteModalProps) => {
    const [note, setNote] = useState<string>('');
    // const [isNoteNotEmpty, setIsNoteNotEmpty] = useState<boolean>(false);
    const [addOnsValue, setAddOnsValue] = useState<string>('0.00');
    const [totalValue, setTotalValue] = useState<string>('0.00');
    const [amount, setAmount] = useState<string>('');
    const [error, setError] = useState<string>('');
    // const [isBtnClickable, setIsBtnClickable] = useState<boolean>(false);
    // const [openNote, setOpenNote] = useState<boolean>(false);

    const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;

        setNote(value);
        setError('');
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;

        console.log(value);

        // Allow only numbers and decimal points
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value);
            setError('');

            // Check if amount is 0 or empty to show note field
            const numericValue = parseFloat(value);
            const addPrice = isNaN(numericValue) ? 0 : numericValue;
            const total = Number(fixPrice) + Number(addPrice);
            const addPriceTransform = addPrice.toFixed(2);
            const totalFormatted = total.toFixed(2);

            setAddOnsValue(addPriceTransform);
            setTotalValue(totalFormatted);
            // if (value === '' || isNaN(numericValue) || numericValue <= 0) {
            //     setOpenNote(true);
            //     setIsNoteNotEmpty(true);
            // } else {
            //     setOpenNote(true);
            //     setIsNoteNotEmpty(false);
            // }
        }
    };

    const handleSave = () => {
        const numericAmount = parseFloat(totalValue);

        if (!amount || amount.trim() === '') {
            setError('Amount is required');
            return;
        }

        if (isNaN(numericAmount) || numericAmount < 0) {
            setError('Please enter a valid amount (0 or greater)');
            return;
        }

        // If amount is 0, note is required
        if (numericAmount === 0 && (!note || note.trim() === '')) {
            setError('A note is required when the amount is ₱0');
            return;
        }

        onSave(numericAmount, note);
    };

    const handleClose = () => {
        setAmount('');
        setNote('');
        setError('');
        // setOpenNote(false);
        // setIsNoteNotEmpty(false);
        onClose();
    };

    // const handleInputAddOnsPrice = (e: { target: { value: any } }) => {
    //     let value = e.target.value;

    //     console.log(value);
    // };

    return (
        <Modal
            keepMounted
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"
        >
            <Box sx={style}>
                <Typography id="keep-mounted-modal-title" variant="h6" component="h2" className="flex items-center justify-between">
                    Mark as Complete
                    <Button className="!bg-[#393E46] text-[#ffffff]" onClick={handleClose} disabled={isLoading}>
                        <X />
                    </Button>
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <p className="mb-4">Please enter the service amount and confirm completion.</p>

                    <div className="mb-4">
                        <label htmlFor="amount" className="mb-2 block text-sm font-medium text-gray-700">
                            Service Amount (₱)
                        </label>
                        <input
                            id="amount"
                            type="text"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="0.00"
                            disabled={isLoading}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                                error ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                    </div>

                    {/* {openNote && (
                        <> */}
                    {/* <div className="color-[#FFFFF] mb-4 rounded-sm border border-[#FFA500] bg-[#FFA500]/20 p-3">
                        <p className="text-sm font-semibold">⚠️ Note Required</p>
                        <p className="mt-1 text-sm">
                            Since the amount is ₱0, please explain why no charge is being applied. This will notify the admin.
                        </p>
                    </div> */}

                    <div className="mb-1">
                        <label htmlFor="note" className="mb-2 block text-sm font-medium text-gray-700">
                            Technician Note <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="note"
                            value={note}
                            onChange={handleNoteChange}
                            placeholder="Explain why no charge is being applied..."
                            disabled={isLoading}
                            rows={4}
                            className={`w-full resize-none rounded-md border px-3 py-2 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                                error ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                    </div>
                    {/* </>
                    )} */}

                    <p className="text-[13px] text-[#444]">Fix Price: {fixPrice}</p>
                    <p className="text-[13px] text-[#444]">Add Price: {addOnsValue}</p>
                    <p className="text-[13px] text-[#444]">Total: {totalValue}</p>

                    <div className="flex justify-end gap-2">
                        <Button onClick={handleClose} variant="outline" disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading || !note} className="bg-green-600 hover:bg-green-700">
                            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Mark Complete'}
                        </Button>
                    </div>
                </Box>
            </Box>
        </Modal>
    );
};

export default function InProgress() {
    const pageProps = usePage<SharedData>().props;
    const auth = pageProps.auth;
    const currentUserId = auth.user?.id;
    const echo = useEcho('');
    // const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [jobs, setJobs] = useState<Jobs[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    // const [, setServices] = useState<string>('all');
    // const [inProgressProcessLoading, setInProgressProcessing] = useState<Set<number>>(new Set());
    // const [completeProcessLoading, setCompleteProcessing] = useState<Set<number>>(new Set());
    // const [cancelProcessLoading, setCancelProcessing] = useState<Set<number>>(new Set());
    const [loadingJobs, setLoadingJobs] = useState<Map<number, string>>(new Map());

    const [openCompleteModal, setOpenCompleteModal] = useState<boolean>(false);
    const [isModalSaveClick, setIsModalSaveClick] = useState<boolean>(false);
    const [jobData, setJobData] = useState<number>(0);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
    const [noteText, setNoteText] = useState<string>('');
    const [sendingNote, setSendingNote] = useState<boolean>(false);
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
    const [transferring, setTransferring] = useState<boolean>(false);

    const handleTransferAppointment = (appointmentId: number) => {
        setSelectedAppointmentId(appointmentId);
        setIsTransferModalOpen(true);
    };

    const getCookie = (name: string): string => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || '';
        }
        return '';
    };

    // const fetchFreshCsrfToken = async (): Promise<string> => {
    //     try {
    //         // First, get fresh CSRF cookie
    //         await fetch('/sanctum/csrf-cookie', {
    //             credentials: 'include'
    //         });

    //         // Wait for cookie to be set
    //         await new Promise(resolve => setTimeout(resolve, 200));

    //         // Now make a simple GET request that will include the new token in response
    //         const response = await fetch(route('my-appointments.fetch'), {
    //             method: 'GET',
    //             credentials: 'include'
    //         });

    //         if (response.ok) {
    //             // Get the CSRF token from the meta tag after the request
    //             // Laravel should have updated it
    //             const meta = document.querySelector('meta[name="csrf-token"]');
    //             const token = meta?.getAttribute('content') || '';

    //             if (token) {
    //                 console.log('Fresh CSRF token obtained');
    //                 return token;
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Failed to refresh CSRF token:', error);
    //     }
    //     return '';
    // };

    const fetchFreshCsrfToken = async (): Promise<string> => {
        try {
            // Make a simple GET request to refresh the session
            // This will cause Laravel to regenerate the CSRF token
            const response = await fetch(window.location.href, {
                method: 'HEAD', // Use HEAD to avoid getting page content
                credentials: 'include',
            });

            if (response.ok) {
                // After the request, check if meta tag was updated
                // In reality, it won't be updated without a full page reload
                // So we'll just prompt the user to reload
                return '';
            }
        } catch (error) {
            console.error('Failed to refresh session:', error);
        }
        return '';
    };

    const handleTransferSubmit = async () => {
        if (!selectedAppointmentId) return;

        setTransferring(true);

        let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        try {
            const response = await fetch(route('appointment.transfer'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    appointmentId: selectedAppointmentId,
                }),
                credentials: 'include',
            });

            // Handle CSRF token mismatch (419) - session expired
            if (response.status === 419) {
                // Show user-friendly message and reload
                if (confirm('Your session has expired. The page will reload to refresh your session. Click OK to continue.')) {
                    window.location.reload();
                } else {
                    setIsTransferModalOpen(false);
                }
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    message: 'Network error occurred',
                }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setJobs((prev) => prev.filter((job) => job.appointmentId !== selectedAppointmentId));
                setIsTransferModalOpen(false);
                setSelectedAppointmentId(null);
                alert('Appointment transferred successfully!');
            } else {
                throw new Error(result.message || 'Failed to transfer appointment');
            }
        } catch (err) {
            console.error('Error transferring appointment:', err);
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            alert(`Failed to transfer appointment: ${errorMessage}`);
        } finally {
            setTransferring(false);
        }
    };

    // Mock data - replace with actual API call
    const handleFetchedServices = async () => {
        try {
            // setLoading(true);
            const response = await fetch(route('my-appointments.fetch'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
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
    };

    // Load services when selectedDate or echo changes
    useEffect(() => {
        let isMounted = true;

        handleFetchedServices()
            .then((data) => {
                if (isMounted) {
                    const transformedData = transformServiceData(data);
                    setJobs(transformedData);
                }
            })
            .catch((err) => console.error(err));

        if (echo) {
            const channel = echo.channel('services');

            channel.listen('.services.retrieve', (event: any) => {
                // Use a flag to prevent duplicate fetches
                if (isMounted) {
                    handleFetchedServices()
                        .then((data) => {
                            if (isMounted) {
                                const transformedData = transformServiceData(data);
                                setJobs(transformedData);
                            }
                        })
                        .catch((err) => console.error(err));
                }
            });
        }

        return () => {
            isMounted = false;
            if (echo) {
                echo.leave('services');
            }
        };
    }, [echo, currentUserId]);

    const transformServiceData = (services: any[]) => {
        return services
            .filter((service: any) => service.user_id === currentUserId)
            .filter((service: any) => service.service_status === 'pending' || service.service_status === 'in-progress')
            .map((service: any) => ({
                id: service.id.toString(),
                appointmentId: service.appointment_id,
                customer: service.client_name,
                device: service.appointment_item_name,
                fixPrice: service.fix_price,
                startTime: new Date(service.appointment_date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }),
                serviceType: service.appointment_service_type,
                description: service.appointment_description,
                status: service.service_status,
            }));
    };

    const handleCompleteModalClose = () => {
        setOpenCompleteModal(false);
    };

    const handleOpenNoteModal = (jobId: string | number) => {
        setSelectedJobId(typeof jobId === 'string' ? parseInt(jobId) : jobId);
        setNoteText('');
        setIsNoteModalOpen(true);
    };

    const handleSendNote = async () => {
        if (!selectedJobId || !noteText.trim()) {
            alert('Please enter a note before sending.');
            return;
        }

        setSendingNote(true);
        try {
            const response = await fetch(route('appointment.note.send'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    appointmentId: selectedJobId,
                    note: noteText,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setIsNoteModalOpen(false);
                setSelectedJobId(null);
                setNoteText('');
                alert('Note sent successfully!');
            } else {
                throw new Error(result.message || 'Failed to send note');
            }
        } catch (err) {
            console.error('Error sending note:', err);
            alert('Failed to send note. Please try again.');
        } finally {
            setSendingNote(false);
        }
    };

    const handleMark = async (jobId: number, status: string) => {
        if (!jobId) {
            console.error('No user ID provided');
            return;
        }

        // Prevent multiple clicks
        if (loadingJobs.has(jobId)) {
            console.log('Already processing this job');
            return;
        }

        if (status === 'completed') {
            setJobData(jobId);
            setOpenCompleteModal(true);
            return; // Exit early
        }

        setLoadingJobs((prev) => new Map(prev).set(jobId, status));

        try {
            // Determine technician status based on job status
            const technicianStatus = status === 'in-progress' ? 'unavailable' : 'available';

            const result = await makeApiCall(jobId, status, undefined, technicianStatus);

            // Verify success before updating UI
            if (!result || result.success === false) {
                throw new Error(result?.message || 'Operation failed');
            }

            // Only update state after successful API call
            if (status === 'canceled') {
                setJobs((prev) => prev.filter((job) => job.appointmentId !== jobId));
            } else if (status === 'in-progress') {
                setJobs((prev) => prev.map((job) => (job.appointmentId === jobId ? { ...job, status: 'in-progress' } : job)));
            }
        } catch (error) {
            console.error(`Error marking job as ${status}:`, error);
            alert(`Failed to mark job as ${status}. Please try again.`);
        } finally {
            // Ensure loading state is always cleared
            setLoadingJobs((prev) => {
                const newMap = new Map(prev);
                newMap.delete(jobId);
                return newMap;
            });
        }
    };

    // Update your handleModalSave function to accept amount parameter
    const handleModalSave = async (amount: number, note: string) => {
        const jobId = jobData;

        // Prevent duplicate submissions
        if (loadingJobs.has(jobId)) {
            return;
        }

        setIsModalSaveClick(true);
        setLoadingJobs((prev) => new Map(prev).set(jobId, 'completed'));

        try {
            // Set technician status to available when completing
            const result = await makeApiCallWithAmount(jobId, 'completed', amount, 'available', note);

            if (!result || result.success === false) {
                throw new Error(result?.message || 'Failed to complete job');
            }

            // Only remove after successful API call
            setJobs((prev) => prev.filter((job) => job.appointmentId !== jobId));
            setOpenCompleteModal(false);
            setJobData(0);
        } catch (error) {
            console.error('Error marking job as completed:', error);
            alert('Failed to mark job as completed. Please try again.');
        } finally {
            setLoadingJobs((prev) => {
                const newMap = new Map(prev);
                newMap.delete(jobId);
                return newMap;
            });
            setIsModalSaveClick(false);
        }
    };

    // Update your makeApiCall function to handle amount
    const makeApiCallWithAmount = async (jobId: number, status: string, amount?: number, technicianStatus?: string, note?: string) => {
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
        const trimmedNote = note?.trim() || '';

        const body = {
            id: jobId,
            currentUserId: currentUserId,
            status: status,
            price: amount,
            technicianStatus: technicianStatus,
            ...(trimmedNote && { note: trimmedNote }),
            ...(amount === 0 && trimmedNote && { notifyAdmin: true }),
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            console.log('makeApiCallWithAmount - Sending request:', {
                url: route('in-progress.mark-in-progress'),
                csrfToken: csrfToken ? csrfToken.substring(0, 20) + '...' : 'MISSING',
                body,
            });

            const response = await fetch(route('in-progress.mark-in-progress'), {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                signal: controller.signal,
                credentials: 'include',
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Network error' }));
                console.error('makeApiCallWithAmount - Response error:', {
                    status: response.status,
                    error,
                });
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('makeApiCallWithAmount - Success:', result);

            if (result.success === false) {
                throw new Error(result.message || 'Failed to update appointment');
            }

            return result;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request timeout - please try again');
            }
            throw error;
        }
    };

    // Or update your existing makeApiCall function:
    const makeApiCall = async (jobId: number, status: string, amount?: number, technicianStatus?: string) => {
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
        const body = {
            id: jobId,
            currentUserId: currentUserId,
            status: status,
            price: amount || 0,
            technicianStatus: technicianStatus,
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            console.log('makeApiCall - Sending request:', {
                url: route('in-progress.mark-in-progress'),
                csrfToken: csrfToken ? csrfToken.substring(0, 20) + '...' : 'MISSING',
                body,
            });

            const response = await fetch(route('in-progress.mark-in-progress'), {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                signal: controller.signal,
                credentials: 'include',
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Network error' }));
                console.error('makeApiCall - Response error:', {
                    status: response.status,
                    error,
                });
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('makeApiCall - Success:', result);

            if (result.success === false) {
                throw new Error(result.message || 'Failed to update appointment');
            }

            return result;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request timeout - please try again');
            }
            throw error;
        }
    };

    return (
        <>
            {/* Note Modal */}
            <Modal open={isNoteModalOpen} onClose={() => !sendingNote && setIsNoteModalOpen(false)} aria-labelledby="note-modal-title">
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: 600,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: { xs: 3, sm: 4 },
                        borderRadius: 2,
                        maxHeight: '90vh',
                        overflowY: 'auto',
                    }}
                >
                    <Typography id="note-modal-title" variant="h6" component="h2" className="mb-4">
                        Send Note to Client
                    </Typography>
                    <div className="mb-6">
                        <p className="mb-4 text-gray-700">
                            Add a note about this appointment. The client will be notified, and staff/admins can view this in the system.
                        </p>
                        <div className="mb-4 border-l-4 border-blue-400 bg-blue-50 p-3">
                            <p className="text-sm text-blue-700">
                                <strong>Note:</strong> This note will be visible to the client in their transaction history and will create
                                notifications for staff and administrators.
                            </p>
                        </div>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Enter your note here..."
                            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            rows={6}
                            disabled={sendingNote}
                            maxLength={1000}
                        />
                        <p className="mt-2 text-right text-sm text-gray-500">{noteText.length}/1000 characters</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsNoteModalOpen(false)}
                            disabled={sendingNote}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSendNote}
                            disabled={sendingNote || !noteText.trim()}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {sendingNote ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                    Send Note
                                </>
                            )}
                        </button>
                    </div>
                </Box>
            </Modal>

            {/* Transfer Appointment Modal */}
            <Modal open={isTransferModalOpen} onClose={() => !transferring && setIsTransferModalOpen(false)} aria-labelledby="transfer-modal-title">
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: 500,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: { xs: 3, sm: 4 },
                        borderRadius: 2,
                        maxHeight: '90vh',
                        overflowY: 'auto',
                    }}
                >
                    <Typography id="transfer-modal-title" variant="h6" component="h2" className="mb-4">
                        Transfer Appointment
                    </Typography>
                    <div className="mb-6">
                        <p className="mb-2 text-gray-700">Are you sure you want to transfer this appointment to another technician?</p>
                        <div className="mt-4 border-l-4 border-blue-400 bg-blue-50 p-4">
                            <p className="text-sm text-blue-700">
                                <strong>Note:</strong> This appointment will be reassigned to an available technician through the queuing system.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsTransferModalOpen(false)}
                            disabled={transferring}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleTransferSubmit}
                            disabled={transferring}
                            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:opacity-50"
                        >
                            {transferring ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                    Transferring...
                                </>
                            ) : (
                                'Confirm Transfer'
                            )}
                        </button>
                    </div>
                </Box>
            </Modal>

            <SetCompleteModal
                isOpen={openCompleteModal}
                onClose={handleCompleteModalClose}
                onSave={handleModalSave}
                isLoading={loadingJobs.has(jobData)}
                fixPrice={jobs.find((job) => job.appointmentId === jobData)?.fixPrice ?? 0}
            />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="In Progress" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <h1 className="text-xl font-semibold">Pending Appointments</h1>

                    <div className="flex flex-col gap-4">
                        {loading ? (
                            <div key="loading" className="rounded-lg bg-white p-8 text-center shadow">
                                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-gray-500">Loading appointments...</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div key="empty" className="rounded-lg bg-white p-8 text-center shadow">
                                <p className="text-gray-500">No appointments found for the selected criteria.</p>
                            </div>
                        ) : (
                            jobs.map((job) => (
                                <div key={job.id} className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="font-semibold text-gray-900">
                                                {job.customer} - {job.device}
                                            </h2>
                                            <p className="text-sm text-gray-600">
                                                Schedule: {job.startTime} | {job.serviceType}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-yellow-200 px-3 py-1 text-xs font-medium text-yellow-800">{job.status}</span>
                                    </div>

                                    <div className="mt-3 rounded-md border border-yellow-200 bg-white p-3">
                                        <p className="text-sm">
                                            {/* <span className="font-semibold">Description:</span> */}
                                            {job.description}
                                        </p>
                                        {/* <p className="text-sm mt-1"> */}
                                        {/*     <span className="font-semibold">Estimated completion:</span> {job.estimatedCompletion} */}
                                        {/* </p> */}
                                    </div>

                                    <div className="flex justify-between">
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {/* Send Note Button - Always visible */}
                                            <button
                                                onClick={() => handleOpenNoteModal(job.id)}
                                                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                                disabled={loadingJobs.has(job.appointmentId)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                                Send Note
                                            </button>

                                            {/* Sequential buttons: pending -> in-progress -> completed */}
                                            {job.status === 'pending' && (
                                                <button
                                                    onClick={() => handleMark(job.appointmentId, 'in-progress')}
                                                    className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                                                    disabled={loadingJobs.has(job.appointmentId)}
                                                >
                                                    {loadingJobs.get(job.appointmentId) === 'in-progress' ? (
                                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        'Mark In Progress'
                                                    )}
                                                </button>
                                            )}

                                            {job.status === 'in-progress' && (
                                                <button
                                                    onClick={() => handleMark(job.appointmentId, 'completed')}
                                                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                                    disabled={loadingJobs.has(job.appointmentId)}
                                                >
                                                    {loadingJobs.get(job.appointmentId) === 'completed' ? (
                                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        'Mark Completed'
                                                    )}
                                                </button>
                                            )}

                                            {/* Cancel button - Always visible for both statuses */}
                                            {(job.status === 'pending' || job.status === 'in-progress') && (
                                                <button
                                                    onClick={() => handleMark(job.appointmentId, 'canceled')}
                                                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                                    disabled={loadingJobs.has(job.appointmentId)}
                                                >
                                                    {loadingJobs.get(job.appointmentId) === 'canceled' ? (
                                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        'Mark Cancel'
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Transfer Button */}
                                        <div className="mt-3 flex justify-end">
                                            <button
                                                onClick={() => handleTransferAppointment(job.appointmentId)}
                                                className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
                                                disabled={loadingJobs.has(job.appointmentId)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                                                </svg>
                                                Transfer Appointment
                                            </button>
                                        </div>
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
