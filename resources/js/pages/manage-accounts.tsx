import AppLayout from '@/layouts/app-layout';
import Register from './auth/register';
import AppTable, { Column } from '@/components/table';
import Profile from 'settings/profile';
import { Head } from '@inertiajs/react';
import { PopUpMessage } from '@/components/pop-up-message';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import { useEcho } from '@laravel/echo-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Account',
        href: '#',
    },
];

function RegiterAccount() {
    return (
        <Register />
    );
}

function Accounts() {
    const echo = useEcho();
    const [fetchedUsers, setFetchedUsers] = useState<any[]>([]);
    const [deleteProcessLoading, setDeleteProcessing] = useState<Set<number>>(new Set());

    const [popups, setPopups] = useState<Array<{
        id: string;
        message: string;
        show: boolean;
        animate: boolean;
    }>>([]);
    // const [showPanel, setShowPanel] = useState(false);
    // const [animate, setAnimate] = useState(false);
    // const [panelMessage, setPanelMessage] = useState("");

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

    async function hundleFetchUsers() {
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
        }
    }

    async function handleEdit( userId: number ) {
        if ( !userId ) {
            return console.error('No user ID provided');
        }

        try{
            const res = await fetch(`${apiBase}/manage-accounts/edit/${userId}`, {
                method: 'POST',
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ''
                }
            });

            const userData = await res.json();

        } catch (err) {
            console.error("Error editing user:", err);
        }
    }

    async function handleDelete( userId: number ){
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
                <div className="flex items-center justify-center gap-5">
                    <button
                        className="text-[#222831] dark:text-[#ffffff]"
                        onClick={() => console.log("Edit", row)}>
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        className="text-[#222831] dark:text-[#ffffff]"
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

    const rows = fetchedUsers.map( user =>
        createData(user.id, user.name, user.email, user.role)
    );


    return (<>
        {popups.map(popup => (
            <PopUpMessage
                key={popup.id}
                showPanel={popup.show}
                animate={popup.animate}
                message={popup.message}
            />
        ))}
        <AppTable columns={columns} rows={ rows } />
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
