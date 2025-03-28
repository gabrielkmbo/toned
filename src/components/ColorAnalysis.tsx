import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { saveAnalysisResult } from '../services/analysisService';
import { auth } from '../firebase';

interface ColorAnalysisProps {
  imageSrc: string;
}

interface ColorResult {
  colorName: string;
  hexCode: string;
  suitable: boolean;
}

interface FaceDetection {
  topLeft: [number, number];
  bottomRight: [number, number];
  landmarks: Array<[number, number]>;
  probability: number;
}

const ColorAnalysis: React.FC<ColorAnalysisProps> = ({ imageSrc }) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [facesDetected, setFacesDetected] = useState(0);
  const [skinTone, setSkinTone] = useState<string | null>(null);
  const [colorPalette, setColorPalette] = useState<ColorResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [faceDetection, setFaceDetection] = useState<FaceDetection | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    const analyzeImage = async () => {
      try {
        setAnalyzing(true);
        setError(null);

        // Ensure TensorFlow is ready
        await tf.ready();
        
        // Load the BlazeFace model (more lightweight than face-landmarks-detection)
        const model = await blazeface.load();

        // Load image into a HTMLImageElement
        const img = new Image();
        img.src = imageSrc;
        await new Promise((resolve) => (img.onload = resolve));

        // Create a canvas to analyze the image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        ctx.drawImage(img, 0, 0);
        
        // Convert image to tensor for face detection
        const imgTensor = tf.browser.fromPixels(img);
        
        // Detect faces
        const predictions = await model.estimateFaces(imgTensor, false);
        
        // Clean up tensor to prevent memory leaks
        imgTensor.dispose();
        
        if (predictions.length === 0) {
          setError('No faces detected in the image. Please try another photo.');
          setAnalyzing(false);
          return;
        }

        setFacesDetected(predictions.length);
        
        // Use the first detected face
        const firstFace = predictions[0] as FaceDetection;
        setFaceDetection(firstFace);
        
        // Extract skin tone from cheek area (simplified)
        // In a real app, we would use multiple sampling points and more sophisticated methods
        const faceWidth = firstFace.bottomRight[0] - firstFace.topLeft[0];
        const faceHeight = firstFace.bottomRight[1] - firstFace.topLeft[1];
        
        // Calculate cheek position (roughly 30% from the center horizontally, 30% down from the top)
        const cheekX = Math.floor(firstFace.topLeft[0] + faceWidth * 0.7);
        const cheekY = Math.floor(firstFace.topLeft[1] + faceHeight * 0.3);
        
        // Sample pixels from the cheek area
        const pixelData = ctx.getImageData(cheekX, cheekY, 1, 1).data;
        const skinToneHex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
        setSkinTone(skinToneHex);

        // Generate color palette based on the skin tone
        const generatedPalette = generateSamplePalette(skinToneHex);
        setColorPalette(generatedPalette);

        setAnalyzing(false);
      } catch (err) {
        console.error('Analysis error:', err);
        setError('An error occurred during analysis. Please try again.');
        setAnalyzing(false);
      }
    };

    if (imageSrc) {
      analyzeImage();
    }
  }, [imageSrc]);

  // Helper function to convert RGB to HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  // Simplified palette generation for the MVP
  // In a real app, this would implement Korean color theory
  const generateSamplePalette = (skinTone: string): ColorResult[] => {
    // Extract RGB values from the skin tone
    const r = parseInt(skinTone.slice(1, 3), 16);
    const g = parseInt(skinTone.slice(3, 5), 16);
    const b = parseInt(skinTone.slice(5, 7), 16);

    // Calculate color values for analysis
    const brightness = (r + g + b) / 3; // 0-255
    const warmth = r - b; // Positive = warm, Negative = cool
    
    // More sophisticated analysis using Korean color theory principles
    // This is a simplified implementation
    const isWarm = warmth > 15;
    const isLight = brightness > 150;
    
    // Korean color system often classifies into seasonal types:
    // Spring (Warm & Light), Summer (Cool & Light), 
    // Autumn (Warm & Deep), Winter (Cool & Deep)
    
    let season = '';
    if (isWarm && isLight) season = 'Spring';
    else if (!isWarm && isLight) season = 'Summer';
    else if (isWarm && !isLight) season = 'Autumn';
    else season = 'Winter';

    // Generate palette based on seasonal type
    switch (season) {
      case 'Spring':
        return [
          { colorName: 'Peach', hexCode: '#FFCBA4', suitable: true },
          { colorName: 'Coral', hexCode: '#FF7F50', suitable: true },
          { colorName: 'Warm Yellow', hexCode: '#FFD700', suitable: true },
          { colorName: 'Apple Green', hexCode: '#8DB600', suitable: true },
          { colorName: 'Navy Blue', hexCode: '#000080', suitable: false },
          { colorName: 'Burgundy', hexCode: '#800020', suitable: false },
        ];
      case 'Summer':
        return [
          { colorName: 'Lavender', hexCode: '#E6E6FA', suitable: true },
          { colorName: 'Powder Blue', hexCode: '#B0E0E6', suitable: true },
          { colorName: 'Soft Pink', hexCode: '#FFB6C1', suitable: true },
          { colorName: 'Periwinkle', hexCode: '#CCCCFF', suitable: true },
          { colorName: 'Bright Orange', hexCode: '#FF4500', suitable: false },
          { colorName: 'Olive Green', hexCode: '#808000', suitable: false },
        ];
      case 'Autumn':
        return [
          { colorName: 'Rust', hexCode: '#B7410E', suitable: true },
          { colorName: 'Olive Green', hexCode: '#808000', suitable: true },
          { colorName: 'Warm Brown', hexCode: '#8B4513', suitable: true },
          { colorName: 'Mustard', hexCode: '#FFDB58', suitable: true },
          { colorName: 'Icy Blue', hexCode: '#A5F2F3', suitable: false },
          { colorName: 'Hot Pink', hexCode: '#FF69B4', suitable: false },
        ];
      case 'Winter':
        return [
          { colorName: 'Royal Blue', hexCode: '#4169E1', suitable: true },
          { colorName: 'Emerald Green', hexCode: '#50C878', suitable: true },
          { colorName: 'Ruby Red', hexCode: '#E0115F', suitable: true },
          { colorName: 'Pure White', hexCode: '#FFFFFF', suitable: true },
          { colorName: 'Salmon Pink', hexCode: '#FA8072', suitable: false },
          { colorName: 'Camel', hexCode: '#C19A6B', suitable: false },
        ];
      default:
        // Fallback palette
        return [
          { colorName: 'Coral Red', hexCode: '#FF6B6B', suitable: true },
          { colorName: 'Peach', hexCode: '#FFB347', suitable: true },
          { colorName: 'Warm Gold', hexCode: '#FFD700', suitable: true },
          { colorName: 'Olive Green', hexCode: '#808000', suitable: true },
          { colorName: 'Bright Blue', hexCode: '#007BFF', suitable: false },
          { colorName: 'Cool Purple', hexCode: '#9370DB', suitable: false },
        ];
    }
  };

  // Save results to Firebase
  const saveResults = async () => {
    if (!skinTone || colorPalette.length === 0) return;
    
    try {
      setSaveStatus('saving');
      
      // Get current user ID from Firebase Authentication
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated. Please try again later.');
      }
      
      const userId = currentUser.uid;
      
      // Determine seasonal type and undertone
      const seasonalType = colorPalette[0].colorName === 'Peach' ? 'Spring' :
                          colorPalette[0].colorName === 'Lavender' ? 'Summer' :
                          colorPalette[0].colorName === 'Rust' ? 'Autumn' : 'Winter';
      
      const undertone = colorPalette[0].colorName === 'Peach' || 
                       colorPalette[0].colorName === 'Rust' ? 'Warm' : 'Cool';
      
      // Prepare data for saving
      const recommendedColors = colorPalette
        .filter(color => color.suitable)
        .map(color => ({
          colorName: color.colorName,
          hexCode: color.hexCode
        }));
      
      const colorsToAvoid = colorPalette
        .filter(color => !color.suitable)
        .map(color => ({
          colorName: color.colorName,
          hexCode: color.hexCode
        }));
      
      // Save analysis result
      const id = await saveAnalysisResult(userId, {
        imageSrc,
        skinTone,
        seasonalType,
        undertone,
        recommendedColors,
        colorsToAvoid
      });
      
      setAnalysisId(id);
      setSaveStatus('success');
    } catch (error) {
      console.error('Error saving results:', error);
      setSaveStatus('error');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 bg-white rounded-lg shadow-md">
      {error ? (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      ) : analyzing ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Analyzing your image...
          </p>
          <p className="text-sm text-gray-500">
            This may take a few moments
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="w-full sm:w-1/3">
              <img
                src={imageSrc}
                alt="Analyzed"
                className="w-full h-auto rounded-lg shadow"
              />
            </div>
            <div className="w-full sm:w-2/3">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Analysis Results
              </h2>
              <p className="text-gray-600 mb-1">
                Faces detected: {facesDetected}
              </p>
              {skinTone && (
                <div className="flex items-center mb-3">
                  <span className="text-gray-600 mr-2">Detected skin tone:</span>
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: skinTone }}
                  ></div>
                  <span className="ml-2 text-gray-600">{skinTone}</span>
                </div>
              )}
              <p className="text-gray-600 mb-1">
                Seasonal color type:{' '}
                <span className="font-medium">
                  {colorPalette.length > 0 && 
                   (colorPalette[0].colorName === 'Peach' ? 'Spring' :
                    colorPalette[0].colorName === 'Lavender' ? 'Summer' :
                    colorPalette[0].colorName === 'Rust' ? 'Autumn' : 'Winter')}
                </span>
              </p>
              <p className="text-gray-600 mb-2">
                Undertone:{' '}
                <span className="font-medium">
                  {colorPalette.length > 0 && 
                   (colorPalette[0].colorName === 'Peach' || 
                    colorPalette[0].colorName === 'Rust' ? 'Warm' : 'Cool')}
                </span>
              </p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Recommended Color Palette
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {colorPalette
              .filter((color) => color.suitable)
              .map((color, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-3 border border-gray-200 rounded-md"
                >
                  <div
                    className="w-full h-12 rounded-md mb-2"
                    style={{ backgroundColor: color.hexCode }}
                  ></div>
                  <p className="text-gray-800 font-medium">{color.colorName}</p>
                  <p className="text-gray-500 text-sm">{color.hexCode}</p>
                </div>
              ))}
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Colors to Avoid
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {colorPalette
              .filter((color) => !color.suitable)
              .map((color, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-3 border border-gray-200 rounded-md"
                >
                  <div
                    className="w-full h-12 rounded-md mb-2"
                    style={{ backgroundColor: color.hexCode }}
                  ></div>
                  <p className="text-gray-800 font-medium">{color.colorName}</p>
                  <p className="text-gray-500 text-sm">{color.hexCode}</p>
                </div>
              ))}
          </div>
        </>
      )}
      
      {/* Add save button at the bottom */}
      {!analyzing && !error && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          {saveStatus === 'idle' ? (
            <button
              onClick={saveResults}
              className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Save This Analysis
            </button>
          ) : saveStatus === 'saving' ? (
            <button
              disabled
              className="w-full py-2 bg-gray-400 text-white rounded-md flex items-center justify-center"
            >
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </button>
          ) : saveStatus === 'success' ? (
            <div className="text-center">
              <div className="bg-green-50 text-green-700 rounded-md p-2 mb-2">
                Analysis saved successfully!
              </div>
              <button
                onClick={() => setSaveStatus('idle')}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Save Another Copy
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-red-50 text-red-700 rounded-md p-2 mb-2">
                Failed to save analysis. Please try again.
              </div>
              <button
                onClick={() => setSaveStatus('idle')}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorAnalysis; 