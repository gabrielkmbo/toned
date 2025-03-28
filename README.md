# Korean Color Analysis App

A web application that uses computer vision to analyze your photo and recommend colors that best match your skin tone based on Korean color theory principles.

## Features

- Take a photo using your device's camera
- Upload an existing photo
- Face detection using TensorFlow.js
- Analyze skin tone and facial features
- Get personalized color recommendations based on Korean seasonal color analysis
- See which colors to avoid based on your analysis
- Save your analysis results to view later
- View history of previous analyses
- Responsive design for desktop and mobile devices

## Tech Stack

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Tailwind
- **Image Handling**: 
  - react-webcam for camera access
  - react-dropzone for file uploads

### Computer Vision
- **TensorFlow.js**: Core machine learning library
- **BlazeFace Model**: Lightweight face detection model from TensorFlow.js
- **Canvas API**: Used for image processing and color extraction

### Database & Storage
- **Firebase**: Backend as a service
  - **Firestore**: NoSQL database for storing analysis results
  - **Cloud Storage**: For storing uploaded images
  - **Authentication**: Anonymous auth for user identification

## How It Works

1. The app captures your photo through your camera or from an uploaded file
2. TensorFlow.js BlazeFace model detects faces in the image
3. The app extracts skin tone from detected facial regions
4. It analyzes the skin tone to determine seasonal color type (Spring, Summer, Autumn, Winter)
5. Based on this analysis, it recommends a color palette using Korean color theory principles
6. The app displays both recommended colors and colors to avoid
7. Analysis results can be saved to Firebase and retrieved later

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Firebase account (for database and storage)

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

3. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Firestore Database, Storage, and Authentication services
   - Update the Firebase configuration in `src/firebase.ts` with your project credentials

4. Start the development server:
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Database Schema

### Firestore Collections

**colorAnalysis**
- `id`: Auto-generated document ID
- `userId`: String (user identifier)
- `imageSrc`: String (URL to stored image)
- `skinTone`: String (HEX color code)
- `seasonalType`: String (Spring/Summer/Autumn/Winter)
- `undertone`: String (Warm/Cool)
- `recommendedColors`: Array of objects:
  - `colorName`: String
  - `hexCode`: String
- `colorsToAvoid`: Array of objects:
  - `colorName`: String
  - `hexCode`: String
- `createdAt`: Timestamp

### Storage Structure

**analysis-images/{userId}/{timestamp}**
- Stores user uploaded/captured images

## Future Enhancements

- Advanced facial feature detection and analysis
- More sophisticated Korean color theory implementation
- Clothing and makeup recommendations
- AR features for virtual try-on
- Full user accounts with email/password or social login
- Sharing capabilities

## Dependencies

- react
- react-dom
- typescript
- tailwindcss
- @tensorflow/tfjs
- @tensorflow-models/blazeface
- react-webcam
- react-dropzone
- firebase (Firestore, Storage, Authentication)

## License

MIT License

## Acknowledgments

- Korean color theory practitioners
- TensorFlow.js team
- React and Tailwind CSS communities
- Firebase team
