import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useEcho } from '@laravel/echo-react';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
// import { LoaderCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Completed Today',
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

export default function CompletedTasks() {
    const { auth } = usePage<SharedData>().props;
    const currentUserId = auth.user?.id;
    const echo = useEcho();
    // const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [jobs, setJobs] = useState<Jobs[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState(true);

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

    // Calculate duration between appointment_date and completion_date
    const calculateDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return "N/A";

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Calculate difference in milliseconds
        const diffMs = end.getTime() - start.getTime();

        // Convert to hours and minutes
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        // Format the duration
        if (diffHours > 0 && diffMinutes > 0) {
            return `${diffHours}h ${diffMinutes}m`;
        } else if (diffHours > 0) {
            return `${diffHours}h`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes}m`;
        } else {
            return "Less than 1m";
        }
    };

    // Filter and set jobs when services data is actually available
    useEffect(() => {
        // console.log('Services data:', services[0].appointment_status !== 'completed');
        // console.log('Current user ID:', currentUserId);
        if (services.length > 0) {
            const serviceAppointments = services
                .filter((service: Jobs) => service.user_id === currentUserId)
                .filter((service: Jobs) => service.appointment_status === 'completed')
                .map((service: Jobs) => ({
                    id: service.id.toString(),
                    customerName: service.client_name,
                    device: service.appointment_item_name,
                    service: "Screen Replacement",
                    startedTime: new Date(service.appointment_date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    }),
                    completedTime: new Date(service.completion_date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    }),
                    duration: calculateDuration(service.appointment_date, service.completion_date),
                    // notes: "Screen replaced successfully, customer satisfied",
                    status: service.appointment_status
                }));

            const jobs = [...serviceAppointments];

            setTimeout(() => {
                setJobs(jobs);
                setLoading(false);
            }, 1000);
        }
    }, [services, currentUserId]); // This runs when services or currentUserId changes


    // Sample data - replace with your actual data source
    // const completedJobs = [
    //     {
    //         id: 1,
    //         customerName: "Michael Chen",
    //         device: "iPhone 13 Pro",
    //         service: "Screen Replacement",
    //         startedTime: "8:00 AM",
    //         completedTime: "9:30 AM",
    //         duration: "1h 30m",
    //         notes: "Screen replaced successfully, customer satisfied",
    //         status: "Completed"
    //     },
    //     {
    //         id: 2,
    //         customerName: "Lisa Rodriguez",
    //         device: "Samsung Galaxy A54",
    //         service: "Charging Port Repair",
    //         startedTime: "9:45 AM",
    //         completedTime: "10:15 AM",
    //         duration: "30m",
    //         notes: "Charging port cleaned and repaired, tested working",
    //         status: "Completed"
    //     },
    //     {
    //         id: 3,
    //         customerName: "David Thompson",
    //         device: "MacBook Air M2",
    //         service: "Keyboard Replacement",
    //         startedTime: "7:30 AM",
    //         completedTime: "8:45 AM",
    //         duration: "1h 15m",
    //         notes: "Full keyboard assembly replaced, all keys functional",
    //         status: "Completed"
    //     },
    //     {
    //         id: 4,
    //         customerName: "Anna Williams",
    //         device: "iPad Air",
    //         service: "Battery Replacement",
    //         startedTime: "11:00 AM",
    //         completedTime: "12:30 PM",
    //         duration: "1h 30m",
    //         notes: "Battery replacement completed, device fully tested",
    //         status: "Completed"
    //     }
    // ];

    // Simulate loading effect
    useEffect(() => {
        const timer = setTimeout(() => {
        setIsLoading(false);
        }, 1500); // 1.5 second loading delay

        return () => clearTimeout(timer);
    }, []);




    const breadcrumbs = [
        { name: "Dashboard", href: "/" },
        { name: "Completed Tasks", href: "/completed-tasks" }
    ];

    // Get today's date
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

  return (
    <>
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Completed Tasks" />
        <div className="flex h-full flex-1 flex-col gap-[1px] rounded-xl p-4 overflow-x-auto">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Completed Tasks</h1>
            <p className="text-gray-600">Jobs completed today - {today}</p>
            {!isLoading && (
              <div className="mt-2 text-sm text-gray-500">
                Total completed: {jobs.length} jobs
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-6 animate-pulse">
                  {/* Header Skeleton */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                  </div>

                  {/* Details Skeleton */}
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>

                  {/* Notes Skeleton */}
                  <div className="mb-4">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>

                  {/* Buttons Skeleton */}
                  <div className="flex gap-3">
                    <div className="h-8 bg-gray-300 rounded w-24"></div>
                    <div className="h-8 bg-gray-300 rounded w-28"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Jobs Cards */
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-green-50 border border-green-200 rounded-lg p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.customerName} - {job.device}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Started: {job.startedTime} | {job.service}
                      </p>
                    </div>
                    <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                      {job.status}
                    </span>
                  </div>

                  {/* Completion Details */}
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Completed:</span> {job.completedTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Duration:</span> {job.duration}
                      </p>
                    </div>
                    {/* <div> */}
                    {/*   <p className="text-sm text-gray-700"> */}
                    {/*     <span className="font-medium">Service:</span> {job.service} */}
                    {/*   </p> */}
                    {/* </div> */}
                  </div>

                  {/* Notes */}
                  {/* <div className="mb-4"> */}
                  {/*   <p className="text-sm text-gray-700"> */}
                  {/*     <span className="font-medium">Notes:</span> {job.notes} */}
                  {/*   </p> */}
                  {/* </div> */}

                  {/* Action Buttons */}
                  <div className="flex gap-3">


                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State - Show when no completed jobs */}
          {!isLoading && jobs.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Tasks Today</h3>
              <p className="text-gray-500">Complete some jobs to see them appear here.</p>
            </div>
          )}

        </div>
      </AppLayout>
    </>
  );
}
