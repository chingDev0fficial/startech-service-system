import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'In Progress',
        href: '#',
    },
];


export default function InProgress() { 
    // mock initialization
    const jobs = [
        {
            id: 1,
            customer: "Emily Davis",
            device: "iPhone 14",
            startTime: "10:30 AM",
            task: "Battery Replacement",
            progress: "Battery removed, new battery being installed",
            estimatedCompletion: "11:45 AM",
            status: "In Progress"
        },
        {
            id: 2,
            customer: "John Smith",
            device: "Samsung S22",
            startTime: "09:15 AM",
            task: "Screen Replacement",
            progress: "Screen removed, new screen being attached",
            estimatedCompletion: "10:45 AM",
            status: "In Progress"
        }
    ];

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="In Progress" /> 
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                    <h1 className="text-xl font-semibold">Jobs In Progress</h1>

                    <div className="flex flex-col gap-4">
                        {jobs.map((job) => (
                            <div key={job.id} className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="font-semibold text-gray-900">
                                            {job.customer} - {job.device}
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            Started: {job.startTime} | {job.task}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-yellow-200 px-3 py-1 text-xs font-medium text-yellow-800">
                                        {job.status}
                                    </span>
                                </div>

                                <div className="mt-3 rounded-md border border-yellow-200 bg-white p-3">
                                    <p className="text-sm">
                                        <span className="font-semibold">Progress:</span> {job.progress}
                                    </p>
                                    <p className="text-sm mt-1">
                                        <span className="font-semibold">Estimated completion:</span> {job.estimatedCompletion}
                                    </p>
                                </div>

                                <div className="mt-3 flex gap-2">
                                    <button className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600">
                                        Update Progress
                                    </button>
                                    <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                                        Mark Complete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
