import AppTable, { Column } from '@/components/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { AlertCircle, Check, CheckCircle, Eye, LoaderCircle, X } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Button } from '@/components/ui/button';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import * as React from 'react';

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
    width: 'clamp(300px, 90vw, 800px)',
    maxHeight: '90vh',
    overflow: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: { xs: 2, sm: 3, md: 4 },
    borderRadius: 1,
};

interface AppointmentFormData {
    appointmentId: string;
    userId: string;
    warrantyStatus: string;
    fixedPrice: number;
}

const apiBase = `${window.location.protocol}//${window.location.hostname}:8000`;

function ViewAppointment({ isOpen, onClose, appointmentData }) {
    const [appointmentDetails, setAppointmentDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFetchAppointmentsData = async () => {
        try {
            setLoading(true);
            const response = await fetch(route('appointment.fetch'), {
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
            console.error('Error fetching appointments:', err);
            throw err instanceof Error ? err : new Error(String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const appointments = await handleFetchAppointmentsData();
                const details = appointments.find((app) => app.id === appointmentData);
                setAppointmentDetails(details);
            } catch (e) {
                console.error('Failed to fetch appointments:', e);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen, appointmentData]);

    return (
        <Modal
            keepMounted
            open={isOpen}
            onClose={onClose}
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"
        >
            <Box sx={style}>
                <Typography variant="h6" component="h2" className="mb-4 flex items-center justify-between">
                    Appointment Details
                    <Button className="!bg-[#393E46] text-[#ffffff]" onClick={onClose}>
                        <X />
                    </Button>
                </Typography>

                {loading ? (
                    <div className="flex items-center justify-center p-4">Loading appointment details...</div>
                ) : appointmentDetails ? (
                    <div className="grid max-h-[70vh] grid-cols-1 gap-3 overflow-y-auto pr-2 sm:grid-cols-2 sm:gap-4">
                        <div className="col-span-1 rounded-lg bg-blue-50 p-3 sm:col-span-2 sm:p-4">
                            <h3 className="mb-2 text-base font-semibold sm:text-lg">Client Information</h3>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-medium">{appointmentDetails.client_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">{appointmentDetails.client_phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{appointmentDetails.client_email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Address</p>
                                    <p className="font-medium">{appointmentDetails.address}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-1 rounded-lg bg-green-50 p-3 sm:col-span-2 sm:p-4">
                            <h3 className="mb-2 text-base font-semibold sm:text-lg">Service Details</h3>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-gray-600">Schedule</p>
                                    <p className="font-medium">
                                        {new Date(appointmentDetails.schedule_at).toLocaleString('en-PH', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true,
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Service Type</p>
                                    <p className="font-medium capitalize">{appointmentDetails.service_type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Location</p>
                                    <p className="font-medium capitalize">{appointmentDetails.service_location}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="font-medium capitalize">{appointmentDetails.status}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-1 rounded-lg bg-yellow-50 p-3 sm:col-span-2 sm:p-4">
                            <h3 className="mb-2 text-base font-semibold sm:text-lg">Device Information</h3>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-gray-600">Device</p>
                                    <p className="font-medium">{appointmentDetails.item}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Issue Description</p>
                                    <p className="font-medium">{appointmentDetails.description}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Warranty Receipt</p>
                                    <div className="font-medium">
                                        {appointmentDetails.warranty_receipt ? (
                                            <div className="mt-2">
                                                <img
                                                    src={`/storage/${appointmentDetails.warranty_receipt}`}
                                                    alt="Warranty Receipt"
                                                    className="h-auto max-w-full cursor-pointer rounded-lg shadow-lg transition-opacity hover:opacity-90"
                                                    onClick={() => window.open(`/storage/${appointmentDetails.warranty_receipt}`, '_blank')}
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">No warranty receipt available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-center text-gray-500">No appointment details found</div>
                )}
            </Box>
        </Modal>
    );
}

function SetAppointmentModal({ isOpen, onClose, appointmentData }) {
    const { data, setData, post, processing, errors, reset } = useForm<AppointmentFormData>({
        appointmentId: '',
        userId: '',
        warrantyStatus: '',
        fixedPrice: 0.0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData(name as keyof AppointmentFormData, name === 'fixedPrice' ? parseFloat(value) || 0 : value);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Validate warranty status is selected
        if (!data.warrantyStatus) {
            alert('Please select a warranty status before assigning a technician.');
            return;
        }

        const appointment = e.target.appointmentId.value;

        post(route('appointment.accept', { appointment: appointment }), {
            preserveScroll: true,
            onSuccess: (response) => {
                reset();
                onClose();
            },
            onError: (errors) => {
                console.error('Creation failed:', errors);
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
                <Typography
                    id="keep-mounted-modal-title"
                    variant="h6"
                    component="h2"
                    className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center"
                >
                    <span>Set Appointment Warranty (if available)</span>
                    <Button className="!bg-[#393E46] text-[#ffffff]" onClick={onClose}>
                        <X />
                    </Button>
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <form onSubmit={submit} className="space-y-4">
                        <input type="hidden" name="appointmentId" value={appointmentData} />

                        <div className="relative rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700" role="alert">
                            <p className="text-[15px]">Note</p>
                            <p className="text-[13px]">
                                Set the date when the warranty expires and the warranty status base on the receipt submitted by the client
                            </p>
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
                                    <SelectItem value="valid">Warranty</SelectItem>
                                    <SelectItem value="expired">No Warranty</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Input name="fixedPrice" type="number" value={data.fixedPrice} onChange={handleChange}></Input>
                        </div>

                        <div className="flex flex-col justify-end gap-2 pt-4 sm:flex-row">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full rounded border px-4 py-2 text-[#393E46]/600 hover:bg-[#393E46]/50 sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing || !data.warrantyStatus}
                                className="w-full rounded bg-[#393E46] px-4 py-2 text-white hover:bg-[#393E46]/70 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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

export default function ManageAppointments() {
    const echo = useEcho();
    const [fetchedAppointments, setFetchedAppointments] = useState<any[]>([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [acceptProcessLoading, setAcceptProcessing] = useState<Set<number>>(new Set());
    const [declineProcessLoading, setDeclineProcessing] = useState<Set<number>>(new Set());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointmentData, setSelectedAppointmentData] = useState<number>(0);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewAppointmentData, setViewAppointmentData] = useState(null);

    // Notification state
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const apiBase = `${window.location.protocol}//${window.location.hostname}:8000`;

    const handleFetchedAppointments = async () => {
        try {
            const response = await fetch(`${apiBase}/manage-appointments/fetch`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();
            return result.retrieved;
        } catch (err) {
            throw err instanceof Error ? err : new Error(String(err));
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        handleFetchedAppointments()
            .then((data) => setFetchedAppointments(data))
            .catch((err) => {
                throw new Error(err);
            });

        echo.channel('appointments').listen('.appointments.retrieve', (event: any) => {
            setFetchedAppointments((prev) => prev.filter((appointment) => appointment.mark_as === 'null'));
        });

        return () => {
            echo.leaveChannel('appointments');
        };
    }, [echo]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAppointmentData(0);
    };

    const handleView = async (id: number) => {
        setViewAppointmentData(id);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewAppointmentData(null);
    };

    const handleAccept = async (appointmentId) => {
        setSelectedAppointmentData(appointmentId);
        setIsModalOpen(true);
    };

    const { flash } = usePage().props;

    const handleDecline = async (appointmentId) => {
        setDeclineProcessing((prev) => new Set([...prev, appointmentId]));
        if (!appointmentId) {
            setAcceptProcessing((prev) => {
                const newSet = new Set(prev);
                newSet.delete(appointmentId);
                return newSet;
            });
            return console.error('No appointment ID provided');
        }

        try {
            const res = await fetch(`${apiBase}/manage-appointments/decline/${appointmentId}`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();
            return appointmentId;
        } catch (err) {
            console.error('Error accepting appointment:', err);
        }
    };

    const columns: Column<Country>[] = [
        { id: 'schedule', label: 'Schedule', minWidth: 170 },
        { id: 'customer', label: 'Customer', minWidth: 170 },
        { id: 'device', label: 'Device', minWidth: 170 },
        { id: 'issue', label: 'Issue', minWidth: 170 },
        {
            id: 'actions',
            label: 'Actions',
            minWidth: 150,
            align: 'center',
            render: (row) => (
                <div className="flex items-center justify-center gap-2">
                    <button
                        className="transform cursor-pointer rounded-md bg-blue-700 p-2 text-[#222831] text-[#ffffff] transition-transform duration-300 hover:scale-105"
                        onClick={() => handleView(row.appointmentId)}
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        className="transform cursor-pointer rounded-md bg-green-700 p-2 text-[#222831] text-[#ffffff] transition-transform duration-300 hover:scale-105"
                        onClick={() => handleAccept(row.appointmentId)}
                    >
                        <Check className="h-4 w-4" />
                    </button>
                    <button
                        className="transform cursor-pointer rounded-md bg-red-700 p-2 text-[#222831] text-[#ffffff] transition-transform duration-300 hover:scale-105"
                        onClick={() =>
                            handleDecline(row.appointmentId).then((appointmentId) => {
                                setDeclineProcessing((prev) => {
                                    const newSet = new Set(prev);
                                    newSet.delete(appointmentId);
                                    return newSet;
                                });
                            })
                        }
                    >
                        {declineProcessLoading.has(row.appointmentId) ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
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

    function createData(appointmentId: number, schedule: string, customer: string, device: string, issue: string): Data {
        return { appointmentId, schedule, customer, device, issue };
    }

    const rows = fetchedAppointments
        .filter((appointment) => appointment.mark_as === null)
        .map((appointment) =>
            createData(
                appointment.id,
                new Date(appointment.schedule_at).toLocaleString(),
                appointment.client_name,
                appointment.item,
                appointment.description,
            ),
        );

    return (
        <>
            {flash.success && <div className="alert alert-success">{flash.success}</div>}
            <SetAppointmentModal isOpen={isModalOpen} onClose={handleCloseModal} appointmentData={selectedAppointmentData} />

            <ViewAppointment isOpen={isViewModalOpen} onClose={handleCloseViewModal} appointmentData={viewAppointmentData} />

            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Manage Accounts" />

                {/* Notification Alert */}
                {notification && (
                    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
                        <Alert
                            className={`min-w-[300px] ${
                                notification.type === 'success'
                                    ? 'border-green-500 bg-green-50 text-green-900'
                                    : 'border-red-500 bg-red-50 text-red-900'
                            }`}
                        >
                            {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertDescription className="ml-2">{notification.message}</AlertDescription>
                            <button onClick={() => setNotification(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                                <X className="h-4 w-4" />
                            </button>
                        </Alert>
                    </div>
                )}

                <div className="flex h-full flex-1 flex-col gap-[1px] overflow-x-auto rounded-xl p-4">
                    <AppTable columns={columns} rows={rows} isLoading={fetchLoading} rowsPerPageOptions={[5, 10, 25]} />
                </div>
            </AppLayout>
        </>
    );
}
