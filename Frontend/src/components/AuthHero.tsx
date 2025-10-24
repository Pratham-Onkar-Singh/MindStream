import { Logo } from "../icons/Logo"

export const AuthHero = () => {
    return (
        <div className="hidden md:flex flex-col justify-center items-start max-w-md space-y-6 text-white">
            {/* Logo and Brand */}
            <div className="text-3xl flex gap-4 items-center text-white mb-6">
                    <div className="cursor-pointer">
                        <Logo className="w-12"/>
                    </div>
                    <div className="cursor-pointer font-bold">
                        Mind<span className="text-custom-900">Stream</span>
                    </div>
                </div>

            {/* Hero Content */}
            <div className="space-y-4">
                <h1 className="text-3xl font-bold leading-tight">
                    Your Second Brain,
                    <div className="text-transparent bg-clip-text bg-gradient-to-r from-custom-900 to-purple-400"> Organized</div>
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed">
                    Capture, organize, and retrieve your digital knowledge effortlessly. 
                    From links and articles to files and notes - all in one beautiful interface.
                </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-custom-900">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Smart Collections</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-custom-900">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Full-text Search</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-custom-900">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Secure Sharing</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4 w-full">
                <div className="space-y-1 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-custom-900">∞</div>
                    <div className="text-xs text-gray-400">Content Items</div>
                </div>
                <div className="space-y-1 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-custom-900">🗂️</div>
                    <div className="text-xs text-gray-400">Collections</div>
                </div>
                <div className="space-y-1 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-custom-900">🔒</div>
                    <div className="text-xs text-gray-400">Secure</div>
                </div>
            </div>
        </div>
    );
};
