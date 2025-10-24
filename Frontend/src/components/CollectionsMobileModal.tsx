import { useEffect, useState } from "react"
import { CloseIcon } from "../icons/CloseIcon"
import { DeleteIcon } from "../icons/DeleteIcon"
import type { CollectionTreeNode } from "../types/collection"

interface CollectionsMobileModalProps {
    open: boolean;
    onClose: () => void;
    collections: CollectionTreeNode[];
    selectedCollectionId: string | null;
    onCollectionSelect: (collectionId: string | null) => void;
    onCreateCollection?: () => void;
    onDeleteCollection?: (collectionId: string) => void;
}

export const CollectionsMobileModal = ({
    open,
    onClose,
    collections,
    selectedCollectionId,
    onCollectionSelect,
    onCreateCollection,
    onDeleteCollection
}: CollectionsMobileModalProps) => {
    const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!open) return;

        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    const toggleExpand = (collectionId: string) => {
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

    const handleCollectionClick = (collectionId: string) => {
        onCollectionSelect(collectionId);
        onClose();
    };

    const renderCollection = (node: CollectionTreeNode, level: number = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedCollections.has(node._id);
        const isSelected = selectedCollectionId === node._id;

        return (
            <div key={node._id}>
                <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                        isSelected
                            ? 'bg-gray-800 text-white'
                            : 'hover:bg-gray-800/50 text-gray-300'
                    }`}
                    style={{ paddingLeft: `${(level * 20) + 16}px` }}
                >
                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(node._id);
                            }}
                            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <svg
                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                    {!hasChildren && <div className="w-5" />}
                    
                    <div
                        className="flex items-center gap-3 flex-1 min-w-0"
                        onClick={() => handleCollectionClick(node._id)}
                    >
                        <span className="text-2xl flex-shrink-0">{node.icon}</span>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{node.name}</div>
                            {node.description && (
                                <div className="text-xs text-gray-500 truncate mt-0.5">
                                    {node.description}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-500">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0010.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            {node.contentCount}
                        </div>
                    </div>
                    
                    {/* Delete Button */}
                    {onDeleteCollection && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteCollection(node._id);
                                onClose();
                            }}
                            className="flex-shrink-0 p-2 hover:bg-red-900/30 rounded transition-all text-gray-500 hover:text-red-400"
                            title="Delete collection"
                        >
                            <DeleteIcon size="size-4" />
                        </button>
                    )}
                </div>

                {/* Render children if expanded */}
                {hasChildren && isExpanded && (
                    <div>
                        {node.children!.map(child => renderCollection(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-black border-t md:border border-gray-800 rounded-t-3xl md:rounded-2xl w-full md:w-[90vw] md:max-w-2xl max-h-[85vh] md:max-h-[80vh] overflow-hidden flex flex-col shadow-2xl z-[110]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <h2 className="text-xl font-bold text-white">Collections</h2>
                        <span className="text-sm text-gray-500">
                            ({collections.length})
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {/* Collections List */}
                    {collections.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <p className="text-lg mb-2">No collections yet</p>
                            <p className="text-sm mb-4">Create your first collection to organize content</p>
                            {onCreateCollection && (
                                <button
                                    onClick={() => {
                                        onCreateCollection();
                                        onClose();
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Collection
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {collections.map(node => renderCollection(node, 0))}
                        </div>
                    )}
                </div>

                {/* Footer - Create New Collection Button */}
                {collections.length > 0 && onCreateCollection && (
                    <div className="border-t border-gray-800 p-4 md:p-6 flex-shrink-0">
                        <button
                            onClick={() => {
                                onCreateCollection();
                                onClose();
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create New Collection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
