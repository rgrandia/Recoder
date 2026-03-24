import React, { useState, useEffect, useRef } from 'react';
import { Check, AlertTriangle, Edit3, MessageSquare } from 'lucide-react';
import { SurveyRecord, CodeBookEntry } from '../types';
import { createFuzzySearch } from '../utils/fuzzySearch';

interface DataCardProps {
  record: SurveyRecord;
  index: number;
  total: number;
  codeBook: CodeBookEntry[];
  onUpdate: (index: number, category: string, code: string | number) => void;
  onAddComment: (index: number, comment: string) => void;
}

export const DataCard: React.FC<DataCardProps> = ({
  record,
  index,
  total,
  codeBook,
  onUpdate,
  onAddComment
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [commentText, setCommentText] = useState(record.Comentaris || '');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const fuse = createFuzzySearch(codeBook);
  const suggestions = searchQuery.trim() 
    ? fuse.search(searchQuery, { limit: 5 }).map(r => r.item)
    : [];

  const isMismatch = !record.IGUAL;
  const currentCategory = record['Categoria definitiva'] || record['Predicted Category'];
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSelectCode = (entry: CodeBookEntry) => {
    onUpdate(index, entry.Etiqueta, entry.Codi);
    setIsEditing(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSelectCode(suggestions[0]);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const saveComment = () => {
    onAddComment(index, commentText);
    setShowComment(false);
  };

  return (
    <div className={`
      bg-white rounded-xl shadow-lg border-2 p-6 mb-4 transition-all
      ${isMismatch ? 'border-amber-400 shadow-amber-100' : 'border-gray-200'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-mono">
            {index + 1} / {total}
          </span>
          <span className="text-sm text-gray-500 font-mono">
            {record.VARIABLE}
          </span>
          {isMismatch && (
            <span className="flex items-center text-amber-600 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Discordància
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowComment(!showComment)}
            className={`p-2 rounded-lg transition ${record.Comentaris ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`}
            title="Afegir comentari"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Text literal - EL ELEMENT PRINCIPAL */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
          Resposta oberta (LITERAL)
        </label>
        <div className="bg-gray-50 rounded-lg p-4 text-lg text-gray-900 leading-relaxed border border-gray-200">
          {record.LITERAL}
        </div>
      </div>

      {/* Predicted vs Current */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <label className="text-xs text-blue-600 font-medium mb-1 block">Predicció automàtica</label>
          <div className="font-medium text-blue-900">
            {record['Predicted Category'] || '-'}
          </div>
          <div className="text-xs text-blue-500 font-mono mt-1">
            Codi: {record.PRED || '-'}
          </div>
        </div>
        
        <div 
          className={`
            rounded-lg p-3 border-2 cursor-pointer transition
            ${isEditing ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
            ${!isEditing && isMismatch ? 'bg-amber-50 border-amber-200' : ''}
          `}
          onClick={() => setIsEditing(true)}
        >
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-600 font-medium">Categoria definitiva</label>
            <Edit3 className="w-3 h-3 text-gray-400" />
          </div>
          
          {isEditing ? (
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cercar categoria..."
                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
              />
              
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectCode(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium text-gray-900">{suggestion.Etiqueta}</div>
                      <div className="text-xs text-gray-500">Codi: {suggestion.Codi}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="font-medium text-gray-900">
                {currentCategory || <span className="text-gray-400 italic">Sense assignar</span>}
              </div>
              <div className="text-xs text-gray-500 font-mono mt-1">
                Codi: {record.CODI || '-'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Comment section */}
      {showComment && (
        <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Afegir comentari sobre aquesta codificació..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex justify-end mt-2 space-x-2">
            <button
              onClick={() => setShowComment(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel·lar
            </button>
            <button
              onClick={saveComment}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <Check className="w-4 h-4 mr-1" />
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Quick actions */}
      {!isEditing && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500 mr-2 py-1">Correcció ràpida:</span>
          {codeBook.slice(0, 8).map((code) => (
            <button
              key={code.Codi}
              onClick={() => handleSelectCode(code)}
              className={`
                text-xs px-2 py-1 rounded border transition
                ${record.CODI === code.Codi 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'}
              `}
              title={`${code.Etiqueta} (${code.Codi})`}
            >
              {code.Codi}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
