import { MessageCircle, UserMinus, UsersRound } from 'lucide-react'
import type { Friend } from './friendship-types'

type FriendsListProps = {
  friends: Friend[]
  pendingAction: string | null
  onRemove: (friend: Friend) => void
}

function formatFriendsSince(value: string | null): string {
  if (!value) return 'Bạn bè'

  return `Bạn bè từ ${new Intl.DateTimeFormat('vi-VN', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))}`
}

export function FriendsList({
  friends,
  pendingAction,
  onRemove,
}: FriendsListProps) {
  if (friends.length === 0) {
    return (
      <div className="friendship-empty">
        <UsersRound aria-hidden="true" />
        <strong>Danh sách bạn bè đang trống</strong>
        <span>Tìm người quen bằng số điện thoại để bắt đầu kết nối.</span>
      </div>
    )
  }

  return (
    <div className="friendship-list">
      {friends.map((friend) => {
        return (
          <article className="friendship-card" key={friend.friendshipId}>
            <div className="friendship-avatar">
              {friend.user?.avatarUrl ? (
                <img src={friend.user.avatarUrl} alt="" />
              ) : (
                friend.user?.username[0]?.toUpperCase() ?? '?'
              )}
            </div>
            <div className="friendship-card-copy">
              <strong>{friend.user?.username ?? 'Tài khoản không khả dụng'}</strong>
              <span>{formatFriendsSince(friend.friendsSince)}</span>
            </div>
            <div className="friendship-card-actions">
              <button
                className="friendship-icon-action"
                type="button"
                disabled
                aria-label={`Nhắn tin với ${friend.user?.username ?? 'người bạn này'}`}
                title="Tính năng nhắn tin đang phát triển"
              >
                <MessageCircle aria-hidden="true" />
              </button>
              <button
                className="friendship-icon-action danger"
                type="button"
                disabled={pendingAction !== null || !friend.user}
                aria-label={`Xóa ${friend.user?.username ?? 'người dùng'} khỏi danh sách bạn`}
                title="Xóa bạn"
                onClick={() => onRemove(friend)}
              >
                <UserMinus aria-hidden="true" />
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
