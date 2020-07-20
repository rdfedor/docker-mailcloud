import { get, prepare, all } from '../database'
import models from '../model'
import { ConflictError, NotFoundError, MissingParameterError, AccessDeniedError } from '../error'
import { hashPassword, genRandomString, md5 } from '../util/crypto'

const {
  addManagerApiLog: addManagerApiLogSql,
  clearOldLogs: clearOldLogsSql,
  getManagerApiLog: getManagerApiLogSql,
  checkIsRemoteAddrBanned: checkIsRemoteAddrBannedSql,
} = models

export const getManagerApiLog = async () => await all(getManagerApiLogSql)

export const addManagerApiLog = async (
  $path: String,
  $remoteAddr: String,
  $parameters: Object,
  $responseStatusCode: String,
  $domain: String,
) => {
  const $filteredParameters = { ...$parameters }

  Object.keys($filteredParameters)
    .filter((key) => key.indexOf('pass') > -1)
    .forEach((key) => delete $filteredParameters[key])

  return await prepare(addManagerApiLogSql, {
    $logHash: md5(`${$remoteAddr}${$path}${Date.now().toString()}`),
    $path,
    $remoteAddr,
    $parameters: JSON.stringify($filteredParameters),
    $responseStatusCode,
    $domain,
  })
}

export const checkIsRemoteAddrBanned = async ($remoteAddr) =>
  (
    await get(checkIsRemoteAddrBannedSql, {
      $remoteAddr,
    })
  ).count > 0

export const clearOldLogs = async () => await get(clearOldLogsSql)

export const startLogManager = () => {
  setInterval(() => {
    clearOldLogs()
  }, 86400000)

  clearOldLogs()
}
