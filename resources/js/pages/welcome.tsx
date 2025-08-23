import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';

import { NavBar } from "@/components/nav-bar";
import { PrimaryButton } from "@/components/default-button";
import { SecondaryButton } from "@/components/default-button";
import { CustomCard } from "@/components/custom-card";
import { LaptopMinimal, AppWindow, BrushCleaning, Github, BookOpen } from 'lucide-react';
import { CustomRadio } from "@/components/custom-radio";
import { TimeList } from "@/components/time-list";
import { CustomFooter } from "@/components/custom-footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import routes from './routes.json';

type ServiceType = "hardware repair" | "software solution" | "maintenance"

interface AppointmentFormData {
    serviceLocation: string,
    date: string,
    time: string,
    serviceType: serviceType | "",
    fullname: string,
    email: string,
    phone_no: string,
    address?: string,
    description: string,
}

export default function welcome(){


    const { data, setData, post, processing, errors, reset } = useForm<appointmentFormData>({
        serviceLocation: '',
        date: '',
        time: '',
        serviceType: '',
        fullname: '',
        email: '',
        phone_no: '',
        address: '',
        description: '',
    });

    const tabs = [
        { component: "link", name: "Get Started", href: "#", className: "hover:underline transition-colors whitespace-nowrap"},
        { component: "link", name: "Admin", href: "/login", className: "hover:underline transition-colors whitespace-nowrap" },
        { component: "primary-button", name: "Contact Us", onClick: () => alert("Contact Us clicked") }
    ];

    const cardsContent = {
        hardwareRepair: [
            { name: "Hardware Repair", price: "120Php - 300Php" },
            { name: "RAM/Storage Upgrade", price: "50Php - 200Php" },
            { name: "Power Supply", price: "80Php - 150Php" },
        ],

        softwareSolution: [
            { name: "OS Installation", price: "60Php - 120Php" },
            { name: "Virus Removal", price: "50Php - 100Php" },
            { name: "System Optimization", price: "80Php - 200Php" },
        ],

        maintenance: [
            { name: "PC Cleaning", price: "40Php - 80Php" },
            { name: "Performance Tune-up", price: "60Php - 120Php" },
            { name: "Diagnostic Service", price: "30Php - 50Php" },
        ]
    }

    const options = [
        { value: 0, title: "In-Store Service", sub: "Visit our service center"},
        { value: 1, title: "Home Service", sub: "We will come to you (+25Php)"},
    ]

    const footerItems = [
        { title: "GitHub", href: "https://github.com", icon: Github },
        { title: "Docs", href: "https://docs.example.com", icon: BookOpen },
        { title: "Contact", href: "mailto:contact@example.com" }
    ];

    let technicianAvailableTime = [
        "09:00 AM", "10:30 AM", "01:00 PM",
        "02:30 PM", "04:00 PM", "05:30 PM"
    ]

    const handleSubmit = (formData) => {
        console.log(formData);
    }

    return (<>
        <div className="grid grid-rows-1 bg-[#F0F1F2] min-h-screen">
            <div className="sticky top-0 left-0 right-0 z-50">
                <NavBar tabs={tabs} />
            </div>
            <div className="grid content-center justify-items-center p-[20px] mb-[2rem]">
                <h1 className="text-[2rem] font-bold text-[#222831]">Expert Computer Repair Services</h1>
                <p className="text-thin text-[#393E46] mt-[10px]">
                    Professional repairs for all your tech needs - in store or at your doorstep.
                </p>
                <div className="grid grid-flow-col content-center justify-items-center p-[20px] gap-[10px]">
                    <PrimaryButton text="Book Now" onClick={() => alert("Learn More clicked")} />
                    <SecondaryButton text="View Services" onClick={() => alert("Learn More clicked")} />
                </div>
            </div>

             <div className="grid content-center justify-items-center p-[20px]">
                <h1 className="text-[2rem] font-bold text-[#222831]">Our Services & Pricing</h1>
                <div className="grid lg:grid-flow-col w-full content-center justify-items-center">
                    <CustomCard icon={ LaptopMinimal } iconColor="blue" title="HardWare Repair" content={ cardsContent.hardwareRepair } buttonText="Book Service" onButtonClick={() => alert("Learn More clicked")}/>
                    <CustomCard icon={ AppWindow } iconColor="green" title="Software Solution" content={ cardsContent.softwareSolution } buttonText="Book Service" onButtonClick={() => alert("Learn More clicked")} />
                    <CustomCard icon={ BrushCleaning } iconColor="purple" title="Maintenance" content={ cardsContent.maintenance } buttonText="Book Service" onButtonClick={ () => alert("Learn More Clicked") } />
                </div>
            </div>
            <div className="grid content-center justify-items-center p-[20px]">
                <h1 className="text-[2rem] font-bold text-[#222831]">Book Your Service</h1>
                <div className="lg:w-[60%] w-full">
                    <form action={handleSubmit} className="flex flex-col bg-[#ffffff] shadow-lg rounded-lg p-[20px] gap-5">
                        <div className="flex lg:flex-row flex-col justify-center gap-[10px]">
                            <div className="flex flex-col gap-[10px] w-full">
                                <label className="font-medium text-[#222831]">Service Location</label>
                                <CustomRadio options={options} />
                            </div>

                            <div className="flex flex-col gap-[10px] w-full">
                                <label className="font-medium text-[#222831]">Select Time & Date</label>
                                <Input
                                    type="date"
                                    className="rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0"
                                    required
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <TimeList times={technicianAvailableTime} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[10px] w-full">
                            <Label htmlFor="role">Services</Label>
                            <Select
                                value={data.serviceType}
                                onValueChange={(value: ServiceType) => setData('serviceType', value)}
                                disabled={processing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hardware repair">Hardware Repair</SelectItem>
                                    <SelectItem value="software solution">Software Solution</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.role} className="mt-2" />
                        </div>
                        <div className="flex flex-col gap-[10px] w-full">
                            <label className="font-medium text-[#222831]">Contact Inforation</label>
                            <div className="grid lg:grid-rows-2 lg:grid-cols-2 gap-2">
                                <input type="text" className="rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0" placeholder="Full Name" required />
                                <input type="email" className="rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0" placeholder="Email"  required />
                                <input type="text" className="rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0" placeholder="Phone Number" required />
                                <input type="tel" className="rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0" placeholder="Address (for home service only)" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-[10px] w-full">
                            <label className="font-medium text-[#222831]">Problem Descriptiom</label>
                            <textarea className="h-32 rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0" placeholder="Please describe the issue you're experiencing..."></textarea>
                        </div>

                        <PrimaryButton text="Confirm Booking" type="submit" />
                    </form>
                </div>
            </div>
        </div>
        <CustomFooter />
    </>);
}
