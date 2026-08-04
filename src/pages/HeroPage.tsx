import { useEffect, useState, type FormEvent } from 'react'
import { PageHeader } from '../components/PageHeader'
import { ImageField } from '../components/ImageField'
import { VideoField } from '../components/VideoField'
import { saveHero, useSiteData } from '../data/store'
import type { HeroMedia, HeroMediaType } from '../types'

export function HeroPage() {
  const data = useSiteData()
  const [form, setForm] = useState<HeroMedia>(data.hero)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(data.hero)
  }, [data.hero])

  const setType = (type: HeroMediaType) => {
    setForm((f) => ({ ...f, type }))
    setSaved(false)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const payload: HeroMedia =
      form.type === 'video'
        ? { type: 'video', video: form.video.trim(), poster: '' }
        : { type: 'image', video: '', poster: form.poster.trim() }

    if (payload.type === 'video' && !payload.video) return
    if (payload.type === 'image' && !payload.poster) return

    try {
      await saveHero(payload)
      setForm(payload)
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Hero media"
        subtitle="Choose either a photo or a video for the homepage hero — not both."
      />
      <form className="panel form-grid" onSubmit={onSubmit}>
        <div className="span-2">
          <span className="field-label">Hero media type *</span>
          <div className="hero-type-toggle" role="group" aria-label="Hero media type">
            <button
              type="button"
              className={`hero-type-btn ${form.type === 'image' ? 'active' : ''}`}
              onClick={() => setType('image')}
            >
              Photo
            </button>
            <button
              type="button"
              className={`hero-type-btn ${form.type === 'video' ? 'active' : ''}`}
              onClick={() => setType('video')}
            >
              Video
            </button>
          </div>
          <p className="field-hint">Only the selected option is shown on the website homepage.</p>
        </div>

        {form.type === 'video' ? (
          <div className="span-2">
            <VideoField
              label="Hero video"
              value={form.video}
              folder="hero"
              required
              onChange={(url) => {
                setForm((f) => ({ ...f, video: url }))
                setSaved(false)
              }}
            />
          </div>
        ) : (
          <div className="span-2">
            <ImageField
              label="Hero photo"
              value={form.poster}
              folder="hero"
              required
              onChange={(url) => {
                setForm((f) => ({ ...f, poster: url }))
                setSaved(false)
              }}
            />
          </div>
        )}

        <div className="form-actions span-2">
          <button type="submit" className="btn btn-primary">
            Save hero
          </button>
          {saved ? <span className="save-hint">Saved</span> : null}
        </div>
      </form>
    </div>
  )
}
