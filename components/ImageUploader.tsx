
import React, { useState } from 'react';

interface ImageUploaderProps {
  onImageUpload: (base64Image: string) => void;
  currentImageSrc?: string;
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, currentImageSrc, label = 'చిత్రాన్ని అప్‌లోడ్ చేయండి' }) => {
  const [preview, setPreview] = useState<string | undefined>(currentImageSrc);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageUpload(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">
        {label}:
      </label>
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        onChange={handleImageChange}
        className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
      />
      {preview && (
        <div className="mt-4 border border-gray-300 rounded-md p-2 flex justify-center">
          <img src={preview} alt="చిత్ర ప్రివ్యూ" className="max-w-full h-auto max-h-48 object-contain" />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
