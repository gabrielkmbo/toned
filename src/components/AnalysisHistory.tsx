import React, { useEffect, useState } from 'react';
import { ColorAnalysisResult, getUserAnalysisHistory } from '../services/analysisService';

interface AnalysisHistoryProps {
  userId: string;
  onSelectAnalysis: (analysis: ColorAnalysisResult) => void;
}

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ userId, onSelectAnalysis }) => {
  const [analysisHistory, setAnalysisHistory] = useState<ColorAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const history = await getUserAnalysisHistory(userId);
        setAnalysisHistory(history);
      } catch (err) {
        console.error('Error fetching analysis history:', err);
        setError('Failed to load your analysis history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  // Format date from Firestore Timestamp
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">Your Analysis History</h2>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading your analysis history...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start">
          <svg className="w-6 h-6 mr-3 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium mb-1">Error Loading History</h3>
            <p>{error}</p>
          </div>
        </div>
      ) : analysisHistory.length === 0 ? (
        <div className="p-8 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl border border-gray-200 text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Analysis Results Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">You haven't performed any color analysis yet. Your analysis results will appear here once you analyze your first image.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analysisHistory.map((analysis) => (
            <div 
              key={analysis.id} 
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-indigo-200 transform hover:scale-[1.02]"
              onClick={() => onSelectAnalysis(analysis)}
            >
              <div className="flex flex-col sm:flex-row h-full">
                <div className="w-full sm:w-1/3 relative aspect-w-1 aspect-h-1 sm:aspect-none sm:h-full">
                  <img 
                    src={analysis.imageSrc} 
                    alt="Analysis" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-medium">
                    {formatDate(analysis.createdAt)}
                  </div>
                </div>
                <div className="w-full sm:w-2/3 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-shrink-0">
                      <span className="inline-block py-1 px-2 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium">
                        {analysis.seasonalType} • {analysis.undertone}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-3 bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-700 text-sm mr-2 font-medium">Skin tone:</span>
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" 
                      style={{ backgroundColor: analysis.skinTone }}
                    ></div>
                    <span className="ml-2 text-gray-600 text-xs font-mono">{analysis.skinTone}</span>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 font-medium mb-2">Recommended colors:</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.recommendedColors.map((color, index) => (
                        <div 
                          key={index} 
                          className="group relative" 
                        >
                          <div 
                            className="w-7 h-7 rounded-full border border-gray-200 shadow-sm" 
                            style={{ backgroundColor: color.hexCode }}
                          ></div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            {color.colorName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className="mt-4 w-full py-2 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <span>View Details</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalysisHistory; 