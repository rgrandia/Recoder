export interface SurveyRecord {
  REGISTRO: string | number;
  VARIABLE: string;
  LITERAL: string;
  'Predicted Category': string;
  PRED: string | number;
  'Categoria definitiva': string;
  CODI: string | number;
  IGUAL: boolean | string;
  Comentaris?: string;
  [key: string]: any; // Altres columnes possibles
}

export interface CodeBookEntry {
  Etiqueta: string;
  Codi: string | number;
}

export interface ReviewState {
  correctedCategory: string;
  correctedCode: string | number;
  isReviewed: boolean;
}

export interface ExcelData {
  sheetName: string;
  data: SurveyRecord[];
}

export interface ParsedExcel {
  dataSheet: ExcelData;
  codeBookSheet: {
    sheetName: string;
    data: CodeBookEntry[];
  };
}
