'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, type ReactNode, useState, useTransition } from 'react'
import { login, logout, signup, type AuthActionResult, type SignupInput } from './actions'

type FormFields = SignupInput
type Viewer = { email: string; firstName: string }

const initialForm: FormFields = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  terms: false,
}

function Logo() {
  return (
    <div className="flex items-center gap-3" aria-label="Atelier">
      <span className="grid size-9 place-items-center rounded-xl bg-[#ff6b4a] text-white shadow-[0_6px_18px_rgba(255,107,74,.25)]">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
          <path
            d="M5 16.5 12 4l7 12.5M8 12h8"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display text-xl font-bold tracking-[-0.03em] text-[#17211e]">
        atelier
      </span>
    </div>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  autoComplete,
  suffix,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  error?: string
  autoComplete?: string
  suffix?: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[#26322e]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-12 w-full rounded-xl border bg-white px-4 text-[15px] text-[#17211e] outline-none transition placeholder:text-[#99a39f] focus:ring-4 ${
            error
              ? 'border-[#db563c] focus:border-[#db563c] focus:ring-[#db563c]/10'
              : 'border-[#dce2df] hover:border-[#bdc8c3] focus:border-[#ff6b4a] focus:ring-[#ff6b4a]/10'
          } ${suffix ? 'pr-12' : ''}`}
        />
        {suffix}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-[#c74630]">
          {error}
        </p>
      )}
    </div>
  )
}

export function RegistrationForm({ initialUser }: { initialUser: Viewer | null }) {
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormFields, string>>>({})
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [viewer, setViewer] = useState<Viewer | null>(initialUser)
  const [justRegistered, setJustRegistered] = useState(false)
  const [isPending, startTransition] = useTransition()

  const updateField = <K extends keyof FormFields>(field: K, value: FormFields[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
    if (formError) setFormError('')
  }

  const applyResult = (result: AuthActionResult, registered: boolean) => {
    if (!result.success) {
      setErrors(result.fieldErrors ?? {})
      setFormError(result.formError ?? '')
      return
    }

    setViewer(result.user)
    setJustRegistered(registered)
    setForm(initialForm)
    setErrors({})
    setFormError('')
    router.refresh()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')

    startTransition(async () => {
      const result =
        mode === 'signup'
          ? await signup(form)
          : await login({ email: form.email, password: form.password })
      applyResult(result, mode === 'signup')
    })
  }

  const switchMode = (nextMode: 'login' | 'signup') => {
    setMode(nextMode)
    setErrors({})
    setFormError('')
    setShowPassword(false)
  }

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
      setViewer(null)
      setJustRegistered(false)
      switchMode('signup')
      router.refresh()
    })
  }

  return (
    <main className="min-h-screen bg-[#f6f8f4] text-[#17211e]">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-[#1d5145] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-20 top-[35%] size-72 rounded-full border border-white/10" />
          <div className="absolute -left-6 top-[41%] size-48 rounded-full border border-white/10" />
          <div className="absolute -right-24 -top-24 size-80 rounded-full bg-[#3f7b69] opacity-50 blur-sm" />
          <div className="relative z-10 flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[#ff7a59] text-white">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
                <path
                  d="M5 16.5 12 4l7 12.5M8 12h8"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-display text-xl font-bold tracking-[-0.03em]">atelier</span>
          </div>

          <div className="relative z-10 max-w-lg pb-12">
            <div className="mb-8 flex -space-x-2">
              {[
                ['MC', 'bg-[#ffd9ad] text-[#824b20]'],
                ['AL', 'bg-[#c8dfff] text-[#315381]'],
                ['YT', 'bg-[#ffb9a9] text-[#813a2b]'],
              ].map(([initials, color]) => (
                <span
                  key={initials}
                  className={`grid size-10 place-items-center rounded-full border-2 border-[#1d5145] text-[11px] font-bold ${color}`}
                >
                  {initials}
                </span>
              ))}
              <span className="grid size-10 place-items-center rounded-full border-2 border-[#1d5145] bg-white/15 text-sm font-semibold backdrop-blur-sm">
                +2k
              </span>
            </div>
            <h1 className="font-display text-[clamp(2.6rem,4vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.055em]">
              Donnez vie à vos idées, ensemble.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-[#d3e4de]">
              Rejoignez une communauté créative et transformez vos projets en expériences
              mémorables.
            </p>
          </div>

          <p className="relative z-10 text-xs font-medium tracking-wide text-white/55">
            UN ESPACE POUR CRÉER, PARTAGER, GRANDIR.
          </p>
        </section>

        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16 lg:py-10 xl:px-24">
          <div className="flex items-center justify-between">
            <div className="lg:hidden">
              <Logo />
            </div>
            {!viewer && (
              <p className="ml-auto text-sm text-[#67736f]">
                {mode === 'signup' ? 'Déjà membre ?' : 'Nouveau ici ?'}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
                  className="font-semibold text-[#1d5145] underline decoration-[#1d5145]/25 underline-offset-4 hover:decoration-[#1d5145]"
                >
                  {mode === 'signup' ? 'Se connecter' : 'Créer un compte'}
                </button>
              </p>
            )}
          </div>

          <div className="mx-auto flex w-full max-w-[560px] flex-1 items-center py-10 sm:py-16">
            {viewer ? (
              <div className="w-full text-center" role="status">
                <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#dff2e9] text-[#1d6b56]">
                  <svg viewBox="0 0 24 24" className="size-9" fill="none" aria-hidden="true">
                    <path
                      d="m6.5 12.5 3.5 3.5 7.5-8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-[#ff6b4a]">
                  {justRegistered ? 'Bienvenue' : 'Ravi de vous revoir'}
                </p>
                <h2 className="font-display mt-3 text-4xl font-semibold tracking-[-0.04em]">
                  {justRegistered ? 'Votre compte est prêt.' : `Bonjour ${viewer.firstName}.`}
                </h2>
                <p className="mx-auto mt-4 max-w-md leading-7 text-[#68736f]">
                  {justRegistered
                    ? `Merci ${viewer.firstName}, votre inscription est enregistrée et votre session est ouverte.`
                    : `Vous êtes connecté avec l’adresse ${viewer.email}.`}
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isPending}
                  className="mt-8 h-12 rounded-xl bg-[#1d5145] px-7 font-semibold text-white transition hover:bg-[#153e35] focus:outline-none focus:ring-4 focus:ring-[#1d5145]/20 disabled:cursor-wait disabled:opacity-60"
                >
                  {isPending ? 'Déconnexion…' : 'Se déconnecter'}
                </button>
              </div>
            ) : (
              <div className="w-full">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e65d3f]">
                  {mode === 'signup' ? 'Créez votre espace' : 'Votre espace'}
                </p>
                <h2 className="font-display mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-[44px]">
                  {mode === 'signup' ? 'Commençons l’aventure.' : 'Heureux de vous revoir.'}
                </h2>
                <p className="mt-3 text-[15px] leading-6 text-[#68736f]">
                  {mode === 'signup'
                    ? 'Quelques informations suffisent pour créer votre compte.'
                    : 'Connectez-vous pour retrouver votre espace Atelier.'}
                </p>

                <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                  {mode === 'signup' && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        id="firstName"
                        label="Prénom"
                        value={form.firstName}
                        onChange={(value) => updateField('firstName', value)}
                        placeholder="Camille"
                        autoComplete="given-name"
                        error={errors.firstName}
                      />
                      <Field
                        id="lastName"
                        label="Nom"
                        value={form.lastName}
                        onChange={(value) => updateField('lastName', value)}
                        placeholder="Martin"
                        autoComplete="family-name"
                        error={errors.lastName}
                      />
                    </div>
                  )}
                  <Field
                    id="email"
                    label="Adresse e-mail"
                    value={form.email}
                    onChange={(value) => updateField('email', value)}
                    placeholder="camille@exemple.fr"
                    type="email"
                    autoComplete="email"
                    error={errors.email}
                  />
                  <Field
                    id="password"
                    label="Mot de passe"
                    value={form.password}
                    onChange={(value) => updateField('password', value)}
                    placeholder={mode === 'signup' ? '8 caractères minimum' : 'Votre mot de passe'}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    error={errors.password}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-[#7c8783] transition hover:text-[#1d5145]"
                        aria-label={
                          showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                        }
                      >
                        {showPassword ? (
                          <svg
                            viewBox="0 0 24 24"
                            className="size-5"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="m4 4 16 16M10.6 10.7a2 2 0 0 0 2.7 2.7M9.4 5.3A9.8 9.8 0 0 1 12 5c5.4 0 8.5 5 8.5 5a15 15 0 0 1-2.2 2.8M6.2 6.2C4.4 7.4 3.5 10 3.5 10s3.1 5 8.5 5c.8 0 1.5-.1 2.2-.3"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="size-5"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M3.5 12s3.1-5 8.5-5 8.5 5 8.5 5-3.1 5-8.5 5-8.5-5-8.5-5Z"
                              stroke="currentColor"
                              strokeWidth="1.7"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="2.3"
                              stroke="currentColor"
                              strokeWidth="1.7"
                            />
                          </svg>
                        )}
                      </button>
                    }
                  />

                  {mode === 'signup' && (
                    <div>
                      <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#596560]">
                        <input
                          type="checkbox"
                          checked={form.terms}
                          onChange={(event) => updateField('terms', event.target.checked)}
                          className="mt-1 size-4 shrink-0 accent-[#1d5145]"
                        />
                        <span>
                          J’accepte les{' '}
                          <a
                            href="#"
                            className="font-semibold text-[#1d5145] underline underline-offset-2"
                          >
                            conditions d’utilisation
                          </a>{' '}
                          et la{' '}
                          <a
                            href="#"
                            className="font-semibold text-[#1d5145] underline underline-offset-2"
                          >
                            politique de confidentialité
                          </a>
                          .
                        </span>
                      </label>
                      {errors.terms && (
                        <p className="mt-1.5 pl-7 text-xs font-medium text-[#c74630]">
                          {errors.terms}
                        </p>
                      )}
                    </div>
                  )}

                  {formError && (
                    <p
                      role="alert"
                      className="rounded-xl border border-[#e6b5aa] bg-[#fff3f0] px-4 py-3 text-sm font-medium text-[#a83e29]"
                    >
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#1d5145] px-5 font-semibold text-white shadow-[0_10px_24px_rgba(29,81,69,.18)] transition hover:-translate-y-0.5 hover:bg-[#173f36] hover:shadow-[0_14px_28px_rgba(29,81,69,.22)] focus:outline-none focus:ring-4 focus:ring-[#1d5145]/20 active:translate-y-0 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isPending
                      ? mode === 'signup'
                        ? 'Création du compte…'
                        : 'Connexion…'
                      : mode === 'signup'
                        ? 'Créer mon compte'
                        : 'Se connecter'}
                    {!isPending && (
                      <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
                        <path
                          d="M4 10h12m-4-4 4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </form>

                {mode === 'signup' && (
                  <p className="mt-6 text-center text-xs leading-5 text-[#89928f]">
                    Inscription gratuite. Aucun moyen de paiement requis.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
