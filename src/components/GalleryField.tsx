import { useId, useRef, useState } from 'react'
import { ImagePlus, Loader2, Plus, Upload, X } from 'lucide-react'
import { uploadImage, validateImageFile } from '../data/upload'

type GalleryFieldProps = {
  label: string
  value: string[]
  folder: string
  max?: number
  onChange: (urls: string[]) => void
}

export function GalleryField({
  label,
  value,
  folder,
  max = 6,
  onChange,
}: GalleryFieldProps) {
  const fileId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [urlDraft, setUrlDraft] = useState('')

  const canAdd = value.length < max

  const handleFiles = async (files: FileList | File[] | null | undefined) => {
    if (!files || !canAdd) return
    const list = Array.from(files).slice(0, max - value.length)
    if (!list.length) return

    setError('')
    setUploading(true)

    try {
      const next = [...value]
      for (const file of list) {
        const validationError = validateImageFile(file)
        if (validationError) {
          setError(validationError)
          continue
        }
        setProgress(1)
        const url = await uploadImage(file, folder, setProgress)
        next.push(url)
        onChange([...next])
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Upload failed. Try a smaller image or paste an image URL.',
      )
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const addUrl = () => {
    const url = urlDraft.trim()
    if (!url || !canAdd) return
    onChange([...value, url])
    setUrlDraft('')
    setError('')
  }

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="image-field gallery-field">
      <span className="image-field-label">
        {label}
        <small>
          {value.length}/{max} side images
        </small>
      </span>

      {value.length ? (
        <div className="gallery-grid">
          {value.map((src, index) => (
            <div key={`${src.slice(0, 24)}-${index}`} className="gallery-thumb">
              <img src={src} alt={`Gallery ${index + 1}`} />
              <button
                type="button"
                className="image-clear"
                onClick={() => removeAt(index)}
                aria-label={`Remove gallery image ${index + 1}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {canAdd ? (
        <>
          <div className={`image-dropzone ${uploading ? 'busy' : ''}`}>
            <ImagePlus size={22} />
            <div>
              <strong>Add gallery images</strong>
              <p>JPG, PNG, WEBP, GIF · auto-compressed · up to {max}</p>
            </div>
            <button
              type="button"
              className="btn btn-sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? <Loader2 size={15} className="spin" /> : <Upload size={15} />}
              {uploading ? `Uploading ${progress}%` : 'Choose files'}
            </button>
            <input
              id={fileId}
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              hidden
              onChange={(e) => void handleFiles(e.target.files)}
            />
          </div>

          <div className="gallery-url-row">
            <input
              type="url"
              value={urlDraft}
              placeholder="https://... paste image URL"
              disabled={uploading}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addUrl()
                }
              }}
            />
            <button type="button" className="btn btn-sm" disabled={!urlDraft.trim()} onClick={addUrl}>
              <Plus size={15} />
              Add URL
            </button>
          </div>
        </>
      ) : (
        <p className="gallery-limit-note">Maximum {max} gallery images reached.</p>
      )}

      {error ? <p className="image-field-error">{error}</p> : null}
    </div>
  )
}
