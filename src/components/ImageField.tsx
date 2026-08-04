import { useEffect, useId, useRef, useState } from 'react'
import { ImagePlus, Link2, Loader2, Upload, X } from 'lucide-react'
import { uploadImage, validateImageFile } from '../data/upload'

type ImageFieldProps = {
  label: string
  value: string
  folder: string
  required?: boolean
  onChange: (url: string) => void
}

export function ImageField({ label, value, folder, required, onChange }: ImageFieldProps) {
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
    const validationError = validateImageFile(file)
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
      const url = await uploadImage(file, folder, setProgress)
      onChange(url)
      URL.revokeObjectURL(preview)
      setLocalPreview('')
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Upload failed. Try a smaller image or paste an image URL.'
      setError(message)
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const previewSrc = localPreview || value

  return (
    <div className="image-field">
      <span className="image-field-label">
        {label}
        {required ? ' *' : ''}
      </span>

      {previewSrc ? (
        <div className="image-preview">
          <img src={previewSrc} alt="Selected preview" />
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
              aria-label="Remove image"
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
        <ImagePlus size={22} />
        <div>
          <strong>Upload from desktop</strong>
          <p>JPG, PNG, WEBP, GIF · auto-compressed · max 5 MB</p>
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
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>

      <label className="field image-url-field" htmlFor={inputId}>
        <span>
          <Link2 size={14} /> Or paste image URL
        </span>
        <input
          id={inputId}
          type="url"
          value={value}
          placeholder="https://..."
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
