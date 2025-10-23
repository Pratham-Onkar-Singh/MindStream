import { useEffect, useState } from "react";
import { collectionAPI } from "../api";
import { PlusIcon } from "../icons/PlusIcon";

interface Collection {
    _id: string;
    name: string;
    description?: string;
    icon: string;
    color: string;
    contentCount: number;
    isDefault: boolean;
}

interface CollectionSidebarProps {
    onCollectionSelect: (collectionId: string | null) => void;
    selectedCollectionId: string | null;
    onCreateClick: () => void;
}

export function CollectionSidebar({ 
    onCollectionSelect, 
    selectedCollectionId,
    onCreateClick 
}: CollectionSidebarProps) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = async () => {
        try {
            setLoading(true);
            const response = await collectionAPI.getAll();
            setCollections(response.collections || []);
        } catch (error) {
            console.error('Failed to load collections:', error);
        } finally {
            setLoading(false);
        }
    };

    // Expose refresh method
    useEffect(() => {
        (window as any).refreshCollections = loadCollections;
    }, []);

    if (loading) {
        return (
            <div className="w-64 bg-zinc-900 border-r border-gray-800 p-4">
                <div className="flex items-center justify-center h-32">
                    <div className="text-gray-400">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-64 bg-zinc-900 border-r border-gray-800 flex flex-col h-screen fixed top-0 left-64">
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Collections</h2>
                    <button
                        onClick={onCreateClick}
                        className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Create Collection"
                    >
                        <PlusIcon size="md" />
                    </button>
                </div>
            </div>

            {/* Collections List */}
            <div className="flex-1 overflow-y-auto p-2">
                {/* All Content - Default Collection */}
                <button
                    onClick={() => onCollectionSelect(null)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 ${
                        selectedCollectionId === null
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                    <span className="text-xl">📚</span>
                    <div className="flex-1 text-left">
                        <div className="font-medium">All Content</div>
                    </div>
                    <span className="text-xs text-gray-500">
                        {collections.reduce((sum, c) => sum + c.contentCount, 0)}
                    </span>
                </button>

                {/* User Collections */}
                {collections.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        <p>No collections yet</p>
                        <p className="text-xs mt-1">Create one to organize your content</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {collections.map((collection) => (
                            <button
                                key={collection._id}
                                onClick={() => onCollectionSelect(collection._id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                    selectedCollectionId === collection._id
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                                style={{
                                    borderLeft: selectedCollectionId === collection._id 
                                        ? `3px solid ${collection.color}` 
                                        : 'none'
                                }}
                            >
                                <span className="text-xl">{collection.icon}</span>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="font-medium truncate">{collection.name}</div>
                                    {collection.description && (
                                        <div className="text-xs text-gray-500 truncate">
                                            {collection.description}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500">
                                    {collection.contentCount}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="p-4 border-t border-gray-800">
                <div className="text-xs text-gray-500">
                    {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
                </div>
            </div>
        </div>
    );
}
