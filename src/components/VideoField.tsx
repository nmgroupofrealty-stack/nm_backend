import { useEffect, useId, useRef, useState } from 'react'
import { Film, Link2, Loader2, Upload, X } from 'lucide-react'
import { uploadVideo, validateVideoFile } from '../data/upload'

type VideoFieldProps = {
  label: string
  value: string
  folder: string
  required?: boolean
  onChange: (url: string) => void
}

export function VideoField({ label, value, folder, required, onChange }: VideoFieldProps) {
  const inputId = useId()
  const fileId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [localPreview, setLocalPreview] = useState('')

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }, [localPreview])

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return
    const validationError = validateVideoFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    if (localPreview) URL.revokeObjectURL(localPreview)
    const preview = URL.createObjectURL(file)
    setLocalPreview(preview)
    setError('')
    setUploading(true)
    setProgress(1)

    try {
      const url = await uploadVideo(file, folder, setProgress)
      onChange(url)
      URL.revokeObjectURL(preview)
      setLocalPreview('')
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Upload failed. Try a smaller video or paste a direct video URL.'
      setError(message)
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const previewSrc = localPreview || value

  return (
    <div className="image-field video-field">
      <span className="image-field-label">
        {label}
        {required ? ' *' : ''}
      </span>

      {previewSrc ? (
        <div className="image-preview video-preview">
          <video src={previewSrc} controls muted playsInline preload="metadata" />
          {!uploading ? (
            <button
              type="button"
              className="image-clear"
              onClick={() => {
                if (localPreview) {
                  URL.revokeObjectURL(localPreview)
                  setLocalPreview('')
                }
                onChange('')
              }}
              aria-label="Remove video"
            >
              <X size={16} />
            </button>
          ) : null}
          {uploading ? (
            <div className="image-progress-overlay">
              <div className="image-progress-bar">
                <span style={{ width: `${Math.max(progress, 8)}%` }} />
              </div>
              <p>Uploading {progress}%</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className={`image-dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'busy' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          void handleFile(e.dataTransfer.files?.[0])
        }}
      >
        <Film size={22} />
        <div>
          <strong>Upload from desktop</strong>
          <p>MP4, WEBM, MOV · max 50 MB</p>
        </div>
        <button
          type="button"
          className="btn btn-sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 size={15} className="spin" /> : <Upload size={15} />}
          {uploading ? `Uploading ${progress}%` : 'Choose file'}
        </button>
        <input
          id={fileId}
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          hidden
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>

      <label className="field image-url-field" htmlFor={inputId}>
        <span>
          <Link2 size={14} /> Or paste video URL
        </span>
        <input
          id={inputId}
          type="url"
          value={value}
          placeholder="https://…/video.mp4"
          required={required && !value}
          disabled={uploading}
          onChange={(e) => {
            setError('')
            onChange(e.target.value)
          }}
        />
      </label>

      {error ? <p className="image-field-error">{error}</p> : null}
    </div>
  )
}
