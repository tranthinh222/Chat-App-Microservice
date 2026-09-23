import { useState } from 'react'
import type { FormEvent } from 'react'
import type { User } from '../../shared/types/user'
import { saveSession } from '../../shared/lib/auth-storage'
import { login, register } from './auth-api'
import { AuthArtwork } from './components/AuthArtwork'
import { Field, GenderIcon, VisibilityIcon } from './components/FormField'

type AuthMode = 'login' | 'register'
type Gender = User['gender']

type AuthScreenProps = {
  onAuthenticated: (user: User) => void
}

type AuthForm = {
  username: string
  email: string
  password: string
  confirm: string
  phone: string
  birthday: string
  gender: Gender | ''
}

const INITIAL_FORM: AuthForm = {
  username: '',
  email: '',
  password: '',
  confirm: '',
  phone: '',
  birthday: '',
  gender: '',
}

const GENDERS: Gender[] = ['MALE', 'FEMALE', 'OTHER']

const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [genderOpen, setGenderOpen] = useState(false)
  const [form, setForm] = useState<AuthForm>(INITIAL_FORM)

  const isRegisterMode = mode === 'register'
  const today = new Date().toISOString().split('T')[0]
  const kicker = isRegisterMode ? 'GET STARTED' : 'WELCOME BACK'
  const title = isRegisterMode ? 'Create your account' : 'Sign in to Nexus'
  const description = isRegisterMode
    ? 'Set up your profile and start chatting with your team.'
    : 'Enter your details to continue to your conversations.'
  const switchPrompt = isRegisterMode
    ? 'Already have an account?'
    : "Don't have an account?"
  const switchAction = isRegisterMode ? 'Sign in' : 'Sign up now'
  const submitLabel = isRegisterMode ? 'Create account' : 'Sign in'
  const passwordAutoComplete = isRegisterMode
    ? 'new-password'
    : 'current-password'
  const selectedGenderLabel = form.gender
    ? GENDER_LABELS[form.gender]
    : 'Select gender'

  const updateField = (field: keyof AuthForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const validateForm = (): string | null => {
    const email = form.email.trim()

    if (!email.includes('@') || form.password.length < 8) {
      return 'Enter a valid email and a password with at least 8 characters.'
    }

    if (!isRegisterMode) {
      return null
    }

    const hasMissingRegistrationField =
      !form.username.trim() ||
      !form.phone.trim() ||
      !form.birthday ||
      !form.gender

    if (hasMissingRegistrationField) {
      return 'Please complete all required registration fields.'
    }

    if (form.password !== form.confirm) {
      return 'The password confirmation does not match.'
    }

    return null
  }

  const registerUser = async (email: string): Promise<void> => {
    if (!form.gender) {
      return
    }

    await register({
      email,
      password: form.password,
      username: form.username.trim().toLowerCase(),
      phone: form.phone.trim().replace(/\s/g, ''),
      birthday: form.birthday,
      gender: form.gender,
    })
  }

  const completeAuthentication = async (email: string): Promise<void> => {
    if (isRegisterMode) {
      await registerUser(email)
    }

    const session = await login({
      email,
      password: form.password,
    })

    saveSession(session)
    onAuthenticated(session.user)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const email = form.email.trim().toLowerCase()
      await completeAuthentication(email)
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Unable to connect to the server.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    const nextMode: AuthMode = isRegisterMode ? 'login' : 'register'

    setMode(nextMode)
    setError('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setGenderOpen(false)
  }

  const selectGender = (gender: Gender) => {
    updateField('gender', gender)
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
          <span className="auth-kicker">{kicker}</span>
          <h2>{title}</h2>
          <p className="auth-description">{description}</p>
          <p className="auth-switch">
            {switchPrompt}{' '}
            <button type="button" onClick={switchMode}>
              {switchAction}
            </button>
          </p>

          {error && <div className="form-error">⚠ {error}</div>}

          {isRegisterMode && (
            <>
              <div className="form-grid">
                <Field
                  label="Username"
                  icon="user"
                  value={form.username}
                  onChange={(value) => updateField('username', value)}
                  placeholder="your_username"
                  autoComplete="username"
                />
                <Field
                  label="Phone number"
                  icon="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(value) => updateField('phone', value)}
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
                      <GenderIcon gender={form.gender || 'SELECTOR'} />
                      <span>{selectedGenderLabel}</span>
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
                        {GENDERS.map((gender) => (
                          <button
                            key={gender}
                            type="button"
                            className={
                              form.gender === gender ? 'selected' : ''
                            }
                            onClick={() => selectGender(gender)}
                            role="option"
                            aria-selected={form.gender === gender}
                          >
                            <span className="gender-option-icon">
                              <GenderIcon gender={gender} />
                            </span>
                            <span>{GENDER_LABELS[gender]}</span>
                            {form.gender === gender && (
                              <span className="gender-check">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </fieldset>
                <Field
                  label="Birthday"
                  icon="calendar"
                  type="date"
                  value={form.birthday}
                  onChange={(value) => updateField('birthday', value)}
                  max={today}
                />
              </div>
            </>
          )}

          <Field
            label="Email address"
            icon="mail"
            type="email"
            value={form.email}
            onChange={(value) => updateField('email', value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Field
            label="Password"
            icon="lock"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(value) => updateField('password', value)}
            placeholder="At least 8 characters"
            autoComplete={passwordAutoComplete}
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

          {isRegisterMode && (
            <Field
              label="Confirm password"
              icon="lock"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirm}
              onChange={(value) => updateField('confirm', value)}
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
          {!isRegisterMode && (
            <button className="forgot" type="button">
              Forgot password?
            </button>
          )}
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : submitLabel}{' '}
            <span>→</span>
          </button>
          {isRegisterMode && (
            <p className="terms-note">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          )}
          <p className="demo-note">
            <span /> Connected through the secure API gateway
          </p>
        </form>
      </section>
    </main>
  )
}
