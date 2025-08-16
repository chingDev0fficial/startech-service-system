import AppLogoIcon from './app-logo-icon';

export default function AppLogo({ inverted_color = false }) {
    return (
    <div className="relative flex items-center w-full gap-[0.5rem]">
        <AppLogoIcon inverted_color={ inverted_color } />
        <div className="flex items-center justify-between">
            <div className={`absolute font-anurati ${ inverted_color ? "text-[#000000]" : "text-[#ffffff]" } text-[1.9rem] sm:text-[1.5rem] truncate dark:text-[#ffffff]`}>
                STARTECH
                <div className="relative font-nasalization text-[0.7rem] sm:text-[0.5rem] flex items-center justify-end">Computer Sales Center</div>
            </div>
        </div>
    </div>
    )
}
