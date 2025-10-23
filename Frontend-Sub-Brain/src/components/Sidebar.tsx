import { Logo } from "../icons/Logo"
import { SidebarItem } from "./SidebarItem"
import { useNavigate, useLocation } from "react-router-dom"

interface SidebarProps {
    onFilterChange?: (filterType: 'all' | 'link' | 'file') => void;
    activeFilter?: 'all' | 'link' | 'file';
}

export const Sidebar = ({ onFilterChange, activeFilter = 'all' }: SidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if we're on the profile page
    const isOnProfile = location.pathname === '/profile';

    const handleFilterClick = (filterType: 'all' | 'link' | 'file') => {
        // If on Dashboard, just filter. Otherwise, navigate to Dashboard first
        if (onFilterChange) {
            onFilterChange(filterType);
        } else {
            // Navigate to dashboard with filter state
            navigate('/dashboard', { state: { filter: filterType } });
        }
    };

    return <div className="border-r border-gray-800 bg-black w-64 fixed top-0 left-0 h-screen">
        <div className="text-2xl flex pl-4 mb-4 gap-4 pt-8 h-20 items-center text-white font-bold">
            <div className="cursor-pointer" onClick={() => navigate('/dashboard')}>
                <Logo className="w-12"/>
            </div>
            <div className="cursor-pointer" onClick={() => navigate('/dashboard')}>
                Mind<span className="text-custom-900">Stream</span>
            </div>
        </div>
        <div className="mt-4">
            {/* All Content */}
            <SidebarItem 
                icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                }
                onClick={() => handleFilterClick('all')}
                text="All Content" 
                type="all"
                isActive={!isOnProfile && activeFilter === 'all'}
            />
            {/* Links */}
            <SidebarItem 
                icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                }
                onClick={() => handleFilterClick('link')}
                text="Links" 
                type="link"
                isActive={!isOnProfile && activeFilter === 'link'}
            />
            {/* Files */}
            <SidebarItem 
                icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0010.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                } 
                onClick={() => handleFilterClick('file')}
                text="Files" 
                type="file"
                isActive={!isOnProfile && activeFilter === 'file'}
            /> 

            {/* Profile - at bottom */}
            <div className="absolute bottom-8">
                <SidebarItem 
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    }
                    onClick={() => navigate('/profile')}
                    text="Profile" 
                    type="profile"
                    isActive={isOnProfile}
                />
            </div>
        </div>
    </div>
}