import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
  size?: 'md' | 'lg'
}

export function Modal({ title, open, onClose, children, size = 'md' }: ModalProps) {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`modal${size === 'lg' ? ' modal-lg' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
