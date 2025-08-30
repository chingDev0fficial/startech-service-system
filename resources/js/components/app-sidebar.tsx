import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, User, Bell, ClipboardClock, History, BanknoteArrowUp, BadgeCheck } from 'lucide-react';
import AppLogo from './app-logo';
import { Check } from 'lucide-react';
import { Loader } from 'lucide-react';

const mainNavItems: NavItem[] = [
    {
        title: 'dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        accessRole: ['super user']
    },
    {
        title: 'Manage Accounts',
        href: '/manage-accounts',
        icon: User,
        accessRole: ['super user']
    },
    {
        title: 'Manage Appointments',
        href: '/manage-appointments',
        icon: ClipboardClock,
        accessRole: ['super user', 'staff']
    },
    {
        title: 'Notification',
        href: '#',
        icon: Bell,
        accessRole: ['super user', 'staff']
    },
    {
        title: 'Manage History',
        href: '/manage-history',
        icon: History,
        accessRole: ['super user', 'staff']
    },
    {
        title: 'Manage Billings',
        href: '/manage-billings',
        icon: BanknoteArrowUp,
        accessRole: ['super user', 'staff']
    },
    {
        title: 'Manage Warranty',
        href: '#',
        icon: BadgeCheck,
        accessRole: ['super user', 'staff']
    },
    {
        title: 'My Appointments',
        href: '/my-appointments',
        icon: ClipboardClock,
        accessRole: ['technician']
    },
    {
        title: 'In Progress',
        href: '/in-progress',
        icon: Loader,
        accessRole: ['technician']
    },
    {
        title: 'Completed Today',
        href: '/completed-today',
        icon: Check,
        accessRole: ['technician']
    },

];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <div className="mb-1 flex h-13 w-13 items-center justify-center rounded-md p-2">
                                    <AppLogo inverted_color={ true } />
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
