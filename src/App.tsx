import React from 'react';
import { useExcelData } from './hooks/useExcelData';
import { FileUploader } from './components/FileUploader';
import { ReviewInterface } from './components/ReviewInterface';
import { exportToExcel } from './utils/excelParser';
import { FileSpreadsheet } from 'lucide-react';

function App() {
  const {
    data,
    dataSheetName,
    codeBook,
    codeBookSheetName,
    isLoading,
    error,
    loadFile,
    updateRecord,
    hasData
  } = useExcelData();

  const handleExport = () => {
    exportToExcel(data, dataSheetName, codeBook, codeBookSheetName);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!hasData ? (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Codificador d'Enquestes
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Eina per a la revisió ràpida de codificació de respostes obertes. 
              Puja un Excel amb les pestanyes <strong>"Dades"</strong> i <strong>"Llibre de Codis"</strong>.
            </p>
          </div>
          
          <FileUploader 
            onFileSelect={loadFile}
            isLoading={isLoading}
            error={error}
          />
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Puja l'Excel</h3>
              <p className="text-sm text-gray-600">
                Arrossega o selecciona l'arxiu amb les dues pestanyes: <strong>"Dades"</strong> i <strong>"Llibre de Codis"</strong>.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-amber-600 font-bold text-lg">✎</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Revisa ràpidament</h3>
              <p className="text-sm text-gray-600">
                Navega amb les fletxes. Corregiu categories amb el cercador o el llibre de codis lateral.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-green-600 font-bold text-lg">⬇</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Exporta</h3>
              <p className="text-sm text-gray-600">
                Descarrega l'Excel amb les correccions aplicades a "Categoria definitiva" i "CODI".
              </p>
            </div>
          </div>
        </div>
      ) : (
        <ReviewInterface
          data={data}
          codeBook={codeBook}
          dataSheetName={dataSheetName}
          codeBookSheetName={codeBookSheetName}
          onUpdateRecord={updateRecord}
          onExport={handleExport}
        />
      )}
    </div>
  );
}

export default App;
