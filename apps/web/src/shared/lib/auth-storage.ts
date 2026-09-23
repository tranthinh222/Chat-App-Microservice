import type { User } from "../types/user"

export const USERS_KEY = 'chat-app-users'
export const SESSION_KEY = 'chat-app-session'

export function readUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function readSession(): User | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") } catch { return null }
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function saveSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}