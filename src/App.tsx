import React, { useState } from 'react';
import './App.css';
import Camera from './components/Camera';
import ImageUploader from './components/ImageUploader';
import ColorAnalysis from './components/ColorAnalysis';

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<'camera' | 'upload' | null>(null);

  const handleReset = () => {
    setImageSrc(null);
    setInputMethod(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-indigo-600">Korean Color Analysis</h1>
          <p className="text-gray-600">Discover your personal color palette based on Korean color theory</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!imageSrc ? (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Analyze Your Personal Colors
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Upload a photo or take a picture to discover which colors complement your
                skin tone based on Korean color analysis techniques.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 justify-center mb-8">
              <button
                onClick={() => setInputMethod('camera')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  inputMethod === 'camera'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="w-10 h-10 mb-2 text-indigo-500"
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
                  <h3 className="font-medium text-gray-800">Take a Photo</h3>
                  <p className="text-sm text-gray-500">
                    Use your device's camera
                  </p>
                </div>
              </button>

              <button
                onClick={() => setInputMethod('upload')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  inputMethod === 'upload'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="w-10 h-10 mb-2 text-indigo-500"
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
                  <h3 className="font-medium text-gray-800">Upload a Photo</h3>
                  <p className="text-sm text-gray-500">
                    Select from your device
                  </p>
                </div>
              </button>
            </div>

            {inputMethod === 'camera' && (
              <div className="mt-6">
                <Camera onCapture={setImageSrc} />
              </div>
            )}

            {inputMethod === 'upload' && (
              <div className="mt-6">
                <ImageUploader onUpload={setImageSrc} />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Color Analysis Results
              </h2>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
              >
                New Analysis
              </button>
            </div>
            <ColorAnalysis imageSrc={imageSrc} />
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <p className="text-center text-gray-500 text-sm">
            Korean Color Analysis App — MVP Demo
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
