import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Account',
        href: '#',
    },
];

export default function ManageAccount() {

    return (<>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Accounts" />
            <div className="flex h-full flex-1 flex-col gap-[1px] rounded-xl p-4 overflow-x-auto">
                This is Appointment page
            </div>
        </AppLayout>
    </>);
}
