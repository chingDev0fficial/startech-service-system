import AppLayout from '@/layouts/app-layout';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useEcho } from '@laravel/echo-react';
import { useEffect, useState } from 'react';
import { Eye, Check, X, AlertCircle, CheckCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { CustomRadio } from "@/components/custom-radio";
import { Head, useForm, usePage } from '@inertiajs/react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

function ViewAppointment({ isOpen, onClose, appointmentData }) {
    const [appointmentDetails, setAppointmentDetails] = useState(null);
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
            console.error('Error fetching appointments:', err);
            throw err instanceof Error ? err : new Error(String(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const appointments = await handleFetchAppointmentsData();
                const details = appointments.find(app => app.id === appointmentData);
                setAppointmentDetails(details);
            } catch(e) {
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
                <Typography variant="h6" component="h2" className="flex items-center justify-between mb-4">
                    Appointment Details
                    <Button className="text-[#ffffff] !bg-[#393E46]" onClick={onClose}>
                        <X />
                    </Button>
                </Typography>
                
                {loading ? (
                    <div className="flex justify-center items-center p-4">
                        Loading appointment details...
                    </div>
                ) : appointmentDetails ? (
                    <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[70vh] pr-2">
                        <div className="col-span-2 bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Client Information</h3>
                            <div className="grid grid-cols-2 gap-2">
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
                            </div>
                        </div>

                        <div className="col-span-2 bg-green-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Service Details</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-sm text-gray-600">Schedule</p>
                                    <p className="font-medium">
                                        {new Date(appointmentDetails.schedule_at).toLocaleString()}
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

                        <div className="col-span-2 bg-yellow-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Device Information</h3>
                            <div className="grid grid-cols-2 gap-2">
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
                                                    className="max-w-full h-auto rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
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
                    <div className="text-center p-4 text-gray-500">
                        No appointment details found
                    </div>
                )}
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setData(
            name as keyof AppointmentFormData,
            value,
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Validate warranty status is selected
        if (!data.warrantyStatus) {
            alert('Please select a warranty status before assigning a technician.');
            return;
        }
        
        const appointment = e.target.appointmentId.value;

        post(route('appointment.accept', {appointment: appointment}), {
            preserveScroll: true,
            onSuccess: (response) => {
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
                    Set Appointment Warranty (if available)
                    <Button className="text-[#ffffff] !bg-[#393E46]" onClick={onClose}>
                        <X />
                    </Button>
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <form onSubmit={submit} className="space-y-4">
                        <input type="hidden" name="appointmentId" value={appointmentData} />

                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <p className='text-[15px]' >Note</p>
                            <p className='text-[13px]'>Set the date when the warranty expires and the warranty 
                                status base on the receipt submitted by the client</p>
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

                        <div className="flex justify-end space-x-2 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-[#393E46]/600 border rounded hover:bg-[#393E46]/50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing || !data.warrantyStatus}
                                className="px-4 py-2 bg-[#393E46] text-white rounded hover:bg-[#393E46]/70 disabled:opacity-50 disabled:cursor-not-allowed"
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

        return () => {
            echo.leaveChannel('appointments');
        };
    }, [echo]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAppointmentData(0);
    };

    const handleView = async ( id: number ) => {
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
            const res = await fetch(`${apiBase}/manage-appointments/decline/${appointmentId}`, {
                method: 'POST',
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
            id: "actions",
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

    const rows = fetchedAppointments
        .filter(appointment => appointment.mark_as === null)
        .map( appointment =>
            createData( appointment.id, appointment.schedule_at, appointment.client_name, appointment.item, appointment.description)
        );

    return (
        <>
            
            {flash.success && (
                <div className="alert alert-success">
                    {flash.success}
                </div>
            )}
            <SetAppointmentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                appointmentData={selectedAppointmentData}
            />

            <ViewAppointment
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                appointmentData={viewAppointmentData}
            />

            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Manage Accounts" />
                
                {/* Notification Alert */}
                {notification && (
                    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
                        <Alert 
                            className={`min-w-[300px] ${
                                notification.type === 'success' 
                                    ? 'bg-green-50 border-green-500 text-green-900' 
                                    : 'bg-red-50 border-red-500 text-red-900'
                            }`}
                        >
                            {notification.type === 'success' ? (
                                <CheckCircle className="h-4 w-4" />
                            ) : (
                                <AlertCircle className="h-4 w-4" />
                            )}
                            <AlertDescription className="ml-2">
                                {notification.message}
                            </AlertDescription>
                            <button
                                onClick={() => setNotification(null)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </Alert>
                    </div>
                )}

                <div className="flex h-full flex-1 flex-col gap-[1px] rounded-xl p-4 overflow-x-auto">
                    <AppTable
                        columns={columns}
                        rows={rows}
                        isLoading={fetchLoading}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </div>
            </AppLayout>
        </>
    );
}