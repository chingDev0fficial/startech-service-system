import AppLayout from '@/layouts/app-layout';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useEcho } from '@laravel/echo-react';
import { useEffect, useState } from 'react';
import { Eye, Check, X } from 'lucide-react';
import { FormEventHandler } from 'react';
import { CustomRadio } from "@/components/custom-radio";
import { Head, useForm, usePage } from '@inertiajs/react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Account',
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

interface AppointmentFormData {
    appointmentId: string,
    userId: string,
    warranty: string,
    warrantyStatus: string,
}

const apiBase = `${window.location.protocol}//${window.location.hostname}:8000`;

function viewAppointment({ isOpen, onClose, appointmentData }) {
    const [fetchedAppointmentsData, setFetchedAppointmentsData] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFetchAppointmentsData = async () => {
        try {
            setLoading(true);
            const response = await fetch(route('appointment.fetch'), {
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
        } catch(err) {
            console.error('Error fetching users:', err);
            throw err instanceof Error ? err : new Error(String(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const appointments = await handleFetchAppointmentsData();
                setFetchedAppointmentsData(appointments);
            } catch(e) {
                console.error('Failed to fetch appointments:', e);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        console.log(fetchedAppointmentsData);
    }, [fetchedAppointmentsData]);

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
                    Available Technicians
                    <Button className="text-[#ffffff] !bg-[#393E46]" onClick={onClose}>
                        <X />
                    </Button>
                </Typography>
                <Box sx={{ mt: 2 }}>

                    test
                </Box>
            </Box>
        </Modal>
    );


}

function SetAppointmentModal({ isOpen, onClose, appointmentData }) {
    const { data, setData, post, processing, errors, reset } = useForm<AppointmentFormData>({
        appointmentId: '',
        userId: '',
        warranty: '',
        warrantyStatus: '',
    });

    const [fetchedUsers, setFetchedUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setData(
            name as keyof AppointmentFormData,
            value,
        );
    };

    const handleFetchedUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiBase}/manage-accounts/fetch`, {
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

    const fetchUsers = async () => {
        try {
            const users = await handleFetchedUsers();
            setFetchedUsers(users); // Set users to state
            // console.log('Fetched users:', users);
            return users;
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setFetchedUsers([]); // Set empty array on error
        }
    }

    // Fetch users when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    // Transform fetched users to options format
    const options = fetchedUsers
        .filter(user => user.role === 'technician')
        .map(user => ({
            value: user.id?.toString() || user.value,
            title: user.name || user.title || 'Unknown User'
        }));

    const displayOptions = options;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const appointment = e.target.appointmentId.value;
        const technician = e.target.userId.value;

        // Use post instead of patch for appointment creation
        post(route('appointment.accept', {technician: technician, appointment: appointment}), {
            preserveScroll: true,
            onSuccess: (response) => {
                console.log('Appointment created successfully:', response);
                reset();
                onClose();
            },
            onError: (errors) => {
                console.log('Creation failed:', errors);
            },
            onFinish: () => {
                reset();
            },

        });
    };

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
                    Available Technicians
                    <Button className="text-[#ffffff] !bg-[#393E46]" onClick={onClose}>
                        <X />
                    </Button>
                </Typography>
                <Box sx={{ mt: 2 }}>


                    <form onSubmit={submit} className="space-y-4">
                        <input type="hidden" name="appointmentId" value={appointmentData} />
                        <div className="flex flex-col gap-[10px] w-full overflow-x-auto max-h-48 md:max-h-64 lg:max-h-80 overflow-y-auto">
                            {loading ? (
                                <div className="text-center py-4">
                                    <span>Loading technicians...</span>
                                </div>
                            ) : options.length > 0 ? (
                                <CustomRadio
                                    options={options}
                                    name="userId"
                                    value={data.userId}
                                    onChange={(option) => setData('userId', option)}
                                />
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No technicians available at the moment</p>
                                </div>
                            )}

                        </div>

                        <div>
                            <input
                                type="date"
                                name="warranty"
                                value={data.warranty}
                                onChange={handleChange}
                                className="rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0"
                            />
                        </div>

                        <div>
                            <Select
                                name="warrantyStatus"
                                onValueChange={(value) => setData('warrantyStatus', value)}
                                defaultValue={data.warrantyStatus}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Warranty Status" />
                                </SelectTrigger>
                                <SelectContent className="z-[9999]">
                                    <SelectItem value="valid">Valid</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing || loading || !data.userId || options.length === 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Assign Technician'}
                            </button>
                        </div>
                    </form>
                </Box>
            </Box>
        </Modal>
    );
}

export default function ManageAccount() {
    const echo = useEcho();
    const [fetchedAppointments, setFetchedAppointments] = useState<any[]>([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [acceptProcessLoading, setAcceptProcessing] = useState<Set<number>>(new Set());
    const [declineProcessLoading, setDeclineProcessing] = useState<Set<number>>(new Set());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointmentData, setSelectedAppointmentData] = useState<number>(0);

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

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAppointmentData(0);
    };

    const handleView = async ( id: number ) => {
        viewAppointment(true, true, 1);
        console.log("clicked view", id);
    };

    const handleAccept = async (appointmentId) => {
        setSelectedAppointmentData(appointmentId);
        setIsModalOpen(true);
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
                <div className="flex items-center justify-center gap-2">
                    <button
                        className="text-[#222831] text-[#ffffff] bg-blue-700 p-2 rounded-md transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => handleView(row.appointmentId)}>
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        className="text-[#222831] text-[#ffffff] bg-green-700 p-2 rounded-md transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => handleAccept(row.appointmentId)}>
                        <Check className="w-4 h-4" />
                    </button>
                    <button
                        className="text-[#222831] text-[#ffffff] bg-red-700 p-2 rounded-md transform hover:scale-105 transition-transform duration-300 cursor-pointer"
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

        <SetAppointmentModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            appointmentData={selectedAppointmentData}
        />

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
