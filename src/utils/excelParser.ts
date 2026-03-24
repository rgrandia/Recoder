import * as XLSX from 'xlsx';
import { SurveyRecord, CodeBookEntry, ParsedExcel } from '../types';

export const parseExcelFile = (file: File): Promise<ParsedExcel> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        let dataSheet: { sheetName: string; data: SurveyRecord[] } | null = null;
        let codeBookSheet: { sheetName: string; data: CodeBookEntry[] } | null = null;
        
        // Iterar per totes les pestanyes per detectar-les automàticament
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];
          
          if (jsonData.length === 0) continue;
          
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1).filter(row => row.length > 0);
          
          // Detectar si és el llibre de codis (té "Etiqueta" i "Codi")
          const hasEtiqueta = headers.some(h => 
            String(h).toLowerCase().includes('etiqueta') || 
            String(h).toLowerCase().includes('categoria')
          );
          const hasCodi = headers.some(h => 
            String(h).toLowerCase().includes('codi') || 
            String(h).toLowerCase().includes('code')
          );
          
          if (hasEtiqueta && hasCodi && !codeBookSheet) {
            // És el llibre de codis
            const etiquetaIdx = headers.findIndex(h => 
              String(h).toLowerCase().includes('etiqueta') || 
              String(h).toLowerCase().includes('categoria')
            );
            const codiIdx = headers.findIndex(h => 
              String(h).toLowerCase().includes('codi') || 
              String(h).toLowerCase().includes('code')
            );
            
            const entries: CodeBookEntry[] = rows.map(row => ({
              Etiqueta: String(row[etiquetaIdx] || ''),
              Codi: row[codiIdx] || ''
            })).filter(e => e.Etiqueta && e.Codi);
            
            codeBookSheet = { sheetName, data: entries };
          } 
          // Detectar si és la pestanya de dades (té "LITERAL" o "VARIABLE")
          else if ((headers.includes('LITERAL') || headers.includes('VARIABLE')) && !dataSheet) {
            const data: SurveyRecord[] = rows.map(row => {
              const obj: any = {};
              headers.forEach((header, idx) => {
                obj[header] = row[idx];
              });
              
              // Normalitzar IGUAL a boolean
              if (obj['IGUAL'] !== undefined) {
                obj['IGUAL'] = obj['IGUAL'] === true || 
                               obj['IGUAL'] === 'true' || 
                               obj['IGUAL'] === 'TRUE' ||
                               obj['IGUAL'] === 1;
              }
              
              return obj as SurveyRecord;
            });
            
            dataSheet = { sheetName, data };
          }
        }
        
        if (!dataSheet) {
          reject(new Error('No s\'ha trobat la pestanya de dades. Assegura\'t que té una columna "LITERAL" o "VARIABLE"'));
          return;
        }
        
        if (!codeBookSheet) {
          reject(new Error('No s\'ha trobat el llibre de codis. Assegura\'t que té les columnes "Etiqueta" i "Codi"'));
          return;
        }
        
        resolve({
          dataSheet,
          codeBookSheet
        });
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Error llegint l\'arxiu'));
    reader.readAsBinaryString(file);
  });
};

export const exportToExcel = (
  data: SurveyRecord[], 
  originalSheetName: string,
  codeBook: CodeBookEntry[],
  codeBookSheetName: string
): void => {
  const wb = XLSX.utils.book_new();
  
  // Fulla de dades corregides
  const wsData = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, wsData, originalSheetName);
  
  // Fulla de codis (per referència)
  const wsCodes = XLSX.utils.json_to_sheet(codeBook);
  XLSX.utils.book_append_sheet(wb, wsCodes, codeBookSheetName);
  
  // Descarregar
  XLSX.writeFile(wb, `codificacio_corregida_${new Date().toISOString().split('T')[0]}.xlsx`);
};
