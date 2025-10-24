import { Logo } from "../icons/Logo"
import { SidebarItem } from "./SidebarItem"
import { PlusIcon } from "../icons/PlusIcon"
import { DeleteIcon } from "../icons/DeleteIcon"
import { useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState, useMemo } from "react"
import { collectionAPI } from "../api"
import type { CollectionSummary, CollectionTreeNode } from "../types/collection"
import { buildCollectionTree, flattenCollectionTree } from "../utils/collectionTree"

// Cache for collections to avoid reloading on every mount
let collectionsCache: CollectionSummary[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface SidebarProps {
    onFilterChange?: (filterType: 'all' | 'link' | 'file') => void;
    activeFilter?: 'all' | 'link' | 'file';
    onCollectionSelect?: (collectionId: string | null) => void;
    selectedCollectionId?: string | null;
    onCreateCollectionClick?: () => void;
    onDeleteCollection?: (collectionId: string) => void;
}

export const Sidebar = ({ 
    onFilterChange, 
    activeFilter = 'all',
    onCollectionSelect,
    selectedCollectionId,
    onCreateCollectionClick,
    onDeleteCollection 
}: SidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collections, setCollections] = useState<CollectionSummary[]>([]);
    const [collectionsLoading, setCollectionsLoading] = useState(true);
    const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
    
    // Check if we're on the profile page
    const isOnProfile = location.pathname === '/profile';

    // Build tree structure from flat collections list
    const collectionTree = useMemo(() => buildCollectionTree(collections), [collections]);
    const flattenedTree = useMemo(() => flattenCollectionTree(collectionTree), [collectionTree]);

    // Auto-expand path to selected collection
    useEffect(() => {
        if (selectedCollectionId) {
            const collectionMap = new Map(collections.map(c => [c._id, c]));
            const pathIds = new Set<string>();
            
            let currentId: string | null = selectedCollectionId;
            while (currentId) {
                const collection = collectionMap.get(currentId);
                if (collection?.parentCollection) {
                    pathIds.add(collection.parentCollection);
                    currentId = collection.parentCollection;
                } else {
                    break;
                }
            }
            
            setExpandedCollections(prev => new Set([...prev, ...pathIds]));
        }
    }, [selectedCollectionId, collections]);

    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = async (forceRefresh = false) => {
        try {
            // Check if we have valid cached data
            const now = Date.now();
            const isCacheValid = collectionsCache && (now - cacheTimestamp < CACHE_DURATION);
            
            if (!forceRefresh && isCacheValid) {
                // Use cached data
                setCollections(collectionsCache!);
                setCollectionsLoading(false);
                return;
            }

            // Fetch fresh data
            setCollectionsLoading(true);
            const response = await collectionAPI.getAll();
            const fetchedCollections = response.collections || [];
            
            // Update cache
            collectionsCache = fetchedCollections;
            cacheTimestamp = now;
            
            setCollections(fetchedCollections);
        } catch (error) {
            console.error('Failed to load collections:', error);
            // If fetch fails but we have cache, use it
            if (collectionsCache) {
                setCollections(collectionsCache);
            }
        } finally {
            setCollectionsLoading(false);
        }
    };

    // Expose refresh method
    useEffect(() => {
        (window as any).refreshCollections = () => loadCollections(true); // Force refresh
    }, []);

    const handleFilterClick = (filterType: 'all' | 'link' | 'file') => {
        // Clear collection selection when changing type filter
        if (onCollectionSelect) {
            onCollectionSelect(null);
        }
        
        // If on Dashboard, just filter. Otherwise, navigate to Dashboard first
        if (onFilterChange) {
            onFilterChange(filterType);
        } else {
            // Navigate to dashboard with filter state
            navigate('/dashboard', { state: { filter: filterType } });
        }
    };

    // Toggle collection expand/collapse
    const toggleCollectionExpand = (collectionId: string) => {
        setExpandedCollections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(collectionId)) {
                newSet.delete(collectionId);
            } else {
                newSet.add(collectionId);
            }
            return newSet;
        });
    };

    // Recursive function to render collection tree
    const renderCollectionNodes = (nodes: CollectionTreeNode[]) => {
        return nodes.map((node) => {
            const isActive = selectedCollectionId === node._id;
            const hasChildren = node.children.length > 0;
            const isExpanded = expandedCollections.has(node._id);
            
            return (
                <div key={node._id}>
                    <div 
                        className="group flex items-center relative w-full"
                        style={{
                            paddingLeft: `${node.depth * 16}px`
                        }}
                    >
                        {/* Expand/Collapse Button - Always reserve space */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (hasChildren) {
                                    toggleCollectionExpand(node._id);
                                }
                            }}
                            className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors ${
                                hasChildren 
                                    ? 'text-gray-500 hover:text-white hover:bg-gray-700 cursor-pointer' 
                                    : 'invisible'
                            }`}
                            disabled={!hasChildren}
                        >
                            {hasChildren && (
                                <svg 
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </button>
                        
                        {/* Collection Button */}
                        <button
                            onClick={() => {
                                if (onCollectionSelect) {
                                    onCollectionSelect(node._id);
                                } else {
                                    navigate('/dashboard', { state: { collectionId: node._id } });
                                }
                            }}
                            className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm cursor-pointer min-w-0 ${
                                isActive
                                    ? 'bg-gray-800 text-white shadow-sm'
                                    : 'text-gray-400 hover:bg-gray-800/70 hover:text-white'
                            }`}
                        >
                            {/* Color indicator bar */}
                            {isActive && (
                                <div 
                                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                                    style={{ backgroundColor: node.color }}
                                />
                            )}
                            
                            <span className="text-base flex-shrink-0">{node.icon}</span>
                            <div className="flex-1 text-left overflow-hidden" style={{ minWidth: 0, maxWidth: '100%' }}>
                                <div className="font-medium truncate text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {node.name}
                                </div>
                                {node.description && node.depth === 0 && (
                                    <div className="text-xs text-gray-500 truncate mt-0.5">
                                        {node.description}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-xs text-gray-500">
                                    {node.contentCount}
                                </span>
                                
                                {/* Delete Button - Show on hover */}
                                {onDeleteCollection && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteCollection(node._id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-900/30 rounded transition-all text-gray-500 hover:text-red-400"
                                        title="Delete collection"
                                    >
                                        <DeleteIcon size="size-4" />
                                    </button>
                                )}
                            </div>
                        </button>
                    </div>
                    
                    {/* Recursively render children - only if expanded */}
                    {hasChildren && isExpanded && (
                        <div>
                            {renderCollectionNodes(node.children)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return <div className="border-r border-gray-800 bg-black w-64 fixed top-0 left-0 h-screen flex flex-col">
        <div className="text-2xl flex pl-4 mb-4 gap-4 pt-8 h-20 items-center text-white font-bold flex-shrink-0">
            <div className="cursor-pointer" onClick={() => navigate('/dashboard')}>
                <Logo className="w-12"/>
            </div>
            <div className="cursor-pointer" onClick={() => navigate('/dashboard')}>
                Mind<span className="text-custom-900">Stream</span>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="">
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
                    isActive={!isOnProfile && activeFilter === 'all' && !selectedCollectionId}
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

                {/* Collections Section */}
                <div className="mt-6 px-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                            Collections
                        </h3>
                        <button
                            onClick={() => {
                                if (onCreateCollectionClick) {
                                    onCreateCollectionClick();
                                } else {
                                    // Navigate to dashboard where user can create a collection
                                    navigate('/dashboard');
                                }
                            }}
                            className="p-1 hover:bg-gray-800 rounded transition-colors"
                            title="Create Collection"
                        >
                            <PlusIcon size="sm" />
                        </button>
                    </div>

                    {collectionsLoading ? (
                            <div className="text-center py-4 text-gray-500 text-xs">
                                Loading...
                            </div>
                        ) : flattenedTree.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-xs">
                                <p>No collections yet</p>
                                <p className="mt-1">Click + to create</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {renderCollectionNodes(collectionTree)}
                            </div>
                        )}

                        {flattenedTree.length > 0 && (
                            <div className="mt-3 text-xs text-gray-600 text-center">
                                {flattenedTree.length} {flattenedTree.length === 1 ? 'collection' : 'collections'}
                            </div>
                        )}
                    </div>
            </div>
        </div>

        {/* Profile - at bottom */}
        <div className="border-t border-gray-800 flex-shrink-0">
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
}