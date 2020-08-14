import { all, get, prepare } from '../database'
import models from '../model'
import { hashPassword } from '../util/crypto'
import { ConflictError, NotFoundError, MissingParameterError, InvalidParameterError } from '../error'
import { isEmail } from '../util/validator'
const {
  getAccountByEmail: getAccountByEmailSql,
  updateAccountPassword: updateAccountPasswordSql,
  addAccountPassword: addAccountPasswordSql,
  updateAccountQuota: updateAccountQuotaSql,
  getAccounts: getAccountsSql,
  updateAccount: updateAccountSql,
  addAccount: addAccountSql,
  deleteAccount: deleteAccountSql,
} = models

export const getAccounts = async () => {
  return await all(getAccountsSql)
}

export const softUpdateAccountPassword = async (email: String, password: String) => {
  const user = await getAccountByEmail(email)
  if (user && user.email) {
    if (user.password !== password) {
      console.info(`Updating account password for ${email}`)
      return await updateAccountPassword(email, password)
    }

    return user
  }

  console.info(`Adding account w/ password for ${email}`)

  return await addAccountPassword(email, password)
}

export const softUpdateAccountQuota = async (email: String, quota: String) => {
  const user = await getAccountByEmail(email)
  if (user && user.email) {
    if (user.quota !== quota) {
      console.info(`Updating account quota for ${email} to ${quota}`)

      return await updateAccountQuota(email, quota)
    }
  }
}

export const getAccountByEmail = async ($email: String) => {
  return await get(getAccountByEmailSql, { $email })
}

export const updateAccountPassword = ($email: String, $password: String) => {
  return prepare(updateAccountPasswordSql, { $email, $password })
}

export const addAccountPassword = ($email: String, $password: String) => {
  return prepare(addAccountPasswordSql, { $email, $password })
}

/**
 * Update's account quota by email address
 * @param {String} $email Email address
 * @param {String} $quota Quota of the mailbox (IE 100M, 1G)
 */
export const updateAccountQuota = ($email: String, $quota: String) => {
  return prepare(updateAccountQuotaSql, { $email, $quota })
}

/**
 * Delete an email address
 * @param {String} $email Email address of the account to delete
 */
export const deleteAccount = ($email: String) => {
  if (!isEmail($email)) {
    throw new InvalidParameterError('Invalid email address')
  }
  return prepare(deleteAccountSql, { $email })
}

/**
 *
 * @param {String} $email Email address of the mailbox
 * @param {String} $password Encrypted password for the mailbox
 * @param {String} [$quota='1G']  Mailbox limit (defaeult: 1G)
 * @param {String} [$extra='']
 * @param {String} [$privileges='']
 */
export const addAccount = (
  $email: String,
  $password: String,
  $quota: String = '1G',
  $extra: String = '',
  $privileges: String = '',
) => {
  return prepare(addAccountSql, { $email, $password, $extra, $privileges, $quota })
}

/**
 *
 * @param {String} $email Email address of the mailbox
 * @param {String} $password Encrypted password for the mailbox
 * @param {String} [$quota='1G']  Mailbox limit (defaeult: 1G)
 * @param {String} [$extra='']
 * @param {String} [$privledges='']
 */
export const updateAccount = ($email, $password, $quota = '1G', $extra = '', $privileges = '') => {
  console.log(`Updating account for ${$email}`)
  return prepare(updateAccountSql, { $email, $password, $extra, $privileges, $quota })
}

/**
 * Update the account details of a mailbox
 * @param {String} email Email address
 * @param {String} password Password to set for the account
 * @param {String} quota Quota of the mailbox (100M, 1G)
 * @param {String} extra
 * @param {String} privileges
 */
export const processUpdateAccount = async (email, password, quota, extra, privileges) => {
  if (!email) {
    throw new MissingParameterError('Missing email attributes')
  }

  if (!isEmail(email)) {
    throw new InvalidParameterError('Invalid email address')
  }

  const storedAccount = await getAccountByEmail(email)

  if (!storedAccount || !storedAccount.email) {
    throw new NotFoundError('Account not found')
  }

  let encryptedPassword = ''

  if (password) {
    encryptedPassword = `{SHA512-CRYPT}${hashPassword(password)}`
  }

  await updateAccount(
    email,
    encryptedPassword || storedAccount.password,
    quota || storedAccount.quota,
    extra || storedAccount.extra,
    privileges || storedAccount.privileges,
  )
}

export const processAddAccount = async (email, password, quota, privileges, extra) => {
  if (!email || !password) {
    throw new MissingParameterError('Missing email and/or password attributes')
  }

  if (!isEmail(email)) {
    throw new InvalidParameterError('Invalid email address')
  }

  const existingAccount = await getAccountByEmail(email)

  if (existingAccount && existingAccount.email) {
    throw new ConflictError('An account already exists with that email')
  }

  let encryptedPassword = ''

  if (password) {
    encryptedPassword = `{SHA512-CRYPT}${hashPassword(password)}`
  }

  await addAccount(email, encryptedPassword, quota, extra, privileges)
}

/**
 * Deletes an account by email
 * @param {String} email Email address of the accoutn to delete
 */
export const processDeleteAccount = async (email) => {
  if (!email) {
    throw new MissingParameterError('Missing email attribute')
  }

  if (!isEmail(email)) {
    throw new InvalidParameterError('Invalid email address')
  }

  const storedAccount = await getAccountByEmail(email)

  if (!storedAccount || !storedAccount.email) {
    throw new NotFoundError('Account not found')
  }

  return await deleteAccount(email)
}
