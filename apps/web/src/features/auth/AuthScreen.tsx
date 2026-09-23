import { useState } from 'react'
import type { FormEvent } from 'react'
import type { User } from '../../shared/types/user'
import {
  readUsers,
  saveSession,
  saveUsers,
} from '../../shared/lib/auth-storage'
import { AuthArtwork } from './components/AuthArtwork'
import { Field, GenderIcon, VisibilityIcon } from './components/FormField'

type AuthMode = 'login' | 'register'

export function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (user: User) => void
}) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [genderOpen, setGenderOpen] = useState(false)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
    birthday: '',
    gender: '',
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
      setError('Enter a valid email and a password with at least 8 characters.')
      return
    }

    if (mode === 'login') {
      const user = users.find(
        (item) => item.email === email && item.password === form.password,
      )
      if (!user) {
        setError(
          'Incorrect email or password. Create an account first if you are new.',
        )
        return
      }
      saveSession(user)
      onAuthenticated(user)
      return
    }

    if (
      !form.username.trim() ||
      !form.phone.trim() ||
      !form.birthday ||
      !form.gender
    ) {
      setError('Please complete all required registration fields.')
      return
    }
    if (form.password !== form.confirm) {
      setError('The password confirmation does not match.')
      return
    }
    if (users.some((item) => item.email === email)) {
      setError('This email is already in use.')
      return
    }

    const user: User = {
      ...form,
      email,
      username: form.username.trim().toLowerCase(),
    }
    saveUsers([...users, user])
    saveSession(user)
    onAuthenticated(user)
  }

  const switchMode = () => {
    setMode((current) => (current === 'login' ? 'register' : 'login'))
    setError('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setGenderOpen(false)
  }

  return (
    <main className="auth-layout">
      <AuthArtwork />
      <section className="auth-form-area">
        <form className={`auth-card auth-card--${mode}`} onSubmit={submit}>
          <div className="auth-mobile-brand">
            <span>✦</span> Nexus
          </div>
          <span className="auth-kicker">
            {mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}
          </span>
          <h2>
            {mode === 'login' ? 'Sign in to Nexus' : 'Create your account'}
          </h2>
          <p className="auth-description">
            {mode === 'login'
              ? 'Enter your details to continue to your conversations.'
              : 'Set up your profile and start chatting with your team.'}
          </p>
          <p className="auth-switch">
            {mode === 'login'
              ? "Don't have an account?"
              : 'Already have an account?'}{' '}
            <button type="button" onClick={switchMode}>
              {mode === 'login' ? 'Sign up now' : 'Sign in'}
            </button>
          </p>

          {error && <div className="form-error">⚠ {error}</div>}

          {mode === 'register' && (
            <>
              <div className="form-grid">
                <Field
                  label="Username"
                  icon="user"
                  value={form.username}
                  onChange={(value) => update('username', value)}
                  placeholder="your_username"
                  autoComplete="username"
                />
                <Field
                  label="Phone number"
                  icon="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(value) => update('phone', value)}
                  placeholder="0912 345 678"
                  autoComplete="tel"
                />
              </div>
              <div className="form-grid">
                <fieldset className="field gender-field">
                  <legend>Gender</legend>
                  <div className="gender-picker">
                    <button
                      type="button"
                      className={
                        genderOpen ? 'gender-trigger open' : 'gender-trigger'
                      }
                      onClick={() => setGenderOpen((open) => !open)}
                      aria-expanded={genderOpen}
                    >
                      {form.gender ? (
                        <GenderIcon
                          gender={form.gender as 'MALE' | 'FEMALE' | 'OTHER'}
                        />
                      ) : (
                        <GenderIcon gender="SELECTOR" />
                      )}
                      <span>
                        {form.gender
                          ? form.gender.charAt(0) +
                            form.gender.slice(1).toLowerCase()
                          : 'Select gender'}
                      </span>
                      <svg
                        className="select-chevron"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
                      </svg>
                    </button>

                    {genderOpen && (
                      <div className="gender-menu" role="listbox">
                        {(['MALE', 'FEMALE', 'OTHER'] as const).map(
                          (gender) => (
                            <button
                              key={gender}
                              type="button"
                              className={
                                form.gender === gender ? 'selected' : ''
                              }
                              onClick={() => {
                                update('gender', gender)
                                setGenderOpen(false)
                              }}
                              role="option"
                              aria-selected={form.gender === gender}
                            >
                              <span className="gender-option-icon">
                                <GenderIcon gender={gender} />
                              </span>
                              <span>
                                {gender === 'MALE'
                                  ? 'Male'
                                  : gender === 'FEMALE'
                                    ? 'Female'
                                    : 'Other'}
                              </span>
                              {form.gender === gender && (
                                <span className="gender-check">✓</span>
                              )}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </fieldset>
                <Field
                  label="Birthday"
                  icon="calendar"
                  type="date"
                  value={form.birthday}
                  onChange={(value) => update('birthday', value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </>
          )}

          <Field
            label="Email address"
            icon="mail"
            type="email"
            value={form.email}
            onChange={(value) => update('email', value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Field
            label="Password"
            icon="lock"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(value) => update('password', value)}
            placeholder="At least 8 characters"
            autoComplete={
              mode === 'login' ? 'current-password' : 'new-password'
            }
            action={
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <VisibilityIcon visible={showPassword} />
              </button>
            }
          />

          {mode === 'register' && (
            <Field
              label="Confirm password"
              icon="lock"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirm}
              onChange={(value) => update('confirm', value)}
              placeholder="Enter your password again"
              autoComplete="new-password"
              action={
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  <VisibilityIcon visible={showConfirmPassword} />
                </button>
              }
            />
          )}
          {mode === 'login' && (
            <button className="forgot" type="button">
              Forgot password?
            </button>
          )}
          <button className="primary-button" type="submit">
            {mode === 'login' ? 'Sign in' : 'Create account'} <span>→</span>
          </button>
          {mode === 'register' && (
            <p className="terms-note">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          )}
          <p className="demo-note">
            <span /> Demo mode · Your data stays in this browser
          </p>
        </form>
      </section>
    </main>
  )
}
