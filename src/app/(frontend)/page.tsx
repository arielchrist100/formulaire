import { RegistrationForm } from './registration-form'
import { appAuth } from '@/lib/app-auth'

export default async function HomePage() {
  const user = await appAuth.currentUser()
  const initialUser =
    user && user.collection === 'users'
      ? {
          email: typeof user.email === 'string' ? user.email : '',
          firstName: typeof user.firstName === 'string' ? user.firstName : '',
        }
      : null

  return <RegistrationForm initialUser={initialUser} />
}
