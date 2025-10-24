import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shareAPI, contentAPI } from "../api";
import { ContentCard } from "../components/ContentCard";
import { ViewContentModal } from "../components/ViewContentModal";
import { Logo } from "../icons/Logo";
import { SkeletonGrid } from "../components/SkeletonLoader";

interface Content {
  _id: string;
  title: string;
  description?: string;
  type: string;
  link?: string;
  tags?: string[];
}

export function Brain() {
  const { linkHash } = useParams<{ linkHash: string }>();
  const navigate = useNavigate();

  const [contents, setContents] = useState<Content[]>([]);
  const [username, setUsername] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{
    title: string;
    description?: string;
    type: string;
    link?: string;
  } | null>(null);
  const [saveNotification, setSaveNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth?mode=signin");
      return;
    }

    if (!linkHash) {
      setError("Invalid share link");
      setLoading(false);
      return;
    }

    loadSharedContent(linkHash);
  }, [linkHash, navigate]);

  const loadSharedContent = async (hash: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await shareAPI.getShared(hash);
      setUsername(response.username);
      
      // Check if brain is private
      if (response.isPrivate) {
        setIsPrivate(true);
        setContents([]);
      } else {
        setIsPrivate(false);
        setContents(response.content || []);
      }
    } catch (err: any) {
      console.error("Failed to load shared content:", err);
      
      // Check if it's a private brain error (403)
      if (err.response?.status === 403) {
        setIsPrivate(true);
        setUsername(err.response?.data?.username || "");
      } else {
        setError(err.response?.data?.message || "Failed to load shared brain");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    const content = contents.find((c) => c._id === id);
    if (content) {
      setSelectedContent({
        title: content.title,
        description: content.description,
        type: content.type,
        link: content.link,
      });
      setViewModalOpen(true);
    }
  };

  const handleSave = async (id: string) => {
    const content = contents.find((c) => c._id === id);
    if (!content) return;

    try {
      await contentAPI.create({
        title: content.title,
        description: content.description,
        type: content.type,
        link: content.link,
      });
      
      setSaveNotification({
        show: true,
        message: "Content saved to your brain successfully! ✨",
        type: "success",
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setSaveNotification({ show: false, message: "", type: "success" });
      }, 3000);
    } catch (err: any) {
      console.error("Failed to save content:", err);
      setSaveNotification({
        show: true,
        message: err.response?.data?.message || "Failed to save content to your brain",
        type: "error",
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setSaveNotification({ show: false, message: "", type: "success" });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <ViewContentModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={selectedContent?.title || ""}
        description={selectedContent?.description}
        type={selectedContent?.type || ""}
        link={selectedContent?.link}
      />

      {/* Toast Notification */}
      {saveNotification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg border ${
              saveNotification.type === "success"
                ? "bg-green-900/90 border-green-700 text-green-100"
                : "bg-red-900/90 border-red-700 text-red-100"
            } backdrop-blur-sm`}
          >
            <div className="flex items-center gap-3">
              {saveNotification.type === "success" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <p className="font-medium">{saveNotification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo className="w-12" />
              <div>
                <h1 className="text-xl font-bold">
                  {username ? `${username}'s Second Brain` : "Shared Brain"}
                </h1>
                <p className="text-gray-500 text-sm">
                  {contents.length} {contents.length === 1 ? "item" : "items"} shared
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 cursor-pointer bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              My Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Loading State */}
        {loading && (
          <div>
            <div className="mb-6 animate-pulse">
              <div className="h-5 bg-gray-900 rounded w-64"></div>
            </div>
            <SkeletonGrid count={6} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-2 text-red-400">
                  Oops! Something went wrong
                </h2>
                <p className="text-gray-400">{error}</p>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Private Brain State */}
        {!loading && !error && isPrivate && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-6">
                <div className="bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-white">
                  This Brain is Private
                </h2>
                <p className="text-gray-400">
                  {username ? `${username}'s` : "This"} brain is set to private. Only they can view their content.
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 bg-white text-black cursor-pointer rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !isPrivate && contents.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <div className="bg-gray-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">No content shared yet</h2>
              <p className="text-gray-500">
                {username || "This user"} hasn't added any content to their brain.
              </p>
            </div>
          </div>
        )}

        {/* Content Grid */}
        {!loading && !error && !isPrivate && contents.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-lg text-gray-400">
                Explore {username ? `${username}'s` : "this"} collection of knowledge
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {contents.map((content) => (
                <ContentCard
                  key={content._id}
                  id={content._id}
                  title={content.title}
                  description={content.description}
                  link={content.link}
                  type={content.type}
                  onView={handleView}
                  onSave={handleSave}
                  // No delete or share buttons for shared view
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>
              Viewing shared content • Second Brain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}