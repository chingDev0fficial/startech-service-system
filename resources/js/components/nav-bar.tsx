import AppLogo from "@/components/app-logo";
import { PrimaryButton } from "@/components/default-button";
import { Icon } from "@/components/icon";
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Tab {
    component: string;
    name: string;
    href?: string;
    onClick?: () => void;
    className?: string;
}

interface NavBarProps {
    tabs: Tab[];
}

export function NavBar({ tabs }: NavBarProps){
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isMobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.menu-button')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    const handleMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleNavigation = (tab: any) => {
        if (tab.onClick) {
            tab.onClick();
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="flex flex-row items-center justify-between bg-gradient-to-r from-[#ff0000] via-[#ff0000] to-[#fdc700] p-[20px] h-[5rem]">
                <AppLogo />
                
                {/* Desktop Menu */}
                <div className="lg:flex hidden items-center gap-[20px] text-[#ffffff] text-[1rem]">
                    {tabs.map((tab) => (
                        tab.component === "link" || tab.component === "text" ? (
                            <a
                                key={tab.name}
                                href={tab.href}
                                className={tab.className}
                            >
                                {tab.name}
                            </a>
                        ) : tab.component === "button" ? (
                            <button
                                key={tab.name}
                                onClick={tab.onClick}
                                className="bg-[#fc1304] whitespace-nowrap p-[0.5rem] rounded-[5px]"
                            >
                                {tab.name}
                            </button>
                        ) : tab.component === "primary-button" ? (
                            <PrimaryButton type="button" text={ tab.name } onClick={ tab.onClick || (() => {}) } processing={false} hoverEffect={ false } />
                        ) : null
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <div className="lg:hidden flex items-center">
                    <button 
                        className="menu-button p-[0.5rem] rounded-[5px] bg-[#fc1304] hover:bg-[#e01202] transition-colors"
                        onClick={handleMenuToggle}
                        aria-label="Toggle menu"
                    >
                        <Icon 
                            iconNode={isMobileMenuOpen ? X : Menu} 
                            className="text-[#ffffff] h-[1.5rem] w-[1.5rem]" 
                        />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Mobile Menu Drawer */}
            <div className={`mobile-menu fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
                isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                {/* Menu Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-[#ff0000] via-[#ff0000] to-[#fdc700] p-[20px]">
                    <h2 className="text-[#ffffff] text-[1.2rem] font-semibold">Menu</h2>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-[0.3rem] rounded-[5px] bg-[#fc1304] hover:bg-[#e01202] transition-colors"
                        aria-label="Close menu"
                    >
                        <Icon iconNode={X} className="text-[#ffffff] h-[1.5rem] w-[1.5rem]" />
                    </button>
                </div>

                {/* Menu Items */}
                <div className="flex flex-col p-[20px] gap-[5px]">
                    {tabs.map((tab, index) => (
                        tab.component === "link" ? (
                            <a
                                key={tab.name}
                                href={tab.href}
                                className="text-[#222831] text-[1rem] p-[15px] rounded-[8px] hover:bg-gray-100 transition-colors font-medium border-b border-gray-200 last:border-b-0"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {tab.name}
                            </a>
                        ) : tab.component === "text" ? (
                            <div
                                key={tab.name}
                                className="text-[#222831] text-[1rem] p-[15px] rounded-[8px] font-semibold bg-gray-50 border-b border-gray-200"
                            >
                                {tab.name}
                            </div>
                        ) : tab.component === "button" ? (
                            <button
                                key={tab.name}
                                onClick={() => handleNavigation(tab)}
                                className="text-[#ffffff] bg-[#fc1304] text-[1rem] p-[15px] rounded-[8px] hover:bg-[#e01202] transition-colors font-medium"
                            >
                                {tab.name}
                            </button>
                        ) : tab.component === "primary-button" ? (
                            <div key={tab.name} className="mt-2">
                                <PrimaryButton 
                                    type="button" 
                                    text={tab.name} 
                                    onClick={() => handleNavigation(tab)} 
                                    processing={false}
                                    hoverEffect={true} 
                                />
                            </div>
                        ) : null
                    ))}
                </div>
            </div>
        </>
    );
}
