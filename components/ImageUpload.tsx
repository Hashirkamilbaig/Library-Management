'use client'

import React, { useRef, useState } from 'react'
import { IKImage, ImageKitProvider, IKUpload } from "imagekitio-next";
import config from '@/lib/config';
import ImageKit from 'imagekit';
import Image from 'next/image';
import { toast } from "sonner"


const {
  env: {
    imagekit: {publicKey, urlEndpoint},
  }
} = config;


const authenticator =async () => {
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);
    if(!response.ok){
      const errorText = await response.text();

      throw new Error(
        `Request failed with ${response.status}: ${errorText}`
      );
    }
    const data = await response.json();
    const {signature, expire, token} = data;
    return {token, expire, signature};

  } catch (error: any) {
      throw new Error(`Authentication request failed: ${error.message}`)
  }
}


const ImageUpload = ({onFileChange} : {onFileChange : (filePath: string) => void}) => {
  const ikUploadRef = useRef(null);
  const [file, setFile] = useState< {filePath: string} | null >(null);

  const onError = (error : any) => {
    console.log(error);
    toast(`Image upload failed`);
  };
  const onSuccess = (res: any) => {
    setFile(res);
    onFileChange(res.filePath);
    toast(`Image uploaded succussfully: ${res.filePath}`);
  };
  
  return (
    <ImageKitProvider publicKey={publicKey} urlEndpoint={urlEndpoint} authenticator={authenticator}>
      <IKUpload className='hidden' ref={ikUploadRef} onError={onError} onSuccess={onSuccess} fileName='test-upload.png' />

      <button className='upload-btn' onClick={(e) => {
        e.preventDefault();

        if(ikUploadRef.current){
          // @ts-ignore
          ikUploadRef.current?.click();
        }
      }}>
        <Image src="/icons/upload.svg" alt='upload-icon' width={20} height={20} className='object-contain'/>

        <p className='text-base text-light-100'>Upload a File</p>

        {file && <p className='upload-filename'>{file.filePath}</p>}
      </button>

      {file && (
        <IKImage
          alt={file.filePath}
          path={file.filePath}
          width={500}
          height={500}
        />
      )}
    </ImageKitProvider>
  )
}

export default ImageUpload
