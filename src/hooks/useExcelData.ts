import { useState, useCallback } from 'react';
import { ParsedExcel, SurveyRecord, CodeBookEntry } from '../types';
import { parseExcelFile } from '../utils/excelParser';

export const useExcelData = () => {
  const [parsedData, setParsedData] = useState<ParsedExcel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await parseExcelFile(file);
      setParsedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRecord = useCallback((index: number, updates: Partial<SurveyRecord>) => {
    setParsedData(prev => {
      if (!prev) return null;
      
      const newData = [...prev.dataSheet.data];
      newData[index] = { ...newData[index], ...updates };
      
      return {
        ...prev,
        dataSheet: {
          ...prev.dataSheet,
          data: newData
        }
      };
    });
  }, []);

  const getAllData = useCallback(() => {
    return parsedData?.dataSheet.data || [];
  }, [parsedData]);

  const getCodeBook = useCallback((): CodeBookEntry[] => {
    return parsedData?.codeBookSheet.data || [];
  }, [parsedData]);

  return {
    data: parsedData?.dataSheet.data || [],
    dataSheetName: parsedData?.dataSheet.sheetName || '',
    codeBook: getCodeBook(),
    codeBookSheetName: parsedData?.codeBookSheet.sheetName || '',
    isLoading,
    error,
    loadFile,
    updateRecord,
    getAllData,
    hasData: !!parsedData
  };
};
