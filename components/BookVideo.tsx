import config from '@/lib/config'
import { ImageKitProvider, Video } from '@imagekit/next' // 1. Import IKVideo
import React from 'react'

const BookVideo = ({videoUrl}: {videoUrl: string}) => {
  // ImageKit works best with a "path", not a full URL.
  // We need to extract the path from your full videoUrl.
  // e.g., turn "https://ik.imagekit.io/your_id/folder/my-video.mp4" 
  // into "/folder/my-video.mp4"
  
  return (
    <ImageKitProvider urlEndpoint={config.env.imagekit.urlEndpoint}>
      <Video
        //urlEndpoint={config.env.imagekit.urlEndpoint}
        // --- THE FIX ---
        // Use the 'videoPath' variable you just created.
        src={videoUrl}
        alt="Picture of the author"
        controls
      />
    </ImageKitProvider>
  )
}

export default BookVideo