import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AppTable, { Column } from '@/components/table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Completed Today',
        href: '#',
    },
];


export default function CompletedTasks() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Sample data - replace with your actual data source
  const completedJobs = [
    {
      id: 1,
      customerName: "Michael Chen",
      device: "iPhone 13 Pro",
      service: "Screen Replacement",
      startedTime: "8:00 AM",
      completedTime: "9:30 AM",
      duration: "1h 30m",
      notes: "Screen replaced successfully, customer satisfied",
      status: "Completed"
    },
    {
      id: 2,
      customerName: "Lisa Rodriguez",
      device: "Samsung Galaxy A54",
      service: "Charging Port Repair",
      startedTime: "9:45 AM",
      completedTime: "10:15 AM",
      duration: "30m",
      notes: "Charging port cleaned and repaired, tested working",
      status: "Completed"
    },
    {
      id: 3,
      customerName: "David Thompson",
      device: "MacBook Air M2",
      service: "Keyboard Replacement",
      startedTime: "7:30 AM",
      completedTime: "8:45 AM",
      duration: "1h 15m",
      notes: "Full keyboard assembly replaced, all keys functional",
      status: "Completed"
    },
    {
      id: 4,
      customerName: "Anna Williams",
      device: "iPad Air",
      service: "Battery Replacement",
      startedTime: "11:00 AM",
      completedTime: "12:30 PM",
      duration: "1h 30m",
      notes: "Battery replacement completed, device fully tested",
      status: "Completed"
    }
  ];

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
                Total completed: {completedJobs.length} jobs
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
              {completedJobs.map((job) => (
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
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Service:</span> {job.service}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Notes:</span> {job.notes}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    
                    
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State - Show when no completed jobs */}
          {!isLoading && completedJobs.length === 0 && (
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