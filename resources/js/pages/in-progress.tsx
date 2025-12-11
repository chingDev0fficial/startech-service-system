import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useEcho } from '@laravel/echo-react';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import { Eye, Check, X } from 'lucide-react';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/ui/button';

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
    id: number,
    appointmentId: number,
    customer: string,
    device: string,
    startTime: string,
    serviceType: string,
    description: string,
    status: string,
}

interface SetCompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (amount: number, note: string) => void;
    isLoading: boolean;
}

const SetCompleteModal = ({ isOpen, onClose, onSave, isLoading }: SetCompleteModalProps) => {
    const [note, setNote] = useState<string>('');
    const [isNoteNotEmpty, setIsNoteNotEmpty] = useState<boolean>(false);
    const [amount, setAmount] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [openNote, setOpenNote] = useState<boolean>(false);

    const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value =  e.target.value;

        console.log(value);

        setNote(value);
        setError('');
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value =  e.target.value;

        if ( parseInt(value) <= 0 ) {
            setOpenNote(true);
            setIsNoteNotEmpty(true);
        }
        else {
            setOpenNote(false);
            setIsNoteNotEmpty(false);
        }

        // Allow only numbers and decimal points
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value);
            setError('');
        }
    };

    const handleSave = () => {
        const numericAmount = parseFloat(amount);

        if (!amount || amount.trim() === '') {
            console.log('error1')
            setError('Amount is required');
            return;
        }

        if (isNaN(numericAmount) || numericAmount < 0) {
            console.log('error2')
            setError('Please enter a valid amount greater than 0');
            return;
        }

        onSave(numericAmount, note);
    };

    const handleClose = () => {
        setAmount('');
        setError('');
        onClose();
    };

    return (
        <Modal
            keepMounted
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"
        >
            <Box sx={style}>
                <Typography
                    id="keep-mounted-modal-title"
                    variant="h6"
                    component="h2"
                    className="flex items-center justify-between"
                >
                    Mark as Complete
                    <Button
                        className="text-[#ffffff] !bg-[#393E46]"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        <X />
                    </Button>
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <p className="mb-4">Please enter the service amount and confirm completion.</p>

                    <div className="mb-4">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                            Service Amount ($)
                        </label>
                        <input
                            id="amount"
                            type="text"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="0.00"
                            disabled={isLoading}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                error ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {error && (
                            <p className="mt-1 text-sm text-red-600">{error}</p>
                        )}
                        
                    </div>

                    {openNote && (
                    <>
                        <div className='mb-4 border rounded-sm color-[#FFFFF] border-[#90EE90] bg-[#90EE90]/30 p-2'>
                            <p>Please leave a note here!</p>
                        </div>

                        <div className='mb-1'>
                            <textarea
                                id="note"
                                value={note}
                                onChange={handleNoteChange}
                                placeholder=""
                                disabled={isLoading}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                                    error ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                        </div>
                    </>
                    )}

                    <div className="flex gap-2 justify-end">
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isLoading || (isNoteNotEmpty && note.trim() === '')}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                "Mark Complete"
                            )}
                        </Button>
                    </div>
                </Box>
            </Box>
        </Modal>
    );
};

export default function InProgress() {
    const { auth } = usePage<SharedData>().props;
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

    const handleTransferSubmit = async () => {
        if (!selectedAppointmentId) return;

        setTransferring(true);
        try {
            const response = await fetch(route('appointment.transfer'), {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    appointmentId: selectedAppointmentId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                // Remove the transferred appointment from the list
                setJobs(prev => prev.filter(job => job.appointmentId !== selectedAppointmentId));
                setIsTransferModalOpen(false);
                setSelectedAppointmentId(null);
                alert('Appointment transferred successfully!');
            } else {
                throw new Error(result.message || 'Failed to transfer appointment');
            }
        } catch (err) {
            console.error('Error transferring appointment:', err);
            alert('Failed to transfer appointment. No available technicians.');
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

    // Load services when selectedDate or echo changes
    useEffect(() => {
        handleFetchedServices()
            .then(data => {
                const transformedData = transformServiceData(data);
                setJobs(transformedData);
            })
            .catch(err => console.error(err));

        if (echo) {
            echo.channel('services')
                .listen('.services.retrieve', (event: any) => {
                    // Fetch fresh data instead of appending to prevent duplicates
                    handleFetchedServices()
                        .then(data => {
                            const transformedData = transformServiceData(data);
                            setJobs(transformedData);
                        })
                        .catch(err => console.error(err));
                });
        }

        return () => {
            if (echo) {
                echo.channel('services').stopListening('.services.retrieve');
            }
        };
    }, [echo, currentUserId]);

    const transformServiceData = (services: any[]) => {
        return services
            .filter((service: any) => service.user_id === currentUserId)
            .filter((service: any) => 
                service.service_status === 'pending' || 
                service.service_status === 'in-progress'
            )
            .map((service: any) => ({
                id: service.id.toString(),
                appointmentId: service.appointment_id,
                customer: service.client_name,
                device: service.appointment_item_name,
                startTime: new Date(service.appointment_date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }),
                serviceType: service.appointment_service_type,
                description: service.appointment_description,
                status: service.service_status,
            }));
    };

    const handleCompleteModalClose = () => {
        setOpenCompleteModal(false);
    }

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
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    appointmentId: selectedJobId,
                    note: noteText
                })
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
            return console.error("No user ID provided");
        }

        console.log('handleMark', jobId, status);

        if (status === 'completed') {
            setJobData(jobId);
            setOpenCompleteModal(true);
            return; // Exit early
        }

        setLoadingJobs(prev => new Map(prev).set(jobId, status));

        try {
            // Determine technician status based on job status
            const technicianStatus = status === 'in-progress' ? 'unavailable' : 'available';
            
            await makeApiCall(jobId, status, undefined, technicianStatus);
            
            // Only update state after successful API call
            if (status === 'canceled') {
                setJobs(prev => prev.filter(job => job.appointmentId !== jobId));
            } else if (status === 'in-progress') {
                setJobs(prev => prev.map(job => 
                    job.appointmentId === jobId 
                        ? { ...job, status: 'in-progress' }
                        : job
                ));
            }
        } catch (error) {
            console.error(`Error marking job as ${status}:`, error);
            alert(`Failed to mark job as ${status}. Please try again.`);
        } finally {
            setLoadingJobs(prev => {
                const newMap = new Map(prev);
                newMap.delete(jobId);
                return newMap;
            });
        }
    }

    // Update your handleModalSave function to accept amount parameter
    const handleModalSave = async (amount: number, note: string) => {
        const jobId = jobData;
        setIsModalSaveClick(true);
        setLoadingJobs(prev => new Map(prev).set(jobId, 'completed'));

        try {
            // Set technician status to available when completing
            await makeApiCallWithAmount(jobId, 'completed', amount, 'available', note);
            
            // Only remove after successful API call
            setJobs(prev => prev.filter(job => job.appointmentId !== jobId));
            setOpenCompleteModal(false);
            setJobData(0);
        } catch (error) {
            console.error('Error marking job as completed:', error);
            alert('Failed to mark job as completed. Please try again.');
        } finally {
            setLoadingJobs(prev => {
                const newMap = new Map(prev);
                newMap.delete(jobId);
                return newMap;
            });
            setIsModalSaveClick(false);
        }
    }

    // Update your makeApiCall function to handle amount
    const makeApiCallWithAmount = async (jobId: number, status: string, amount?: number, technicianStatus?: string, note?: string) => {
        const trimmedNote = note?.trim() || '';
        
        const body = {
            id: jobId,
            currentUserId: currentUserId,
            status: status,
            price: amount,
            technicianStatus: technicianStatus,
            ...(trimmedNote && { note: trimmedNote }),
            ...(amount === 0 && trimmedNote && { notifyAdmin: true })
        };

        const response = await fetch(route('in-progress.mark-in-progress'), {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    // Or update your existing makeApiCall function:
    const makeApiCall = async (jobId: number, status: string, amount?: number, technicianStatus?: string) => {
        const body = {
            id: jobId,
            currentUserId: currentUserId,
            status: status,
            technicianStatus: technicianStatus,
            ...(amount && { amount: amount })
        };

        const response = await fetch(route('in-progress.mark-in-progress'), {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    return (
        <>
            {/* Note Modal */}
            <Modal
                open={isNoteModalOpen}
                onClose={() => !sendingNote && setIsNoteModalOpen(false)}
                aria-labelledby="note-modal-title"
            >
                <Box sx={{
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
                    overflowY: 'auto'
                }}>
                    <Typography id="note-modal-title" variant="h6" component="h2" className="mb-4">
                        Send Note to Client
                    </Typography>
                    <div className="mb-6">
                        <p className="text-gray-700 mb-4">
                            Add a note about this appointment. The client will be notified, and staff/admins can view this in the system.
                        </p>
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                            <p className="text-sm text-blue-700">
                                <strong>Note:</strong> This note will be visible to the client in their transaction history and will create notifications for staff and administrators.
                            </p>
                        </div>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Enter your note here..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={6}
                            disabled={sendingNote}
                            maxLength={1000}
                        />
                        <p className="text-sm text-gray-500 mt-2 text-right">
                            {noteText.length}/1000 characters
                        </p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsNoteModalOpen(false)}
                            disabled={sendingNote}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSendNote}
                            disabled={sendingNote || !noteText.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {sendingNote ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
            <Modal
                open={isTransferModalOpen}
                onClose={() => !transferring && setIsTransferModalOpen(false)}
                aria-labelledby="transfer-modal-title"
            >
                <Box sx={{
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
                    overflowY: 'auto'
                }}>
                    <Typography id="transfer-modal-title" variant="h6" component="h2" className="mb-4">
                        Transfer Appointment
                    </Typography>
                    <div className="mb-6">
                        <p className="text-gray-700 mb-2">
                            Are you sure you want to transfer this appointment to another technician?
                        </p>
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                            <p className="text-sm text-blue-700">
                                <strong>Note:</strong> This appointment will be reassigned to an available technician through the queuing system.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsTransferModalOpen(false)}
                            disabled={transferring}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleTransferSubmit}
                            disabled={transferring}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {transferring ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
            />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="In Progress" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                    <h1 className="text-xl font-semibold">Jobs In Progress</h1>

                    <div className="flex flex-col gap-4">
                        {loading ? (
                            <div key="loading" className="bg-white p-8 rounded-lg shadow text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-2">Loading appointments...</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div key="empty" className="bg-white p-8 rounded-lg shadow text-center">
                                <p className="text-gray-500">No appointments found for the selected criteria.</p>
                            </div>
                        ) :
                        (jobs.map((job) => (
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
                                    <span className="rounded-full bg-yellow-200 px-3 py-1 text-xs font-medium text-yellow-800">
                                        {job.status}
                                    </span>
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

                                <div className='flex justify-between'>

                                    <div className="mt-3 flex gap-2 flex-wrap">
                                        {/* Send Note Button - Always visible */}
                                        <button
                                            onClick={() => handleOpenNoteModal(parseInt(job.id))}
                                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
                                            disabled={loadingJobs.has(job.appointmentId)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                            Send Note
                                        </button>

                                        {/* Sequential buttons: pending -> in-progress -> completed */}
                                        {job.status === "pending" && (
                                            <button
                                                onClick={() => handleMark(job.appointmentId, 'in-progress')}
                                                className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                                                disabled={loadingJobs.has(job.appointmentId)}
                                            >
                                                {loadingJobs.get(job.appointmentId) === 'in-progress' ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Mark In Progress"
                                                )}
                                            </button>
                                        )}

                                        {job.status === "in-progress" && (
                                            <button
                                                onClick={() => handleMark(job.appointmentId, 'completed')}
                                                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                                disabled={loadingJobs.has(job.appointmentId)}
                                            >
                                                {loadingJobs.get(job.appointmentId) === 'completed' ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Mark Completed"
                                                )}
                                            </button>
                                        )}

                                        {/* Cancel button - Always visible for both statuses */}
                                        {(job.status === "pending" || job.status === "in-progress") && (
                                            <button
                                                onClick={() => handleMark(job.appointmentId, 'canceled')}
                                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                                disabled={loadingJobs.has(job.appointmentId)}
                                            >
                                                {loadingJobs.get(job.appointmentId) === 'canceled' ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Mark Cancel"
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Transfer Button */}
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => handleTransferAppointment(job.appointmentId)}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
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
                        )))}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
