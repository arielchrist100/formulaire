'use server'

import config from '@payload-config'
import { getPayload } from 'payload'
import { appAuth } from '@/lib/app-auth'

type FieldName = 'firstName' | 'lastName' | 'email' | 'password' | 'terms'

export type AuthActionResult =
  | {
      success: true
      user: {
        email: string
        firstName: string
      }
    }
  | {
      success: false
      fieldErrors?: Partial<Record<FieldName, string>>
      formError?: string
    }

export type SignupInput = {
  email: string
  firstName: string
  lastName: string
  password: string
  terms: boolean
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateSignup(input: SignupInput) {
  const errors: Partial<Record<FieldName, string>> = {}
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  const email = input.email.trim().toLowerCase()

  if (!firstName || firstName.length > 80) errors.firstName = 'Indiquez un prénom valide.'
  if (!lastName || lastName.length > 80) errors.lastName = 'Indiquez un nom valide.'
  if (!emailPattern.test(email) || email.length > 254) {
    errors.email = 'Saisissez une adresse e-mail valide.'
  }
  if (input.password.length < 8 || input.password.length > 128) {
    errors.password = 'Utilisez entre 8 et 128 caractères.'
  }
  if (input.terms !== true) {
    errors.terms = 'Vous devez accepter les conditions pour continuer.'
  }

  return { email, errors, firstName, lastName }
}

export async function signup(input: SignupInput): Promise<AuthActionResult> {
  const { email, errors, firstName, lastName } = validateSignup(input)
  if (Object.keys(errors).length > 0) return { success: false, fieldErrors: errors }

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'users',
      data: {
        email,
        firstName,
        lastName,
        password: input.password,
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
      },
      overrideAccess: false,
    })

    await appAuth.login(email, input.password)
    return { success: true, user: { email, firstName } }
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : ''

    if (
      message.includes('already') ||
      message.includes('registered') ||
      message.includes('unique')
    ) {
      return {
        success: false,
        fieldErrors: { email: 'Un compte existe déjà avec cette adresse e-mail.' },
      }
    }

    return {
      success: false,
      formError: 'Impossible de créer votre compte pour le moment. Veuillez réessayer.',
    }
  }
}

export async function login(input: { email: string; password: string }): Promise<AuthActionResult> {
  const email = input.email.trim().toLowerCase()
  const fieldErrors: Partial<Record<FieldName, string>> = {}

  if (!emailPattern.test(email)) fieldErrors.email = 'Saisissez une adresse e-mail valide.'
  if (!input.password) fieldErrors.password = 'Saisissez votre mot de passe.'
  if (Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors }

  try {
    const user = await appAuth.login(email, input.password)
    const firstName = typeof user.firstName === 'string' ? user.firstName : ''

    return { success: true, user: { email, firstName } }
  } catch {
    return {
      success: false,
      formError: 'Adresse e-mail ou mot de passe incorrect.',
    }
  }
}

export async function logout() {
  await appAuth.logout()
  return { success: true }
}
