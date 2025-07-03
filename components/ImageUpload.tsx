'use client'

import React, { useRef, useState } from 'react';
import { Image, ImageKitProvider } from '@imagekit/next';
import { upload } from '@imagekit/next';
import config from '@/lib/config';
import NextImage from 'next/image';
import { toast } from "sonner";

const {
  env: {
    imagekit: { publicKey, urlEndpoint },
  }
} = config;

interface ImageUploadProps {
  onFileChange: (filePath: string) => void;
  value?: string | null;
}

const ImageUpload = ({ onFileChange, value }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const displayPath = value;

  const authenticator = async () => {
    try {
      const response = await fetch('/api/auth/imagekit');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Authentication request failed with ${response.status}: ${errorText}`);
      }
      return await response.json();
    } catch (error: any) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setIsUploading(true);
    toast("Uploading your ID card...");

    try {
      const authParams = await authenticator();
      const result = await upload({
        file: selectedFile,
        fileName: selectedFile.name,
        ...authParams,
        publicKey: publicKey,
        useUniqueFileName: true,
      });

      // --- FIX IS HERE ---
      // First, check if the result and its filePath exist.
      if (result && result.filePath) {
        // Now it's safe to call onFileChange because we know filePath is a string.
        onFileChange(result.filePath);
        toast.success("ID card uploaded successfully!");
      } else {
        // Handle the unlikely case where the upload succeeds but returns no path.
        throw new Error("Upload succeeded but no file path was returned.");
      }
      // --- END OF FIX ---

    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    // ... your JSX remains the same
    <ImageKitProvider urlEndpoint={urlEndpoint}>
      <div className="flex flex-col gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <button
          type="button"
          className='upload-btn'
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <NextImage src="/icons/upload.svg" alt='upload-icon' width={20} height={20} />
          <p className='text-base text-light-100'>
            {isUploading ? 'Uploading...' : (displayPath ? 'Change ID Card' : 'Upload ID Card')}
          </p>
        </button>

        {displayPath && (
          <div className="mt-2">
            <p className="text-sm text-gray-400">Preview:</p>
            <Image
              alt="Uploaded ID card preview"
              src={displayPath}
              width={200}
              height={120}
              className="rounded-md object-cover border border-gray-600"
            />
          </div>
        )}
      </div>
    </ImageKitProvider>
  );
}

export default ImageUpload;