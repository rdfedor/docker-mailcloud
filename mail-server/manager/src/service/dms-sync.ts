import {
  DMS_POSTFIX_ACCOUNTS,
  DMS_POSTFIX_QUOTAS,
  DMS_POSTFIX_ALIASES,
} from "../config"
import { readFileSync } from "fs"
import { softUpdateAccountPassword, softUpdateAccountQuota } from './account'
import { softUpdateAlias } from './alias'
import { Watch } from "../util"
import { registerServiceCheck, checkServiceStatus } from "./health-check"

let watchPostfixAccounts = null
let watchPostfixQuotas = null
let watchPostfixAliases = null

const HCSM_POSTFIX_ACCOUNTS = 'watch-postfix-accounts'
const HCSM_POSTFIX_QUOTAS = 'watch-postfix-quotas'
const HCSM_POSTFIX_ALIASES = 'watch-postfix-alias'

export const DmsSync = function() {
    watchPostfixAccounts = new Watch(
      DMS_POSTFIX_ACCOUNTS,
      async () => {
        try {
          await Promise.all(readFileSync(DMS_POSTFIX_ACCOUNTS, "utf-8")
            .split('\n')
            .filter(Boolean)
            .map((row) => {
              const [email, password] = row.split('|')
              return softUpdateAccountPassword(email, password)
            }))
            console.log('Account sync completed')
          } catch (err) {
            console.log(err)
          }
      }
    )

    watchPostfixQuotas = new Watch(
      DMS_POSTFIX_QUOTAS,
      async () => {
        readFileSync(DMS_POSTFIX_QUOTAS, "utf-8")
          .split("\n")
          .filter(Boolean)
          .map((row) => {
            const [email, quota] = row.split(":")
            return softUpdateAccountQuota(email, quota)
          })
      }
    )

    watchPostfixAliases = new Watch(
      DMS_POSTFIX_ALIASES,
      () => {
        readFileSync(DMS_POSTFIX_ALIASES, "utf-8")
          .split("\n")
          .filter(Boolean)
          .map((row) => {
            const [source, destination] = row.split(' ')
            return softUpdateAlias(source, destination)
          })
      }
    )

    registerServiceCheck(HCSM_POSTFIX_ALIASES, () => {
      return watchPostfixAliases.isRunning()
    })
    registerServiceCheck(HCSM_POSTFIX_ACCOUNTS, () => {
      return watchPostfixAccounts.isRunning()
    })
    registerServiceCheck(HCSM_POSTFIX_QUOTAS, () => {
      return watchPostfixQuotas.isRunning()
    })
}

DmsSync.prototype.start = function() {
    watchPostfixAccounts.start()
    watchPostfixQuotas.start()
    watchPostfixAliases.start()

    checkServiceStatus(HCSM_POSTFIX_ALIASES)
    checkServiceStatus(HCSM_POSTFIX_QUOTAS)
    checkServiceStatus(HCSM_POSTFIX_ACCOUNTS)
}

DmsSync.prototype.stop = function () {
    watchPostfixAccounts.stop()
    watchPostfixQuotas.stop()
    watchPostfixAliases.stop()

    checkServiceStatus(HCSM_POSTFIX_ALIASES)
    checkServiceStatus(HCSM_POSTFIX_QUOTAS)
    checkServiceStatus(HCSM_POSTFIX_ACCOUNTS)
}

export default new DmsSync()
