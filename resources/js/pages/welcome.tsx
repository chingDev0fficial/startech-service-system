import {useForm, usePage} from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InputError from '@/components/input-error';

import { NavBar } from "@/components/nav-bar";
import { PrimaryButton } from "@/components/default-button";
import { CustomCard } from "@/components/custom-card";
import { LaptopMinimal, AppWindow, BrushCleaning, Github, BookOpen, X } from 'lucide-react';
import { CustomRadio } from "@/components/custom-radio";
import { TimeList } from "@/components/time-list";
import { CustomFooter } from "@/components/custom-footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { echo } from '@laravel/echo-react';

type ServiceType = "hardware repair" | "software solution" | "maintenance"

interface AppointmentFormData {
    clientId: number;
    serviceLocation: string,
    date: string,
    time: string,
    serviceType: ServiceType | "",
    fullname: string,
    email: string,
    phone_no: string,
    address?: string,
    item: string,
    description: string,
    warrantyReceipt: File | null,
    clientStatus: string
}

export default function Welcome(){
    const { auth } = usePage().props;
    const [notification, setNotification] = useState<string | null>(null);
    const [preview, setPreview] = useState(null);

    const [cityPrice, setCityPrice] = useState(0);
    const [outsidePrice, setOutsidePrice] = useState(0);

    const client = auth.client;

    const { data, setData, post, processing, errors, reset } = useForm<AppointmentFormData>({
        clientId: client ? client.id : 0,
        serviceLocation: '',
        date: '',
        time: '',
        serviceType: '',
        fullname: client ? client.name : '',
        email: client ? client.email : '',
        phone_no: client ? client.phone_number : '',
        address: '',
        item: '',
        description: '',
        warrantyReceipt: null,
        clientStatus: client ? client.client_status : 'guest',
    });

    const tabs = [
        {
            component: "text",
            name: `Welcome, ${client.name}`,
            href: null,
            className: `transition-colors whitespace-nowrap ml-2 ${client ? "" : "hover:underline"}`
        },
        {
            component: "link",
            name: "Transactions",
            href: "/client-transactions",
            className: "hover:underline transition-colors whitespace-nowrap ml-2"
        },
        {
            component: "link",
            name: "Logout",
            href: "/client-logout",
            className: "hover:underline transition-colors whitespace-nowrap ml-2"
        },
        { component: "link", name: "Contact Us", onClick: () => alert("Contact Us clicked"), className: "hover:underline transition-colors whitespace-nowrap ml-2" }
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

    const getServicePrices = async () => {
        try {
            const response = await fetch('get-service-price', {
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

    const options = [
        { value: "in-store", title: "In-Store Service", sub: "Visit our service center" },
        {
            value: "home-service",
            title: "Home Service",
            sub: (
                <span>
                    +{cityPrice}Php - City Area
                    <br />
                    +{outsidePrice}Php - Outside City
                </span>
            )
        },
    ]

    const footerItems = [
        { title: "GitHub", href: "https://github.com", icon: Github },
        { title: "Docs", href: "https://docs.example.com", icon: BookOpen },
        { title: "Contact", href: "mailto:contact@example.com" }
    ];

    const technicianAvailableTime = [
        "09:00 AM", "10:30 AM", "01:00 PM",
        "02:30 PM", "04:00 PM", "05:30 PM"
    ]

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setData(
            name as keyof AppointmentFormData,
            value,
        );
    };

    const processImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const maxSize = 2048 * 1024; // 2048KB or 2MB
            
            // If file is already smaller than max size, return it
            if (file.size <= maxSize) {
                resolve(file);
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions while maintaining aspect ratio
                    const aspectRatio = width / height;
                    
                    // Start with original dimensions and gradually reduce
                    while ((width * height * 4) > maxSize * 2) { // *4 for RGBA channels
                        width *= 0.9;
                        height = width / aspectRatio;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Convert to blob
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Canvas to Blob conversion failed'));
                                return;
                            }
                            
                            // Create new file from blob
                            const optimizedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });

                            resolve(optimizedFile);
                        },
                        'image/jpeg',
                        0.8 // Quality parameter
                    );
                };
            };

            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (!file) {
            setPreview(null);
            setData('warrantyReceipt', null);
            return;
        }

        try 
        {
            setNotification('Processing image...');
            
            // Process the image
            const processedFile = await processImage(file);
            
            // Create preview
            const previewUrl = URL.createObjectURL(processedFile);
            setPreview(previewUrl);
            
            // Update form data
            setData('warrantyReceipt', processedFile);
            
            setNotification('Image processed successfully');
            setTimeout(() => setNotification(null), 2000);
        }
        catch (error)
        {
            console.error('Image processing failed:', error);
            setNotification('Failed to process image. Please try another file.');
            setTimeout(() => setNotification(null), 5000);
        }

        // if (file) {
        //     const previewUrl = URL.createObjectURL(file);
        //     setPreview(previewUrl);
        //     // console.log("File added to form data:", file.name); // Debug line
        // } else {
        //     setPreview(null);
        // }
    };

    const handleSubmitAppointment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (processing) return;

        setNotification('Sending your booking...');

        post(route('client.appoint'), {
            forceFormData: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onSuccess: () => {
                setNotification('Booking sent successfully! We will contact you soon.');
                setTimeout(() => setNotification(null), 5000);
                reset(); // Reset all at once instead of individually
                setPreview(null);
            },
            onError: (error) => {
                console.error(error);
                setNotification('Failed to send booking. Please try again.');
                setTimeout(() => setNotification(null), 5000);
            },
            onFinish: () => {
                if (notification === 'Sending your booking...') {
                    setNotification(null);
                }
            }
        });
    }

    return (<>
        {/* Top Notification */}
        {notification && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 ease-in-out">
                <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg min-w-[300px] max-w-[500px] ${
                    notification.includes('Failed')
                        ? 'bg-red-500 text-white'
                        : notification.includes('successfully')
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white'
                }`}>
                    {/* Loading Spinner for "Sending" message */}
                    {notification === 'Sending your booking...' && (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}

                    {/* Success Icon */}
                    {notification.includes('successfully') && (
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    )}

                    {/* Error Icon */}
                    {notification.includes('Failed') && (
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    )}

                    <span className="flex-1 font-medium">{notification}</span>

                    {/* Close Button - only show for non-loading notifications */}
                    {notification !== 'Sending your booking...' && (
                        <button
                            onClick={() => setNotification(null)}
                            className="ml-2 hover:opacity-80 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>
        )}

        <div className="grid grid-rows-1 bg-[#F0F1F2] min-h-screen">
            <div className="sticky top-0 left-0 right-0 z-50">
                <NavBar tabs={tabs} />
            </div>

             <div className="grid content-center justify-items-center p-[20px]">
                <h1 className="text-[2rem] font-bold text-[#222831]">Our Services & Pricing</h1>
                <div className="grid lg:grid-flow-col w-full content-center justify-items-center gap-4">
                    <CustomCard icon={ LaptopMinimal } iconColor="blue" title="HardWare Repair" content={ cardsContent.hardwareRepair } buttonText="Book Service" onButtonClick={() => alert("Learn More clicked")}/>
                    <CustomCard icon={ AppWindow } iconColor="green" title="Software Solution" content={ cardsContent.softwareSolution } buttonText="Book Service" onButtonClick={() => alert("Learn More clicked")} />
                    <CustomCard icon={ BrushCleaning } iconColor="purple" title="Maintenance" content={ cardsContent.maintenance } buttonText="Book Service" onButtonClick={ () => alert("Learn More Clicked") } />
                </div>
            </div>

            <div className="grid content-center justify-items-center p-[20px]">
                <h1 className="text-[2rem] font-bold text-[#222831]">Book Your Service</h1>
                <div className="lg:w-[60%] w-full">
                    <form onSubmit={handleSubmitAppointment} encType="multipart/form-data" className="flex flex-col bg-[#ffffff] shadow-lg rounded-lg p-[20px] gap-5">
                        <div className="flex lg:flex-row flex-col justify-center gap-[10px]">
                            <div className="flex flex-col gap-[10px] w-full">
                                <label className="font-medium text-[#222831]">Service Location</label>
                                <CustomRadio
                                    options={options}
                                    name="serviceLocation"
                                    value={data.serviceLocation}
                                    onChange={(option) => setData('serviceLocation', option)}
                                />
                            </div>

                            <div className="flex flex-col gap-[10px] w-full">
                                <label className="font-medium text-[#222831]">Select Time & Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={data.date}
                                    onChange={handleChange}
                                    className="rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0"
                                    required
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <TimeList
                                        times={technicianAvailableTime}
                                        value={data.time}
                                        onChange={(time) => setData('time', time)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[10px] w-full">
                            <Label htmlFor="serviceType">Services</Label>
                            <Select
                                name="serviceType"
                                value={data.serviceType}
                                onValueChange={(value: ServiceType) => setData('serviceType', value)}
                                disabled={processing}
                                required
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
                            <InputError message={errors.serviceType} className="mt-2" />
                        </div>
                        <div className="flex flex-col gap-[10px] w-full">
                            <label className="font-medium text-[#222831]">Contact Inforation</label>
                            <div className="grid lg:grid-rows-2 lg:grid-cols-2 gap-2">
                                <input name="fullname" value={data.fullname} onChange={handleChange} type="text" className="rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0" placeholder="Full Name" required />
                                <input name="email" value={data.email} onChange={handleChange} type="email" className="rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0" placeholder="Email"  required />
                                <input name="phone_no" value={data.phone_no} onChange={handleChange} type="tel" className="rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0" placeholder="Phone Number" required />
                                <input name="address" value={data.address} onChange={handleChange} type="text" className="rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0" placeholder="Address (for home service only)" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-[10px] w-full">
                            <label className="font-medium text-[#222831]">Client Device</label>
                            <input name="item" value={data.item} onChange={handleChange} type="text" className="rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0" placeholder="Eg. Printer Epson L23500" />
                            <label className="font-medium text-[#222831]">Problem Description</label>
                            <textarea name="description" value={data.description} onChange={handleChange} className="h-32 rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0" placeholder="Please describe the issue you're experiencing..."></textarea>
                        </div>


                        <div className="flex flex-col gap-[1px] w-full">
                            <label className="font-medium text-[#222831]">Warranty Sticker/Reciept</label>
                            <input name="warrantyReceipt" onChange={handleImageChange} type="file" accept="image/*" className="rounded-[15px] font-thin text-[#393E46] p-[10px] border border-input focus:outline-none focus:ring-0 w-[100%]" />
                            {preview && (
                                <div className="mt-4">
                                <p>Image Preview:</p>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-48 rounded shadow"
                                />
                                </div>
                            )}
                        </div>
                        <PrimaryButton text="Confirm Booking" type="submit" onClick={() => {}} processing={processing} />
                    </form>
                </div>
            </div>
        </div>
        <CustomFooter />
    </>);
}
