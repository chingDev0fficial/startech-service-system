import AppLogo from "@/components/app-logo";
import { PrimaryButton } from "@/components/default-button";
import { Icon } from "@/components/icon";
import { Menu } from 'lucide-react';

export function NavBar({ tabs }){
    return (
        <nav className="flex flex-row items-center justify-between bg-[#fc1304] p-[20px] h-[5rem]">
            <AppLogo />
            <div className="lg:flex hidden items-center gap-[20px] text-[#ffffff] text-[1rem]">
                {tabs.map((tab) => (
                    tab.component === "link" ? (
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
                        <PrimaryButton type="button" text={ tab.name } onClick={ tab.onClick } hoverEffect={ false } />
                    ) : null
                ))}
            </div>
            <div className="lg:hidden flex items-center">
                <button className="p-[0.5rem] rounded-[5px] bg-[#fc1304]" onClick={() => alert("Menu clicked")}>
                    <Icon iconNode={ Menu } className="text-[#ffffff] h-[1.5rem] w-[1.5rem]" />
                </button>
            </div>
        </nav>
    );
}
