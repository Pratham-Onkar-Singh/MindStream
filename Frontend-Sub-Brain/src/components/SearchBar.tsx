import { useState, useEffect } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    onFilterChange?: (filters: SearchFilters) => void;
    placeholder?: string;
}

export interface SearchFilters {
    type: string;
    sortBy: string;
}

export const SearchBar = ({ onSearch, onFilterChange, placeholder = "Search your brain..." }: SearchBarProps) => {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState<SearchFilters>({
        type: 'all',
        sortBy: 'relevance'
    });
    const [showFilters, setShowFilters] = useState(false);

    // Debounced search - wait 500ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 500);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    // Trigger filter change (separate from search)
    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(filters);
        }
    }, [filters, onFilterChange]);

    const handleFilterChange = (key: keyof SearchFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClear = () => {
        setQuery('');
        setFilters({ type: 'all', sortBy: 'relevance' });
    };

    return (
        <div className="w-full">
            {/* Search Input */}
            <div className="flex gap-3 items-center">
                <div className="flex-1 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gray-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-black text-white border border-gray-800 rounded-xl py-3 pl-12 pr-10 placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
                    />
                    {query && (
                        <button
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
                            title="Clear search"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                        showFilters 
                            ? 'bg-white text-black border-white' 
                            : 'bg-black border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                    }`}
                    title="Toggle filters"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span className="hidden sm:inline font-medium">Filters</span>
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="mt-4 p-5 bg-black border border-gray-800 rounded-xl transition-all">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm text-gray-500 mb-2 font-medium uppercase tracking-wider">
                                Content Type
                            </label>
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="w-full bg-black text-white border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-600 cursor-pointer transition-colors hover:border-gray-700"
                            >
                                <option value="all">All Types</option>
                                <option value="link">🔗 Links</option>
                                <option value="file">📄 Files</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm text-gray-500 mb-2 font-medium uppercase tracking-wider">
                                Sort By
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                className="w-full bg-black text-white border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-600 cursor-pointer transition-colors hover:border-gray-700"
                            >
                                <option value="relevance">🎯 Relevance</option>
                                <option value="date">📅 Date (Newest)</option>
                                <option value="title">🔤 Title (A-Z)</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Search Indicator */}
            {query && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                        Searching for: <span className="text-white font-medium">"{query}"</span>
                    </span>
                </div>
            )}
        </div>
    );
};
