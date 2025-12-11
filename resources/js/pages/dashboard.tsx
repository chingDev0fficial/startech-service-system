import * as React from "react"

import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import { Card, CardTitle, CardDescription, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/icon";

import { ToolCase, ClipboardClock, PhilippinePeso, Star, User, LaptopMinimal, AppWindow, BrushCleaning } from 'lucide-react';

import { CollapsibleWrapper } from "@/components/collapsable-content";

import { useState, useEffect, useCallback } from 'react';
import { useEcho } from '@laravel/echo-react';

import { Home, MapPin } from 'lucide-react';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { floated } from "@material-tailwind/react/types/components/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DotProps {
    serviceType: string;
}

function Dot({ serviceType }: DotProps) {
    return (<>
        <div className="grid grid-cols-1 grid-rows-1 place-items-center">
            <div className={`rounded-xl w-[7px] h-[7px] ${ serviceType.toLowerCase() === "home service" ? "bg-blue-500" : "bg-orange-500"}`}></div>
        </div>
    </>)
}

interface DashboardCardProps {
    icon: any;
    iconColor: 'blue' | 'orange' | 'green' | 'purple';
    title: string;
    value: string | number;
}

function DashboardCard({ icon, iconColor, title, value }: DashboardCardProps) {

    const colors = {
        blue: {
            bg: "bg-blue-500/30",
            text: "text-blue-700"
        },
        orange: {
            bg: "bg-orange-500/30",
            text: "text-orange-700"
        },
        green: {
            bg: "bg-green-500/30",
            text: "text-green-700"
        },
        purple: {
            bg: "bg-purple-500/30",
            text: "text-purple-700"
        }
    };

    const icon_bg_color = colors[iconColor].bg;
    const icon_text_color =  colors[iconColor].text;

    return (<>
        <Card className="!flex-row items-center justify-between w-full bg-sidebar shadow-lg m-4 border border-sidebar-border p-2">
            <CardContent className="!p-[0]">
                <CardTitle className="!font-normal text-[0.7rem] text-[#393E46] dark:text-[#ffffff]">{ title }</CardTitle>
                <CardDescription className="!font-semibold text-[1.2rem] text-[#222831] dark:text-[#ffffff]">{ value }</CardDescription>
            </CardContent>
            <Avatar className={`h-9 w-9 flex items-center justify-center ${icon_bg_color}`}>
                <Icon iconNode={icon} className={` ${ icon_text_color } dark:text-[#ffffff] `} strokeWidth={2} />
            </Avatar>
        </Card>
    </>);
}

interface PricingCardProps {
    title: string;
    initialPrice: number;
    icon: any;
    description: string;
    onPriceChange: (price: number) => void;
}

function PricingCard({ title, initialPrice, icon, description, onPriceChange }: PricingCardProps) {
    const [price, setPrice] = useState(initialPrice);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPrice = parseFloat(e.target.value) || 0;
        setPrice(newPrice);
        onPriceChange(newPrice);
    };

    return (
        <Card className="bg-sidebar shadow-lg m-4 border border-sidebar-border p-4">
            <CardContent className="flex items-center justify-between">
                <div className="w-full">
                    <CardTitle className="text-lg font-semibold mb-2">{title}</CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="flex items-baseline">
                            <span className="text-lg font-bold text-[#222831] dark:text-white mr-2">₱</span>
                            <Input
                                type="number"
                                value={initialPrice}
                                onChange={handlePriceChange}
                                className="w-32"
                                min="0"
                            />
                        </div>
                        <span className="text-sm text-gray-500">{description}</span>
                    </div>
                </div>
                <Avatar className="h-12 w-12 flex items-center justify-center bg-blue-500/30">
                    <Icon iconNode={icon} className="text-blue-700 dark:text-white" strokeWidth={2} />
                </Avatar>
            </CardContent>
        </Card>
    );
}

interface AppointmentDetails {
    id: number;
    client_id: number;
    schedule_at: string;
    item: string;
    service_type: string;
    service_location: string;
    description: string;
    mark_as: string;
    created_at: string;
    updated_at: string;
    warranty_receipt?: string;
    price?: string;
    address?: string;
    phone_number?: string;
    name: string;
    status?: string;
    rating?: number;
    technician_name?: string;
    technician_email?: string;
    technician_id?: number;
}

function AppointmentInfoModal({ isOpen, onClose, appointmentId }: { 
    isOpen: boolean; 
    onClose: () => void; 
    appointmentId: string | null;
}) {
    const [appointmentData, setAppointmentData] = useState<AppointmentDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && appointmentId) {
            handleFetchAppointmentInfo();
        }
    }, [isOpen, appointmentId]);

    const handleFetchAppointmentInfo = async () => {
        if (!appointmentId) return;

        try {
            setIsLoading(true);
            setError(null);

            // Remove # from appointmentId if present
            const cleanId = appointmentId.replace('#', '');

            const response = await fetch(`/dashboard/fetch-appointment-data/${cleanId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success && result.data) {
                setAppointmentData(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch appointment');
            }
        } catch(error) {
            console.error('Error fetching appointment info:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch appointment details');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-sidebar border-sidebar-border max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col p-4 sm:p-6">
                <DialogHeader className="flex-shrink-0 pb-3 sm:pb-4">
                    <DialogTitle className="text-base sm:text-lg md:text-xl text-[#222831] dark:text-white">
                        Appointment Details
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-[#393E46] dark:text-gray-300">
                        {appointmentId && `Appointment ${appointmentId}`}
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <p className="text-[#393E46] dark:text-white">Loading...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {appointmentData && !isLoading && (
                    <div className="space-y-3 sm:space-y-4 overflow-y-auto flex-1 pr-2 sm:pr-3 -mr-2 sm:-mr-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <p className="text-xs text-[#393E46] dark:text-gray-400">Service Type</p>
                                <p className="text-sm sm:text-base font-semibold text-[#222831] dark:text-white capitalize break-words">{appointmentData.service_type}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#393E46] dark:text-gray-400">Status</p>
                                <div className={`inline-block px-2 py-1 rounded text-xs capitalize ${
                                    appointmentData.status?.toLowerCase() === "pending" ? "bg-orange-500/30 text-orange-700" :
                                    appointmentData.status?.toLowerCase() === "in-progress" ? "bg-yellow-500/30 text-yellow-700" :
                                    appointmentData.status?.toLowerCase() === "completed" ? "bg-green-500/30 text-green-700" :
                                    "bg-red-500/30 text-red-700"
                                }`}>
                                    {appointmentData.status || 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <p className="text-xs text-[#393E46] dark:text-gray-400">Customer Name</p>
                                <p className="text-sm sm:text-base font-semibold text-[#222831] dark:text-white break-words">{appointmentData.name}</p>
                            </div>
                            {appointmentData.phone_number && (
                                <div>
                                    <p className="text-xs text-[#393E46] dark:text-gray-400">Phone Number</p>
                                    <p className="text-sm sm:text-base font-semibold text-[#222831] dark:text-white break-words">{appointmentData.phone_number}</p>
                                </div>
                            )}
                        </div>

                        {appointmentData.technician_name && (
                            <div className="border-t border-sidebar-border pt-3 sm:pt-4 mt-2">
                                <p className="text-xs text-[#393E46] dark:text-gray-400 mb-2 font-semibold">Assigned Technician</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <p className="text-xs text-[#393E46] dark:text-gray-400">Name</p>
                                        <p className="text-sm sm:text-base font-semibold text-[#222831] dark:text-white break-words">{appointmentData.technician_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#393E46] dark:text-gray-400">Email</p>
                                        <p className="text-sm sm:text-base font-semibold text-[#222831] dark:text-white break-words">{appointmentData.technician_email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-xs text-[#393E46] dark:text-gray-400">Item/Device</p>
                            <p className="text-sm sm:text-base font-semibold text-[#222831] dark:text-white break-words">{appointmentData.item}</p>
                        </div>

                        <div>
                            <p className="text-xs text-[#393E46] dark:text-gray-400">Description</p>
                            <p className="text-sm sm:text-base text-[#222831] dark:text-white break-words">{appointmentData.description}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <p className="text-xs text-[#393E46] dark:text-gray-400">Service Location</p>
                                <p className="text-sm sm:text-base font-semibold text-[#222831] dark:text-white capitalize break-words">{appointmentData.service_location}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#393E46] dark:text-gray-400">Mark As</p>
                                <p className="text-sm sm:text-base font-semibold text-[#222831] dark:text-white capitalize break-words">{appointmentData.mark_as}</p>
                            </div>
                        </div>

                        {appointmentData.address && (
                            <div>
                                <p className="text-xs text-[#393E46] dark:text-gray-400">Address</p>
                                <p className="text-sm sm:text-base text-[#222831] dark:text-white break-words">{appointmentData.address}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-xs text-[#393E46] dark:text-gray-400">Scheduled At</p>
                            <p className="text-sm sm:text-base font-semibold text-[#222831] dark:text-white break-words">
                                {new Date(appointmentData.schedule_at).toLocaleString()}
                            </p>
                        </div>

                        {appointmentData.warranty_receipt && (
                            <div>
                                <p className="text-xs text-[#393E46] dark:text-gray-400 mb-2">Warranty Receipt</p>
                                <img 
                                    src={`/storage/${appointmentData.warranty_receipt}`} 
                                    alt="Warranty Receipt"
                                    className="w-full max-w-md rounded-lg border border-sidebar-border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => window.open(`/storage/${appointmentData.warranty_receipt}`, '_blank')}
                                />
                            </div>
                        )}

                        {appointmentData.price && (
                            <div>
                                <p className="text-xs text-[#393E46] dark:text-gray-400">Price</p>
                                <p className="text-sm sm:text-base font-semibold text-[#222831] dark:text-white">₱{appointmentData.price}</p>
                            </div>
                        )}

                        {appointmentData.rating && (
                            <div>
                                <p className="text-xs text-[#393E46] dark:text-gray-400">Rating</p>
                                <p className="text-sm sm:text-base font-semibold text-[#222831] dark:text-white">⭐ {appointmentData.rating}/5</p>
                            </div>
                        )}

                        <div className="text-xs text-[#393E46] dark:text-gray-400 pt-2 border-t border-sidebar-border pb-4">
                            <p className="mb-1">Created: {new Date(appointmentData.created_at).toLocaleString()}</p>
                            <p>Updated: {new Date(appointmentData.updated_at).toLocaleString()}</p>
                        </div>
                    </div>
                )}

                {/* <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-sidebar-border flex-shrink-0">
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
                </div> */}
            </DialogContent>
        </Dialog>
    );
}

export default function Dashboard() {
    const echo = useEcho();
    const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [dataAppointments, setDataAppointments] = useState<Array<any>>([]);
    const [dataTech, setDataTech] = useState<Array<any>>([]);
    const [activeRepair, setActiveRepair] = useState<number>(0);
    const [pendingAppointments, setPendingAppointments] = useState<number>(0);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [satisfaction, setSatisfaction] = useState<number>(0.0);

    // Add cache state
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);
    const CACHE_DURATION = 10000; // 10 seconds

    // const [initialServicePrices, setInitialServicePrices] = useState<{ within: number; outside: number } | null>(null);

    const [cityPrice, setCityPrice] = useState(0);
    const [outsidePrice, setOutsidePrice] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

    const handlePendingClick = (appointmentId: string) => {
        setSelectedAppointmentId(appointmentId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAppointmentId(null);
    };

    const getServicePrices = async () => {
       try {
            const response = await fetch('dashboard/get-service-price', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        }
        catch (error)
        {
            console.error('Error fetching service prices:', error);
        }
    }

    useEffect(() => {
        // Fetch initial service prices on component mount
        const fetchInitialPrices = async () => {
            const prices = await getServicePrices();
            if (prices) {
                setCityPrice(prices.within);
                setOutsidePrice(prices.outside);
            }
        };

        fetchInitialPrices();
    }, []);

    const handleSavePrices = async () => {
        try {
            setIsSaving(true);
            const response = await fetch('dashboard/set-service-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    within  :  cityPrice,
                    outside :  outsidePrice
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update prices');
            }

            // Show success message or toast notification
            alert('Prices updated successfully');
        } catch (error) {
            console.error('Error updating prices:', error);
            alert('Failed to update prices');
        } finally {
            setIsSaving(false);
        }
    };


    const handleFetchAppointment = useCallback(async () => {
        // Check cache
        const now = Date.now();
        if (now - lastFetchTime < CACHE_DURATION) {
            return dataAppointments;
        }

        try {
            setIsLoading(true);
            const response = await fetch(route('fetch.todaysAppoint'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            // Check for non-JSON responses
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response');
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } 

            const data = await response.json();
            setLastFetchTime(now);
            setError(null);
            return data.retrieved || [];
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMessage);
            return dataAppointments; // Return existing data on error
        } finally {
            setIsLoading(false);
        }
    }, [dataAppointments, lastFetchTime]);

    const handleFetchTech = useCallback(async () => {
        // Similar cache check
        const now = Date.now();
        if (now - lastFetchTime < CACHE_DURATION) {
            return dataTech;
        }

        try {
            setIsLoading(true);
            const response = await fetch('/dashboard/fetch-technician', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setLastFetchTime(now);
            setError(null);
            return data.retrieved || [];
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMessage);
            return dataTech; // Return existing data on error
        } finally {
            setIsLoading(false);
        }
    }, [dataTech, lastFetchTime]);

    // Update timer interval to 10 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 10000);

        return () => clearInterval(timer);
    }, []);

    // Update data fetch effects
    useEffect(() => {
        handleFetchAppointment()
            .then(data => {
                const activeRepairCount = data.filter((appointment: any) => appointment.status === "in-progress").length
                const pendingAppointmentsCount = data.filter((appointment: any) => appointment.status === "pending").length

                const totalRatings = data.reduce((sum: number, appointment: any) => 
                    appointment.rating !== null && appointment.rating !== undefined 
                        ? sum + appointment.rating 
                        : sum, 
                    0
                );
                const numberOfRatings = data.filter((appointment: any) => appointment.rating !== null && appointment.rating !== undefined).length;
                const averageSatisfaction = numberOfRatings > 0 ? (totalRatings / numberOfRatings) : 0;
                setSatisfaction(parseFloat(averageSatisfaction.toFixed(2)));

                const formatter = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                });
                const revenueTotal = data.filter((appointment: any) => appointment.status === "completed")
                    .reduce((sum: number, appointment: any) => sum + parseInt(appointment.price), 0);
                const formattedPrice = formatter.format(revenueTotal);

                setTotalRevenue(revenueTotal);
                setActiveRepair(activeRepairCount);
                setPendingAppointments(pendingAppointmentsCount);
                setDataAppointments(data);
            })
            .catch(error => {
                console.error('Failed to fetch appointments:', error);
            });
    }, [currentDateTime, echo, handleFetchAppointment]);

    useEffect(() => {
        handleFetchTech()
            .then(data => {
                setDataTech(data);
            })
            .catch(error => {
                console.error('Failed to fetch appointments:', error);
            });
    }, [currentDateTime, echo, handleFetchTech]);

    let todaysAppointment = dataAppointments
        .filter(appointment => new Date(appointment?.schedule_at).toLocaleDateString() === currentDateTime.toLocaleDateString())
        .map(appointment => ({
            setTime: appointment.schedule_at,
            serviceType: appointment.service_type,
            client: appointment.name,
            purpose: appointment.service_location,
        }))

    let recentServiceReq = dataAppointments
        .filter(service => service.status === "pending" || service.status === "in-progress")
        .map(service => ({
            serviceType: service.service_type,
            itemBrand: service.item,
            purpose: service.description,
            customerName: service.name,
            appointmentId: `#${service.id}`,
            status: service.status
        }))

    let availableStatusTechnician = dataTech
        .filter(tech => tech.role === "technician")
        .map(tech => ({
            icon: User,
            name: tech.name,
            status: tech.status
        }))

    const statCards = [
        {icon: ToolCase, iconColor: "blue" as const, title: "Active Repairs", value: activeRepair},
        {icon: ClipboardClock, iconColor: "orange" as const, title: "pending Appointments", value: pendingAppointments},
        {icon: PhilippinePeso, iconColor: "green" as const, title: "Today's Revenue", value: totalRevenue},
        {icon: Star, iconColor: "purple" as const, title: "Satisfaction", value: `${satisfaction}/5`},
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div className="flex h-full flex-1 flex-col gap-[1px] rounded-xl p-4 overflow-x-auto">
                <div className="grid auto-rows-min gap-[1px] md:grid-cols-4">
                    {statCards.map((card) => (
                        <div className="flex justify-center items-center relative overflow-hidden rounded-xl dark:border-sidebar-border">
                            <DashboardCard icon={ card.icon } iconColor={ card.iconColor } title={ card.title } value={ card.value } />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <PricingCard 
                        title="City Area Service"
                        initialPrice={cityPrice}
                        description="base price for home service"
                        icon={Home}
                        onPriceChange={setCityPrice}
                    />
                    <PricingCard 
                        title="Outside City Service"
                        initialPrice={outsidePrice}
                        description="base price for home service"
                        icon={MapPin}
                        onPriceChange={setOutsidePrice}
                    />
                    <div className="col-span-1 md:col-span-2 flex justify-center md:justify-end px-4 py-2">
                        <Button 
                            onClick={handleSavePrices}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto min-w-[200px]"
                        >
                            {isSaving ? 'Saving...' : 'Save Prices'}
                        </Button>
                    </div>
                </div>
                <div className="grid lg:grid-cols-[1fr_400px] gap-1 relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-transparent md:min-h-min">
                    <div className="h-full w-full rounded-xl">
                       <Card className="bg-sidebar p-5 shadow-lg m-4 border border-sidebar-border p-2">
                            <CardHeader className="grid grid-cols-[1fr_60px] items-center">
                                <CardTitle>Pending Appointments</CardTitle>
                                {/* <a href={route('manage-appointments')} className="text-xs">View All</a> */}
                            </CardHeader>

                            <CardContent className="grid grid-cols-1 gap-3 pb-5">

                                {recentServiceReq.slice(0, 6).map((req) => (
                                    <div onClick={() => handlePendingClick(req.appointmentId)} className="flex items-center justify-between w-full p-2 border border-sidebar-border rounded-xl cursor-pointer hover:bg-sidebar-accent transition-colors">
                                        <div className="flex items-center gap-2">

                                            <Icon iconNode={req.serviceType.toLowerCase() === "hardware repair" ? LaptopMinimal : req.serviceType.toLowerCase() === "software solution" ? AppWindow : BrushCleaning } className={ `dark:text-[#ffffff] h-6 w-6 rounded-xl p-1 ${req.serviceType.toLowerCase() === "hardware repair" ? "bg-blue-500/30 text-blue-700" : req.serviceType.toLowerCase() === "software solution" ? "bg-green-500/30 text-green-700" : "bg-purple-500/30 text-purple-700" }` } strokeWidth={2} />
                                            <div className="grid grid-cols-1 text-[0.8rem]">
                                                <div className="font-semibold text-[#222831] dark:text-[#ffffff]">
                                                    {req.itemBrand} - {req.purpose}
                                                </div>
                                                <div className="text-[0.7rem] text-[#393E46] dark:text-[#ffffff]">
                                                    Customer: { req.customerName } - ID: { req.appointmentId }
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`flex items-center justify-center w-22 text-[0.7rem] ${req.status.toLowerCase() === "pending" ? "bg-orange-500/30 text-orange-700" : req.status.toLowerCase() === "in-progress" ? "bg-yellow-500/30 text-yellow-700" : req.status.toLowerCase() === "completed" ? "bg-green-500/30 text-green-700" : "bg-red-500/30 text-red-700"} dark:text-[#ffffff] p-1 rounded-xl`}>
                                            { req.status }
                                        </div>
                                    </div>
                                ))}

                            </CardContent>

                        </Card>
                    </div>
                    <div className="grid grid-cols-1 h-full p-0">
                        <CollapsibleWrapper
                            title="Today's Appointments"
                            items={todaysAppointment}
                            visibleCount={3}
                            renderItem={(appointment: any) => (
                                <div className={`flex items-center gap-2 rounded-[10px] ${appointment.serviceType.toLowerCase() === "home service" ? "bg-blue-500/30" : "bg-orange-500/30"} p-[10px]`}>
                                    <Dot serviceType={appointment.serviceType} />
                                    <div>
                                        <h1 className="text-[0.8rem] text-[#222831] font-semibold dark:text-[#ffffff]">
                                            {appointment.setTime} - {appointment.serviceType}
                                        </h1>
                                        <p className="text-[0.7rem] text-[#393E46] font-normal dark:text-[#ffffff]">
                                            {appointment.client} - {appointment.purpose}
                                        </p>
                                    </div>
                                </div>
                            )}
                        />
                        <CollapsibleWrapper
                            title="Technician Availability"
                            items={availableStatusTechnician}
                            visibleCount={3}
                            renderItem={(technician: any) => (
                                <div className="flex items-center justify-between" >
                                    <div className="grid grid-cols-[1fr_100px] gap-5 items-center">
                                        <Icon iconNode={technician.icon} className={ `h-6 w-6 ${ technician.status.toLowerCase() === "available" ? "text-green-700 bg-green-500/30" : technician.status.toLowerCase() === "busy" ? "text-orange-700 bg-orange-500/30" : "text-blue-700 bg-blue-500/30" } rounded-xl p-1 dark:text-[#ffffff]` } strokeWidth={2} />
                                        <h1 className="text-[0.8rem] text-[#222831] font-normal dark:text-[#ffffff] whitespace-nowrap">
                                            {technician.name}
                                        </h1>
                                    </div>
                                    <div className={`flex justify-center items-center font-medium w-20 text-[0.8rem] rounded-xl ${ technician.status.toLowerCase() === "available" ? "text-green-700 bg-green-500/30" : technician.status.toLowerCase() === "busy" ? "text-orange-700 bg-orange-500/30" : "text-blue-700 bg-blue-500/30" } p-[1px] dark:text-[#ffffff]`}>
                                        { technician.status }
                                    </div>
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>

            <AppointmentInfoModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                appointmentId={selectedAppointmentId}
            />
        </AppLayout>
    );
}
