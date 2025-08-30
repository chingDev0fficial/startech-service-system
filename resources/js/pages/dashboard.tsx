import * as React from "react"
import { useState } from "react"

import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import { Card, CardTitle, CardDescription, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/icon";

import { ToolCase, ClipboardClock, PhilippinePeso, Star, User, LaptopMinimal, AppWindow, BrushCleaning, CheckCircle, Clock, AlertTriangle, Wrench, Calendar, FileText, Settings } from 'lucide-react';

import { CollapsibleWrapper } from "@/components/collapsable-content";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Data functions for different roles
const getSuperAdminData = () => ({
    statCards: [
        {icon: ToolCase, iconColor: "blue", title: "Active Repairs", value: "24"},
        {icon: ClipboardClock, iconColor: "orange", title: "Pending Appointments", value: "12"},
        {icon: PhilippinePeso, iconColor: "green", title: "Today's Revenue", value: "200,450Php"},
        {icon: Star, iconColor: "purple", title: "Satisfaction", value: "4.9/5"},
    ],
    todaysAppointment: [
        {setTime: "10:00 AM", serviceType: "Home Service", client: "Rober Wilson", purpose: "Gaming PC Setup"},
        {setTime: "11:30 AM", serviceType: "In-Store", client: "Sarah Davis", purpose: "Laptop Repair"},
        {setTime: "02:00 PM", serviceType: "Home Service", client: "Mike Johnson", purpose: "Network Setup"},
        {setTime: "03:30 PM", serviceType: "Home Service", client: "Lisa Chen", purpose: "PC Cleaning"},
        {setTime: "04:00 PM", serviceType: "In-Store", client: "David Brown", purpose: "Software Install"},
        {setTime: "05:00 PM", serviceType: "In-Store", client: "Emma Wilson", purpose: "Data Recovery"},
    ],
    availableStatusTechnician: [
        {icon: User, name: "Alex Thompson", status: "Available"},
        {icon: User, name: "Maria Garcia", status: "Busy"},
        {icon: User, name: "James Wilson", status: "On Service"},
        {icon: User, name: "Prince Carl Ajoc", status: "On Service"},
    ],
    recentServiceReq: [
        {serviceType: "hardware repair", itemBrand: "iPhone 14 Pro", purpose: "Screen Replacement", customerName: "Sarah Johnson", appointmentId: "#SR-2024-0156", status: "In Progress"},
        {serviceType: "maintenance", itemBrand: "MacBook Pro", purpose: "Deep Clean", customerName: "John Doe", appointmentId: "#SR-2024-0157", status: "Completed"},
        {serviceType: "maintenance", itemBrand: "Dell XPS", purpose: "System Tune-up", customerName: "Jane Smith", appointmentId: "#SR-2024-0158", status: "Waiting Part"},
        {serviceType: "software solution", itemBrand: "HP Laptop", purpose: "OS Installation", customerName: "Bob Wilson", appointmentId: "#SR-2024-0159", status: "In Progress"},
        {serviceType: "hardware repair", itemBrand: "Samsung Galaxy", purpose: "Battery Replace", customerName: "Alice Brown", appointmentId: "#SR-2024-0160", status: "Completed"},
        {serviceType: "hardware repair", itemBrand: "iPad Air", purpose: "Charging Port Fix", customerName: "Chris Davis", appointmentId: "#SR-2024-0161", status: "In Progress"},
    ]
});

const getTechnicianData = () => ({
    statCards: [
        {icon: Wrench, iconColor: "orange", title: "My Open Tickets", value: "8"},
        {icon: CheckCircle, iconColor: "green", title: "Completed Today", value: "5"},
        {icon: Clock, iconColor: "yellow", title: "Pending Review", value: "3"},
        {icon: AlertTriangle, iconColor: "purple", title: "Priority Issues", value: "2"},
    ],
    myAssignedTickets: [
        {ticketId: "#T-2024-0245", priority: "High", device: "iPhone 14 Pro", issue: "Screen Replacement", customer: "Sarah Johnson", assignedTime: "09:00 AM", status: "In Progress"},
        {ticketId: "#T-2024-0246", priority: "Medium", device: "MacBook Pro", issue: "Keyboard Issue", customer: "John Doe", assignedTime: "10:30 AM", status: "Pending"},
        {ticketId: "#T-2024-0247", priority: "High", device: "Dell XPS", issue: "Won't Boot", customer: "Jane Smith", assignedTime: "11:00 AM", status: "Waiting Parts"},
        {ticketId: "#T-2024-0248", priority: "Low", device: "HP Laptop", issue: "Software Install", customer: "Bob Wilson", assignedTime: "02:00 PM", status: "Pending"},
        {ticketId: "#T-2024-0249", priority: "High", device: "Samsung Galaxy", issue: "Water Damage", customer: "Alice Brown", assignedTime: "03:30 PM", status: "In Progress"},
    ],
    todaySchedule: [
        {time: "09:00 AM", task: "Screen Replacement - iPhone 14 Pro", location: "Workshop", status: "Current"},
        {time: "10:30 AM", task: "Keyboard Repair - MacBook Pro", location: "Workshop", status: "Next"},
        {time: "02:00 PM", task: "Home Service - Gaming PC Setup", location: "Customer Home", status: "Scheduled"},
        {time: "04:00 PM", task: "Data Recovery - External HDD", location: "Workshop", status: "Scheduled"},
    ],
    recentCompletions: [
        {device: "iPad Air", issue: "Battery Replacement", customer: "Mike Chen", completedTime: "Yesterday 4:30 PM", satisfaction: "5/5"},
        {device: "Gaming PC", issue: "Performance Tuning", customer: "Lisa Wang", completedTime: "Yesterday 2:15 PM", satisfaction: "4.8/5"},
        {device: "iPhone 13", issue: "Screen Repair", customer: "David Kim", completedTime: "Yesterday 11:00 AM", satisfaction: "5/5"},
    ]
});

const getStaffData = () => ({
    statCards: [
        {icon: FileText, iconColor: "blue", title: "Tasks Assigned", value: "15"},
        {icon: CheckCircle, iconColor: "green", title: "Completed", value: "11"},
        {icon: Clock, iconColor: "orange", title: "In Progress", value: "4"},
        {icon: AlertTriangle, iconColor: "purple", title: "Overdue", value: "0"},
    ],
    myTasks: [
        {taskId: "#ST-2024-0089", task: "Update customer database", priority: "Medium", dueTime: "02:00 PM", status: "In Progress", assignedBy: "Manager"},
        {taskId: "#ST-2024-0090", task: "Call follow-up for completed repairs", priority: "High", dueTime: "03:30 PM", status: "Pending", assignedBy: "Supervisor"},
        {taskId: "#ST-2024-0091", task: "Prepare monthly service report", priority: "Low", dueTime: "05:00 PM", status: "Pending", assignedBy: "Manager"},
        {taskId: "#ST-2024-0092", task: "Schedule next week appointments", priority: "Medium", dueTime: "Tomorrow", status: "Pending", assignedBy: "Manager"},
        {taskId: "#ST-2024-0093", task: "Inventory check - spare parts", priority: "High", dueTime: "04:00 PM", status: "In Progress", assignedBy: "Technician Lead"},
    ],
    customerInquiries: [
        {inquiryId: "#INQ-2024-0156", customer: "Sarah Johnson", type: "Service Status", message: "When will my iPhone repair be ready?", time: "10:30 AM", status: "Pending"},
        {inquiryId: "#INQ-2024-0157", customer: "John Doe", type: "Pricing", message: "How much for MacBook screen replacement?", time: "11:15 AM", status: "Responded"},
        {inquiryId: "#INQ-2024-0158", customer: "Jane Smith", type: "Appointment", message: "Can I reschedule my 3 PM appointment?", time: "12:00 PM", status: "Pending"},
        {inquiryId: "#INQ-2024-0159", customer: "Bob Wilson", type: "Warranty", message: "Is my repair covered under warranty?", time: "01:30 PM", status: "Responded"},
    ],
    quickActions: [
        {action: "Schedule Appointment", icon: Calendar, color: "blue"},
        {action: "Create Service Ticket", icon: FileText, color: "green"},
        {action: "Customer Follow-up", icon: User, color: "purple"},
        {action: "Generate Report", icon: FileText, color: "orange"},
    ]
});

// Component functions
function Dot({ serviceType }) {
    return (
        <div className="grid grid-cols-1 grid-rows-1 place-items-center">
            <div className={`rounded-xl w-[7px] h-[7px] ${serviceType.toLowerCase() === "home service" ? "bg-blue-500" : "bg-orange-500"}`}></div>
        </div>
    )
}

function DashboardCard({ icon, iconColor, title, value }) {
    const colors = {
        blue: { bg: "bg-blue-500/30", text: "text-blue-700" },
        orange: { bg: "bg-orange-500/30", text: "text-orange-700" },
        green: { bg: "bg-green-500/30", text: "text-green-700" },
        purple: { bg: "bg-purple-500/30", text: "text-purple-700" },
        yellow: { bg: "bg-yellow-500/30", text: "text-yellow-700" }
    };

    const icon_bg_color = colors[iconColor].bg;
    const icon_text_color = colors[iconColor].text;

    return (
        <Card className="!flex-row items-center justify-between w-full bg-sidebar shadow-lg m-4 border border-sidebar-border p-2">
            <CardContent className="!p-[0]">
                <CardTitle className="!font-normal text-[0.7rem] text-[#393E46] dark:text-[#ffffff]">{title}</CardTitle>
                <CardDescription className="!font-semibold text-[1.2rem] text-[#222831] dark:text-[#ffffff]">{value}</CardDescription>
            </CardContent>
            <Avatar className={`h-9 w-9 flex items-center justify-center ${icon_bg_color}`}>
                <Icon iconNode={icon} className={`${icon_text_color} dark:text-[#ffffff]`} strokeWidth={2} />
            </Avatar>
        </Card>
    );
}

// Super Admin Content Functions
const renderSuperAdminStats = (statCards) => (
    <div className="grid auto-rows-min gap-[1px] md:grid-cols-4">
        {statCards.map((card, index) => (
            <div key={index} className="flex justify-center items-center relative overflow-hidden rounded-xl dark:border-sidebar-border">
                <DashboardCard icon={card.icon} iconColor={card.iconColor} title={card.title} value={card.value} />
            </div>
        ))}
    </div>
);

const renderRecentServiceRequests = (recentServiceReq) => (
    <Card className="bg-sidebar p-5 shadow-lg m-4 border border-sidebar-border">
        <CardHeader className="grid grid-cols-[1fr_60px] items-center">
            <CardTitle>Recent Service Request</CardTitle>
            <a href="#" className="text-xs">View All</a>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 pb-5">
            {recentServiceReq.slice(0, 6).map((req, index) => (
                <div key={index} className="flex items-center justify-between w-full p-2 border border-sidebar-border rounded-xl">
                    <div className="flex items-center gap-2">
                        <Icon 
                            iconNode={req.serviceType.toLowerCase() === "hardware repair" ? LaptopMinimal : req.serviceType.toLowerCase() === "software solution" ? AppWindow : BrushCleaning} 
                            className={`dark:text-[#ffffff] h-6 w-6 rounded-xl p-1 ${req.serviceType.toLowerCase() === "hardware repair" ? "bg-blue-500/30 text-blue-700" : req.serviceType.toLowerCase() === "software solution" ? "bg-green-500/30 text-green-700" : "bg-purple-500/30 text-purple-700"}`} 
                            strokeWidth={2} 
                        />
                        <div className="grid grid-cols-1 text-[0.8rem]">
                            <div className="font-semibold text-[#222831] dark:text-[#ffffff]">
                                {req.itemBrand} - {req.purpose}
                            </div>
                            <div className="text-[0.7rem] text-[#393E46] dark:text-[#ffffff]">
                                Customer: {req.customerName} - ID: {req.appointmentId}
                            </div>
                        </div>
                    </div>
                    <div className={`flex items-center justify-center w-22 text-[0.7rem] ${req.status.toLowerCase() === "in progress" ? "bg-yellow-500/30 text-yellow-700" : req.status.toLowerCase() === "completed" ? "bg-green-500/30 text-green-700" : "bg-red-500/30 text-red-700"} dark:text-[#ffffff] p-1 rounded-xl`}>
                        {req.status}
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);

// Technician Content Functions
const renderTechnicianStats = (statCards) => renderSuperAdminStats(statCards);

const renderMyAssignedTickets = (tickets) => (
    <Card className="bg-sidebar p-5 shadow-lg m-4 border border-sidebar-border">
        <CardHeader className="grid grid-cols-[1fr_60px] items-center">
            <CardTitle>My Assigned Tickets</CardTitle>
            <a href="#" className="text-xs">View All</a>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 pb-5">
            {tickets.slice(0, 6).map((ticket, index) => (
                <div key={index} className="flex items-center justify-between w-full p-2 border border-sidebar-border rounded-xl">
                    <div className="flex items-center gap-2">
                        <Icon 
                            iconNode={Wrench} 
                            className={`dark:text-[#ffffff] h-6 w-6 rounded-xl p-1 ${ticket.priority.toLowerCase() === "high" ? "bg-red-500/30 text-red-700" : ticket.priority.toLowerCase() === "medium" ? "bg-yellow-500/30 text-yellow-700" : "bg-green-500/30 text-green-700"}`} 
                            strokeWidth={2} 
                        />
                        <div className="grid grid-cols-1 text-[0.8rem]">
                            <div className="font-semibold text-[#222831] dark:text-[#ffffff]">
                                {ticket.device} - {ticket.issue}
                            </div>
                            <div className="text-[0.7rem] text-[#393E46] dark:text-[#ffffff]">
                                Customer: {ticket.customer} - ID: {ticket.ticketId} - {ticket.assignedTime}
                            </div>
                        </div>
                    </div>
                    <div className={`flex items-center justify-center w-22 text-[0.7rem] ${ticket.status.toLowerCase() === "in progress" ? "bg-blue-500/30 text-blue-700" : ticket.status.toLowerCase() === "pending" ? "bg-yellow-500/30 text-yellow-700" : "bg-red-500/30 text-red-700"} dark:text-[#ffffff] p-1 rounded-xl`}>
                        {ticket.status}
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);

// Staff Content Functions
const renderStaffStats = (statCards) => renderSuperAdminStats(statCards);

const renderMyTasks = (tasks) => (
    <Card className="bg-sidebar p-5 shadow-lg m-4 border border-sidebar-border">
        <CardHeader className="grid grid-cols-[1fr_60px] items-center">
            <CardTitle>My Tasks</CardTitle>
            <a href="#" className="text-xs">View All</a>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 pb-5">
            {tasks.slice(0, 6).map((task, index) => (
                <div key={index} className="flex items-center justify-between w-full p-2 border border-sidebar-border rounded-xl">
                    <div className="flex items-center gap-2">
                        <Icon 
                            iconNode={FileText} 
                            className={`dark:text-[#ffffff] h-6 w-6 rounded-xl p-1 ${task.priority.toLowerCase() === "high" ? "bg-red-500/30 text-red-700" : task.priority.toLowerCase() === "medium" ? "bg-yellow-500/30 text-yellow-700" : "bg-green-500/30 text-green-700"}`} 
                            strokeWidth={2} 
                        />
                        <div className="grid grid-cols-1 text-[0.8rem]">
                            <div className="font-semibold text-[#222831] dark:text-[#ffffff]">
                                {task.task}
                            </div>
                            <div className="text-[0.7rem] text-[#393E46] dark:text-[#ffffff]">
                                Due: {task.dueTime} - Assigned by: {task.assignedBy} - ID: {task.taskId}
                            </div>
                        </div>
                    </div>
                    <div className={`flex items-center justify-center w-22 text-[0.7rem] ${task.status.toLowerCase() === "in progress" ? "bg-blue-500/30 text-blue-700" : task.status.toLowerCase() === "pending" ? "bg-yellow-500/30 text-yellow-700" : "bg-green-500/30 text-green-700"} dark:text-[#ffffff] p-1 rounded-xl`}>
                        {task.status}
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);

const renderQuickActions = (quickActions) => (
    <Card className="bg-sidebar p-5 shadow-lg m-4 border border-sidebar-border">
        <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 pb-5">
            {quickActions.map((action, index) => (
                <button 
                    key={index}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border border-sidebar-border hover:bg-${action.color}-500/10 transition-colors`}
                >
                    <Icon 
                        iconNode={action.icon} 
                        className={`h-6 w-6 mb-2 text-${action.color}-600 dark:text-[#ffffff]`} 
                        strokeWidth={2} 
                    />
                    <span className="text-[0.7rem] text-center text-[#222831] dark:text-[#ffffff]">{action.action}</span>
                </button>
            ))}
        </CardContent>
    </Card>
);

// Content rendering functions based on role
const renderSuperAdminContent = (data) => (
    <>
        {renderSuperAdminStats(data.statCards)}
        <div className="grid lg:grid-cols-[1fr_400px] gap-1 relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-transparent md:min-h-min">
            <div className="h-full w-full rounded-xl">
                {renderRecentServiceRequests(data.recentServiceReq)}
            </div>
            <div className="grid grid-cols-1 h-full p-0">
                <CollapsibleWrapper
                    title="Today's Appointments"
                    items={data.todaysAppointment}
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
                    items={data.availableStatusTechnician}
                    visibleCount={3}
                    renderItem={(technician) => (
                        <div className="flex items-center justify-between">
                            <div className="grid grid-cols-[1fr_100px] gap-5 items-center">
                                <Icon 
                                    iconNode={technician.icon} 
                                    className={`h-6 w-6 ${technician.status.toLowerCase() === "available" ? "text-green-700 bg-green-500/30" : technician.status.toLowerCase() === "busy" ? "text-orange-700 bg-orange-500/30" : "text-blue-700 bg-blue-500/30"} rounded-xl p-1 dark:text-[#ffffff]`} 
                                    strokeWidth={2} 
                                />
                                <h1 className="text-[0.8rem] text-[#222831] font-normal dark:text-[#ffffff] whitespace-nowrap">
                                    {technician.name}
                                </h1>
                            </div>
                            <div className={`flex justify-center items-center font-medium w-20 text-[0.8rem] rounded-xl ${technician.status.toLowerCase() === "available" ? "text-green-700 bg-green-500/30" : technician.status.toLowerCase() === "busy" ? "text-orange-700 bg-orange-500/30" : "text-blue-700 bg-blue-500/30"} p-[1px] dark:text-[#ffffff]`}>
                                {technician.status}
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    </>
);

const renderTechnicianContent = (data) => (
    <>
        {renderTechnicianStats(data.statCards)}
        <div className="grid lg:grid-cols-[1fr_400px] gap-1 relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-transparent md:min-h-min">
            <div className="h-full w-full rounded-xl">
                {renderMyAssignedTickets(data.myAssignedTickets)}
            </div>
            <div className="grid grid-cols-1 h-full p-0">
                <CollapsibleWrapper
                    title="Today's Schedule"
                    items={data.todaySchedule}
                    visibleCount={3}
                    renderItem={(schedule) => (
                        <div className={`flex items-center gap-2 rounded-[10px] ${schedule.status.toLowerCase() === "current" ? "bg-green-500/30" : schedule.status.toLowerCase() === "next" ? "bg-blue-500/30" : "bg-gray-500/20"} p-[10px]`}>
                            <div className={`w-[7px] h-[7px] rounded-xl ${schedule.status.toLowerCase() === "current" ? "bg-green-500" : schedule.status.toLowerCase() === "next" ? "bg-blue-500" : "bg-gray-500"}`}></div>
                            <div>
                                <h1 className="text-[0.8rem] text-[#222831] font-semibold dark:text-[#ffffff]">
                                    {schedule.time} - {schedule.task}
                                </h1>
                                <p className="text-[0.7rem] text-[#393E46] font-normal dark:text-[#ffffff]">
                                    Location: {schedule.location}
                                </p>
                            </div>
                        </div>
                    )}
                />
                <CollapsibleWrapper
                    title="Recent Completions"
                    items={data.recentCompletions}
                    visibleCount={3}
                    renderItem={(completion) => (
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-[0.8rem] text-[#222831] font-semibold dark:text-[#ffffff]">
                                    {completion.device} - {completion.issue}
                                </h1>
                                <p className="text-[0.7rem] text-[#393E46] font-normal dark:text-[#ffffff]">
                                    {completion.customer} - {completion.completedTime}
                                </p>
                            </div>
                            <div className="flex justify-center items-center font-medium text-[0.7rem] rounded-xl text-green-700 bg-green-500/30 px-2 py-1 dark:text-[#ffffff]">
                                ★ {completion.satisfaction}
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    </>
);

const renderStaffContent = (data) => (
    <>
        {renderStaffStats(data.statCards)}
        <div className="grid lg:grid-cols-[1fr_400px] gap-1 relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-transparent md:min-h-min">
            <div className="h-full w-full rounded-xl">
                {renderMyTasks(data.myTasks)}
            </div>
            <div className="grid grid-cols-1 h-full p-0">
                <CollapsibleWrapper
                    title="Customer Inquiries"
                    items={data.customerInquiries}
                    visibleCount={3}
                    renderItem={(inquiry) => (
                        <div className={`flex flex-col gap-2 rounded-[10px] ${inquiry.status.toLowerCase() === "pending" ? "bg-yellow-500/30" : "bg-green-500/30"} p-[10px]`}>
                            <div className="flex justify-between items-start">
                                <h1 className="text-[0.8rem] text-[#222831] font-semibold dark:text-[#ffffff]">
                                    {inquiry.customer} - {inquiry.type}
                                </h1>
                                <span className="text-[0.6rem] text-[#393E46] dark:text-[#ffffff]">{inquiry.time}</span>
                            </div>
                            <p className="text-[0.7rem] text-[#393E46] font-normal dark:text-[#ffffff]">
                                {inquiry.message}
                            </p>
                        </div>
                    )}
                />
                {renderQuickActions(data.quickActions)}
            </div>
        </div>
    </>
);

// Main Dashboard Component
export default function Dashboard() {
    const [currentRole, setCurrentRole] = useState('super user'); // Default role

    // Get data based on current role
    const getRoleData = () => {
        switch (currentRole) {
            case 'technician':
                return getTechnicianData();
            case 'staff':
                return getStaffData();
            default:
                return getSuperAdminData();
        }
    };

    const data = getRoleData();

    // Render content based on role
    const renderDashboardContent = () => {
        switch (currentRole) {
            case 'technician':
                return renderTechnicianContent(data);
            case 'staff':
                return renderStaffContent(data);
            default:
                return renderSuperAdminContent(data);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Dashboard`} />
            <div className="flex h-full flex-1 flex-col gap-[1px] rounded-xl p-4 overflow-x-auto">
                
                {/* Role Selector */}
                <div className="mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-[#222831] dark:text-[#ffffff] capitalize">
                        {currentRole} Dashboard
                    </h1>
                    <select 
                        value={currentRole} 
                        onChange={(e) => setCurrentRole(e.target.value)}
                        className="p-2 border border-sidebar-border rounded-lg text-sm bg-sidebar text-[#222831] dark:text-[#ffffff]"
                    >
                        <option value="superadmin">Super Admin</option>
                        <option value="technician">Technician</option>
                        <option value="staff">Staff</option>
                    </select>
                </div>

                {/* Dynamic Content Based on Role */}
                {renderDashboardContent()}
            </div>
        </AppLayout>
    );
}