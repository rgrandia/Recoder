import Fuse from 'fuse.js';
import { CodeBookEntry } from '../types';

export const createFuzzySearch = (codeBook: CodeBookEntry[]) => {
  return new Fuse(codeBook, {
    keys: ['Etiqueta'],
    threshold: 0.4,
    includeScore: true,
  });
};

export const searchCodes = (
  fuse: Fuse<CodeBookEntry>, 
  query: string, 
  limit: number = 10
): CodeBookEntry[] => {
  if (!query.trim()) return [];
  const results = fuse.search(query, { limit });
  return results.map(r => r.item);
};
