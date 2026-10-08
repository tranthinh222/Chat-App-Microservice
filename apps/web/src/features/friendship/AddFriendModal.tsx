import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Check,
  Clock3,
  Search,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react'
import { ApiRequestError } from '../../shared/api/http-client'
import {
  getFriendshipOverview,
  searchUserByPhone,
  sendFriendRequest,
} from './friendship-api'
import type { FriendshipOverview, PublicUser } from './friendship-types'

type RelationshipStatus =
  | 'none'
  | 'self'
  | 'outgoing'
  | 'incoming'
  | 'friends'
  | 'sent'

type AddFriendModalProps = {
  currentUserId: number
  onClose: () => void
}

const ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: 'Không tìm thấy tài khoản với số điện thoại này.',
  CANNOT_FRIEND_YOURSELF: 'Bạn không thể gửi lời mời kết bạn cho chính mình.',
  ALREADY_FRIENDS: 'Hai bạn đã là bạn bè.',
  FRIEND_REQUEST_ALREADY_EXISTS: 'Lời mời kết bạn đã tồn tại.',
  INVALID_ACCESS_TOKEN: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  USER_SERVICE_UNAVAILABLE: 'Dịch vụ người dùng đang tạm thời gián đoạn.',
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    return (error.code && ERROR_MESSAGES[error.code]) || error.message
  }

  return error instanceof Error ? error.message : fallback
}

export function AddFriendModal({
  currentUserId,
  onClose,
}: AddFriendModalProps) {
  const [phone, setPhone] = useState('')
  const [user, setUser] = useState<PublicUser | null>(null)
  const [status, setStatus] = useState<RelationshipStatus>('none')
  const [searching, setSearching] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const overviewRequest = useRef<Promise<FriendshipOverview> | null>(null)
  const searchSequence = useRef(0)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => {
      searchSequence.current += 1
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  const loadOverview = (refresh = false) => {
    if (refresh || !overviewRequest.current) {
      overviewRequest.current = getFriendshipOverview().catch((error) => {
        overviewRequest.current = null
        throw error
      })
    }

    return overviewRequest.current
  }

  const findRelationshipStatus = async (
    foundUser: PublicUser,
    overview: FriendshipOverview,
  ): Promise<RelationshipStatus> => {
    if (foundUser.id === currentUserId) return 'self'

    if (overview.friends.some((item) => item.user?.id === foundUser.id)) {
      return 'friends'
    }

    if (overview.incoming.some((item) => item.user?.id === foundUser.id)) {
      return 'incoming'
    }

    if (overview.outgoing.some((item) => item.user?.id === foundUser.id)) {
      return 'outgoing'
    }

    return 'none'
  }

  const search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedPhone = phone.trim()
    if (!/^\+?[0-9]{9,15}$/.test(normalizedPhone)) {
      setError('Số điện thoại phải gồm từ 9 đến 15 chữ số.')
      setUser(null)
      return
    }

    setSearching(true)
    setError('')
    setUser(null)
    setStatus('none')
    const sequence = ++searchSequence.current

    try {
      const [foundUser, overview] = await Promise.all([
        searchUserByPhone(normalizedPhone),
        loadOverview(),
      ])
      if (sequence !== searchSequence.current) return

      const relationshipStatus = await findRelationshipStatus(
        foundUser,
        overview,
      )
      setUser(foundUser)
      setStatus(relationshipStatus)
    } catch (requestError) {
      if (sequence !== searchSequence.current) return
      setError(
        getErrorMessage(requestError, 'Không thể tìm người dùng lúc này.'),
      )
    } finally {
      if (sequence === searchSequence.current) setSearching(false)
    }
  }

  const sendRequest = async () => {
    if (!user || sending) return

    setSending(true)
    setError('')

    try {
      await sendFriendRequest(user.id)
      setStatus('sent')
    } catch (requestError) {
      if (
        requestError instanceof ApiRequestError &&
        (requestError.code === 'ALREADY_FRIENDS' ||
        requestError.code === 'FRIEND_REQUEST_ALREADY_EXISTS')
      ) {
        try {
          const overview = await loadOverview(true)
          setStatus(await findRelationshipStatus(user, overview))
        } catch {
          setError(getErrorMessage(requestError, 'Không thể gửi lời mời.'))
        }
      } else {
        setError(getErrorMessage(requestError, 'Không thể gửi lời mời.'))
      }
    } finally {
      setSending(false)
    }
  }

  const updatePhone = (value: string) => {
    searchSequence.current += 1
    setPhone(value)
    setUser(null)
    setStatus('none')
    setSearching(false)
    setError('')
  }

  return (
    <div
      className="add-friend-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="add-friend-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-friend-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="add-friend-header">
          <div>
            <span className="add-friend-heading-icon">
              <UserPlus aria-hidden="true" />
            </span>
            <div>
              <h2 id="add-friend-title">Thêm bạn</h2>
              <p>Tìm kiếm bằng số điện thoại</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <X aria-hidden="true" />
          </button>
        </header>

        <form className="add-friend-search" onSubmit={search}>
          <label htmlFor="friend-phone">Số điện thoại</label>
          <div>
            <Search aria-hidden="true" />
            <input
              id="friend-phone"
              value={phone}
              onChange={(event) => updatePhone(event.target.value)}
              placeholder="Nhập số điện thoại"
              inputMode="tel"
              autoComplete="tel"
              autoFocus
              disabled={sending}
            />
            <button
              type="submit"
              disabled={searching || sending || !phone.trim()}
            >
              {searching ? 'Đang tìm…' : 'Tìm kiếm'}
            </button>
          </div>
        </form>

        <div className="add-friend-content" aria-live="polite">
          {error && <p className="add-friend-error">{error}</p>}

          {!user && !error && !searching && (
            <div className="add-friend-empty">
              <Search aria-hidden="true" />
              <strong>Tìm một người bạn</strong>
              <span>Nhập số điện thoại để xem tài khoản của họ.</span>
            </div>
          )}

          {searching && (
            <div className="add-friend-empty">
              <span className="add-friend-spinner" aria-hidden="true" />
              <strong>Đang tìm kiếm…</strong>
            </div>
          )}

          {user && (
            <article className="add-friend-result">
              <div className="add-friend-avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" />
                ) : (
                  user.username[0]?.toUpperCase()
                )}
              </div>
              <div className="add-friend-user-copy">
                <strong>{user.username}</strong>
                <span>Tài khoản ChatApp</span>
              </div>

              {status === 'none' && (
                <button
                  className="add-friend-submit"
                  type="button"
                  disabled={sending}
                  onClick={sendRequest}
                >
                  <UserPlus aria-hidden="true" />
                  {sending ? 'Đang gửi…' : 'Kết bạn'}
                </button>
              )}

              {(status === 'outgoing' || status === 'sent') && (
                <span className="add-friend-status pending">
                  <Clock3 aria-hidden="true" /> Đã gửi lời mời
                </span>
              )}

              {status === 'incoming' && (
                <span className="add-friend-status incoming">
                  <UserPlus aria-hidden="true" /> Đã gửi lời mời cho bạn
                </span>
              )}

              {status === 'friends' && (
                <span className="add-friend-status friends">
                  <UserCheck aria-hidden="true" /> Đã là bạn bè
                </span>
              )}

              {status === 'self' && (
                <span className="add-friend-status self">
                  <Check aria-hidden="true" /> Đây là bạn
                </span>
              )}
            </article>
          )}
        </div>
      </section>
    </div>
  )
}
