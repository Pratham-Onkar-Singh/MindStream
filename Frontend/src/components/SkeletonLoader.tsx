// Reusable skeleton loading components

export const SkeletonCard = () => {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-gray-800 bg-black transition-all flex flex-col">
            {/* Gradient overlay matching ContentCard */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-transparent to-transparent opacity-0 transition-opacity" />
            
            <div className="relative p-5 flex flex-col h-full animate-pulse">
                {/* Type badge and actions */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg"></div>
                        <div className="h-5 w-16 bg-gray-900 rounded"></div>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity">
                        <div className="w-7 h-7 bg-gray-900 rounded-lg"></div>
                        <div className="w-7 h-7 bg-gray-900 rounded-lg"></div>
                    </div>
                </div>
                
                {/* Title */}
                <div className="mb-2">
                    <div className="h-5 bg-gray-900 rounded w-3/4"></div>
                </div>
                
                {/* Description lines */}
                <div className="space-y-2 mb-3">
                    <div className="h-4 bg-gray-900 rounded w-full"></div>
                    <div className="h-4 bg-gray-900 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-900 rounded w-4/5"></div>
                </div>
                
                {/* Footer */}
                <div className="pt-3 border-t border-gray-800 mt-auto">
                    <div className="h-3 bg-gray-900 rounded w-24"></div>
                </div>
            </div>
        </div>
    );
};

export const SkeletonGrid = ({ count = 6 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
};

export const SkeletonList = ({ count = 4 }: { count?: number }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-xl p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 bg-gray-900 rounded-lg flex-shrink-0"></div>
                        {/* Content */}
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-900 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-900 rounded w-1/2"></div>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-900 rounded"></div>
                            <div className="w-8 h-8 bg-gray-900 rounded"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const SkeletonCollectionCard = () => {
    return (
        <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-xl p-4 transition-all cursor-pointer animate-pulse">
            <div className="flex items-center gap-3 mb-3">
                {/* Icon skeleton */}
                <div className="w-10 h-10 bg-gray-900 rounded-lg"></div>
                {/* Title skeleton */}
                <div className="flex-1">
                    <div className="h-4 bg-gray-900 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-900 rounded w-1/2"></div>
                </div>
            </div>
            {/* Stats skeleton */}
            <div className="flex items-center gap-4 text-sm mt-3 pt-3 border-t border-gray-800">
                <div className="h-3 bg-gray-900 rounded w-16"></div>
                <div className="h-3 bg-gray-900 rounded w-16"></div>
            </div>
        </div>
    );
};

export const SkeletonCollectionGrid = ({ count = 4 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCollectionCard key={index} />
            ))}
        </div>
    );
};

export const SkeletonProfileCard = () => {
    return (
        <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-6">
                {/* Avatar skeleton */}
                <div className="w-20 h-20 bg-gray-900 rounded-full"></div>
                {/* Info skeleton */}
                <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-900 rounded w-32"></div>
                    <div className="h-4 bg-gray-900 rounded w-48"></div>
                </div>
            </div>
            {/* Stats skeleton */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-6 bg-gray-900 rounded w-12 mx-auto"></div>
                        <div className="h-3 bg-gray-900 rounded w-16 mx-auto"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const SkeletonSidebar = () => {
    return (
        <div className="space-y-4 p-4">
            {/* Logo skeleton */}
            <div className="h-10 bg-gray-900 rounded-lg mb-6 animate-pulse"></div>
            
            {/* Menu items skeleton */}
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                    <div className="w-5 h-5 bg-gray-900 rounded"></div>
                    <div className="h-4 bg-gray-900 rounded flex-1"></div>
                </div>
            ))}
            
            {/* Collections section skeleton */}
            <div className="mt-8 space-y-3 animate-pulse">
                <div className="h-5 bg-gray-900 rounded w-32"></div>
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-2 pl-4">
                        <div className="w-4 h-4 bg-gray-900 rounded"></div>
                        <div className="h-3 bg-gray-900 rounded flex-1"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};
