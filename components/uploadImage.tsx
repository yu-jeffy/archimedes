"use client"

import { useState } from 'react';
import Image from 'next/image';

interface UploadImageProps {
  onImageParsed: (parsedText: string) => void;
}

export default function UploadImage({ onImageParsed }: UploadImageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/uploadToPinata', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      const gatewayUrl = `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}${result.IpfsHash}`;
      const parsedText = await parseImage(gatewayUrl);
      onImageParsed(parsedText);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const parseImage = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch('/api/gptParseImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse image');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      setError((error as Error).message);
      return '';
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <label className="bg-white text-black font-bold py-2 px-4 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
          Choose File
          <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
        </label>
        <button 
          onClick={handleUpload} 
          disabled={uploading || !file} 
          className="bg-white text-black font-bold py-2 px-4 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {preview && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Image Preview</h3>
          <div className="relative w-full h-20 bg-gray-800 rounded-lg overflow-hidden">
            <Image 
              src={preview} 
              alt="Preview" 
              layout="fill" 
              objectFit="contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}