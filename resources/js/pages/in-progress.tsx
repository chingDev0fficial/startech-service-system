import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useEcho } from '@laravel/echo-react';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'In Progress',
        href: '#',
    },
];

interface Jobs {
    id: string,
    appointment_id: number,
    customer: string,
    device: string,
    start_time: string,
    service_type: string,
    description: string,
    appointment_status: string,
}

export default function InProgress() {
    const { auth } = usePage<SharedData>().props;
    const currentUserId = auth.user?.id;
    const echo = useEcho();
    // const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [jobs, setJobs] = useState<Jobs[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    // const [, setServices] = useState<string>('all');
    const [inProgressProcessLoading, setInProgressProcessing] = useState<Set<number>>(new Set());
    const [completeProcessLoading, setCompleteProcessing] = useState<Set<number>>(new Set());
    const [cancelProcessLoading, setCancelProcessing] = useState<Set<number>>(new Set());

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
            // setLoading(false);
        }
    }

    const loadServices = async () => {
        try {
            const fetchedServices = await handleFetchedServices();
            setServices(fetchedServices);
        } catch (err) {
            console.error('failed to fetch services:', err);
        }
    }

    // Load services when selectedDate or echo changes
    useEffect(() => {
        loadServices();
    }, [echo]);

    // Filter and set jobs when services data is actually available
    useEffect(() => {
        // console.log('Services data:', services[0].appointment_status !== 'completed');
        // console.log('Current user ID:', currentUserId);
        if (services.length > 0) {
            const serviceAppointments = services
                .filter((service: Jobs) => service.user_id === currentUserId)
                .filter((service: Jobs) => service.appointment_status === 'pending' || service.appointment_status === 'in-progress')
                .map((service: Jobs) => ({
                    id: service.id.toString(),
                    appointment_id: service.appointment_id,
                    customer: service.client_name,
                    device: service.appointment_item_name,
                    startTime: new Date(service.appointment_date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    }),
                    service_type: service.appointment_service_type,
                    description: service.appointment_description,
                    status: service.appointment_status,
                }));

            const jobs = [...serviceAppointments];

            setTimeout(() => {
                setJobs(jobs);
                setLoading(false);
            }, 1000);
        }
    }, [services, currentUserId]); // This runs when services or currentUserId changes

    const handleMark = async (jobId: number, status: string) => {
        // Logic to mark job as in progress
        // console.log(`Marking job ${jobId} as in progress`);

        if (status === 'in-progress') {
            setInProgressProcessing(prev => new Set([...prev, jobId]));
            if (!jobId) {
                setInProgressProcessing(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(jobId);
                    return newSet;
                });
                return console.error("No user ID provided");
            }
        }
        else if (status === 'completed') {
            setCompleteProcessing(prev => new Set([...prev, jobId]));
            if (!jobId) {
                setCompleteProcessing(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(jobId);
                    return newSet;
                });
                return console.error("No user ID provided");
            }
        }
        else if (status === 'canceled') {
            setCancelProcessing(prev => new Set([...prev, jobId]));
            if (!jobId) {
                setCancelProcessing(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(jobId);
                    return newSet;
                });
                return console.error("No user ID provided");
            }
        }

        try {
            const response = await fetch(route('in-progress.mark-in-progress'), {
                method: 'POST',
                body: JSON.stringify({ id: jobId, status: status }),
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        catch(error) {
            console.error('Error marking job as in progress:', error);
        }
    }

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="In Progress" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                    <h1 className="text-xl font-semibold">Jobs In Progress</h1>

                    <div className="flex flex-col gap-4">
                        {loading ? (
                            <div className="bg-white p-8 rounded-lg shadow text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-2">Loading appointments...</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="bg-white p-8 rounded-lg shadow text-center">
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
                                            Schedule: {job.startTime} | {job.service_type}
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
                                        {job.status === "pending" && (
                                            <>
                                            <button
                                                onClick={() => handleMark(job.appointment_id, 'in-progress')}
                                                className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                                            >
                                                {inProgressProcessLoading.has(job.appointment_id) ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Mark Progress"
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleMark(job.appointment_id, 'completed')}
                                                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                            >
                                                {completeProcessLoading.has(job.appointment_id) ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Mark Complete"
                                                )}
                                        </button>
                                        <button
                                            onClick={() => handleMark(job.appointment_id, 'canceled')}
                                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                        >
                                            {cancelProcessLoading.has(job.appointment_id) ? (
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                            ) : (
                                                "Mark Cancel"
                                            )}
                                        </button>
                                    </>
                                )}

                                {job.status === "in-progress" && (
                                    <>
                                    <button
                                        onClick={() => handleMark(job.appointment_id, 'completed')}
                                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                    >
                                        {completeProcessLoading.has(job.appointment_id) ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Mark Complete"
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleMark(job.appointment_id, 'canceled')}
                                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                    >
                                        {cancelProcessLoading.has(job.appointment_id) ? (
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
