'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SearchMenuProps {
  onSelectParkingLot: (parkingLot: string, shouldZoom?: boolean) => void;
  parkingLots: string[];
  isZoneInfoMinimized: boolean;
  isFilterOpen: boolean;
  isMenuOpen: boolean;
}

export default function SearchMenu({ 
  onSelectParkingLot, 
  parkingLots,
  isFilterOpen,
  isMenuOpen,
}: SearchMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Create a memoized debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Update the input value immediately for UI responsiveness
    e.target.value = value;
    // Debounce the actual search query update
    debouncedSearch(value);
  };

  const filteredParkingLots = parkingLots
    .filter(lot => lot.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      // Extract numbers from the parking lot names
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      
      // If both have numbers, sort by numbers
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      // If no numbers or only one has numbers, fall back to string comparison
      return a.localeCompare(b);
    });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchQuery) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredParkingLots.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredParkingLots.length) {
          const selectedLot = filteredParkingLots[highlightedIndex];
          onSelectParkingLot(selectedLot, true);
          setIsFocused(false);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsFocused(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery('');
    setHighlightedIndex(-1);
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
      searchInputRef.current.focus();
    }
  };

  // Reset highlighted index when search query changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchQuery]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Calculate the left position based on menu states
  const getLeftPosition = () => {
    // When both parking lot controls and filter are open, move furthest right
    if (isMenuOpen && isFilterOpen) {
      return 'translate-x-[calc(51rem+2.5rem)]';
    }
    
    // When only parking lot controls are open
    if (isMenuOpen) {
      return 'translate-x-[calc(37rem+1.5rem)]';
    }
    
    // When only filter is open - position after filter menu
    if (isFilterOpen) {
      return 'translate-x-[calc(35rem+1.5rem)]';
    }
    
    // Default position (next to zone info)
    return 'translate-x-[calc(20rem+1.5rem)]';
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`fixed left-[50px] top-0 z-25 transition-all duration-300 ease-in-out ${getLeftPosition()}`}>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-4 ml-4 w-64 min-h-0 max-h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex items-center p-2 bg-gray-100 h-12 rounded-t-lg flex-shrink-0">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search parking lots..."
              onChange={handleSearchChange}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              className="w-full p-1 pl-8 pr-8 bg-transparent border-none focus:outline-none text-sm"
            />
            <svg
              className="w-4 h-4 absolute left-0 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={handleClear}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        {searchQuery && (
          <div className="overflow-y-auto max-h-[calc(100vh-6rem)]">
            <div className="p-2">
              <div className="space-y-1" ref={listRef}>
                {filteredParkingLots.map((lot, index) => (
                  <button
                    key={lot}
                    onClick={() => {
                      onSelectParkingLot(lot, true);
                      setIsFocused(false);
                      setHighlightedIndex(-1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                      index === highlightedIndex 
                        ? 'bg-blue-100 hover:bg-blue-200' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {lot}
                  </button>
                ))}
                {filteredParkingLots.length === 0 && (
                  <div className="text-center text-gray-500 py-4 text-sm">
                    No parking lots found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 