import { useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import './App.css'

type User = {
  username: string
  email: string
  password: string
  phone: string
  birthday: string
  gender: string
}

type AuthMode = 'login' | 'register'

const USERS_KEY = 'chat-app-users'
const SESSION_KEY = 'chat-app-session'

const conversations = [
  { id: 1, name: 'Linh Nguyễn', initials: 'LN', color: '#5b7fff', message: 'Thiết kế mới trông rất đẹp! 🎨', time: '00:42', unread: 2 },
  { id: 2, name: 'Team Sản phẩm', initials: 'SP', color: '#a78bfa', message: 'Huy: PR đã merge rồi nhé', time: 'Hôm qua', unread: 0 },
  { id: 3, name: 'Minh Anh', initials: 'MA', color: '#34c759', message: 'Cảm ơn bạn nhiều!', time: 'T.7', unread: 0 },
  { id: 4, name: 'Design Squad', initials: 'DS', color: '#ff9500', message: 'Bạn đã gửi một tệp', time: 'T.6', unread: 0 },
]

const initialMessages = [
  { id: 1, mine: false, text: 'Chào bạn! Bản thiết kế trang chat đã xong rồi nè 👋', time: '00:38' },
  { id: 2, mine: true, text: 'Tuyệt quá, gửi mình xem với nhé!', time: '00:39' },
  { id: 3, mine: false, text: 'Thiết kế mới trông rất đẹp! 🎨', time: '00:42' },
]

function readUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function AuthArtwork() {
  return (
    <aside className="auth-artwork">
      <div className="brand"><span>✦</span> Nexus</div>
      <div className="floating-messages">
        <div><span className="mini-avatar blue">L</span>Thiết kế mới trông rất đẹp! 🎨</div>
        <div>Cảm ơn! Mình gửi file ngay nhé <span className="mini-avatar green">T</span></div>
        <div><span className="mini-avatar purple">H</span>PR đã merge rồi! Cảm ơn team 🎉</div>
      </div>
      <div>
        <h1>Kết nối &amp; <em>cộng tác</em><br />mọi lúc mọi nơi</h1>
        <p>Nhắn tin, chia sẻ file, và làm việc nhóm hiệu quả hơn với Nexus Chat.</p>
      </div>
    </aside>
  )
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm: '', phone: '', birthday: '', gender: '',
  })

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const users = readUsers()
    const email = form.email.trim().toLowerCase()

    if (!email.includes('@') || form.password.length < 8) {
      setError('Email không hợp lệ hoặc mật khẩu chưa đủ 8 ký tự.')
      return
    }

    if (mode === 'login') {
      const user = users.find((item) => item.email === email && item.password === form.password)
      if (!user) {
        setError('Email hoặc mật khẩu không đúng. Hãy đăng ký tài khoản trước.')
        return
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))
      onAuthenticated(user)
      return
    }

    if (!form.username.trim() || !form.phone.trim() || !form.birthday || !form.gender) {
      setError('Vui lòng nhập đầy đủ thông tin đăng ký.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    if (users.some((item) => item.email === email)) {
      setError('Email này đã được sử dụng.')
      return
    }

    const user: User = { ...form, email, username: form.username.trim().toLowerCase() }
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]))
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    onAuthenticated(user)
  }

  const switchMode = () => {
    setMode((current) => current === 'login' ? 'register' : 'login')
    setError('')
  }

  return (
    <main className="auth-layout">
      <AuthArtwork />
      <section className="auth-form-area">
        <form className="auth-card" onSubmit={submit}>
          <h2>{mode === 'login' ? 'Chào mừng trở lại 👋' : 'Tạo tài khoản ✨'}</h2>
          <p className="auth-switch">
            {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
            <button type="button" onClick={switchMode}>{mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}</button>
          </p>

          {error && <div className="form-error">⚠ {error}</div>}

          {mode === 'register' && (
            <>
              <Field label="Tên người dùng" icon="👤" value={form.username} onChange={(value) => update('username', value)} placeholder="thinhtran" />
              <div className="form-grid">
                <label className="field"><span>Giới tính</span><div><b>👫</b><select value={form.gender} onChange={(e) => update('gender', e.target.value)} required><option value="">Chọn giới tính</option><option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option></select></div></label>
                <Field label="Ngày sinh" icon="🎂" type="date" value={form.birthday} onChange={(value) => update('birthday', value)} />
              </div>
              <Field label="Số điện thoại" icon="📱" type="tel" value={form.phone} onChange={(value) => update('phone', value)} placeholder="0912 345 678" />
            </>
          )}

          <Field label="Email" icon="✉️" type="email" value={form.email} onChange={(value) => update('email', value)} placeholder="ten@email.com" />
          <Field label="Mật khẩu" icon="🔒" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(value) => update('password', value)} placeholder="Tối thiểu 8 ký tự" action={<button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? '🙈' : '👁️'}</button>} />

          {mode === 'register' && <Field label="Xác nhận mật khẩu" icon="🔒" type="password" value={form.confirm} onChange={(value) => update('confirm', value)} placeholder="Nhập lại mật khẩu" />}
          {mode === 'login' && <button className="forgot" type="button">Quên mật khẩu?</button>}
          <button className="primary-button" type="submit">{mode === 'login' ? 'Đăng nhập →' : 'Tạo tài khoản →'}</button>
          <p className="demo-note">Bản demo FE — dữ liệu chỉ được lưu trên trình duyệt này.</p>
        </form>
      </section>
    </main>
  )
}

function Field({ label, icon, value, onChange, type = 'text', placeholder, action }: {
  label: string; icon: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; action?: ReactNode
}) {
  return <label className="field"><span>{label}</span><div><b>{icon}</b><input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required />{action}</div></label>
}

function ChatScreen({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [activeId, setActiveId] = useState(1)
  const [messages, setMessages] = useState(initialMessages)
  const [message, setMessage] = useState('')
  const active = useMemo(() => conversations.find((item) => item.id === activeId) ?? conversations[0], [activeId])

  const send = (event: FormEvent) => {
    event.preventDefault()
    if (!message.trim()) return
    setMessages((current) => [...current, { id: Date.now(), mine: true, text: message.trim(), time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }])
    setMessage('')
  }

  return (
    <main className="chat-app">
      <aside className="sidebar">
        <div className="sidebar-brand"><span>✦</span> Nexus <button>⌘K</button></div>
        <div className="profile-strip"><div className="avatar self">{user.username[0]?.toUpperCase()}</div><div><strong>{user.username}</strong><small><i /> Đang hoạt động</small></div><button onClick={onLogout} title="Đăng xuất">↪</button></div>
        <div className="search">⌕ <input placeholder="Tìm kiếm cuộc trò chuyện" /></div>
        <div className="section-label"><span>Tin nhắn</span><button>＋</button></div>
        <div className="conversation-list">{conversations.map((item) => <button key={item.id} className={item.id === activeId ? 'conversation active' : 'conversation'} onClick={() => setActiveId(item.id)}><span className="avatar" style={{ background: item.color }}>{item.initials}</span><span className="conversation-copy"><strong>{item.name}</strong><small>{item.message}</small></span><span className="conversation-meta"><small>{item.time}</small>{item.unread > 0 && <b>{item.unread}</b>}</span></button>)}</div>
      </aside>

      <section className="chat-panel">
        <header className="chat-header"><div className="avatar" style={{ background: active.color }}>{active.initials}</div><div><strong>{active.name}</strong><small><i /> Đang hoạt động</small></div><div className="header-actions"><button>☎</button><button>⌕</button><button>•••</button></div></header>
        <div className="messages"><div className="day-divider"><span>Hôm nay</span></div>{messages.map((item) => <div key={item.id} className={item.mine ? 'message-row mine' : 'message-row'}>{!item.mine && <span className="avatar small" style={{ background: active.color }}>{active.initials[0]}</span>}<div><div className="bubble">{item.text}</div><small>{item.time}</small></div></div>)}</div>
        <form className="composer" onSubmit={send}><button type="button">＋</button><div><input value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Nhắn tin cho ${active.name}`} /><button type="button">☺</button></div><button className="send" type="submit">➤</button></form>
      </section>
    </main>
  )
}

function App() {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') } catch { return null }
  })

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return user ? <ChatScreen user={user} onLogout={logout} /> : <AuthScreen onAuthenticated={setUser} />
}

export default App
