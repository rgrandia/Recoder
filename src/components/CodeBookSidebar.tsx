import React, { useState, useMemo } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { CodeBookEntry } from '../types';
import { createFuzzySearch } from '../utils/fuzzySearch';

interface CodeBookSidebarProps {
  codeBook: CodeBookEntry[];
  onSelectCode: (entry: CodeBookEntry) => void;
  selectedCode?: string | number;
}

export const CodeBookSidebar: React.FC<CodeBookSidebarProps> = ({ 
  codeBook, 
  onSelectCode,
  selectedCode 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const fuse = useMemo(() => createFuzzySearch(codeBook), [codeBook]);
  
  const filteredCodes = useMemo(() => {
    if (!searchQuery.trim()) return codeBook;
    return fuse.search(searchQuery, { limit: 20 }).map(r => r.item);
  }, [fuse, searchQuery, codeBook]);

  const groupedCodes = useMemo(() => {
    const groups: { [key: string]: CodeBookEntry[] } = {};
    filteredCodes.forEach(code => {
      const prefix = String(code.Codi).substring(0, 1);
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(code);
    });
    return groups;
  }, [filteredCodes]);

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center mb-3">
          <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Llibre de codis</h3>
          <span className="ml-auto text-xs text-gray-500">{codeBook.length} codis</span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cercar categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {Object.entries(groupedCodes).map(([prefix, codes]) => (
          <div key={prefix}>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">
              {prefix}00 - {prefix}99
            </div>
            {codes.map((entry, idx) => (
              <button
                key={`${entry.Codi}-${idx}`}
                onClick={() => onSelectCode(entry)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm transition mb-1
                  ${selectedCode === entry.Codi 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'hover:bg-gray-100 text-gray-700 border border-transparent'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{entry.Etiqueta}</span>
                  <span className="text-xs font-mono text-gray-500 ml-2 flex-shrink-0">
                    {entry.Codi}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ))}
        
        {filteredCodes.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No s'han trobat codis
          </div>
        )}
      </div>
    </div>
  );
};
