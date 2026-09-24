import type { ReactNode } from 'react'

type InputIconName = 'user' | 'phone' | 'calendar' | 'mail' | 'lock'

function InputIcon({ name }: { name: InputIconName }) {
  const paths: Record<InputIconName, ReactNode> = {
    user: (
      <>
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.5 19c.7-3.2 3-5 6.5-5s5.8 1.8 6.5 5" />
      </>
    ),
    phone: (
      <path d="M7.4 3.8 9.8 7 8.2 9c1.2 2.5 3.2 4.5 5.8 5.8l2-1.6 3.2 2.4-.7 3c-.2.8-.9 1.4-1.8 1.4C9.7 19.5 4.5 14.3 4 7.3c-.1-.9.5-1.6 1.4-1.8l2-.7Z" />
    ),
    calendar: (
      <>
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M8 3v4m8-4v4M3.5 9.5h17" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="m4.5 7 7.5 6 7.5-6" />
      </>
    ),
    lock: (
      <>
        <rect x="4.5" y="10" width="15" height="11" rx="2.5" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4.5v2" />
      </>
    ),
  }

  return (
    <span className="field-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">{paths[name]}</svg>
    </span>
  )
}

export function GenderIcon({
  gender,
}: {
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'SELECTOR'
}) {
  if (gender === 'SELECTOR') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="8" cy="9" r="3.5" />
        <path d="M8 12.5V20m-3-3h6" />
        <circle cx="16" cy="15" r="3.5" />
        <path d="m18.5 12.5 3-3m-2.5 0h2.5V12" />
      </svg>
    )
  }
  if (gender === 'MALE') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="15" r="5" />
        <path d="m13 11 7-7m-5 0h5v5" />
      </svg>
    )
  }
  if (gender === 'FEMALE') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="5" />
        <path d="M12 13v8m-4-3h8" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10" cy="10" r="5" />
      <path d="M10 15v6m-3-3h6m1-12 5-3m-2 0h2v2" />
    </svg>
  )
}

export function VisibilityIcon({ visible }: { visible: boolean }) {
  return (
    <svg className="visibility-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.8" />
      {visible && <path d="m4 4 16 16" />}
    </svg>
  )
}

export function Field({
  label,
  icon,
  value,
  onChange,
  type = 'text',
  placeholder,
  action,
  autoComplete,
  max,
  error,
}: {
  label: string
  icon: InputIconName
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  action?: ReactNode
  autoComplete?: string
  max?: string
  error?: string
}) {
  return (
    <label className={error ? 'field field--error' : 'field'}>
      <span>{label}</span>
      <div>
        <InputIcon name={icon} />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          max={max}
          required
        />
        {action}
      </div>
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}
