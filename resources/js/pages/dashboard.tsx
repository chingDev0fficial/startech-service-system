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

import { useState, useEffect } from 'react';
import { useEcho } from '@laravel/echo-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

function Dot({ serviceType }) {
    return (<>
        <div className="grid grid-cols-1 grid-rows-1 place-items-center">
            <div className={`rounded-xl w-[7px] h-[7px] ${ serviceType.toLowerCase() === "home service" ? "bg-blue-500" : "bg-orange-500"}`}></div>
        </div>
    </>)
}

function DashboardCard({ icon, iconColor, title, value }) {

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

export default function Dashboard() {
    const echo = useEcho();
    const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

    const [dataAppointments, setDataAppointments] = useState([]);
    const [dataTech, setDataTech] = useState([]);
    const [activeRepair, setActiveRepair] = useState<number>(0);
    const [pendingAppointments, setPendingAppointments] = useState<number>(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000); // Update every second

        return () => clearInterval(timer); // Cleanup
    }, [echo]);

    const handleFetchAppointment = async () => {
        try
        {
            const response = await fetch(route('fetch.todaysAppoint'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if ( !response.ok )
            {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.retrieved;
        }
        catch( error )
        {
            console.error('Error fetching appointments:', error);
        }
    }

    useEffect(() => {
        handleFetchAppointment()
            .then(data => {
                const activeRepairCount = data.filter(appointment => appointment.status === "in-progress").length
                const pendingAppointmentsCount = data.filter(appointment => appointment.status === "pending").length

                setActiveRepair(activeRepairCount);
                setPendingAppointments(pendingAppointmentsCount);
                setDataAppointments(data);
            })
            .catch(error => {
                console.error('Failed to fetch appointments:', error);
            });
    }, [currentDateTime, echo])

    let todaysAppointment = dataAppointments
        .filter(appointment => new Date(appointment?.schedule_at).toLocaleDateString() === currentDateTime.toLocaleDateString())
        .map(appointment => ({
            setTime: appointment.schedule_at,
            serviceType: appointment.service_type,
            client: appointment.name,
            purpose: appointment.service_location,
        }))

    let recentServiceReq = dataAppointments
        .map(appointment => ({
            serviceType: appointment.service_type,
            itemBrand: appointment.item,
            purpose: appointment.description,
            customerName: appointment.name,
            appointmentId: `#${appointment.id}`,
            status: appointment.status
        }))

    const handleFetchTech = async () => {
        try
        {
            const response = await fetch(route('fetch.tech'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if ( !response.ok )
            {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.retrieved;
        }
        catch( error )
        {
            console.error('Error fetching appointments:', error);
        }
    }

    useEffect(() => {
        handleFetchTech()
            .then(data => {
                setDataTech(data);
            })
            .catch(error => {
                console.error('Failed to fetch appointments:', error);
            });
    }, [echo])

    let availableStatusTechnician = dataTech
        .filter(tech => tech.role === "technician")
        .map(tech => ({
            icon: User,
            name: tech.name,
            status: "Available"
        }))

    // useEffect(() => {
    //     handleFetchAppointment()
    //         .then(data => {
    //         })
    //         .catch(error => {
    //             console.error('Failed to fetch appointments:', error);
    //         });
    // }, [currentDateTime, echo])


    const statCards = [
        {icon: ToolCase, iconColor: "blue", title: "Active Repairs", value: activeRepair},
        {icon: ClipboardClock, iconColor: "orange", title: "pending Appointments", value: pendingAppointments},
        {icon: PhilippinePeso, iconColor: "green", title: "Today's Revenue", value: "200,450Php"},
        {icon: Star, iconColor: "purple", title: "Satisfaction", value: "4.9/5"},
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-[1px] rounded-xl p-4 overflow-x-auto">
                <div className="grid auto-rows-min gap-[1px] md:grid-cols-4">
                    {statCards.map((card) => (
                        <div className="flex justify-center items-center relative overflow-hidden rounded-xl dark:border-sidebar-border">
                            <DashboardCard icon={ card.icon } iconColor={ card.iconColor } title={ card.title } value={ card.value } />
                        </div>
                    ))}
                </div>
                <div className="grid lg:grid-cols-[1fr_400px] gap-1 relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-transparent md:min-h-min">
                    {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                    <div className="h-full w-full rounded-xl">
                       <Card className="bg-sidebar p-5 shadow-lg m-4 border border-sidebar-border p-2">
                            <CardHeader className="grid grid-cols-[1fr_60px] items-center">
                                <CardTitle>Recent Service Request</CardTitle>
                                {/* <a href={route('manage-appointments')} className="text-xs">View All</a> */}
                            </CardHeader>

                            <CardContent className="grid grid-cols-1 gap-3 pb-5">

                                {recentServiceReq.slice(0, 6).map((req) => (
                                    <div className="flex items-center justify-between w-full p-2 border border-sidebar-border rounded-xl">
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
                                        <div className={`flex items-center justify-center w-22 text-[0.7rem] ${req.status.toLowerCase() === "in progress" ? "bg-yellow-500/30 text-yellow-700" : req.status.toLowerCase() === "completed" ? "bg-green-500/30 text-green-700" : "bg-red-500/30 text-red-700"} dark:text-[#ffffff] p-1 rounded-xl`}>
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
                            renderItem={(appointment) => (
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
                            renderItem={(technician) => (
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
        </AppLayout>
    );
}
