import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

interface ColorAnalysisProps {
  imageSrc: string;
}

interface ColorResult {
  colorName: string;
  hexCode: string;
  suitable: boolean;
}

const ColorAnalysis: React.FC<ColorAnalysisProps> = ({ imageSrc }) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [facesDetected, setFacesDetected] = useState(0);
  const [skinTone, setSkinTone] = useState<string | null>(null);
  const [colorPalette, setColorPalette] = useState<ColorResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeImage = async () => {
      try {
        setAnalyzing(true);
        setError(null);

        // Load TensorFlow.js models
        await tf.ready();
        
        // For MVP, we're using a simplified approach without actual face detection
        // In a real app, we would properly implement the face detection model
        // This is a placeholder for the actual implementation

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
        
        // Since we're building an MVP, we'll simulate face detection
        // and just assume 1 face is detected
        setFacesDetected(1);

        // For the MVP, we'll use a simplified approach to skin tone analysis
        // In a real application, we would extract pixels from facial landmarks
        // and apply more sophisticated color analysis
        
        // Simple skin tone extraction (just for demonstration purposes)
        // In a real app, we would analyze specific face regions
        const centerX = img.width / 2;
        const centerY = img.height / 2;
        const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data;
        const skinToneHex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
        setSkinTone(skinToneHex);

        // Generate a simplified color palette based on the skin tone
        // In a real app, this would use Korean color theory algorithms
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

    // Determine if the skin has warm or cool undertones
    // This is a very simplified approach
    const isWarm = r > b;

    // Generate sample colors based on warm/cool classification
    if (isWarm) {
      return [
        { colorName: 'Coral Red', hexCode: '#FF6B6B', suitable: true },
        { colorName: 'Peach', hexCode: '#FFB347', suitable: true },
        { colorName: 'Warm Gold', hexCode: '#FFD700', suitable: true },
        { colorName: 'Olive Green', hexCode: '#808000', suitable: true },
        { colorName: 'Bright Blue', hexCode: '#007BFF', suitable: false },
        { colorName: 'Cool Purple', hexCode: '#9370DB', suitable: false },
      ];
    } else {
      return [
        { colorName: 'Navy Blue', hexCode: '#000080', suitable: true },
        { colorName: 'Cool Pink', hexCode: '#FF69B4', suitable: true },
        { colorName: 'Silver', hexCode: '#C0C0C0', suitable: true },
        { colorName: 'Lavender', hexCode: '#E6E6FA', suitable: true },
        { colorName: 'Bright Orange', hexCode: '#FF4500', suitable: false },
        { colorName: 'Mustard Yellow', hexCode: '#FFDB58', suitable: false },
      ];
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
              <p className="text-gray-600 mb-2">
                Skin undertone:{' '}
                <span className="font-medium">
                  {colorPalette.length > 0 &&
                    (colorPalette[0].colorName.includes('Coral') ||
                    colorPalette[0].colorName.includes('Peach')
                      ? 'Warm'
                      : 'Cool')}
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
    </div>
  );
};

export default ColorAnalysis; 