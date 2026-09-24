import { useEffect } from 'react'
import type { User } from '../../shared/types/user'

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
  const [year, month, day] = value.split('-')

  return year && month && day ? `${day}/${month}/${year}` : value
}

export function ProfileModal({ user, onClose }: ProfileModalProps) {
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

        <div className="profile-summary">
          <div className="profile-avatar-large">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`Ảnh đại diện của ${user.username}`}
              />
            ) : (
              user.username[0]?.toUpperCase()
            )}
          </div>
          <h3>{user.username}</h3>
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
              <dd>{GENDER_LABELS[user.gender]}</dd>
            </div>
            <div>
              <dt>Ngày sinh</dt>
              <dd>{formatBirthday(user.birthday)}</dd>
            </div>
            <div>
              <dt>Điện thoại</dt>
              <dd>{user.phone}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
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
