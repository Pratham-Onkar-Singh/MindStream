import { useRef, useState, useEffect, useMemo } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { CloseIcon } from "../icons/CloseIcon";
import { collectionAPI } from "../api";
import type { CollectionSummary } from "../types/collection";
import { buildCollectionTree, flattenCollectionTree } from "../utils/collectionTree";

interface CreateCollectionModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateCollectionModal({ open, onClose, onSuccess }: CreateCollectionModalProps) {
    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [collections, setCollections] = useState<CollectionSummary[]>([]);
    const [selectedParentId, setSelectedParentId] = useState<string>('');

    // Build tree for indented parent selection
    const collectionTree = useMemo(() => buildCollectionTree(collections), [collections]);
    const flattenedTree = useMemo(() => flattenCollectionTree(collectionTree), [collectionTree]);

    // Load collections when modal opens
    useEffect(() => {
        if (open) {
            loadCollections();
        }
    }, [open]);

    const loadCollections = async () => {
        try {
            const response = await collectionAPI.getAll();
            setCollections(response.collections || []);
        } catch (error) {
            console.error('Failed to fetch collections:', error);
        }
    };

    const handleSubmit = async () => {
        const name = nameRef.current?.value.trim();
        
        if (!name) {
            setErrorMessage('Collection name is required');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            await collectionAPI.create({
                name,
                description: descriptionRef.current?.value.trim(),
                icon: '📁', // Default icon
                color: '#6B7280', // Default gray color
                parentCollection: selectedParentId || undefined
            });

            // Clear form
            if (nameRef.current) nameRef.current.value = '';
            if (descriptionRef.current) descriptionRef.current.value = '';
            setSelectedParentId('');
            
            onSuccess();
            onClose();
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to create collection');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="w-full h-screen fixed top-0 left-0 bg-black/40 flex justify-center items-center backdrop-blur-sm z-50">
            <div className="flex flex-col z-50">
                <span className="bg-black opacity-100 p-6 rounded-2xl border border-gray-800 min-w-[500px] relative z-50">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-xl font-bold text-white">
                            Create Collection
                        </h2>
                        <div onClick={onClose} className="cursor-pointer text-gray-500 hover:text-white transition-colors">
                            <CloseIcon/>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-full">
                            <Input 
                                placeholder="Collection Name" 
                                reference={nameRef}
                            />
                        </div>
                        <div className="w-full">
                            <Textarea 
                                placeholder="Description (Optional)" 
                                reference={descriptionRef} 
                                rows={3}
                            />
                        </div>
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Parent Collection (optional)
                            </label>
                            <select
                                value={selectedParentId}
                                onChange={(e) => setSelectedParentId(e.target.value)}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-gray-600 focus:outline-none"
                            >
                                <option value="">None (Top Level)</option>
                                {flattenedTree.map((node) => {
                                    const indent = '  '.repeat(node.depth);
                                    const prefix = node.depth > 0 ? `${indent}↳ ` : '';
                                    return (
                                        <option key={node._id} value={node._id}>
                                            {prefix}{node.icon} {node.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="text-red-400 text-sm mt-4 text-center">
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex justify-center mt-6">
                        <Button
                            onClick={handleSubmit}
                            variant="primary"
                            text={loading ? 'Creating...' : 'Create Collection'}
                            size="md"
                            className="w-full"
                        />
                    </div>
                </span>
            </div>
        </div>
    );
}
