import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { auth } = usePage<SharedData>().props;
    const page = usePage();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const toggleExpanded = (title: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(title)) {
                newSet.delete(title);
            } else {
                newSet.add(title);
            }
            return newSet;
        });
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    item.accessRole.includes(auth.user.role) && (
                        <div key={item.title}>
                            <SidebarMenuItem>
                                {item.children ? (
                                    // Expandable item
                                    <SidebarMenuButton
                                        onClick={() => toggleExpanded(item.title)}
                                        className="hover:bg-[#393E46]/20 hover:text-[#222831] w-full justify-between"
                                        tooltip={{ children: item.title }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {item.icon && <item.icon className="h-5 w-5" />}
                                            <span>{item.title}</span>
                                        </div>
                                        <ChevronRight
                                            className={`h-4 w-4 transition-transform duration-200 ${
                                                expandedItems.has(item.title) ? 'rotate-90' : ''
                                            }`}
                                        />
                                    </SidebarMenuButton>
                                ) : (
                                    // Regular item
                                    <SidebarMenuButton
                                        asChild
                                        isActive={page.url.startsWith(item.href)}
                                        tooltip={{ children: item.title }}
                                        className="hover:bg-[#393E46]/20 hover:text-[#222831] data-[active=true]:bg-[#393E46] data-[active=true]:text-white"
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>

                            {/* Render children if expanded */}
                            {item.children && expandedItems.has(item.title) && (
                                <div className="ml-6 mt-1 space-y-1">
                                    {item.children.map((child) => (
                                        child.accessRole?.includes(auth.user.role) && (
                                            <SidebarMenuItem key={child.title}>
                                                <SidebarMenuButton
                                                    asChild
                                                    size="sm"
                                                    isActive={page.url.startsWith(child.href)}
                                                    className="hover:bg-[#393E46]/20 hover:text-[#222831] data-[active=true]:bg-[#393E46] data-[active=true]:text-white pl-8"
                                                    tooltip={{ children: child.title }}
                                                >
                                                    <Link href={child.href} prefetch>
                                                        {child.icon && <child.icon className="h-3 w-3" />}
                                                        <span className="text-sm">{child.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
