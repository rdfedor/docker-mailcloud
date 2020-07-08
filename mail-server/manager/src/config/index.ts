export const ENABLE_SQL = new Boolean(process.env.ENABLE_SQL || "0")
export const SQL_DRIVER = process.env.SQL_DRIVER || "sqlite"
export const SQL_CONNECT =
  process.env.SQL_CONNECT || "/var/mail/database.sqlite"
export const DMS_POSTFIX_ACCOUNTS =
  process.env.DMS_POSTFIX_ACCOUNTS ||
  "/tmp/docker-mailserver/postfix-accounts.cf"
export const DMS_POSTFIX_QUOTAS =
  process.env.DMS_POSTFIX_QUOTAS || "/tmp/docker-mailserver/dovecot-quotas.cf"
export const DMS_POSTFIX_ALIASES =
  process.env.DMS_POSTFIX_ALIASES || "/tmp/docker-mailserver/postfix-virtual.cf"
