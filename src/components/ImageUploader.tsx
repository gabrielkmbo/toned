import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
  onUpload: (imageSrc: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            onUpload(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center w-full max-w-md p-6 border-2 border-dashed rounded-lg transition-colors ${
        isDragActive
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-300 hover:border-indigo-400'
      }`}
    >
      <input {...getInputProps()} />
      <svg
        className={`w-12 h-12 mb-4 ${
          isDragActive ? 'text-indigo-600' : 'text-gray-400'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      {isDragActive ? (
        <p className="text-indigo-600 font-medium">Drop the image here</p>
      ) : (
        <div className="text-center">
          <p className="mb-2 text-gray-700">
            Drag and drop an image here, or click to select
          </p>
          <p className="text-sm text-gray-500">
            (Only JPG and PNG images are accepted)
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 