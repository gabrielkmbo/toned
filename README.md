# Korean Color Analysis App

A web application that uses computer vision to analyze your photo and recommend colors that best match your skin tone based on Korean color theory principles.

## Features

- Take a photo using your device's camera
- Upload an existing photo
- Analyze skin tone and facial features
- Get personalized color recommendations
- See which colors to avoid based on your analysis
- Responsive design for desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Image Processing**: TensorFlow.js, HTML5 Canvas
- **Camera/File Handling**: react-webcam, react-dropzone

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/toned-color-analysis.git
   cd toned-color-analysis
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## How It Works

1. The app captures your photo through your camera or from an uploaded file
2. It uses TensorFlow.js to analyze facial features (simplified in the MVP)
3. The app extracts your skin tone and determines if you have warm or cool undertones
4. Based on this analysis, it recommends a color palette using Korean color theory principles
5. The app displays both recommended colors and colors to avoid

## MVP Limitations

This is a Minimum Viable Product (MVP) with some simplifications:

- Simplified skin tone detection
- Basic warm/cool undertone classification
- Sample color palettes rather than fully personalized recommendations
- No persistent storage of analysis results

## Future Enhancements

- Advanced facial feature detection and analysis
- More sophisticated Korean color theory implementation
- Seasonal color analysis
- Clothing and makeup recommendations
- AR features for virtual try-on
- User accounts and history
- Sharing capabilities

## Dependencies

- react
- react-dom
- typescript
- tailwindcss
- @tensorflow/tfjs
- @tensorflow-models/face-landmarks-detection
- react-webcam
- react-dropzone

## License

MIT License

## Acknowledgments

- Korean color theory practitioners
- TensorFlow.js team
- React and Tailwind CSS communities
