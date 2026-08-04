import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { storage } from '../firebase'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_WIDTH = 1600
const JPEG_QUALITY = 0.82

const MAX_VIDEO_BYTES = 50 * 1024 * 1024
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Use JPG, PNG, WEBP, or GIF images only.'
  }
  if (file.size > MAX_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }
  return null
}

export function validateVideoFile(file: File): string | null {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return 'Use MP4, WEBM, or MOV video files only.'
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return 'Video must be 50 MB or smaller.'
  }
  return null
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read this image file.'))
    }
    img.src = url
  })
}

/**
 * Compress a desktop image and return a data URL.
 * Saved with the listing in Realtime Database — no Firebase Storage needed.
 */
export async function uploadImage(
  file: File,
  _folder: string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const validationError = validateImageFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  onProgress?.(10)
  const img = await loadImage(file)
  onProgress?.(40)

  const scale = Math.min(1, MAX_WIDTH / img.width)
  const width = Math.max(1, Math.round(img.width * scale))
  const height = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not process this image in the browser.')
  }

  onProgress?.(70)
  ctx.drawImage(img, 0, 0, width, height)

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const dataUrl =
    outputType === 'image/png'
      ? canvas.toDataURL('image/png')
      : canvas.toDataURL('image/jpeg', JPEG_QUALITY)

  onProgress?.(100)

  // Keep DB payloads reasonable (~1.5MB text)
  if (dataUrl.length > 1_800_000) {
    throw new Error('Image is still too large after compression. Try a smaller file or use an image URL.')
  }

  return dataUrl
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
}

/**
 * Upload a desktop video to Firebase Storage and return its public download URL.
 */
export async function uploadVideo(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const validationError = validateVideoFile(file)
  if (validationError) {
    throw new Error(validationError)
  }
  if (!storage) {
    throw new Error('Firebase Storage is not configured. Check your admin .env values.')
  }

  const path = `site-videos/${folder}/${Date.now()}-${safeFileName(file.name)}`
  const storageRef = ref(storage, path)
  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
    cacheControl: 'public,max-age=31536000',
  })

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        onProgress?.(Math.max(1, percent))
      },
      (err) => {
        const message = err.message?.toLowerCase() ?? ''
        if (message.includes('unauthorized') || message.includes('permission')) {
          reject(
            new Error(
              'Upload blocked by Storage rules. In Firebase Console → Storage → Rules, publish the site-videos write rule from NMadmin/storage.rules, then try again.',
            ),
          )
          return
        }
        reject(new Error(err.message || 'Video upload failed.'))
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref)
          onProgress?.(100)
          resolve(url)
        } catch {
          reject(new Error('Upload finished but the video URL could not be loaded.'))
        }
      },
    )
  })
}
