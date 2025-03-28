import { db, storage } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp, 
  doc, 
  getDoc,
  FirestoreError 
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, StorageError } from 'firebase/storage';

export interface ColorAnalysisResult {
  id?: string;
  userId: string;
  imageSrc: string;
  skinTone: string;
  seasonalType: string;
  undertone: string;
  recommendedColors: Array<{
    colorName: string;
    hexCode: string;
  }>;
  colorsToAvoid: Array<{
    colorName: string;
    hexCode: string;
  }>;
  createdAt: Date | Timestamp;
}

export const saveAnalysisResult = async (
  userId: string,
  analysisResult: Omit<ColorAnalysisResult, 'id' | 'userId' | 'createdAt'>
): Promise<string> => {
  try {
    // Upload the image to Firebase Storage
    const imageRef = ref(storage, `analysis-images/${userId}/${Date.now()}`);
    
    try {
      await uploadString(imageRef, analysisResult.imageSrc, 'data_url');
    } catch (error) {
      const storageError = error as StorageError;
      console.error('Storage error:', storageError.code, storageError.message);
      throw new Error(`Failed to upload image: ${storageError.message}`);
    }
    
    let imageUrl;
    try {
      imageUrl = await getDownloadURL(imageRef);
    } catch (error) {
      const storageError = error as StorageError;
      console.error('Download URL error:', storageError.code, storageError.message);
      throw new Error(`Failed to get image URL: ${storageError.message}`);
    }

    // Save the analysis result to Firestore
    const analysisData: Omit<ColorAnalysisResult, 'id'> = {
      userId,
      imageSrc: imageUrl, // Use the stored image URL
      skinTone: analysisResult.skinTone,
      seasonalType: analysisResult.seasonalType,
      undertone: analysisResult.undertone,
      recommendedColors: analysisResult.recommendedColors,
      colorsToAvoid: analysisResult.colorsToAvoid,
      createdAt: Timestamp.now()
    };

    try {
      const docRef = await addDoc(collection(db, 'colorAnalysis'), analysisData);
      return docRef.id;
    } catch (error) {
      const firestoreError = error as FirestoreError;
      console.error('Firestore error:', firestoreError.code, firestoreError.message);
      throw new Error(`Failed to save analysis data: ${firestoreError.message}`);
    }
  } catch (error) {
    console.error('Error saving analysis result:', error);
    throw error;
  }
};

export const getUserAnalysisHistory = async (userId: string): Promise<ColorAnalysisResult[]> => {
  try {
    const analysisQuery = query(
      collection(db, 'colorAnalysis'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    try {
      const querySnapshot = await getDocs(analysisQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<ColorAnalysisResult, 'id'>
      }));
    } catch (error) {
      const firestoreError = error as FirestoreError;
      console.error('Firestore query error:', firestoreError.code, firestoreError.message);
      throw new Error(`Failed to retrieve analysis history: ${firestoreError.message}`);
    }
  } catch (error) {
    console.error('Error getting user analysis history:', error);
    throw error;
  }
};

export const getAnalysisById = async (analysisId: string): Promise<ColorAnalysisResult | null> => {
  try {
    const docRef = doc(db, 'colorAnalysis', analysisId);
    
    try {
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data() as Omit<ColorAnalysisResult, 'id'>
        };
      } else {
        return null;
      }
    } catch (error) {
      const firestoreError = error as FirestoreError;
      console.error('Firestore document error:', firestoreError.code, firestoreError.message);
      throw new Error(`Failed to retrieve analysis: ${firestoreError.message}`);
    }
  } catch (error) {
    console.error('Error getting analysis by ID:', error);
    throw error;
  }
}; 