import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import {
  AudioWaveform,
  BriefcaseBusiness,
  CloudLightning,
  Contact,
  ContactRound,
  CreditCard,
  Ellipsis,
  FolderOpen,
  ImageIcon,
  LogOut,
  MessageCircleMore,
  MessageSquareMore,
  Paperclip,
  Pilcrow,
  Plus,
  ScanText,
  SendHorizontal,
  Settings,
  Smile,
  Sticker,
  ThumbsUp,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react'
import type { User } from '../../shared/types/user'
import { ProfileModal } from '../profile/ProfileModal'
import { conversations, initialMessages } from './data'

type ToolButtonProps = {
  children: ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

function ToolButton({ children, label, active, onClick }: ToolButtonProps) {
  return (
    <button
      type="button"
      className={active ? 'zalo-tool active' : 'zalo-tool'}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function ChatScreen({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const [activeId, setActiveId] = useState(1)
  const [messages, setMessages] = useState(initialMessages)
  const [message, setMessage] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [conversationFilter, setConversationFilter] = useState<
    'all' | 'unread'
  >('all')

  const active = useMemo(
    () =>
      conversations.find((item) => item.id === activeId) ?? conversations[0],
    [activeId],
  )

  const visibleConversations = useMemo(
    () =>
      conversationFilter === 'unread'
        ? conversations.filter((item) => item.unread > 0)
        : conversations,
    [conversationFilter],
  )

  const send = (event: FormEvent) => {
    event.preventDefault()
    if (!message.trim()) return

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        mine: true,
        text: message.trim(),
        time: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ])
    setMessage('')
  }

  return (
    <main className="zalo-layout">
      <nav className="zalo-rail" aria-label="Điều hướng chính">
        <button
          type="button"
          className="zalo-self-avatar"
          onClick={() => setProfileOpen(true)}
          aria-label="Mở thông tin tài khoản"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" />
          ) : (
            user.username[0]?.toUpperCase()
          )}
        </button>

        <div className="zalo-rail-primary">
          <ToolButton label="Tin nhắn" active>
            <MessageCircleMore />
          </ToolButton>
          <ToolButton label="Danh bạ">
            <ContactRound />
          </ToolButton>
        </div>

        <div className="zalo-rail-middle">
          <ToolButton label="Tin nhắn thoại">
            <AudioWaveform />
          </ToolButton>
        </div>

        <div className="zalo-rail-secondary">
          <ToolButton label="Lưu trữ đám mây">
            <CloudLightning />
          </ToolButton>
          <ToolButton label="Thư mục cloud">
            <FolderOpen />
          </ToolButton>
          <ToolButton label="Công việc">
            <BriefcaseBusiness />
          </ToolButton>
          <ToolButton label="Cài đặt">
            <Settings />
          </ToolButton>
          <ToolButton label="Đăng xuất" onClick={onLogout}>
            <LogOut />
          </ToolButton>
        </div>
      </nav>

      <aside className="zalo-conversations">
        <div className="zalo-search-row">
          <label className="zalo-search-box">
            <span>⌕</span>
            <input placeholder="Tìm kiếm" aria-label="Tìm kiếm hội thoại" />
          </label>
          <ToolButton label="Thêm bạn">
            <UserRoundPlus className="zalo-action-icon" aria-hidden="true" />
          </ToolButton>
          <ToolButton label="Tạo nhóm">
            <span className="zalo-group-add-icon" aria-hidden="true">
              <UsersRound />
              <Plus />
            </span>
          </ToolButton>
        </div>

        <div className="zalo-filter-row">
          <div className="zalo-filter-tabs">
            <button
              type="button"
              className={conversationFilter === 'all' ? 'active' : ''}
              onClick={() => setConversationFilter('all')}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={conversationFilter === 'unread' ? 'active' : ''}
              onClick={() => setConversationFilter('unread')}
            >
              Chưa đọc
            </button>
          </div>
          <button type="button" className="zalo-sort">
            Phân loại⌄
          </button>
          <button type="button" className="zalo-more" aria-label="Tùy chọn">
            •••
          </button>
        </div>

        <div className="zalo-conversation-list">
          {visibleConversations.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                item.id === activeId
                  ? 'zalo-conversation active'
                  : 'zalo-conversation'
              }
              onClick={() => setActiveId(item.id)}
            >
              <span className="zalo-avatar" style={{ background: item.color }}>
                {item.initials}
              </span>
              <span className="zalo-conversation-copy">
                <span className="zalo-conversation-topline">
                  <strong>{item.name}</strong>
                  <time>{item.time}</time>
                </span>
                <span className="zalo-conversation-preview">
                  <span>{item.message}</span>
                  {item.unread > 0 && <b>{item.unread}</b>}
                </span>
              </span>
            </button>
          ))}

          {visibleConversations.length === 0 && (
            <p className="zalo-empty-list">Không có tin nhắn chưa đọc</p>
          )}
        </div>
      </aside>

      <section className="zalo-chat-panel">
        <header className="zalo-chat-header">
          <span className="zalo-avatar" style={{ background: active.color }}>
            {active.initials}
          </span>
          <div className="zalo-contact-copy">
            <strong>{active.name}</strong>
            <small>
              <i /> Đang hoạt động
            </small>
          </div>
          <div className="zalo-header-actions">
            <ToolButton label="Thêm vào nhóm">♙＋</ToolButton>
            <ToolButton label="Tìm trong trò chuyện">⌕</ToolButton>
            <ToolButton label="Thông tin hội thoại">▣</ToolButton>
          </div>
        </header>

        <div className="zalo-messages">
          <div className="zalo-day-label">Hôm nay</div>
          {messages.map((item) => (
            <div
              key={item.id}
              className={
                item.mine ? 'zalo-message-row mine' : 'zalo-message-row'
              }
            >
              {!item.mine && (
                <span
                  className="zalo-avatar message-avatar"
                  style={{ background: active.color }}
                >
                  {active.initials[0]}
                </span>
              )}
              <div className="zalo-message-bubble">
                <p>{item.text}</p>
                <time>{item.time}</time>
              </div>
            </div>
          ))}
        </div>

        <div className="zalo-composer-tools">
          <ToolButton label="Gửi sticker">
            <Sticker />
          </ToolButton>
          <ToolButton label="Gửi hình ảnh">
            <ImageIcon />
          </ToolButton>
          <ToolButton label="Đính kèm tệp">
            <Paperclip />
          </ToolButton>
          <ToolButton label="Gửi danh thiếp">
            <Contact />
          </ToolButton>
          <ToolButton label="Trích xuất văn bản">
            <ScanText />
          </ToolButton>
          <ToolButton label="Định dạng văn bản">
            <Pilcrow />
          </ToolButton>
          <ToolButton label="Tin nhắn nhanh">
            <MessageSquareMore />
          </ToolButton>
          <ToolButton label="Gửi danh thiếp điện tử">
            <CreditCard />
          </ToolButton>
          <ToolButton label="Thêm tùy chọn">
            <Ellipsis />
          </ToolButton>
        </div>

        <form className="zalo-composer" onSubmit={send}>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={`Nhập @, tin nhắn tới ${active.name}`}
            aria-label="Nội dung tin nhắn"
          />
          <ToolButton label="Biểu tượng cảm xúc">
            <Smile />
          </ToolButton>
          <button
            className={message.trim() ? 'zalo-send has-message' : 'zalo-send like'}
            type={message.trim() ? 'submit' : 'button'}
            aria-label={message.trim() ? 'Gửi tin nhắn' : 'Gửi lượt thích'}
            title={message.trim() ? 'Gửi tin nhắn' : 'Gửi lượt thích'}
          >
            {message.trim() ? <SendHorizontal /> : <ThumbsUp />}
          </button>
        </form>
      </section>

      {profileOpen && (
        <ProfileModal user={user} onClose={() => setProfileOpen(false)} />
      )}
    </main>
  )
}
