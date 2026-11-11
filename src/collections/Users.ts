import type {
  Access,
  CollectionBeforeValidateHook,
  CollectionConfig,
  PayloadRequest,
} from 'payload'
import { ValidationError } from 'payload'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'
const canAccessAdmin = ({ req }: { req: PayloadRequest }) => req.user?.collection === 'admins'

const isAdminOrSelf: Access = ({ req }) => {
  if (req.user?.collection === 'admins') return true
  if (req.user?.collection !== 'users') return false

  return {
    id: {
      equals: req.user.id,
    },
  }
}

const setTermsAcceptedAt: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (data && operation === 'create') {
    if (
      typeof data.password !== 'string' ||
      data.password.length < 8 ||
      data.password.length > 128
    ) {
      throw new ValidationError({
        collection: 'users',
        errors: [
          {
            message: 'Le mot de passe doit contenir entre 8 et 128 caractères.',
            path: 'password',
          },
        ],
      })
    }

    data.termsAcceptedAt = new Date().toISOString()
  }

  return data
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Utilisateur',
    plural: 'Utilisateurs',
  },
  auth: {
    lockTime: 10 * 60 * 1000,
    maxLoginAttempts: 5,
    tokenExpiration: 7 * 24 * 60 * 60,
  },
  access: {
    admin: canAccessAdmin,
    create: () => true,
    delete: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
  },
  admin: {
    defaultColumns: ['email', 'firstName', 'lastName', 'createdAt'],
    group: 'Comptes',
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      label: 'Prénom',
      maxLength: 80,
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Nom',
      maxLength: 80,
      required: true,
    },
    {
      name: 'termsAccepted',
      type: 'checkbox',
      label: 'Conditions acceptées',
      access: {
        update: () => false,
      },
      required: true,
      validate: (value) => value === true || 'Les conditions doivent être acceptées.',
    },
    {
      name: 'termsAcceptedAt',
      type: 'date',
      label: 'Conditions acceptées le',
      access: {
        create: () => false,
        update: () => false,
      },
      admin: {
        readOnly: true,
      },
      required: true,
    },
  ],
  hooks: {
    beforeValidate: [setTermsAcceptedAt],
  },
  timestamps: true,
  versions: false,
}
