import { useState } from "react";
import { DeleteIcon } from "../icons/DeleteIcon";

interface ContentCardProps {
  id: string;
  title: string;
  description?: string;
  type: string;
  link?: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onSave?: (id: string) => void;
}

export const ContentCard = ({ id, title, description, type, link, onDelete, onEdit, onView, onSave }: ContentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTypeIcon = () => {
    if (type === 'file') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0010.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  return (
    <div 
      className="bg-black border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all duration-300 group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${type==="file" ? "from-purple-900/50" : "from-blue-900/50"} to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header with type badge and actions */}
        <div className="flex justify-between items-start mb-3">
          <div onClick={() => onView?.(id)} className={`flex items-center gap-2 cursor-pointer ${getTypeColor()}`}>
            {getTypeIcon()}
            <span className="text-xs font-medium uppercase tracking-wider">
              {getTypeLabel()}
            </span>
          </div>
          
          {/* Action buttons - visible on hover, only shown if callbacks provided */}
          {(onEdit || onDelete || onSave) && (
            <div className={`flex gap-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              {onSave && (
                <button 
                  onClick={() => onSave(id)}
                  className="p-1.5 rounded-lg cursor-pointer hover:bg-gray-800 text-gray-500 hover:text-green-400 transition-all"
                  title="Save to My Brain"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
              {onEdit && (
                <button 
                  onClick={() => onEdit(id)}
                  className="p-1.5 rounded-lg cursor-pointer hover:bg-gray-800 text-gray-500 hover:text-yellow-400 transition-all"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => onDelete(id)}
                  className="p-1.5 rounded-lg cursor-pointer hover:bg-gray-800 text-gray-500 hover:text-red-500 transition-all"
                  title="Delete"
                >
                  <DeleteIcon size="size-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 
          onClick={() => onView?.(id)}
          className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-gray-100 cursor-pointer hover:underline"
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p 
            onClick={() => onView?.(id)}
            className="text-gray-400 text-sm line-clamp-3 mb-3 leading-relaxed cursor-pointer hover:text-gray-300"
          >
            {description}
          </p>
        )}

        {/* Footer with link */}
        {link && (
          <div className="pt-3 border-t border-gray-800 mt-auto">
            <a 
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 group/link"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="truncate max-w-[200px]">View original</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
