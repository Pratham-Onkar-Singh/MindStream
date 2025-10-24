import type { ReactNode } from "react"
import { AuthHero } from "./AuthHero"

interface AuthLayoutProps {
    children: ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div className="h-screen bg-gradient-mindstream bg-grid-pattern bg-radial-overlay flex justify-center items-center overflow-hidden p-4">
            <div className="bg-black/60 backdrop-blur-xl h-fit p-6 md:p-10 rounded-2xl flex flex-col justify-evenly md:flex-row items-center gap-10 md:gap-16 border border-gray-800/50 shadow-2xl shadow-custom-900/20 w-full max-w-md md:max-w-6xl">
                
                {/* Hero Section - Static, Hidden on mobile */}
                <AuthHero />

                {/* Dynamic Form Section */}
                <div className="flex flex-col items-center w-full md:w-auto md:min-w-[320px]">
                    {children}
                </div>
            </div>
        </div>
    )
}
