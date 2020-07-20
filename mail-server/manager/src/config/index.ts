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
export const MANAGER_PORT = process.env.MANAGER_PORT || 8080
export const PEM_PUBLIC_KEY = process.env.PEM_PUBLIC_KEY || '/tmp/docker-mailserver/public_key.pem'
export const PEM_PRIVATE_KEY = process.env.PEM_PRIVATE_KEY || '/tmp/docker-mailserver/private_key.pem'
export const LOG_DATABASE_QUERIES = process.env.LOG_DATABASE_QUERIES || false
