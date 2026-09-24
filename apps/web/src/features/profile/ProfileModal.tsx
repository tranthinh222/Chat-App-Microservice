import { useEffect, useState } from 'react'
import type { User } from '../../shared/types/user'
import { getUserProfile } from './profile-api'

type ProfileModalProps = {
  user: User
  onClose: () => void
}

const GENDER_LABELS: Record<User['gender'], string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
}

function formatBirthday(value: string) {
  const [date] = value.split('T')
  const [year, month, day] = date.split('-')

  return year && month && day ? `${day}/${month}/${year}` : value
}

export function ProfileModal({ user, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<User>(user)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getUserProfile(user.id)
      .then((freshProfile) => {
        if (active) {
          setProfile((current) => ({ ...current, ...freshProfile }))
        }
      })
      .catch((requestError: unknown) => {
        if (!active) return

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Không thể tải thông tin tài khoản',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user.id])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div
      className="profile-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="profile-modal-header">
          <h2 id="profile-modal-title">Thông tin tài khoản</h2>
          <button type="button" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </header>

        <div className="profile-cover" />

        {loading && <p className="profile-api-state">Đang tải thông tin…</p>}
        {error && <p className="profile-api-state error">{error}</p>}

        <div className="profile-summary">
          <div className="profile-avatar-large">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`Ảnh đại diện của ${profile.username}`}
              />
            ) : (
              profile.username[0]?.toUpperCase()
            )}
          </div>
          <h3>{profile.username}</h3>
          <button
            className="profile-edit-button"
            type="button"
            aria-label="Chỉnh sửa hồ sơ"
          >
            ✎
          </button>
        </div>

        <div className="profile-actions">
          <button type="button">Chỉnh sửa thông tin</button>
        </div>

        <section className="profile-section">
          <h3>Thông tin cá nhân</h3>
          <dl>
            <div>
              <dt>Giới tính</dt>
              <dd>{GENDER_LABELS[profile.gender]}</dd>
            </div>
            <div>
              <dt>Ngày sinh</dt>
              <dd>{formatBirthday(profile.birthday)}</dd>
            </div>
            <div>
              <dt>Điện thoại</dt>
              <dd>{profile.phone}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{profile.email}</dd>
            </div>
          </dl>
        </section>

        <section className="profile-section profile-media">
          <h3>Hình ảnh</h3>
          <p>Chưa có ảnh nào được chia sẻ</p>
        </section>
      </section>
    </div>
  )
}
