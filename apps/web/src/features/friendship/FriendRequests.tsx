import { Check, Clock3, UserRoundX, X } from 'lucide-react'
import type { FriendRequest } from './friendship-types'

type FriendRequestsProps = {
  requests: FriendRequest[]
  direction: 'incoming' | 'outgoing'
  pendingAction: string | null
  onAccept?: (request: FriendRequest) => void
  onReject?: (request: FriendRequest) => void
  onCancel?: (request: FriendRequest) => void
}

function formatRequestDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function FriendRequests({
  requests,
  direction,
  pendingAction,
  onAccept,
  onReject,
  onCancel,
}: FriendRequestsProps) {
  if (requests.length === 0) {
    return (
      <div className="friendship-empty">
        <UserRoundX aria-hidden="true" />
        <strong>Không có lời mời</strong>
        <span>
          {direction === 'incoming'
            ? 'Bạn chưa nhận được lời mời kết bạn nào.'
            : 'Bạn chưa gửi lời mời kết bạn nào.'}
        </span>
      </div>
    )
  }

  return (
    <div className="friendship-list">
      {requests.map((request) => {
        const accepting = pendingAction === `accept:${request.requestId}`
        const rejecting = pendingAction === `reject:${request.requestId}`
        const cancelling = pendingAction === `cancel:${request.requestId}`
        const busy = pendingAction !== null

        return (
          <article className="friendship-card" key={request.requestId}>
            <div className="friendship-avatar">
              {request.user?.avatarUrl ? (
                <img src={request.user.avatarUrl} alt="" />
              ) : (
                request.user?.username[0]?.toUpperCase() ?? '?'
              )}
            </div>
            <div className="friendship-card-copy">
              <strong>{request.user?.username ?? 'Tài khoản không khả dụng'}</strong>
              <span>
                <Clock3 aria-hidden="true" />
                {formatRequestDate(request.createdAt)}
              </span>
            </div>

            <div className="friendship-card-actions">
              {direction === 'incoming' ? (
                <>
                  <button
                    className="friendship-action primary"
                    type="button"
                    disabled={busy}
                    onClick={() => onAccept?.(request)}
                  >
                    <Check aria-hidden="true" />
                    {accepting ? 'Đang nhận…' : 'Chấp nhận'}
                  </button>
                  <button
                    className="friendship-action"
                    type="button"
                    disabled={busy}
                    onClick={() => onReject?.(request)}
                  >
                    <X aria-hidden="true" />
                    {rejecting ? 'Đang từ chối…' : 'Từ chối'}
                  </button>
                </>
              ) : (
                <button
                  className="friendship-action danger"
                  type="button"
                  disabled={busy}
                  onClick={() => onCancel?.(request)}
                >
                  <X aria-hidden="true" />
                  {cancelling ? 'Đang huỷ…' : 'Huỷ lời mời'}
                </button>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
