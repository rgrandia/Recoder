import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Filter, Download, Eye, EyeOff } from 'lucide-react';
import { SurveyRecord, CodeBookEntry } from '../types';
import { DataCard } from './DataCard';
import { CodeBookSidebar } from './CodeBookSidebar';
import { StatsBar } from './StatsBar';

interface ReviewInterfaceProps {
  data: SurveyRecord[];
  codeBook: CodeBookEntry[];
  dataSheetName: string;
  codeBookSheetName: string;
  onUpdateRecord: (index: number, updates: Partial<SurveyRecord>) => void;
  onExport: () => void;
}

export const ReviewInterface: React.FC<ReviewInterfaceProps> = ({
  data,
  codeBook,
  dataSheetName,
  codeBookSheetName,
  onUpdateRecord,
  onExport
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOnlyMismatches, setShowOnlyMismatches] = useState(false);
  const [selectedCodeEntry, setSelectedCodeEntry] = useState<CodeBookEntry | null>(null);

  // Filtrar dades si cal
  const filteredIndices = showOnlyMismatches 
    ? data.map((r, i) => !r.IGUAL ? i : -1).filter(i => i !== -1)
    : data.map((_, i) => i);
    
  const effectiveIndex = filteredIndices[currentIndex] || 0;
  const currentRecord = data[effectiveIndex];
  const totalFiltered = filteredIndices.length;

  // Navegació per teclat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // No interferir amb inputs
      }
      
      switch(e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentIndex(totalFiltered - 1);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalFiltered, showOnlyMismatches]);

  const goNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, totalFiltered - 1));
  }, [totalFiltered]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const handleUpdate = (index: number, category: string, code: string | number) => {
    onUpdateRecord(index, {
      'Categoria definitiva': category,
      'CODI': code,
      'IGUAL': category === currentRecord['Predicted Category']
    });
  };

  const handleAddComment = (index: number, comment: string) => {
    onUpdateRecord(index, { Comentaris: comment });
  };

  const handleSelectFromSidebar = (entry: CodeBookEntry) => {
    handleUpdate(effectiveIndex, entry.Etiqueta, entry.Codi);
    setSelectedCodeEntry(entry);
  };

  if (!currentRecord) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No hi ha dades per mostrar</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <StatsBar data={data} currentIndex={effectiveIndex} />
        
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowOnlyMismatches(!showOnlyMismatches)}
              className={`
                flex items-center px-3 py-1.5 rounded-lg text-sm transition
                ${showOnlyMismatches 
                  ? 'bg-amber-100 text-amber-700 border border-amber-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              {showOnlyMismatches ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showOnlyMismatches ? 'Mostrant discordàncies' : 'Mostrar només discordàncies'}
            </button>
            
            <span className="text-sm text-gray-500">
              {showOnlyMismatches ? `Filtrades: ${totalFiltered} de ${data.length}` : `Total: ${data.length}`}
            </span>
          </div>
          
          <button
            onClick={onExport}
            className="flex items-center px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </button>
        </div>

        {/* Card container */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <DataCard
              record={currentRecord}
              index={effectiveIndex}
              total={data.length}
              codeBook={codeBook}
              onUpdate={handleUpdate}
              onAddComment={handleAddComment}
            />
            
            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Anterior (←)
              </button>
              
              <div className="text-sm text-gray-500">
                Navegació amb fletxes del teclat
              </div>
              
              <button
                onClick={goNext}
                disabled={currentIndex >= totalFiltered - 1}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Següent (→)
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar */}
      <CodeBookSidebar 
        codeBook={codeBook}
        onSelectCode={handleSelectFromSidebar}
        selectedCode={currentRecord.CODI}
      />
    </div>
  );
};
