import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { User } from '../../shared/types/user'
import { conversations, initialMessages } from './data'

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
  const active = useMemo(
    () =>
      conversations.find((item) => item.id === activeId) ?? conversations[0],
    [activeId],
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
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ])
    setMessage('')
  }

  return (
    <main className="chat-app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>✦</span> Nexus <button>⌘K</button>
        </div>
        <div className="profile-strip">
          <div className="avatar self">{user.username[0]?.toUpperCase()}</div>
          <div>
            <strong>{user.username}</strong>
            <small>
              <i /> Active now
            </small>
          </div>
          <button onClick={onLogout} title="Sign out">
            ↪
          </button>
        </div>
        <div className="search">
          ⌕ <input placeholder="Search conversations" />
        </div>
        <div className="section-label">
          <span>Messages</span>
          <button>＋</button>
        </div>
        <div className="conversation-list">
          {conversations.map((item) => (
            <button
              key={item.id}
              className={
                item.id === activeId ? 'conversation active' : 'conversation'
              }
              onClick={() => setActiveId(item.id)}
            >
              <span className="avatar" style={{ background: item.color }}>
                {item.initials}
              </span>
              <span className="conversation-copy">
                <strong>{item.name}</strong>
                <small>{item.message}</small>
              </span>
              <span className="conversation-meta">
                <small>{item.time}</small>
                {item.unread > 0 && <b>{item.unread}</b>}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="chat-panel">
        <header className="chat-header">
          <div className="avatar" style={{ background: active.color }}>
            {active.initials}
          </div>
          <div>
            <strong>{active.name}</strong>
            <small>
              <i /> Active now
            </small>
          </div>
          <div className="header-actions">
            <button>☎</button>
            <button>⌕</button>
            <button>•••</button>
          </div>
        </header>
        <div className="messages">
          <div className="day-divider">
            <span>Today</span>
          </div>
          {messages.map((item) => (
            <div
              key={item.id}
              className={item.mine ? 'message-row mine' : 'message-row'}
            >
              {!item.mine && (
                <span
                  className="avatar small"
                  style={{ background: active.color }}
                >
                  {active.initials[0]}
                </span>
              )}
              <div>
                <div className="bubble">{item.text}</div>
                <small>{item.time}</small>
              </div>
            </div>
          ))}
        </div>
        <form className="composer" onSubmit={send}>
          <button type="button">＋</button>
          <div>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message ${active.name}`}
            />
            <button type="button">☺</button>
          </div>
          <button className="send" type="submit">
            ➤
          </button>
        </form>
      </section>
    </main>
  )
}
