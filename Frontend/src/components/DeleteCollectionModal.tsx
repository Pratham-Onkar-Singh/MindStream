import { useState } from 'react';
import { Button } from './Button';
import { CloseIcon } from '../icons/CloseIcon';
import type { CollectionSummary } from '../types/collection';

interface DeleteCollectionModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (deleteAll: boolean) => void;
    collection: CollectionSummary | null;
    hasChildren: boolean;
    hasContent: boolean;
}

export function DeleteCollectionModal({ 
    open, 
    onClose, 
    onConfirm, 
    collection,
    hasChildren,
    hasContent
}: DeleteCollectionModalProps) {
    const [deleteAll, setDeleteAll] = useState(false);

    if (!open || !collection) return null;

    const handleConfirm = () => {
        onConfirm(deleteAll);
        setDeleteAll(false); // Reset for next time
    };

    const handleClose = () => {
        setDeleteAll(false);
        onClose();
    };

    return (
        <div className="w-full h-screen fixed top-0 left-0 bg-black/40 flex justify-center items-center backdrop-blur-sm z-50">
            <div className="flex flex-col z-50">
                <span className="bg-black opacity-100 p-6 rounded-2xl border border-gray-800 min-w-[500px] max-w-[600px] relative z-50">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{collection.icon}</span>
                            <h2 className="text-xl font-bold text-white">
                                Delete Collection
                            </h2>
                        </div>
                        <div 
                            onClick={handleClose}
                            className="cursor-pointer text-gray-500 hover:text-white transition-colors"
                        >
                            <CloseIcon />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        {/* Warning Box */}
                        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                            <p className="text-red-400 font-medium mb-2">
                                ⚠️ Warning: This action cannot be undone
                            </p>
                            <p className="text-gray-400 text-sm">
                                You are about to delete the collection <span className="font-semibold text-white">"{collection.name}"</span>
                            </p>
                        </div>

                        {(hasChildren || hasContent) && (
                            <div className="space-y-3">
                                <p className="text-gray-300 font-medium">Choose deletion method:</p>
                                
                                {/* Option 1: Delete only collection */}
                                <label className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg border-2 transition-all cursor-pointer hover:border-gray-600"
                                    style={{
                                        borderColor: !deleteAll ? '#3B82F6' : 'transparent'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="deleteOption"
                                        checked={!deleteAll}
                                        onChange={() => setDeleteAll(false)}
                                        className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <div className="text-white font-medium mb-1">
                                            Delete collection only
                                        </div>
                                        <div className="text-sm text-gray-400 space-y-1">
                                            {hasChildren && (
                                                <div>• Child collections will move up one level</div>
                                            )}
                                            {hasContent && (
                                                <div>• Content will become uncategorized</div>
                                            )}
                                        </div>
                                    </div>
                                </label>

                                {/* Option 2: Delete everything */}
                                <label className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg border-2 transition-all cursor-pointer hover:border-red-600"
                                    style={{
                                        borderColor: deleteAll ? '#DC2626' : 'transparent'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="deleteOption"
                                        checked={deleteAll}
                                        onChange={() => setDeleteAll(true)}
                                        className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500 focus:ring-2 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <div className="text-white font-medium mb-1 flex items-center gap-2">
                                            Delete everything
                                            <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded">
                                                Destructive
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-400 space-y-1">
                                            {hasChildren && (
                                                <div>• All nested collections will be deleted</div>
                                            )}
                                            {hasContent && (
                                                <div>• All content in this collection will be deleted</div>
                                            )}
                                            <div className="text-red-400 font-medium mt-2">
                                                ⚠️ This will permanently delete all data
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        )}

                        {!hasChildren && !hasContent && (
                            <div className="text-gray-400 text-sm bg-gray-800 rounded-lg p-4">
                                This collection is empty and has no subcollections. It will be safely deleted.
                            </div>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-3 mt-6">
                        <Button
                            variant="secondary"
                            size="md"
                            text="Cancel"
                            onClick={handleClose}
                            className="flex-1"
                        />
                        <button
                            onClick={handleConfirm}
                            className={`flex-1 h-12 text-[1.1rem] p-3 rounded-xl font-bold transition-colors cursor-pointer ${
                                deleteAll 
                                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                                    : 'bg-white hover:bg-gray-200 text-black'
                            }`}
                        >
                            {deleteAll ? "Delete Everything" : "Delete Collection"}
                        </button>
                    </div>
                </span>
            </div>
        </div>
    );
}
