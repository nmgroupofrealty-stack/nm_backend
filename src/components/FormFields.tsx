import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

export function TextInput({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label}>
      <input {...props} />
    </Field>
  )
}

export function TextTextarea({
  label,
  ...props
}: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label}>
      <textarea rows={4} {...props} />
    </Field>
  )
}

export function TextSelect({
  label,
  children,
  ...props
}: { label: string; children: React.ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label}>
      <select {...props}>{children}</select>
    </Field>
  )
}
