import React, { useState, useEffect } from 'react';
import './App.css';
import Camera from './components/Camera';
import ImageUploader from './components/ImageUploader';
import ColorAnalysis from './components/ColorAnalysis';
import AnalysisHistory from './components/AnalysisHistory';
import { ColorAnalysisResult } from './services/analysisService';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<'camera' | 'upload' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ColorAnalysisResult | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Handle anonymous authentication
  useEffect(() => {
    setAuthLoading(true);
    setAuthError(null);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setAuthLoading(false);
      } else {
        // If not logged in, sign in anonymously
        signInAnonymously(auth)
          .then(() => {
            // Auth state change will trigger the callback above
            console.log('Signed in anonymously');
          })
          .catch((error) => {
            console.error('Error signing in anonymously:', error);
            setAuthError('Failed to authenticate. Please refresh the page and try again.');
            setAuthLoading(false);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleReset = () => {
    setImageSrc(null);
    setInputMethod(null);
    setSelectedAnalysis(null);
    setCurrentStep(1);
  };

  const handleSelectAnalysis = (analysis: ColorAnalysisResult) => {
    setSelectedAnalysis(analysis);
    setShowHistory(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-700 tracking-wide">
            Connecting to service...
          </p>
          <p className="mt-2 text-gray-500">Setting up your personalized experience</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-600 text-center mb-6">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 font-medium shadow-md"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-gradient-to-r from-violet-50 to-indigo-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text [-webkit-background-clip:text] bg-gradient-to-r from-indigo-600 to-violet-600 [-webkit-text-fill-color:transparent]">Korean Color Analysis</h1>
            <p className="text-base text-gray-600 font-medium leading-relaxed mt-1">Discover your personal color palette based on Korean color theory</p>
          </div>
          {userId && (
            <button
              onClick={() => {
                handleReset();
                setShowHistory(!showHistory);
              }}
              className={`px-6 py-3 rounded-lg transition-all duration-200 focus:ring-4 focus:ring-indigo-100 font-medium flex items-center gap-2 ${
                showHistory 
                  ? "bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 shadow-sm"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-md"
              }`}
            >
              {showHistory ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>New Analysis</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>View History</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {showHistory ? (
          userId ? (
            <AnalysisHistory userId={userId} onSelectAnalysis={handleSelectAnalysis} />
          ) : (
            <div className="flex justify-center py-8">
              <div className="animate-pulse space-y-4 w-full max-w-3xl">
                <div className="h-8 bg-gray-200 rounded-md dark:bg-gray-700 w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex">
                        <div className="w-1/3 bg-gray-200 h-32"></div>
                        <div className="w-2/3 p-3 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="flex space-x-1">
                            <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                            <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                            <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : selectedAnalysis ? (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                Saved Analysis
              </h2>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-all duration-200 focus:ring-4 focus:ring-indigo-100 shadow-sm"
              >
                New Analysis
              </button>
            </div>
            <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <div className="w-full sm:w-1/3">
                  <div className="aspect-w-1 aspect-h-1 rounded-xl overflow-hidden shadow-md border border-gray-200">
                    <img
                      src={selectedAnalysis.imageSrc}
                      alt="Analyzed"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-2/3">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">
                    Analysis Results
                  </h2>
                  <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 mr-3 font-medium">Detected skin tone:</span>
                    <div
                      className="w-8 h-8 rounded-full border border-gray-300 shadow-sm"
                      style={{ backgroundColor: selectedAnalysis.skinTone }}
                    ></div>
                    <span className="ml-2 text-gray-600 font-mono text-sm">{selectedAnalysis.skinTone}</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">
                        <span className="font-semibold mr-2">Seasonal color type:</span> 
                        <span className="text-indigo-700 font-medium">{selectedAnalysis.seasonalType}</span>
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">
                        <span className="font-semibold mr-2">Undertone:</span> 
                        <span className="text-indigo-700 font-medium">{selectedAnalysis.undertone}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
                Recommended Color Palette
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
                {selectedAnalysis.recommendedColors.map((color, index) => (
                  <div
                    key={index}
                    className="relative group p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow transition-all duration-200"
                  >
                    <div
                      className="w-full h-16 rounded-lg mb-3 shadow-inner"
                      style={{ backgroundColor: color.hexCode }}
                    ></div>
                    <p className="text-gray-800 font-medium">{color.colorName}</p>
                    <p className="text-gray-500 text-sm font-mono">{color.hexCode}</p>
                    <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/80 rounded-full" title="Copy color code">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
                Colors to Avoid
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {selectedAnalysis.colorsToAvoid.map((color, index) => (
                  <div
                    key={index}
                    className="relative group p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow transition-all duration-200"
                  >
                    <div
                      className="w-full h-16 rounded-lg mb-3 shadow-inner"
                      style={{ backgroundColor: color.hexCode }}
                    ></div>
                    <p className="text-gray-800 font-medium">{color.colorName}</p>
                    <p className="text-gray-500 text-sm font-mono">{color.hexCode}</p>
                    <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/80 rounded-full" title="Copy color code">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : !imageSrc ? (
          <>
            <div className="mb-10 text-center max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 tracking-tight">
                Discover Your Perfect Colors
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Upload a photo or take a picture to discover which colors complement your
                skin tone based on Korean color analysis techniques.
              </p>
            </div>

            {/* Stepper component */}
            <div className="flex items-center justify-center mb-10">
              <div className="flex items-center">
                <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-medium">1</div>
                <span className="ml-2 text-indigo-600 font-medium">Upload</span>
              </div>
              <div className="flex-1 h-0.5 mx-4 bg-indigo-200"></div>
              <div className="flex items-center opacity-50">
                <div className="bg-gray-200 text-gray-500 w-8 h-8 rounded-full flex items-center justify-center font-medium">2</div>
                <span className="ml-2 text-gray-500 font-medium">Analysis</span>
              </div>
              <div className="flex-1 h-0.5 mx-4 bg-gray-200"></div>
              <div className="flex items-center opacity-50">
                <div className="bg-gray-200 text-gray-500 w-8 h-8 rounded-full flex items-center justify-center font-medium">3</div>
                <span className="ml-2 text-gray-500 font-medium">Results</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 justify-center mb-8 max-w-4xl mx-auto">
              <button
                onClick={() => setInputMethod('camera')}
                className={`flex-1 p-6 rounded-xl transition-all duration-300 hover:transform hover:scale-105 ${
                  inputMethod === 'camera'
                    ? 'bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-300 shadow-md'
                    : 'bg-white border-2 border-gray-200 hover:border-indigo-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${
                    inputMethod === 'camera' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Take a Photo</h3>
                  <p className="text-gray-500 text-center">
                    Use your device's camera for instant analysis
                  </p>
                </div>
              </button>

              <button
                onClick={() => setInputMethod('upload')}
                className={`flex-1 p-6 rounded-xl transition-all duration-300 hover:transform hover:scale-105 ${
                  inputMethod === 'upload'
                    ? 'bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-300 shadow-md'
                    : 'bg-white border-2 border-gray-200 hover:border-indigo-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${
                    inputMethod === 'upload' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Upload a Photo</h3>
                  <p className="text-gray-500 text-center">
                    Select a high-quality portrait from your device
                  </p>
                </div>
              </button>
            </div>

            {inputMethod === 'camera' && (
              <div className="mt-8 max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <Camera onCapture={setImageSrc} />
              </div>
            )}

            {inputMethod === 'upload' && (
              <div className="mt-8 max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <ImageUploader onUpload={setImageSrc} />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                Color Analysis Results
              </h2>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-all duration-200 focus:ring-4 focus:ring-indigo-100 shadow-sm"
              >
                New Analysis
              </button>
            </div>
            
            {/* Updated stepper for step 3 */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="ml-2 text-green-600 font-medium">Upload</span>
              </div>
              <div className="flex-1 h-0.5 mx-4 bg-green-200"></div>
              <div className="flex items-center">
                <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="ml-2 text-green-600 font-medium">Analysis</span>
              </div>
              <div className="flex-1 h-0.5 mx-4 bg-indigo-200"></div>
              <div className="flex items-center">
                <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-medium">3</div>
                <span className="ml-2 text-indigo-600 font-medium">Results</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 max-w-6xl mx-auto">
              <ColorAnalysis imageSrc={imageSrc} />
            </div>
          </>
        )}
      </main>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 flex justify-around">
        <button 
          onClick={handleReset}
          className="flex flex-col items-center"
        >
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-xs mt-1 font-medium">New</span>
        </button>
        {userId && (
          <button 
            onClick={() => {
              handleReset();
              setShowHistory(!showHistory);
            }}
            className="flex flex-col items-center"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs mt-1 font-medium">History</span>
          </button>
        )}
      </div>

      <footer className="bg-gradient-to-r from-indigo-50 to-violet-50 border-t border-gray-200 mt-12 pt-8 pb-16 md:pb-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold text-indigo-600 mb-2">Korean Color Analysis</h3>
              <p className="text-gray-600 text-sm">Discover your personal color palette based on Korean color theory</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-500 text-sm">
                © 2023 Korean Color Analysis App — MVP Demo
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
