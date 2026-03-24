import React, { useState, useEffect, useRef } from 'react';
import { Check, AlertTriangle, Edit3, MessageSquare, X } from 'lucide-react';
import { SurveyRecord, CodeBookEntry } from '../types';
import { createFuzzySearch } from '../utils/fuzzySearch';

interface DataCardProps {
  record: SurveyRecord;
  index: number;
  total: number;
  codeBook: CodeBookEntry[];
  onUpdate: (index: number, category: string, code: string) => void;
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
  const [selectedEntry, setSelectedEntry] = useState<CodeBookEntry | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [commentText, setCommentText] = useState(record.Comentaris || '');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const fuse = createFuzzySearch(codeBook);
  const suggestions = searchQuery.trim() 
    ? fuse.search(searchQuery, { limit: 8 }).map(r => r.item)
    : [];

  const isMismatch = !record.IGUAL;
  const currentCategory = record['Categoria definitiva'] || record['Predicted Category'];
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSelectCode = (entry: CodeBookEntry) => {
    setSelectedEntry(entry);
    setSearchQuery(entry.Etiqueta);
  };

  const handleAccept = () => {
    if (selectedEntry) {
      onUpdate(index, selectedEntry.Etiqueta, selectedEntry.Codi);
      setIsEditing(false);
      setSearchQuery('');
      setSelectedEntry(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSearchQuery('');
    setSelectedEntry(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedEntry) {
        handleAccept();
      } else if (suggestions.length > 0) {
        handleSelectCode(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const saveComment = () => {
    onAddComment(index, commentText);
    setShowComment(false);
  };

  // Obtenir els codis més freqüents per als botons ràpids
  const frequentCodes = codeBook.slice(0, 10);

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

      {/* Text literal */}
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
            rounded-lg p-3 border-2 transition
            ${isEditing ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 cursor-pointer'}
            ${!isEditing && isMismatch ? 'bg-amber-50 border-amber-200' : ''}
            ${!isEditing && !isMismatch && record['Categoria definitiva'] ? 'bg-green-50 border-green-200' : ''}
          `}
          onClick={() => !isEditing && setIsEditing(true)}
        >
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-600 font-medium">Categoria definitiva</label>
            {!isEditing && <Edit3 className="w-3 h-3 text-gray-400" />}
          </div>
          
          {isEditing ? (
            <div className="space-y-3">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedEntry(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Cercar categoria..."
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {suggestions.length > 0 && !selectedEntry && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectCode(suggestion)}
                        className={`
                          w-full text-left px-4 py-3 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-0 transition
                          ${selectedEntry?.Codi === suggestion.Codi ? 'bg-blue-100' : ''}
                        `}
                      >
                        <div className="font-medium text-gray-900">{suggestion.Etiqueta}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Codi: {suggestion.Codi}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview de selecció */}
              {selectedEntry && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                  <div className="text-xs text-green-700 font-medium mb-1">Seleccionat:</div>
                  <div className="font-medium text-green-900">{selectedEntry.Etiqueta}</div>
                  <div className="text-sm text-green-700">Codi: {selectedEntry.Codi}</div>
                </div>
              )}

              {/* Botons d'acció */}
              <div className="flex space-x-2">
                <button
                  onClick={handleAccept}
                  disabled={!selectedEntry}
                  className={`
                    flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition
                    ${selectedEntry 
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                  `}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Acceptar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel·lar
                </button>
              </div>
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
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">Correcció ràpida:</span>
            <span className="text-xs text-gray-400">Clica per assignar directament</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {frequentCodes.map((code) => (
              <button
                key={code.Codi}
                onClick={() => onUpdate(index, code.Etiqueta, code.Codi)}
                className={`
                  text-xs px-3 py-1.5 rounded-lg border transition font-medium
                  ${record.CODI === code.Codi 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'}
                `}
                title={`${code.Etiqueta} (${code.Codi})`}
              >
                {code.Codi}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
