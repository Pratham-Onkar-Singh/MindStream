import { useRef, useState, useEffect } from "react"
import { CloseIcon } from "../icons/CloseIcon"
import { Button } from "./Button"
import { Input } from "./Input"
import { Textarea } from "./Textarea"
import { contentAPI, uploadAPI } from "../api"

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
    };
}

export const CreateContentModal = ({ open, onClose, onSubmit, editMode = false, initialData }: CreateContentModalProps) => {
    const titleRef = useRef<HTMLInputElement>(null);
    const linkRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadMode, setUploadMode] = useState<UploadMode>(initialData?.type === 'file' ? 'file' : 'url');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Store form values in state to preserve them when switching modes
    const [formValues, setFormValues] = useState({
        title: "",
        description: "",
        link: ""
    });

    // Set initial values when modal opens in edit mode
    useEffect(() => {
        if (open && editMode && initialData) {
            const title = initialData.title || "";
            const description = initialData.description || "";
            const link = initialData.link || "";
            
            setFormValues({ title, description, link });
            
            if (titleRef.current) titleRef.current.value = title;
            if (descriptionRef.current) descriptionRef.current.value = description;
            if (linkRef.current && initialData.type !== 'file') linkRef.current.value = link;
        }
        // Clear values when modal closes
        if (!open) {
            setFormValues({ title: "", description: "", link: "" });
            if (titleRef.current) titleRef.current.value = "";
            if (linkRef.current) linkRef.current.value = "";
            if (descriptionRef.current) descriptionRef.current.value = "";
            if (fileInputRef.current) fileInputRef.current.value = "";
            setSelectedFile(null);
            setErrorMessage("");
            setUploadMode('url'); // Reset to default mode
        }
    }, [open, editMode, initialData]);

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
            } else {
                // File mode - require a file to be selected for update
                if (!selectedFile) {
                    setErrorMessage("Please select a file to upload!");
                    return;
                }
            }

            setLoading(true);
            setErrorMessage("");

            try {
                // Note: You'll need to implement an update API endpoint
                // For now, we'll delete and recreate
                await contentAPI.delete(initialData.id);
                
                if (uploadMode === 'url') {
                    const link = linkRef.current?.value;
                    await contentAPI.create({ 
                        title, 
                        type: "link", 
                        link: link || undefined, 
                        description: description || undefined 
                    });
                } else {
                    const formData = new FormData();
                    formData.append('file', selectedFile!); // Non-null assertion safe here due to validation above
                    formData.append('title', title);
                    if (description) formData.append('description', description);
                    await uploadAPI.uploadFile(formData);
                }

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
                    description: description || undefined 
                });
            } else {
                // Upload file
                const formData = new FormData();
                formData.append('file', selectedFile!);
                formData.append('title', title);
                if (description) formData.append('description', description);

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
                <span className="bg-black opacity-100 p-6 rounded-2xl border border-gray-800 min-w-[500px] relative z-50">
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

                        {uploadMode === 'url' ? (
                            <div className="w-full">
                                <Input 
                                    placeholder="Paste any link here (YouTube, Twitter, article, etc.)" 
                                    reference={linkRef}
                                    onChange={(e) => setFormValues(prev => ({ ...prev, link: e.target.value }))}
                                />
                            </div>
                        ) : (
                            <div className="w-full">
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

