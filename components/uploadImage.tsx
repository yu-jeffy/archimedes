import { useState } from 'react';

interface UploadImageProps {
  onImageParsed: (parsedText: string) => void;
}

export default function UploadImage({ onImageParsed }: UploadImageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
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
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
