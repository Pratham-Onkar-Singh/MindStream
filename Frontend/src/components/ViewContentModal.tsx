import { CloseIcon } from "../icons/CloseIcon";

interface ViewContentModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type: string;
  link?: string;
}

export const ViewContentModal = ({ open, onClose, title, description, type, link }: ViewContentModalProps) => {
  // Ensure URL has proper protocol
  const getValidUrl = (url: string | undefined) => {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const getTypeIcon = () => {
    if (type === 'file') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0010.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    );
  };

  const getTypeColor = () => {
    return type === 'file' ? 'text-purple-400' : 'text-blue-400';
  };

  const getTypeLabel = () => {
    return type === 'file' ? 'FILE' : 'LINK';
  };

  if (!open) return null;

  return (
    <div className="w-full h-screen fixed top-0 left-0 bg-black/40 flex justify-center items-center backdrop-blur-sm z-50" onClick={onClose}>
      <div className="flex flex-col z-50" onClick={(e) => e.stopPropagation()}>
        <div className="bg-black p-8 rounded-2xl border border-gray-800 min-w-[600px] max-w-[800px] max-h-[80vh] overflow-y-auto relative z-50">
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <button 
              onClick={onClose} 
              className="cursor-pointer text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Type Badge */}
          <div className={`flex items-center gap-2 mb-4 ${getTypeColor()}`}>
            {getTypeIcon()}
            <span className="text-sm font-medium uppercase tracking-wider">
              {getTypeLabel()}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-6 leading-relaxed">
            {title}
          </h2>

          {/* Description */}
          {description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Description
              </h3>
              <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          )}

          {/* File Preview - Show actual content for uploaded files */}
          {type === 'file' && link && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Preview
              </h3>
              {(() => {
                const fileExtension = link.split('.').pop()?.toLowerCase();
                
                // Image files
                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension || '')) {
                  return (
                    <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
                      <img 
                        src={link} 
                        alt={title}
                        className="w-full h-auto max-h-[500px] object-contain"
                      />
                    </div>
                  );
                }
                
                // PDF files
                if (fileExtension === 'pdf') {
                  return (
                    <div className="rounded-lg overflow-hidden border border-gray-700 bg-white">
                      <iframe 
                        src={link}
                        className="w-full h-[600px]"
                        title={title}
                      />
                    </div>
                  );
                }
                
                // Video files
                if (['mp4', 'webm', 'ogg'].includes(fileExtension || '')) {
                  return (
                    <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
                      <video 
                        controls 
                        className="w-full h-auto max-h-[500px]"
                        src={link}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  );
                }
                
                // Audio files
                if (['mp3', 'wav', 'ogg', 'm4a'].includes(fileExtension || '')) {
                  return (
                    <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                      <audio 
                        controls 
                        className="w-full"
                        src={link}
                      >
                        Your browser does not support the audio tag.
                      </audio>
                    </div>
                  );
                }
                
                // Default fallback for other file types
                return (
                  <div className="rounded-lg border border-gray-700 bg-gray-900 p-6 text-center">
                    <div className="text-4xl mb-3">📄</div>
                    <p className="text-gray-400 text-sm">
                      Preview not available for this file type
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Link - Show for both file and link types */}
          {link && (
            <div className="pt-6 border-t border-gray-800">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {type === 'file' ? 'Direct Link' : 'Source Link'}
              </h3>
              <a 
                href={getValidUrl(link)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 group break-all"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="group-hover:underline">{link}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
