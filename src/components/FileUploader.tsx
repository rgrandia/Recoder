import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelect, 
  isLoading, 
  error 
}) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`
          border-3 border-dashed rounded-xl p-12 text-center transition-all
          ${isLoading ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-300 hover:bg-blue-100 cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleChange}
          className="hidden"
          id="excel-upload"
          disabled={isLoading}
        />
        <label htmlFor="excel-upload" className="cursor-pointer block">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Processant l'arxiu...</p>
            </div>
          ) : (
            <>
              <FileSpreadsheet className="mx-auto h-16 w-16 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Arrossega o selecciona l'arxiu Excel
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                L'arxiu ha de contenir 2 pestanyes:<br/>
                <span className="font-medium text-blue-700">Dades</span> (amb columna LITERAL) i 
                <span className="font-medium text-blue-700"> Llibre de codis</span> (amb Etiqueta + Codi)
              </p>
              <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar arxiu
              </span>
            </>
          )}
        </label>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};
