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
    width: 800,
    // maxHeight: '75vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
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
    onSave: (amount: number) => void;
    isLoading: boolean;
}

const SetCompleteModal = ({ isOpen, onClose, onSave, isLoading }: SetCompleteModalProps) => {
    const [amount, setAmount] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
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

        if (isNaN(numericAmount) || numericAmount <= 0) {
            console.log('error2')
            setError('Please enter a valid amount greater than 0');
            return;
        }

        onSave(numericAmount);
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
                            disabled={isLoading}
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
    const echo = useEcho();
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

        return () => {
            echo.leaveChannel('services');
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
    const handleModalSave = async (amount: number) => {
        const jobId = jobData;
        setIsModalSaveClick(true);
        setLoadingJobs(prev => new Map(prev).set(jobId, 'completed'));

        try {
            // Set technician status to available when completing
            await makeApiCallWithAmount(jobId, 'completed', amount, 'available');
            
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
    const makeApiCallWithAmount = async (jobId: number, status: string, amount?: number, technicianStatus?: string) => {
        const body = {
            id: jobId,
            currentUserId: currentUserId,
            status: status,
            price: amount,
            technicianStatus: technicianStatus,
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

                                        <div className="mt-3 flex gap-2">
                                        {/* Show "Mark Progress" only for pending jobs */}
                                        {job.status === "pending" && (
                                            <button
                                                onClick={() => handleMark(job.appointmentId, 'in-progress')}
                                                className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                                                disabled={loadingJobs.has(job.appointmentId)}
                                            >
                                                {loadingJobs.get(job.appointmentId) === 'in-progress' ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Mark Progress"
                                                )}
                                            </button>
                                        )}

                                        {/* Show "Mark Complete" and "Mark Cancel" for both pending and in-progress jobs */}
                                        {(job.status === "pending" || job.status === "in-progress") && (
                                            <>
                                                <button
                                                    onClick={() => handleMark(job.appointmentId, 'completed')}
                                                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                                    disabled={loadingJobs.has(job.appointmentId)}
                                                >
                                                    {loadingJobs.get(job.appointmentId) === 'completed' ? (
                                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        "Mark Complete"
                                                    )}
                                                </button>

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
                                            </>
                                    )}
                                </div>
                            </div>
                        )))}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
