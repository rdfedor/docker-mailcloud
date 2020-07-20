import { all, get, prepare } from '../database'
import models from '../model'
import { hashPassword } from '../util/crypto'
import { ConflictError, NotFoundError, MissingParameterError } from '../error'
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

export const softUpdateAccountPassword = async (email, password) => {
  const user = await getAccountByEmail(email)
  if (user && user.email) {
    if (user.password !== password) {
      console.info(`Updating account password for ${email}`)
      return await updateAccountPassword(email, password)
    }

    return
  }

  console.info(`Adding account w/ password for ${email}`)

  return await addAccountPassword(email, password)
}

export const softUpdateAccountQuota = async (email, quota) => {
  const user = await getAccountByEmail(email)
  if (user && user.email) {
    if (user.quota !== quota) {
      console.info(`Updating account quota for ${email} to ${quota}`)

      return await updateAccountQuota(email, quota)
    }
  }
}

export const getAccountByEmail = ($email) => {
         return get(getAccountByEmailSql, { $email })
       }

export const updateAccountPassword = ($email, $password) => {
  return prepare(updateAccountPasswordSql, { $email, $password })
}

export const addAccountPassword = ($email, $password) => {
  return prepare(addAccountPasswordSql, { $email, $password })
}

export const updateAccountQuota = ($email, $quota) => {
  return prepare(updateAccountQuotaSql, { $email, $quota })
}

export const deleteAccount = $email => {
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
export const addAccount = ($email, $password, $quota = '1G', $extra = '', $privileges = '') => {
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

export const processUpdateAccount = async (email, password, quota, extra, privleges) => {
   if (!email) {
     throw new MissingParameterError('Missing email attributes')
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
     privleges || storedAccount.privleges,
   )
}

export const processAddAccount = async (email, password, quota, privleges, extra) => {
  if (!email || !password) {
    throw new MissingParameterError('Missing email and/or password attributes')
  }

  const existingAccount = await getAccountByEmail(email)

  if (existingAccount && existingAccount.email) {
    throw new ConflictError('An account already exists with that email')
  }

  let encryptedPassword = ''

  if (password) {
    encryptedPassword = `{SHA512-CRYPT}${hashPassword(password)}`
  }

  await addAccount(email, encryptedPassword, quota, extra, privleges)
}

export const processDeleteAccount = async (email) => {
  if (!email) {
    throw new MissingParameterError('Missing email password attributes')
  }
  const storedAccount = await getAccountByEmail(email)

  if (!storedAccount || !storedAccount.email) {
    throw new NotFoundError('Account not found')
  }

  await deleteAccount(email)
}
