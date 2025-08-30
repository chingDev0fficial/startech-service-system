import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage History',
        href: '#',
    },
];

export default function ManageHistory() {
    // initialization
    return (<>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Accounts" />
            <div className="flex h-full flex-1 flex-col gap-[1px] rounded-xl p-4 overflow-x-auto">
                This is manage history page
                {/* your design here */}
            </div>
        </AppLayout>
    </>);
}

