import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { Button } from "../components/Button";
import { userAPI } from "../api";

export function Profile() {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [brainLink, setBrainLink] = useState("");
    const [totalContent, setTotalContent] = useState(0);
    const [fileCount, setFileCount] = useState(0);
    const [linkCount, setLinkCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toggleLoading, setToggleLoading] = useState(false);

    // Fetch user profile on component mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getProfile();
            
            if (response.success) {
                setUsername(response.user.username);
                setName(response.user.name);
                setEmail(response.user.email);
                setBrainLink(response.user.brainLink || "");
                setIsPublic(response.user.isBrainPublic || false);
                setTotalContent(response.stats.totalContent);
                setFileCount(response.stats.fileCount);
                setLinkCount(response.stats.linkCount);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublic = async () => {
        try {
            setToggleLoading(true);
            const newPublicState = !isPublic;
            const response = await userAPI.toggleBrainVisibility(newPublicState);
            
            if (response.success) {
                setIsPublic(newPublicState);
            }
        } catch (err) {
            console.error('Failed to toggle brain visibility:', err);
            alert('Failed to update brain visibility');
        } finally {
            setToggleLoading(false);
        }
    };

    const handleCopyLink = async () => {
        if (!brainLink) return;
        
        const fullLink = `${window.location.origin}/brain/${brainLink}`;
        try {
            await navigator.clipboard.writeText(fullLink);
            alert(`Brain link copied to clipboard!\n${fullLink}`);
        } catch (err) {
            console.error('Failed to copy link:', err);
            alert('Failed to copy link to clipboard');
        }
    };    const handleLogout = () => {
        // TODO: Implement logout functionality
        localStorage.removeItem('token');
        window.location.href = '/signin';
    };

    return (
        <div className="flex">
            <Sidebar />
            
            <div className="flex-1 ml-64 min-h-screen bg-black p-10">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
                        <p className="text-gray-500">Manage your account and preferences</p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="relative w-16 h-16 mx-auto mb-6">
                                    <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
                                </div>
                                <p className="text-gray-400 font-medium">Loading profile...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Profile Content - Only show when not loading */}
                    {!loading && !error && (
                        <>
                            {/* Profile Card */}
                            <div className="bg-black border border-gray-800 rounded-xl p-8 mb-6">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-800">
                            <div className="w-24 h-24 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center text-black text-3xl font-bold">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-1">@{username}</h2>
                                <p className="text-gray-400">{email}</p>
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="space-y-6 mb-8 pb-8 border-b border-gray-800">
                            <h3 className="text-xl font-semibold text-white mb-4">Account Information</h3>
                            
                            <div>
                                <label className="block text-sm text-gray-500 mb-2 uppercase tracking-wider">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    disabled
                                    className="w-full bg-black text-gray-500 border border-gray-800 rounded-lg px-4 py-3 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-2 uppercase tracking-wider">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    disabled
                                    className="w-full bg-black text-gray-500 border border-gray-800 rounded-lg px-4 py-3 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-2 uppercase tracking-wider">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full bg-black text-gray-500 border border-gray-800 rounded-lg px-4 py-3 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 mb-2 uppercase tracking-wider">
                                    Total Content
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="bg-black border border-gray-800 rounded-lg px-6 py-3">
                                        <span className="text-2xl font-bold text-white">{totalContent}</span>
                                        <span className="text-gray-400 ml-2">items saved</span>
                                    </div>
                                    <div className="bg-black border border-gray-800 rounded-lg px-6 py-3">
                                        <span className="text-xl font-bold text-white">{linkCount}</span>
                                        <span className="text-gray-400 ml-2">links</span>
                                    </div>
                                    <div className="bg-black border border-gray-800 rounded-lg px-6 py-3">
                                        <span className="text-xl font-bold text-white">{fileCount}</span>
                                        <span className="text-gray-400 ml-2">files</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Privacy Settings */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Privacy Settings</h3>
                            
                            <div className="bg-black border border-gray-800 rounded-lg p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 mr-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            <h4 className="text-lg font-medium text-white">
                                                {isPublic ? 'Public Brain' : 'Private Brain'}
                                            </h4>
                                        </div>
                                        <p className="text-gray-400 text-sm">
                                            {isPublic 
                                                ? 'Your brain is visible to anyone with the link. People can view but not edit your content.'
                                                : 'Your brain is private. Only you can see your content. You can generate shareable links anytime.'
                                            }
                                        </p>
                                    </div>
                                    
                                    {/* Toggle Switch */}
                                    <button
                                        onClick={handleTogglePublic}
                                        disabled={toggleLoading}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black ${
                                            isPublic 
                                                ? 'bg-white focus:ring-gray-400' 
                                                : 'bg-gray-700 focus:ring-gray-600'
                                        } ${toggleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full transition-transform ${
                                                isPublic ? 'bg-black translate-x-7' : 'bg-white translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Brain Link Display */}
                                {brainLink && (
                                    <div className="mt-4 pt-4 border-t border-gray-800">
                                        <label className="block text-sm text-gray-500 mb-2 uppercase tracking-wider">
                                            Your Brain Link
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 font-mono text-sm text-gray-400 overflow-x-auto">
                                                {`${window.location.origin}/brain/${brainLink}`}
                                            </div>
                                            <button
                                                onClick={handleCopyLink}
                                                className="px-4 py-3 cursor-pointer bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Copy
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Share this link with others to let them view your brain
                                        </p>
                                    </div>
                                )}

                                {/* Warning when public */}
                                {isPublic && (
                                    <div className="mt-4 pt-4 border-t border-gray-800">
                                        <div className="flex items-start gap-3 text-yellow-500/80">
                                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <p className="text-sm">
                                                Anyone with your share link can view all your content. Make sure you only share with people you trust.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-black border border-red-900/30 rounded-xl p-8">
                        <h3 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-medium mb-1">Log Out</h4>
                                <p className="text-gray-400 text-sm">Sign out of your account on this device</p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                text="Log Out"
                                onClick={handleLogout}
                                className="border-red-800 text-red-400 hover:bg-red-900/20"
                            />
                        </div>
                    </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
