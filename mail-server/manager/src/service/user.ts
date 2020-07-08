import { get, prepare } from '../database'
import models from '../model'

const {
  getUserByEmail: getUserByEmailSql,
  updateUserPassword: updateUserPasswordSql,
  addUserPassword: addUserPasswordSql,
  updateUserQuota: updateUserQuotaSql,
} = models

export const softUpdateUserPassword = async (email, password) => {
  const user = await getUserByEmail(email)
  if (user && user.email) {
    if (user.password !== password) {
      return await updateUserPassword(email, password)
    }

    return
  }

  return await addUserPassword(email, password)
}

export const softUpdateUserQuota = async (email, quota) => {
  const user = await getUserByEmail(email)
  if (user && user.email) {
    if (user.quota !== quota) {
      return await updateUserQuota(email, quota)
    }
  }
}

export const getUserByEmail = $email => {
  return get(getUserByEmailSql, { $email })
}

export const updateUserPassword = ($email, $password) => {
  console.log(`Updating user password for ${$email}`)
  return prepare(updateUserPasswordSql, { $email, $password })
}

export const addUserPassword = ($email, $password) => {
  console.log(`Adding user password for ${$email}`)
  return prepare(addUserPasswordSql, { $email, $password })
}

export const updateUserQuota = ($email, $quota) => {
  console.log(`Updating user quota for ${$email}`)
  return prepare(updateUserQuotaSql, { $email, $quota })
}
