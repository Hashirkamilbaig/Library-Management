'use client'

import React, { useRef, useState } from 'react';
// CHANGE: Import Video component as well
import { Image, Video, ImageKitProvider } from '@imagekit/next';
import { upload } from '@imagekit/next';
import config from '@/lib/config';
import NextImage from 'next/image';
import { toast } from "sonner";

const {
  env: {
    imagekit: { publicKey, urlEndpoint },
  }
} = config;

interface FileUploadProps {
  onFileChange: (filePath: string) => void;
  value?: string | null;
  type: 'image' | 'video';
  accept: string;
  placeholder: string;
  folder: string;
  variant: 'dark' | 'light';
}

const FileUpload = ({ onFileChange, value, type, accept, placeholder, folder, variant }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const displayPath = value;

  const styles = {
    button: variant === "dark" ? "bg-dark-300" : "bg-light-600 border-gray-100 border",
    placeholder: variant === "dark" ? "text-light-100" : "text-slate-500",
    text: variant === "dark" ? "text-light-100" : "text-dark-400"
  }

  const authenticator = async () => {
    // ... (This function is perfect, no changes needed)
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

  const validate = (file: File) => {
    if (type === 'image' && file.size > 20 * 1024 * 1024) { // 20 MB
      toast.error('Image size too large, please upload a file less than 20 MB.');
      return false;
    }
    if (type === 'video' && file.size > 50 * 1024 * 1024) { // 50 MB
      // CHANGE: Corrected the error message to match the validation rule
      toast.error('Video size too large, please upload a file less than 50 MB.');
      return false;
    }
    return true; // File is valid
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // CHANGE: Call the validate function and stop if invalid
    if (!validate(selectedFile)) {
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
      return;
    }

    setIsUploading(true);
    setProgress(0); // Reset progress on new upload
    toast(`Uploading your ${type}...`);

    try {
      const authParams = await authenticator();
      const result = await upload({
        file: selectedFile,
        fileName: selectedFile.name,
        // CHANGE: Pass the folder prop to the upload function
        folder: folder,
        ...authParams,
        publicKey: publicKey,
        useUniqueFileName: true,
        // CHANGE: Use the onProgress callback to update state
        onProgress: (progress) => {
          setProgress(progress.loaded / progress.total * 100);
        },
      });

      if (result && result.filePath) {
        onFileChange(result.filePath);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
      } else {
        throw new Error("Upload succeeded but no file path was returned.");
      }

    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(`${type.charAt(0).toUpperCase() + type.slice(1)} upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <ImageKitProvider urlEndpoint={urlEndpoint}>
      <div className="flex flex-col gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          // CHANGE: Use the accept prop to make this dynamic
          accept={accept}
        />
        <button
          type="button"
          // CHANGE: Applied dynamic styles
          className={`upload-btn ${styles.button}`}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <NextImage src="/icons/upload.svg" alt='upload-icon' width={20} height={20} />
          {/* CHANGE: Use the placeholder prop and show uploading status */}
          <p className={`text-base ${styles.placeholder}`}>
            {isUploading ? `Uploading... ${Math.round(progress)}%` : (displayPath ? `Change ${type}` : placeholder)}
          </p>
        </button>

        {/* CHANGE: Added a visual progress bar */}
        {isUploading && <progress value={progress} max="100" className="w-full" />}

        {/* CHANGE: Conditionally render Image or Video for the preview */}
        {displayPath && (
          <div className="mt-2">
            <p className={`text-sm ${styles.text}`}>Preview:</p>
            {type === 'image' ? (
              <Image
                alt="Uploaded file preview"
                src={displayPath}
                width={200}
                height={120}
                className="rounded-md object-cover border border-gray-600"
              />
            ) : (
              <Video
                alt="Uploaded file preview"
                src={displayPath}
                width={320}
                height={180}
                controls
                className="rounded-md"
              />
            )}
          </div>
        )}
      </div>
    </ImageKitProvider>
  );
}

export default FileUpload;