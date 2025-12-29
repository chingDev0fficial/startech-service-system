import { usePage, Link } from '@inertiajs/react';
import { NavBar } from "@/components/nav-bar";
import { CustomFooter } from "@/components/custom-footer";
import { Mail, Phone, MapPin, Clock, Facebook, MessageSquare, Instagram, ArrowLeft } from 'lucide-react';

export default function ContactUsClient() {
    const { auth } = usePage().props as any;
    const client = auth?.client;

    const tabs = [
        {
            component: "text",
            name: `Welcome, ${client?.name || 'Guest'}`,
            className: `transition-colors whitespace-nowrap ml-2`
        },
        {
            component: "link",
            name: "Transactions",
            href: "/client-transactions",
            className: "hover:underline transition-colors whitespace-nowrap ml-2"
        },
        {
            component: "link",
            name: "Contact Us",
            href: "/contact-us",
            className: "hover:underline transition-colors whitespace-nowrap ml-2"
        },
        {
            component: "link",
            name: "Logout",
            href: "/client-logout",
            className: "hover:underline transition-colors whitespace-nowrap ml-2"
        }
    ];

    return (
        <>
            <NavBar tabs={tabs} />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <div className="mb-8">
                        <Link
                            href="/client"
                            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-light">Back to Home</span>
                        </Link>
                    </div>

                    {/* Header Section */}
                    <div className="text-center mb-16 space-y-4">
                        <h1 className="text-5xl font-light text-gray-800 tracking-tight">
                            Contact Information
                        </h1>
                        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto"></div>
                        <p className="text-lg font-light text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            We're here to help. Reach out to us through any of the following channels and we'll get back to you as soon as possible.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {/* Email Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Mail className="w-7 h-7 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-light text-gray-800 mb-2">Email Address</h3>
                                    <p className="text-sm font-light text-gray-500 mb-3">Drop us a line anytime</p>
                                    <div className="space-y-1">
                                        <p className="text-base text-gray-700">support@startech.com</p>
                                        <p className="text-base text-gray-700">startechsurigao@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                                    <Phone className="w-7 h-7 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-light text-gray-800 mb-2">Phone Number</h3>
                                    <p className="text-sm font-light text-gray-500 mb-3">Call us for immediate support</p>
                                    <div className="space-y-1">
                                        <p className="text-base text-gray-700">+63 907 755 5099</p>
                                        {/* <p className="text-base text-gray-700">+63 987 654 3210</p> */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                                    <MapPin className="w-7 h-7 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-light text-gray-800 mb-2">Office Location</h3>
                                    <p className="text-sm font-light text-gray-500 mb-3">Visit us at our office</p>
                                    <div className="space-y-1">
                                        <p className="text-base text-gray-700">Amat Street Cor. Magallanes</p>
                                        <p className="text-base text-gray-700">Surigao City</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Hours and Social Media Section */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {/* Business Hours */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-light text-gray-800">Business Hours</h3>
                            </div>
                            <div className="h-px bg-gradient-to-r from-gray-200 to-transparent mb-6"></div>
                            <div className="space-y-4 text-base font-light">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Monday - Friday</span>
                                    <span className="text-gray-800 font-normal">9:00 AM - 5:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Saturday</span>
                                    <span className="text-gray-800 font-normal">9:00 AM - 5:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Sunday</span>
                                    <span className="text-gray-400 font-normal">Closed</span>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-xl font-light text-gray-800 mb-2">Connect With Us</h3>
                            <p className="text-sm font-light text-gray-500 mb-6">Follow us on social media</p>
                            <div className="h-px bg-gradient-to-r from-gray-200 to-transparent mb-6"></div>
                            <div className="space-y-4">
                                <a
                                    href="https://www.facebook.com/profile.php?id=100057657150837"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                    <Facebook className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <p className="font-normal text-gray-800">Facebook</p>
                                        <p className="text-sm text-gray-500">@startechservices</p>
                                    </div>
                                </a>
                                <a
                                    href="https://www.instagram.com/satoshi.e2?igsh=aHNhN2J1Z254Y3lh&utm_source=qr_code"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                    <Instagram className="w-6 h-6 text-blue-500" />
                                    <div>
                                        <p className="font-normal text-gray-800">Instagram</p>
                                        <p className="text-sm text-gray-500">@startech_servicecenter</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CustomFooter />
        </>
    );
}
