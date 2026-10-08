import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, UserRoundPlus, UsersRound } from 'lucide-react'
import { ApiRequestError } from '../../shared/api/http-client'
import {
  acceptFriendRequest,
  cancelFriendRequest,
  getFriendshipOverview,
  rejectFriendRequest,
  removeFriend,
} from './friendship-api'
import type {
  Friend,
  FriendRequest,
  FriendshipOverview,
} from './friendship-types'
import { FriendRequests } from './FriendRequests'
import { FriendsList } from './FriendsList'

type FriendshipTab = 'friends' | 'incoming' | 'outgoing'

type FriendshipPanelProps = {
  refreshKey: number
  onAddFriend: () => void
}

const EMPTY_OVERVIEW: FriendshipOverview = {
  incoming: [],
  outgoing: [],
  friends: [],
}

function getActionError(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message
  return error instanceof Error
    ? error.message
    : 'Không thể thực hiện thao tác lúc này.'
}

export function FriendshipPanel({
  refreshKey,
  onAddFriend,
}: FriendshipPanelProps) {
  const [activeTab, setActiveTab] = useState<FriendshipTab>('friends')
  const [overview, setOverview] = useState(EMPTY_OVERVIEW)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  const loadOverview = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      setOverview(await getFriendshipOverview())
    } catch (requestError) {
      setError(getActionError(requestError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    getFriendshipOverview()
      .then((nextOverview) => {
        if (active) {
          setOverview(nextOverview)
          setError('')
        }
      })
      .catch((requestError: unknown) => {
        if (active) setError(getActionError(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [refreshKey])

  const runAction = async (
    actionKey: string,
    action: () => Promise<void>,
  ) => {
    setPendingAction(actionKey)
    setError('')

    try {
      await action()
    } catch (requestError) {
      setError(getActionError(requestError))
    } finally {
      setPendingAction(null)
    }
  }

  const accept = (request: FriendRequest) =>
    runAction(`accept:${request.requestId}`, async () => {
      const friendship = await acceptFriendRequest(request.requestId)
      setOverview((current) => ({
        ...current,
        incoming: current.incoming.filter(
          (item) => item.requestId !== request.requestId,
        ),
        friends: request.user
          ? [
              {
                friendshipId: friendship.id,
                user: request.user,
                friendsSince: friendship.acceptedAt,
              },
              ...current.friends,
            ]
          : current.friends,
      }))
    })

  const reject = (request: FriendRequest) =>
    runAction(`reject:${request.requestId}`, async () => {
      await rejectFriendRequest(request.requestId)
      setOverview((current) => ({
        ...current,
        incoming: current.incoming.filter(
          (item) => item.requestId !== request.requestId,
        ),
      }))
    })

  const cancel = (request: FriendRequest) =>
    runAction(`cancel:${request.requestId}`, async () => {
      await cancelFriendRequest(request.requestId)
      setOverview((current) => ({
        ...current,
        outgoing: current.outgoing.filter(
          (item) => item.requestId !== request.requestId,
        ),
      }))
    })

  const remove = (friend: Friend) => {
    const friendUser = friend.user
    if (!friendUser) return
    if (!window.confirm(`Xóa ${friendUser.username} khỏi danh sách bạn bè?`)) {
      return
    }

    void runAction(`remove:${friend.friendshipId}`, async () => {
      await removeFriend(friendUser.id)
      setOverview((current) => ({
        ...current,
        friends: current.friends.filter(
          (item) => item.friendshipId !== friend.friendshipId,
        ),
      }))
    })
  }

  const tabs: Array<{ id: FriendshipTab; label: string; count: number }> = [
    { id: 'friends', label: 'Bạn bè', count: overview.friends.length },
    {
      id: 'incoming',
      label: 'Lời mời nhận',
      count: overview.incoming.length,
    },
    {
      id: 'outgoing',
      label: 'Đã gửi',
      count: overview.outgoing.length,
    },
  ]

  return (
    <section className="friendship-workspace">
      <header className="friendship-panel-header">
        <div>
          <span className="friendship-panel-icon">
            <UsersRound aria-hidden="true" />
          </span>
          <div>
            <h1>Danh bạ</h1>
            <p>Quản lý bạn bè và lời mời kết bạn</p>
          </div>
        </div>
        <button className="friendship-add-button" type="button" onClick={onAddFriend}>
          <UserRoundPlus aria-hidden="true" /> Thêm bạn
        </button>
      </header>

      <nav className="friendship-tabs" aria-label="Danh mục bạn bè">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'active' : ''}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} <span>{tab.count}</span>
          </button>
        ))}
      </nav>

      <div className="friendship-panel-body">
        {error && (
          <div className="friendship-panel-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => void loadOverview()}>
              <RefreshCw aria-hidden="true" /> Thử lại
            </button>
          </div>
        )}

        {loading ? (
          <div className="friendship-loading">
            <span className="add-friend-spinner" aria-hidden="true" />
            Đang tải danh bạ…
          </div>
        ) : (
          <>
            {activeTab === 'friends' && (
              <FriendsList
                friends={overview.friends}
                pendingAction={pendingAction}
                onRemove={remove}
              />
            )}
            {activeTab === 'incoming' && (
              <FriendRequests
                requests={overview.incoming}
                direction="incoming"
                pendingAction={pendingAction}
                onAccept={(request) => void accept(request)}
                onReject={(request) => void reject(request)}
              />
            )}
            {activeTab === 'outgoing' && (
              <FriendRequests
                requests={overview.outgoing}
                direction="outgoing"
                pendingAction={pendingAction}
                onCancel={(request) => void cancel(request)}
              />
            )}
          </>
        )}
      </div>
    </section>
  )
}
