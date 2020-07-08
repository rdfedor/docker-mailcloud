import {
  DMS_POSTFIX_ACCOUNTS,
  DMS_POSTFIX_QUOTAS,
  DMS_POSTFIX_ALIASES,
} from "../config"
import { readFileSync } from "fs"
import { softUpdateUserPassword, softUpdateUserQuota } from './user'
import { softUpdateAlias } from './alias'
import { Watch } from "../util"

let watchPostfixAccounts = null
let watchPostfixQuotas = null
let watchPostfixAliases = null

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
              return softUpdateUserPassword(email, password)
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
            return softUpdateUserQuota(email, quota)
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
}

DmsSync.prototype.start = function() {
    watchPostfixAccounts.start()
    watchPostfixQuotas.start()
    watchPostfixAliases.start()
}

DmsSync.prototype.stop = function () {
    watchPostfixAccounts.stop()
    watchPostfixQuotas.stop()
    watchPostfixAliases.stop()
}

export default new DmsSync()
