import { get, prepare, all } from '../database'
import models from '../model'
import { ConflictError, NotFoundError, MissingParameterError, AccessDeniedError } from '../error'
import { hashPassword, genRandomString } from '../util/crypto'

const {
  getManagerApiKeys: getManagerApiKeysSql,
  getManagerApiKeyByDomain: getApiKeyByDomainSql,
  addManagerApiKey: addManagerApiKeySql,
  delManagerApiKey: delManagerApiKeySql,
} = models

export const processGetApiKeys = async () => await all(getManagerApiKeysSql)

export const processVerifyAuth = async ($domain, $passkey) => {
  if (!$domain || !$passkey) {
    throw new MissingParameterError('Missing parameters domain and/or passkey')
  }

  const apiKeyRecord = await get(getApiKeyByDomainSql, {
    $domain,
  })

  if (!apiKeyRecord || !apiKeyRecord.passkey) {
    throw new AccessDeniedError('Invalid domain and/or passkey')
  }

  const { passkey } = apiKeyRecord
  const salt = passkey.substr(3, passkey.indexOf('$', 3) - 3)

  if (hashPassword($passkey, salt) !== passkey) {
    throw new AccessDeniedError('Invalid domain and/or passkey')
  }

  delete apiKeyRecord.passkey

  return apiKeyRecord
}

export const processAddApiKey = async ($domain) => {
  if (!$domain) {
    throw new MissingParameterError('Missing parameters domain')
  }

  const apiKeyRecord = await get(getApiKeyByDomainSql, {
    $domain,
  })

  if (apiKeyRecord) {
    throw new ConflictError('A key with that domain name already exists')
  }

  const passkey = genRandomString(32)

  await prepare(addManagerApiKeySql, {
    $domain,
    $passkey: hashPassword(passkey)
  })

  return {
    domain: $domain,
    passkey,
  }
}

export const processDeleteApiKey = async ($domain, $passkey) => {
  await processVerifyAuth($domain, $passkey)

  await prepare(delManagerApiKeySql, { $domain })
}
