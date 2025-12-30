import AppLayout from '@/layouts/app-layout';
import Register from './auth/register';
import AppTable, { Column } from '@/components/table';
import Profile from 'settings/profile';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PopUpMessage } from '@/components/pop-up-message';
import { LoaderCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import { useEcho } from '@laravel/echo-react';
import { useEffect, useState } from 'react';
import { FormEventHandler } from 'react';

import { type BreadcrumbItem, type SharedData } from '@/types';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Account',
        href: '#',
    },
];

// type userForm = {
//     name: string,
//     email: string,
//     password: string,
//     role: string,
// };

function RegiterAccount() {
    return (
        <Register />
    );
}

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

function EditUserModal({ isOpen, onClose, userData }) {
    const { data, setData, patch, errors, processing, reset } = useForm({
        name: userData?.name || '',
        email: userData?.email || '',
        password: '',
        role: userData?.role || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('user.update', userData?.id), {
            preserveScroll: true,
            onSuccess: (response) => {
                console.log(`response ${response}`)
                reset('password');
                onClose();
            },
            onError: (errors) => {
                console.log('Update failed:', errors);
            }
        });
    };

    return (<>
        <Modal
            keepMounted
            open={isOpen}
            onClose={onClose}
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"
        >
            <Box sx={style}>
                <Typography id="keep-mounted-modal-title" variant="h6" component="h2" className="flex items-center justify-between">
                    Edit User
                    <Button className="text-[#ffffff] !bg-[#393E46]" onClick={onClose}>
                        <X />
                    </Button>
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label className="block text-sm font-medium mb-1">Name</Label>
                            <Input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                autoComplete="name"
                                className="w-full border rounded px-3 py-2"
                            />
                            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                        </div>

                        <div>
                            <Label className="block text-sm font-medium mb-1">Email</Label>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoComplete="email"
                                className="w-full border rounded px-3 py-2"
                            />
                            {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                        </div>

                        <div>
                            <Label className="block text-sm font-medium mb-1">Password</Label>
                            <Input
                                type="text"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="current-password"
                                className="w-full border rounded px-3 py-2"
                            />
                            {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                        </div>

                        <div>
                            <Label htmlFor='role' className="block text-sm font-medium mb-1">Role</Label>
                            <Select
                                value={data.role}
                                onValueChange={(value) => setData('role', value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent className="z-[9999]">
                                    <SelectItem value="super user">Super User</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="technician">Technician</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && <span className="text-red-500 text-sm">{errors.role}</span>}
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
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </Box>
            </Box>
        </Modal>
    </>);
}

function Accounts() {
    const echo = useEcho();
    const [fetchedUsers, setFetchedUsers] = useState<any[]>([]);
    const [deleteProcessLoading, setDeleteProcessing] = useState<Set<number>>(new Set());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    const { auth } = usePage().props;

    const [popups, setPopups] = useState<Array<{
        id: string;
        message: string;
        show: boolean;
        animate: boolean;
    }>>([]);

    const apiBase = `${window.location.protocol}//${window.location.hostname}:8000`;

    // Function to add a new popup
    const addPopup = (message: string) => {
        const id = Date.now().toString(); // Simple unique ID

        setPopups(prev => [...prev, {
            id,
            message,
            show: true,
            animate: false
        }]);

        // Start animation after brief delay
        setTimeout(() => {
            setPopups(prev => prev.map(popup =>
                popup.id === id ? { ...popup, animate: true } : popup
            ));
        }, 10);

        // Remove popup after 3 seconds
        setTimeout(() => {
            setPopups(prev => prev.map(popup =>
                popup.id === id ? { ...popup, animate: false } : popup
            ));

            setTimeout(() => {
                setPopups(prev => prev.filter(popup => popup.id !== id));
            }, 300);
        }, 3000);
    };

    // Function to show and animate the panel
    const triggerPanel = (message) => {
        setPanelMessage(message);
        setShowPanel(true);

        setTimeout(() => setAnimate(true), 10);

        setTimeout(() => {
        setAnimate(false);
        setTimeout(() => setShowPanel(false), 300);
        }, 3000);
    };

    const hundleFetchUsers = async () => {
        try {
            const response = await fetch(`${apiBase}/manage-accounts/fetch`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();

            if ( !result.success ) throw new Error( 'no user register' );

            return result.retrieved;

        } catch ( err ) {
            throw err instanceof Error ? err : new Error(String(err));
        } finally {
            setFetchLoading(false);
        }
    }

    const handleEdit = async ( userId: number ) => {

        if ( !userId ) {
            return console.error('No user ID provided');
        }

        setLoading(true);

        try{
            const res = await fetch(`${apiBase}/manage-accounts/edit/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ''
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const userData = await res.json();

            setSelectedUserData(userData.data);
            setIsModalOpen(true);

        } catch (err) {
            console.error("Error editing user:", err);
        } finally {
            setLoading(false);
        }

        return (<>

        </>)
    }

    useEffect(() => {
        if (selectedUserData) {
            console.log(`User ${selectedUserData.id}`);
        }
    }, [selectedUserData]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUserData(null);
    };

    const handleDelete = async ( userId: number ) => {
        setDeleteProcessing(prev => new Set([...prev, userId]))
        if (!userId) {
            setDeleteProcessing(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
            return console.error("No user ID provided");
        }

        try {
            const res = await fetch(`${apiBase}/manage-accounts/delete/${userId}`, {
                method: 'DELETE', // RESTful method
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ''
                }
            });

            const data = await res.json();

            // setUsers(data.users || []);
        } catch (err) {
            console.error("Error deleting user:", err);
        }

    }

    useEffect(() => {

        hundleFetchUsers()
            .then(data => setFetchedUsers(data))
            .catch(err => {throw new Error(err)});

        echo.channel('users')
            .listen('.user.deleted', (event: any) => {
                addPopup('Successfully Deleted');
                setFetchedUsers(prev => prev.filter(user => user.id !== event.user.id));
            });

        // Cleanup listener on unmount
        return () => {
            echo.leaveChannel('users');
        };
    }, [echo]);

    const columns: Column<Country>[] = [
        { id: "name", label: "Name", minWidth: 170 },
        { id: "email", label: "Email", minWidth: 170 },
        { id: "role", label: "Role", minWidth: 170 },
        {
            label: "Actions",
            minWidth: 150,
            align: "center",
            render: (row) => (
                <div className="flex items-center justify-center gap-2">
                    <button
                        className="text-[#222831] text-[#ffffff] bg-blue-700 p-2 rounded-md"
                        onClick={() => handleEdit(row.userId)}>
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        className="text-[#222831] text-[#ffffff] bg-red-700 p-2 rounded-md"
                        onClick={() => handleDelete(row.userId)}>
                        {deleteProcessLoading.has(row.userId) ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash className="w-4 h-4" />
                        )}
                    </button>
                </div>
            ),
        },
    ];

    type Data = {
        userId: number;
        name: string;
        email: string;
        role: string;
    };


    function createData(
        userId: number,
        name: string,
        email: string,
        role: string,
    ): Data {
        return { userId, name, email, role };
    }

    const rows = fetchedUsers
    .filter(user => user.id !== auth.user?.id)
    .map( user =>
        createData(user.id, user.name, user.email, user.role)
    );

    // console.log(selectedUserData.name)


    return (<>
        {popups.map(popup => (
            <PopUpMessage
                key={popup.id}
                showPanel={popup.show}
                animate={popup.animate}
                message={popup.message}
            />
        ))}

        {selectedUserData && (
            <EditUserModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                userData={selectedUserData}
            />
        )}

        <AppTable
            columns={columns}
            rows={ rows }
            isLoading={fetchLoading} // Pass loading state
            rowsPerPageOptions={[5, 10, 25]}
        />
    </>);
}

export default function ManageAccount() {

    const [activeTab, setActiveTab] = useState('Accounts')

    return (<>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Accounts" />
            <div className="flex h-full flex-1 flex-col gap-[1px] rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-center w-full">
                    <div className="w-100 grid grid-cols-2 content-center gap-1 p-1 text-[#222831] text-[0.9rem] border border-sidebar-border font-semibold rounded-xl dark:text-[#ffffff]">
                        <button onClick={ () => setActiveTab('Accounts') } className={`p-1 hover:bg-[#393E46] hover:text-[#ffffff] rounded-xl transition duration-[0.2s] ${activeTab === "Accounts" ? "bg-[#393E46] text-[#ffffff]" : "bg-[#ffffff]"}`}>Accounts</button>
                        <button onClick={ () => setActiveTab('Register') } className={`p-1 hover:bg-[#393E46] hover:text-[#ffffff] rounded-xl transition duration-[0.2s] ${activeTab === "Register" ? "bg-[#393E46] text-[#ffffff]" : "bg-[#ffffff]"}`}>Register Account</button>
                    </div>
                </div>

                <div>
                    {activeTab === "Register" ? <RegiterAccount /> : <Accounts />}
                </div>
            </div>
        </AppLayout>
    </>);
}