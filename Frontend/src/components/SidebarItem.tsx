import type { ReactElement } from "react"

const IconStyles = {
    "link": "text-blue-400",
    "file": "text-purple-400",
    "all": "text-gray-400",
    "profile": "text-custom-900"
}

interface SidebarItemProps {
    icon: ReactElement;
    text: string;
    type: string;
    onClick?: () => void;
    isActive?: boolean;
}

export const SidebarItem = ({ icon, text, type, onClick, isActive = false }: SidebarItemProps) => {
    return (
        <div 
            onClick={onClick} 
            className={`flex p-3 w-16 md:w-64 gap-4 pl-0 md:pl-10 justify-center md:justify-start cursor-pointer transition-all duration-200 ${
                isActive 
                    ? 'bg-zinc-900 text-white' 
                    : 'text-gray-400 hover:bg-zinc-900 hover:text-white'
            } pl-3`}
            title={text}
        >
            <div className={`${isActive ? IconStyles[type.toLowerCase() as keyof typeof IconStyles] ?? "" : ""}`}>
                {icon}
            </div>
            <div className={`font-normal hidden md:block ${isActive ? 'font-medium' : ''}`}>
                {text}
            </div>
        </div>
    )
}