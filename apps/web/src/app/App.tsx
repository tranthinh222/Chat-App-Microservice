import { useState } from "react"
import { AuthScreen } from "../features/auth/AuthScreen"
import { ChatScreen } from "../features/chat/ChatScreen"
import { clearSession, readSession } from "../shared/lib/auth-storage"
import type { User } from "../shared/types/user"

function App() {
  const [user, setUser] = useState<User | null>(readSession)

  const logout = () => {
    clearSession()
    setUser(null)
  }

  return user ? (
    <ChatScreen user={user} onLogout={logout} />
  ) : (
    <AuthScreen onAuthenticated={setUser} />
  )
}

export default App
