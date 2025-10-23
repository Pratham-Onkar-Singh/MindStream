import { useEffect, useState, useCallback } from "react"
import { Button } from "../components/Button"
import { ContentCard } from "../components/ContentCard"
import { CreateContentModal } from "../components/CreateContentModal"
import { CreateCollectionModal } from "../components/CreateCollectionModal"
import { ViewContentModal } from "../components/ViewContentModal"
import { SearchBar } from "../components/SearchBar"
import type { SearchFilters } from "../components/SearchBar"
import { PlusIcon } from "../icons/PlusIcon"
import { ShareIcon } from "../icons/ShareIcon"
import { Sidebar } from "../components/Sidebar"
import { useContent } from "../hooks/useContent"
import { contentAPI, shareAPI, searchAPI } from "../api"
import { useLocation } from 'react-router-dom';

export function Dashboard() {
  const location = useLocation();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createCollectionModalOpen, setCreateCollectionModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{
    id?: string;
    title?: string;
    description?: string;
    type?: string;
    link?: string;
    collection?: string;
  } | undefined>(undefined);

  // Collection state
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    type: 'all',
    sortBy: 'relevance'
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Sidebar filter state
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'link' | 'file'>('all');
  
  // Check if filter or collectionId was passed via navigation state
  useEffect(() => {
    if (location.state?.filter) {
      setSidebarFilter(location.state.filter);
      // Clear the state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
    if (location.state?.collectionId) {
      setSelectedCollectionId(location.state.collectionId);
      setSidebarFilter('all'); // Reset type filter when selecting collection
      setIsSearching(false); // Exit search mode
      // Clear the state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  const { contents, loading, error, refresh } = useContent();
  
  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await contentAPI.delete(id);
        refresh();
      } catch (err) {
        alert('Failed to delete content');
      }
    }
  };

  const handleBrainShare = async () => {
    try {
      const response = await shareAPI.getBrainLink();
      const linkHash = response.hash;
      const shareLink = `${window.location.origin}/brain/${linkHash}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareLink);
      
      // Success feedback
      alert(`Share link copied to clipboard!\n${shareLink}`);
    } catch (error) {
      console.error('Share error:', error);
      alert('Unable to share Brain!');
    }
  }

  const handleView = (id: string) => {
    const content = contents.find(c => c._id === id);
    if (content) {
      setSelectedContent({
        title: content.title,
        description: content.description,
        type: content.type,
        link: content.link
      });
      setViewModalOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    const content = contents.find(c => c._id === id);
    if (content) {
      setSelectedContent({
        id: content._id,
        title: content.title,
        description: content.description,
        type: content.type,
        link: content.link,
        collection: content.collection
      });
      setEditModalOpen(true);
    }
  };

  // Search handler - memoized to prevent infinite loops
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchLoading(false);
      return;
    }

    setIsSearching(true);
    setSearchLoading(true);
    
    try {
      const response = await searchAPI.search(query, {
        type: searchFilters.type !== 'all' ? searchFilters.type : undefined,
        sortBy: searchFilters.sortBy,
        collection: selectedCollectionId || undefined // Add collection filter
      });
      setSearchResults(response.contents || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search content');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchFilters, selectedCollectionId]);

  // Filter change handler
  const handleFilterChange = useCallback((filters: SearchFilters) => {
    setSearchFilters(filters);
  }, []);

  // Re-search when filters change
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  }, [searchFilters]);

  // Re-search when selected collection changes (if actively searching)
  useEffect(() => {
    if (searchQuery.trim() && isSearching) {
      handleSearch(searchQuery);
    }
  }, [selectedCollectionId]);

  // Sidebar filter handler
  const handleSidebarFilter = useCallback((filterType: 'all' | 'link' | 'file') => {
    setSidebarFilter(filterType);
    // Clear search when sidebar filter changes
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  }, []);

  // Determine which content to display
  let displayedContents = isSearching ? searchResults : contents;
  
  // Apply collection filter first
  if (!isSearching && selectedCollectionId) {
    displayedContents = contents.filter(content => {
      // Convert both to strings for comparison in case one is ObjectId
      const contentCollection = content.collection?.toString();
      const selectedCollection = selectedCollectionId?.toString();
      return contentCollection === selectedCollection;
    });
  }
  
  // Apply sidebar filter if not searching
  if (!isSearching && sidebarFilter !== 'all') {
    displayedContents = displayedContents.filter(content => content.type === sidebarFilter);
  }
  
  return (
    <>
      <div className="flex">
        <div className="">
          <Sidebar 
            onFilterChange={handleSidebarFilter}
            activeFilter={sidebarFilter}
            onCollectionSelect={(collectionId) => {
              setSelectedCollectionId(collectionId);
              setSidebarFilter('all'); // Reset type filter when selecting collection
              // Don't exit search mode - let the useEffect re-trigger search with new collection
            }}
            selectedCollectionId={selectedCollectionId}
            onCreateCollectionClick={() => setCreateCollectionModalOpen(true)}
          />
        </div>
        <CreateContentModal 
          open={createModalOpen} 
          onClose={() => {setCreateModalOpen(false);}} 
          onSubmit={() => {setCreateModalOpen(false); refresh();}}
          defaultCollectionId={selectedCollectionId}
        />
        <CreateCollectionModal
          open={createCollectionModalOpen}
          onClose={() => setCreateCollectionModalOpen(false)}
          onSuccess={() => {
            // Refresh the collection sidebar
            if ((window as any).refreshCollections) {
              (window as any).refreshCollections();
            }
            refresh();
          }}
        />
        <CreateContentModal 
          open={editModalOpen} 
          onClose={() => {setEditModalOpen(false); setSelectedContent(undefined);}} 
          onSubmit={() => {setEditModalOpen(false); setSelectedContent(undefined); refresh();}}
          editMode={true}
          initialData={selectedContent}
        />
        <ViewContentModal 
          open={viewModalOpen} 
          onClose={() => setViewModalOpen(false)}
          title={selectedContent?.title || ""}
          description={selectedContent?.description}
          type={selectedContent?.type || ""}
          link={selectedContent?.link}
        />
        <div className="flex flex-col gap-10 p-10 min-h-screen w-dvw bg-black ml-64">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-800">
            <div>
              <h1 className="text-2xl font-bold text-white">My Second Brain</h1>
              <p className="text-gray-500 text-sm mt-1">
                {isSearching 
                  ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} found`
                  : `${contents.length} ${contents.length === 1 ? 'item' : 'items'} saved`
                }
              </p>
            </div>
            <div className="gap-4 flex justify-start">
              <div onClick={() => handleBrainShare()}>
                <Button variant="secondary" size="md" text="Share Brain" startIcon={<ShareIcon size="size-4"/>}/>
              </div>
              <div className="">
                <Button variant="primary" size="md" text="Add Content" startIcon={<PlusIcon size="md"/>} onClick={() => {setCreateModalOpen(true)}}/>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full">
            <SearchBar 
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              placeholder="Search your brain..."
              collectionScope={selectedCollectionId}
            />
          </div>

          {/* Loading State */}
          {(loading || searchLoading) && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                {/* Sophisticated multi-ring loader */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  {/* Outer ring */}
                  <div className="absolute inset-0 border-2 border-gray-700 rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-transparent border-t-white border-r-white rounded-full animate-spin"></div>
                  
                  {/* Middle ring */}
                  <div className="absolute inset-2 border-2 border-gray-800 rounded-full"></div>
                  <div className="absolute inset-2 border-2 border-transparent border-t-gray-400 border-r-gray-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                  
                  {/* Inner ring */}
                  <div className="absolute inset-4 border-2 border-gray-700 rounded-full"></div>
                  <div className="absolute inset-4 border-2 border-transparent border-t-white rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
                  
                  {/* Center dot */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-gray-400 font-medium tracking-wide">
                  {searchLoading ? 'Searching your brain...' : 'Loading your content...'}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !searchLoading && !error && displayedContents.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-semibold mb-2">
                  {isSearching ? 'No results found' : 'No content yet'}
                </h2>
                <p className="text-gray-500 mb-6">
                  {isSearching 
                    ? `No content matches "${searchQuery}". Try adjusting your search or filters.`
                    : 'Start building your second brain by adding your first piece of content'
                  }
                </p>
                {!isSearching && (
                  <Button
                    variant="primary"
                    size="md"
                    text="Add Your First Content"
                    startIcon={<PlusIcon size="md" />}
                    onClick={() => setCreateModalOpen(true)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Content Grid */}
          {!loading && !searchLoading && !error && displayedContents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedContents.map((content) => (
                <ContentCard 
                  key={content._id} 
                  id={content._id}
                  title={content.title} 
                  description={content.description}
                  link={content.link} 
                  type={content.type}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onView={handleView}
                />
              ))}
            </div>
          )}

          {/* Old Cards (for comparison - you can remove this section later) */}
          {/* {!loading && !error && contents.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-gray-500">Old Card Design (for comparison)</h2>
              <div className="flex gap-4 flex-wrap">
                {contents.map((content) => (
                  <Card 
                    key={content._id}
                    title={content.title} 
                    type={content.type} 
                    link={content.link || ""}
                  />
                ))}
              </div>
            </div>
          )} */}
        </div>
      </div>
    </>
  )
}