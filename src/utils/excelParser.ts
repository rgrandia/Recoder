import * as XLSX from 'xlsx';
import { SurveyRecord, CodeBookEntry, ParsedExcel } from '../types';

const DATA_SHEET_NAME = 'Dades';
const CODEBOOK_SHEET_NAME = 'Llibre de Codis';

export const parseExcelFile = (file: File): Promise<ParsedExcel> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Buscar les pestanyes específiques per nom
        const sheetNames = workbook.SheetNames;
        
        // Verificar que existeixen les dues pestanyes requerides
        if (!sheetNames.includes(DATA_SHEET_NAME)) {
          reject(new Error(`No s'ha trobat la pestanya "${DATA_SHEET_NAME}". Assegura't que l'arxiu té una pestanya amb aquest nom exacte (amb majúscula i accent).`));
          return;
        }
        
        if (!sheetNames.includes(CODEBOOK_SHEET_NAME)) {
          reject(new Error(`No s'ha trobat la pestanya "${CODEBOOK_SHEET_NAME}". Assegura't que l'arxiu té una pestanya amb aquest nom exacte (amb majúscules i accent).`));
          return;
        }
        
        // Processar pestanya de dades
        const dataWorksheet = workbook.Sheets[DATA_SHEET_NAME];
        const dataJson = XLSX.utils.sheet_to_json(dataWorksheet, { header: 1 }) as any[];
        
        if (dataJson.length === 0) {
          reject(new Error(`La pestanya "${DATA_SHEET_NAME}" està buida`));
          return;
        }
        
        const dataHeaders = dataJson[0] as string[];
        const dataRows = dataJson.slice(1).filter(row => row.length > 0);
        
        // Verificar que té la columna LITERAL
        if (!dataHeaders.includes('LITERAL')) {
          reject(new Error(`La pestanya "${DATA_SHEET_NAME}" no té la columna "LITERAL" obligatòria`));
          return;
        }
        
        const surveyData: SurveyRecord[] = dataRows.map(row => {
          const obj: any = {};
          dataHeaders.forEach((header, idx) => {
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
        
        // Processar pestanya de llibre de codis
        const codeWorksheet = workbook.Sheets[CODEBOOK_SHEET_NAME];
        const codeJson = XLSX.utils.sheet_to_json(codeWorksheet, { header: 1 }) as any[];
        
        if (codeJson.length === 0) {
          reject(new Error(`La pestanya "${CODEBOOK_SHEET_NAME}" està buida`));
          return;
        }
        
        const codeHeaders = codeJson[0] as string[];
        const codeRows = codeJson.slice(1).filter(row => row.length > 0);
        
        // Buscar columnes Etiqueta i Codi (flexible amb majúscules/minúscules)
        const etiquetaHeader = codeHeaders.find(h => 
          String(h).toLowerCase() === 'etiqueta'
        );
        const codiHeader = codeHeaders.find(h => 
          String(h).toLowerCase() === 'codi'
        );
        
        if (!etiquetaHeader || !codiHeader) {
          reject(new Error(`La pestanya "${CODEBOOK_SHEET_NAME}" ha de tenir les columnes "Etiqueta" i "Codi"`));
          return;
        }
        
        const etiquetaIdx = codeHeaders.indexOf(etiquetaHeader);
        const codiIdx = codeHeaders.indexOf(codiHeader);
        
        const codeBookData: CodeBookEntry[] = codeRows.map(row => ({
          Etiqueta: String(row[etiquetaIdx] || ''),
          Codi: String(row[codiIdx] || '')
        })).filter(e => e.Etiqueta && e.Codi);
        
        if (codeBookData.length === 0) {
          reject(new Error(`No s'han trobat codis vàlids a la pestanya "${CODEBOOK_SHEET_NAME}"`));
          return;
        }
        
        resolve({
          dataSheet: {
            sheetName: DATA_SHEET_NAME,
            data: surveyData
          },
          codeBookSheet: {
            sheetName: CODEBOOK_SHEET_NAME,
            data: codeBookData
          }
        });
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Error llegint l\'arxiu'));
    reader.readAsArrayBuffer(file);
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
