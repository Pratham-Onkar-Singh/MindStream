import { useRef, useState, useEffect, useMemo } from "react"
import { CloseIcon } from "../icons/CloseIcon"
import { Button } from "./Button"
import { Input } from "./Input"
import { Textarea } from "./Textarea"
import { contentAPI, uploadAPI, collectionAPI } from "../api"
import type { CollectionSummary } from "../types/collection"
import { buildCollectionTree, flattenCollectionTree } from "../utils/collectionTree"

type UploadMode = 'url' | 'file';

interface CreateContentModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
    editMode?: boolean;
    initialData?: {
        id?: string;
        title?: string;
        description?: string;
        link?: string;
        type?: string;
        collection?: string;
    };
    defaultCollectionId?: string | null;
}

export const CreateContentModal = ({ open, onClose, onSubmit, editMode = false, initialData, defaultCollectionId }: CreateContentModalProps) => {
    const titleRef = useRef<HTMLInputElement>(null);
    const linkRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadMode, setUploadMode] = useState<UploadMode>(initialData?.type === 'file' ? 'file' : 'url');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [collections, setCollections] = useState<CollectionSummary[]>([]);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Store form values in state to preserve them when switching modes
    const [formValues, setFormValues] = useState({
        title: "",
        description: "",
        link: ""
    });

    // Build tree for hierarchical display
    const collectionTree = useMemo(() => buildCollectionTree(collections), [collections]);
    const flattenedTree = useMemo(() => flattenCollectionTree(collectionTree), [collectionTree]);

    // Fetch collections when modal opens
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
            console.error('Failed to load collections:', error);
        }
    };

    // Set initial values when modal opens
    useEffect(() => {
        if (open) {
            if (editMode && initialData) {
                // Edit mode: use initialData
                const title = initialData.title || "";
                const description = initialData.description || "";
                const link = initialData.link || "";
                
                setFormValues({ title, description, link });
                setSelectedCollectionId(initialData.collection || '');
                
                if (titleRef.current) titleRef.current.value = title;
                if (descriptionRef.current) descriptionRef.current.value = description;
                if (linkRef.current && initialData.type !== 'file') linkRef.current.value = link;
            } else if (defaultCollectionId) {
                // Create mode: use defaultCollectionId if provided
                setSelectedCollectionId(defaultCollectionId);
            }
        }
        // Clear values when modal closes
        if (!open) {
            setFormValues({ title: "", description: "", link: "" });
            setSelectedCollectionId('');
            if (titleRef.current) titleRef.current.value = "";
            if (linkRef.current) linkRef.current.value = "";
            if (descriptionRef.current) descriptionRef.current.value = "";
            if (fileInputRef.current) fileInputRef.current.value = "";
            setSelectedFile(null);
            setErrorMessage("");
            setUploadMode('url'); // Reset to default mode
        }
    }, [open, editMode, initialData, defaultCollectionId]);

    // Preserve linkRef value when switching back to URL mode
    useEffect(() => {
        if (uploadMode === 'url' && linkRef.current) {
            linkRef.current.value = formValues.link;
        }
    }, [uploadMode, formValues.link]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (50MB limit)
            if (file.size > 50 * 1024 * 1024) {
                setErrorMessage("File size must be less than 50MB");
                return;
            }
            setSelectedFile(file);
            setErrorMessage("");
        }
    };

    const createContent = async () => {
        const title = titleRef.current?.value;
        const description = descriptionRef.current?.value;

        if (!title) {
            setErrorMessage("Title is required!");
            return;
        }

        // Edit mode - update existing content
        if (editMode && initialData?.id) {
            if (uploadMode === 'url') {
                const link = linkRef.current?.value;
                if (!link) {
                    setErrorMessage("Link is required!");
                    return;
                }
            }
            // Note: For file type content, we only allow updating title, description, and collection
            // To change the file itself, user needs to delete and create new content

            setLoading(true);
            setErrorMessage("");

            try {
                const updateData: any = {
                    title,
                    description: description || undefined,
                    collection: selectedCollectionId || null
                };

                // Only update link if it's a link type content
                if (uploadMode === 'url') {
                    updateData.link = linkRef.current?.value;
                }

                await contentAPI.update(initialData.id, updateData);

                // Clear inputs
                if (titleRef.current) titleRef.current.value = "";
                if (linkRef.current) linkRef.current.value = "";
                if (descriptionRef.current) descriptionRef.current.value = "";
                if (fileInputRef.current) fileInputRef.current.value = "";
                setSelectedFile(null);
                setErrorMessage("");

                onSubmit();
            } catch (error: any) {
                console.error('Update content error:', error);
                setErrorMessage(error.response?.data?.message || "Failed to update content");
            } finally {
                setLoading(false);
            }
            return;
        }

        // Create mode - original logic
        if (uploadMode === 'url') {
            const link = linkRef.current?.value;
            if (!link) {
                setErrorMessage("Link is required!");
                return;
            }
        } else {
            if (!selectedFile) {
                setErrorMessage("Please select a file to upload!");
                return;
            }
        }

        setLoading(true);
        setErrorMessage("");

        try {
            if (uploadMode === 'url') {
                // Create URL-based content
                const link = linkRef.current?.value;
                await contentAPI.create({ 
                    title, 
                    type: "link", 
                    link: link || undefined, 
                    description: description || undefined,
                    collection: selectedCollectionId || undefined
                });
            } else {
                // Upload file
                const formData = new FormData();
                formData.append('file', selectedFile!);
                formData.append('title', title);
                if (description) formData.append('description', description);
                if (selectedCollectionId) formData.append('collection', selectedCollectionId);

                await uploadAPI.uploadFile(formData);
            }
            
            // Clear the inputs
            if (titleRef.current) titleRef.current.value = "";
            if (linkRef.current) linkRef.current.value = "";
            if (descriptionRef.current) descriptionRef.current.value = "";
            if (fileInputRef.current) fileInputRef.current.value = "";
            setSelectedFile(null);
            setErrorMessage("");

            // trigger refresh in Dashboard and close modal
            onSubmit();
        } catch (error: any) {
            console.error('Create content error:', error);
            setErrorMessage(error.response?.data?.message || "Failed to create content");
        } finally {
            setLoading(false);
        }
    }
    
    return <div>
        {open && <div className="w-full h-screen fixed top-0 left-0 bg-black/40 flex justify-center items-center backdrop-blur-sm z-50">
              <div className="flex flex-col z-50">
                <span className="bg-black opacity-100 p-4 md:p-6 rounded-2xl border border-gray-800 w-[90vw] md:min-w-[500px] md:w-auto relative z-50">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-xl font-bold text-white">
                            {editMode ? 'Edit Content' : 'Add New Content'}
                        </h2>
                        <div onClick={onClose} className="cursor-pointer text-gray-500 hover:text-white transition-colors">
                            <CloseIcon/>
                        </div>
                    </div>

                    {/* Upload Mode Toggle */}
                    <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
                        <button
                            onClick={() => {
                                setUploadMode('url');
                                // setSelectedFile(null);
                                setErrorMessage("");
                            }}
                            className={`flex-1 py-2 px-4 rounded-lg transition-all cursor-pointer ${
                                uploadMode === 'url'
                                    ? 'bg-white text-black font-medium'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            🔗 Add Link
                        </button>
                        <button
                            onClick={() => {
                                setUploadMode('file');
                                setErrorMessage("");
                            }}
                            className={`flex-1 py-2 px-4 rounded-lg transition-all cursor-pointer ${
                                uploadMode === 'file'
                                    ? 'bg-white text-black font-medium'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            📤 Upload File
                        </button>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-full">
                            <Input 
                                placeholder="Title" 
                                reference={titleRef}
                                onChange={(e) => setFormValues(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div className="w-full">
                            <Textarea 
                                placeholder="Description (Optional)" 
                                reference={descriptionRef} 
                                rows={3}
                                onChange={(e) => setFormValues(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        {/* Collection Selector */}
                        <div className="w-full">
                            <label className="flex text-sm font-medium text-gray-400 mb-2 items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                Collection (optional)
                            </label>
                            <div className="relative group">
                                <select 
                                    value={selectedCollectionId}
                                    onChange={(e) => setSelectedCollectionId(e.target.value)}
                                    className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-3 pr-10 border border-gray-800 hover:border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer appearance-none backdrop-blur-sm"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundSize: '1.25rem'
                                    }}
                                >
                                    <option value="" className="bg-gray-900 text-gray-400 py-2">
                                        📂 No Collection
                                    </option>
                                    {flattenedTree.map((node) => {
                                        const indent = '\u00A0\u00A0\u00A0'.repeat(node.depth); // Non-breaking spaces
                                        const prefix = node.depth > 0 ? `${indent}↳ ` : '';
                                        return (
                                            <option 
                                                key={node._id} 
                                                value={node._id}
                                                className="bg-gray-900 text-white py-2 hover:bg-gray-800"
                                            >
                                                {prefix}{node.icon} {node.name}
                                            </option>
                                        );
                                    })}
                                </select>
                                {/* Subtle glow effect on focus */}
                                <div className="absolute inset-0 rounded-lg bg-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none -z-10 blur-xl"></div>
                            </div>
                            {selectedCollectionId && (
                                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                    </svg>
                                    Content will be saved to selected collection
                                </div>
                            )}
                        </div>

                        {uploadMode === 'url' ? (
                            <div className="w-full">
                                <Input 
                                    placeholder="Paste any link here (YouTube, Twitter, article, etc.)" 
                                    reference={linkRef}
                                    onChange={(e) => setFormValues(prev => ({ ...prev, link: e.target.value }))}
                                />
                            </div>
                        ) : (
                            <div className="w-full mt-4">
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="file-upload"
                                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.webm,.mp3,.wav,.zip"
                                    />
                                    <label 
                                        htmlFor="file-upload" 
                                        className="cursor-pointer flex flex-col items-center"
                                    >
                                        {selectedFile ? (
                                            <>
                                                <div className="text-4xl mb-2">📄</div>
                                                <p className="text-white font-medium">{selectedFile.name}</p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                                <p className="text-blue-400 text-sm mt-2 hover:underline">
                                                    Click to change file
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-4xl mb-2">📁</div>
                                                <p className="text-white font-medium mb-1">
                                                    Click to upload a file
                                                </p>
                                                <p className="text-gray-400 text-sm">
                                                    PDF, DOC, Images, Videos, Audio (Max 50MB)
                                                </p>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center mt-6" >
                        <Button 
                            variant="primary" 
                            size="sm" 
                            text={loading ? (editMode ? "Updating..." : (uploadMode === 'file' ? "Uploading..." : "Adding...")) : (editMode ? "Update" : "Submit")} 
                            onClick={createContent}
                            disabled={loading}
                        />
                    </div>

                    {errorMessage && (
                        <div className="flex justify-center text-red-500 mt-2 text-sm">
                            {errorMessage}
                        </div>
                    )}
                </span>
              </div>
            </div>}
    </div>
}

