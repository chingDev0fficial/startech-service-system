import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useEcho } from '@laravel/echo-react';
import { useEffect, useState } from 'react';
import { Eye, Check, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Account',
        href: '#',
    },
];

export default function ManageAccount() {
    const echo = useEcho();
    const [fetchedAppointments, setFetchedAppointments] = useState<any[]>([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [acceptProcessLoading, setAcceptProcessing] = useState<Set<number>>(new Set());
    const [declineProcessLoading, setDeclineProcessing] = useState<Set<number>>(new Set());

    const apiBase = `${window.location.protocol}//${window.location.hostname}:8000`;

    const handleFetchedAppointments = async () => {
        try {
            const response = await fetch(`${apiBase}/manage-appointments/fetch`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();

            return result.retrieved;

        } catch ( err ) {
            throw err instanceof Error ? err : new Error(String(err));
        } finally {
            setFetchLoading(false);
        }
    }

    useEffect(() => {
        handleFetchedAppointments()
            .then(data => setFetchedAppointments(data))
            .catch(err => {throw new Error(err)});

        echo.channel('appointments')
            .listen('.appointments.retrieve', (event: any) => {
                setFetchedAppointments(prev => prev.filter(appointment => appointment.mark_as === 'null' ));
            });

        // Cleanup listener on unmount
        return () => {
            echo.leaveChannel('appointments');
        };
    }, [echo]);


    const handleView = async ( id: number ) => {
        console.log("clicked view", id);
    };

    const handleAccept = async (appointmentId) => {
        setAcceptProcessing(prev => new Set([...prev, appointmentId]))
        if (!appointmentId) {
            setAcceptProcessing(prev => {
                const newSet = new Set(prev);
                newSet.delete(appointmentId);
                return newSet;
            });
            return console.error("No appointment ID provided");
        }

        try {
            console.log("id:", appointmentId);
            const res = await fetch(`${apiBase}/manage-appointments/accept/${appointmentId}`, {
                method: 'POST', // RESTful method
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || '',
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();
            console.log(data)

        } catch (err) {
            console.error("Error accepting appointment:", err);
        }
    };

    const handleDecline = async (appointmentId) => {
        setDeclineProcessing(prev => new Set([...prev, appointmentId]))
        if (!appointmentId) {
            setAcceptProcessing(prev => {
                const newSet = new Set(prev);
                newSet.delete(appointmentId);
                return newSet;
            });
            return console.error("No appointment ID provided");
        }

        try {
            // console.log("id:", appointmentId);
            const res = await fetch(`${apiBase}/manage-appointments/decline/${appointmentId}`, {
                method: 'POST', // RESTful method
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || '',
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();
            console.log(data)

        } catch (err) {
            console.error("Error accepting appointment:", err);
        }
    };

    const columns: Column<Country>[] = [
        { id: "schedule", label: "Schedule", minWidth: 170 },
        { id: "customer", label: "Customer", minWidth: 170 },
        { id: "device", label: "Device", minWidth: 170 },
        { id: "issue", label: "Issue", minWidth: 170 },
        {
            label: "Actions",
            minWidth: 150,
            align: "center",
            render: (row) => (
                <div className="flex items-center justify-center gap-5">
                    <button
                        className="text-[#222831] dark:text-[#ffffff]"
                        onClick={() => handleView(row.appointmentId)}>
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        className="text-[#222831] dark:text-[#ffffff]"
                        onClick={() => handleAccept(row.appointmentId)}>
                        <Check className="w-4 h-4" />
                    </button>
                    <button
                        className="text-[#222831] dark:text-[#ffffff]"
                        onClick={() => handleDecline(row.appointmentId)}>
                            <X className="w-4 h-4" />
                        {/* {deleteProcessLoading.has(row.userId) ? ( */}
                        {/*     <LoaderCircle className="h-4 w-4 animate-spin" /> */}
                        {/* ) : ( */}
                        {/*     <X className="w-4 h-4" /> */}
                        {/* )} */}
                    </button>
                </div>
            ),
        },
    ];

    type Data = {
        appointmentId: number;
        schedule: string;
        customer: string;
        device: string;
        issue: string;
    };


    function createData(
        appointmentId: number,
        schedule: string,
        customer: string,
        device: string,
        issue: string,
    ): Data {
        return { appointmentId, schedule, customer, device, issue };
    }

    // console.log("Appointments: ", fetchedAppointments);

    const rows = fetchedAppointments
        .filter(appointment => appointment.mark_as === null)
        .map( appointment =>
            createData( appointment.id, appointment.schedule_at, appointment.client_name, appointment.item, appointment.description)
        );

    return (<>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Accounts" />
            <div className="flex h-full flex-1 flex-col gap-[1px] rounded-xl p-4 overflow-x-auto">
                <AppTable
                    columns={columns}
                    rows={ rows }
                    isLoading={fetchLoading} // Pass loading state
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </div>
        </AppLayout>
    </>);
}
