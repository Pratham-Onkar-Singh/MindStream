import { useEffect, useState, useCallback, useMemo } from "react"
import { Button } from "../components/Button"
import { ContentCard } from "../components/ContentCard"
import { CreateContentModal } from "../components/CreateContentModal"
import { CreateCollectionModal } from "../components/CreateCollectionModal"
import { DeleteCollectionModal } from "../components/DeleteCollectionModal"
import { ViewContentModal } from "../components/ViewContentModal"
import { SearchBar } from "../components/SearchBar"
import type { SearchFilters } from "../components/SearchBar"
import { PlusIcon } from "../icons/PlusIcon"
import { ShareIcon } from "../icons/ShareIcon"
import { Sidebar } from "../components/Sidebar"
import { useContent } from "../hooks/useContent"
import { contentAPI, shareAPI, searchAPI, collectionAPI } from "../api"
import { useLocation } from 'react-router-dom';
import type { CollectionSummary } from "../types/collection"
import { buildCollectionTree } from "../utils/collectionTree"
import { SkeletonGrid, SkeletonCollectionGrid } from "../components/SkeletonLoader"

export function Dashboard() {
  const location = useLocation();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createCollectionModalOpen, setCreateCollectionModalOpen] = useState(false);
  const [deleteCollectionModalOpen, setDeleteCollectionModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);
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
  const [collections, setCollections] = useState<CollectionSummary[]>([]);

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
    loadCollections();
  }, []);

  // Load collections for building descendant map
  const loadCollections = async () => {
    try {
      const response = await collectionAPI.getAll();
      const fetchedCollections = (response.collections || []).map((c: any) => ({
        ...c,
        parentCollection: c.parentCollection || null
      }));
      setCollections(fetchedCollections);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  // Build collection tree for displaying nested collections
  const collectionTree = useMemo(() => buildCollectionTree(collections), [collections]);
  
  // Get selected collection details and its children
  const selectedCollection = useMemo(() => {
    if (!selectedCollectionId) return null;
    return collections.find(c => c._id === selectedCollectionId);
  }, [selectedCollectionId, collections]);

  const childCollections = useMemo(() => {
    if (!selectedCollectionId) return [];
    
    // Find children from the tree
    const findNodeChildren = (nodes: any[]): any[] => {
      for (const node of nodes) {
        if (node._id === selectedCollectionId) {
          return node.children || [];
        }
        if (node.children && node.children.length > 0) {
          const found = findNodeChildren(node.children);
          if (found.length > 0) return found;
        }
      }
      return [];
    };
    
    return findNodeChildren(collectionTree);
  }, [selectedCollectionId, collectionTree]);

  // Build breadcrumb path for selected collection
  const collectionBreadcrumb = useMemo(() => {
    if (!selectedCollectionId) return [];
    
    const path: CollectionSummary[] = [];
    const collectionMap = new Map(collections.map(c => [c._id, c]));
    
    let currentId: string | null = selectedCollectionId;
    while (currentId) {
      const collection = collectionMap.get(currentId);
      if (collection) {
        path.unshift(collection);
        currentId = collection.parentCollection || null;
      } else {
        break;
      }
    }
    
    return path;
  }, [selectedCollectionId, collections]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await contentAPI.delete(id);
        refresh();
        // Refresh collection counts
        if ((window as any).refreshCollections) {
          (window as any).refreshCollections();
        }
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

  // Delete collection handler
  const handleDeleteCollection = useCallback((collectionId: string) => {
    setCollectionToDelete(collectionId);
    setDeleteCollectionModalOpen(true);
  }, []);

  // Get info about collection to delete
  const collectionToDeleteInfo = useMemo(() => {
    if (!collectionToDelete) return null;
    
    const collection = collections.find(c => c._id === collectionToDelete);
    if (!collection) return null;
    
    // Check if it has children
    const hasChildren = collections.some(c => c.parentCollection === collectionToDelete);
    
    return {
      collection,
      hasChildren,
      hasContent: (collection.contentCount || 0) > 0
    };
  }, [collectionToDelete, collections]);

  const handleConfirmDelete = useCallback(async (deleteAll: boolean) => {
    if (!collectionToDelete) return;
    
    try {
      await collectionAPI.delete(collectionToDelete, deleteAll);
      
      // If we deleted the currently selected collection, clear the selection
      if (collectionToDelete === selectedCollectionId) {
        setSelectedCollectionId(null);
      }
      
      // Refresh collections and content
      loadCollections();
      refresh();
      
      // Refresh the sidebar
      if ((window as any).refreshCollections) {
        (window as any).refreshCollections();
      }
      
      setDeleteCollectionModalOpen(false);
      setCollectionToDelete(null);
    } catch (error) {
      console.error('Delete collection error:', error);
      alert('Failed to delete collection');
    }
  }, [collectionToDelete, selectedCollectionId, refresh]);

  // Determine which content to display
  let displayedContents = isSearching ? searchResults : contents;
  
  // Apply collection filter (only direct content, not from nested collections)
  if (!isSearching && selectedCollectionId) {
    displayedContents = contents.filter(content => {
      const contentCollection = content.collection?.toString();
      return contentCollection === selectedCollectionId;
    });
  }
  
  // Apply sidebar filter if not searching
  if (!isSearching && sidebarFilter !== 'all') {
    displayedContents = displayedContents.filter(content => content.type === sidebarFilter);
  }
  
  return (
    <>
      <div className="flex h-screen bg-gradient-mindstream bg-grid-pattern bg-radial-overlay">
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
            onDeleteCollection={handleDeleteCollection}
          />
        </div>
        <CreateContentModal 
          open={createModalOpen} 
          onClose={() => {setCreateModalOpen(false);}} 
          onSubmit={() => {
            setCreateModalOpen(false); 
            refresh();
            // Refresh collection counts
            if ((window as any).refreshCollections) {
              (window as any).refreshCollections();
            }
          }}
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
        <DeleteCollectionModal
          open={deleteCollectionModalOpen}
          onClose={() => {
            setDeleteCollectionModalOpen(false);
            setCollectionToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          collection={collectionToDeleteInfo?.collection || null}
          hasChildren={collectionToDeleteInfo?.hasChildren || false}
          hasContent={collectionToDeleteInfo?.hasContent || false}
        />
        <CreateContentModal 
          open={editModalOpen} 
          onClose={() => {setEditModalOpen(false); setSelectedContent(undefined);}} 
          onSubmit={() => {
            setEditModalOpen(false); 
            setSelectedContent(undefined); 
            refresh();
            // Refresh collection counts
            if ((window as any).refreshCollections) {
              (window as any).refreshCollections();
            }
          }}
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
        <div className="flex flex-col gap-6 md:gap-10 p-4 md:p-10 flex-1 h-screen overflow-y-auto ml-16 md:ml-64">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-4 border-b border-gray-800">
            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-bold text-white">My Second Brain</h1>
              <p className="text-gray-500 text-sm mt-1">
                {isSearching 
                  ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} found`
                  : `${contents.length} ${contents.length === 1 ? 'item' : 'items'} saved`
                }
              </p>
            </div>
            <div className="gap-2 md:gap-4 flex justify-evenly">
              <div onClick={() => handleBrainShare()}>
                <Button variant="secondary" size="sm" text="Share Brain" startIcon={<ShareIcon size="size-4"/>}/>
              </div>
              <div className="">
                <Button variant="primary" size="sm" text="Add Content" startIcon={<PlusIcon size="md"/>} onClick={() => {setCreateModalOpen(true)}}/>
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

          {/* Breadcrumb Navigation */}
          {!isSearching && collectionBreadcrumb.length > 0 && (
            <div className="flex items-center gap-2 text-sm overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent min-h-[2.5rem]">
              <button
                onClick={() => setSelectedCollectionId(null)}
                className="text-gray-500 hover:text-white transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="whitespace-nowrap hidden sm:inline">All Collections</span>
                <span className="whitespace-nowrap sm:hidden">All</span>
              </button>
              {collectionBreadcrumb.map((collection, index) => (
                <div key={collection._id} className="flex items-center gap-2 flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <button
                    onClick={() => setSelectedCollectionId(collection._id)}
                    className={`flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                      index === collectionBreadcrumb.length - 1
                        ? 'text-white font-medium'
                        : 'text-gray-500 hover:text-white'
                    }`}
                    title={collection.name}
                  >
                    <span className="flex-shrink-0">{collection.icon}</span>
                    <span className="inline-block max-w-[120px] sm:max-w-[150px] md:max-w-[200px] truncate align-middle">{collection.name}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Loading State */}
          {(loading || searchLoading) && (
            <div className="space-y-8">
              {/* Skeleton for subcollections */}
              {!isSearching && selectedCollectionId && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-gray-900 rounded w-48 animate-pulse"></div>
                    <div className="h-4 bg-gray-900 rounded w-24 animate-pulse"></div>
                  </div>
                  <SkeletonCollectionGrid count={4} />
                </div>
              )}
              
              {/* Skeleton for content cards */}
              <div>
                <div className="h-4 bg-gray-900 rounded w-32 mb-6 animate-pulse"></div>
                <SkeletonGrid count={8} />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Child Collections Section - Show when a collection is selected */}
          {!loading && !isSearching && selectedCollectionId && childCollections.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Subcollections in {selectedCollection?.name}
                </h2>
                <span className="text-sm text-gray-500">
                  {childCollections.length} {childCollections.length === 1 ? 'subcollection' : 'subcollections'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {childCollections.map((child: any) => (
                  <button
                    key={child._id}
                    onClick={() => setSelectedCollectionId(child._id)}
                    className="group relative bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-all text-left cursor-pointer"
                    style={{
                      borderLeft: `4px solid ${child.color}`
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-3xl">{child.icon}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0010.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {child.contentCount}
                      </div>
                    </div>
                    <h3 className="font-semibold text-white mb-1 group-hover:text-gray-100">
                      {child.name}
                    </h3>
                    {child.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {child.description}
                      </p>
                    )}
                    {child.children && child.children.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        {child.children.length} nested
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content Header - Show when displaying content */}
          {!loading && !searchLoading && !error && displayedContents.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0010.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {selectedCollectionId ? `Content in ${selectedCollection?.name}` : 'All Content'}
              </h2>
              <span className="text-sm text-gray-500">
                {displayedContents.length} {displayedContents.length === 1 ? 'item' : 'items'}
              </span>
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
                    : selectedCollectionId
                      ? 'Start building collection by adding a piece of content'
                      : 'Start building your second brain by adding your first piece of content'
                  }
                </p>
                {!isSearching && (
                  <Button
                    variant="primary"
                    size="md"
                    text={selectedCollectionId ? "Add Content" : "Add Your First Content"}
                    startIcon={<PlusIcon size="md" />}
                    onClick={() => setCreateModalOpen(true)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Content Grid */}
          {!loading && !searchLoading && !error && displayedContents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
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