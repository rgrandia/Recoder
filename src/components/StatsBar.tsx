import React from 'react';
import { CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { SurveyRecord } from '../types';

interface StatsBarProps {
  data: SurveyRecord[];
  currentIndex: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ data, currentIndex }) => {
  const total = data.length;
  const reviewed = data.filter(r => r['Categoria definitiva'] && r['Categoria definitiva'] !== r['Predicted Category']).length;
  const mismatches = data.filter(r => !r.IGUAL).length;
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <BarChart3 className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">
            Progrés: <span className="font-semibold text-gray-900">{currentIndex + 1} / {total}</span>
          </span>
        </div>
        
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          <span className="text-sm text-gray-600">
            Revisades: <span className="font-semibold text-green-600">{reviewed}</span>
          </span>
        </div>
        
        <div className="flex items-center">
          <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
          <span className="text-sm text-gray-600">
            Discordàncies: <span className="font-semibold text-amber-600">{mismatches}</span>
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="w-48 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};
