'use strict'

const fs = require('fs')
const path = require('path')
const { b64_sha512crypt } = require('sha512crypt-node')
const { randomBytes } = require('crypto')
const { readFile } = require('fs')
const { promisify } = require('util')
const { DMS_POSTFIX_ACCOUNTS } = require('../src/config/index.ts')

const readFileAsync = promisify(readFile)

let dbm
let type
let seed
let Promise

const genRandomString = (length) => {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length) /** return required number of characters */
}

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate
  type = dbm.dataType
  seed = seedLink
  Promise = options.Promise
}

exports.up = async (db) => {
  const filePath = path.join(__dirname, 'sqls', '20200706032804-initial-up.sql')
  const adminEmail = `postmaster-${genRandomString(5)}`
  const password = genRandomString(32)
  const encryptedPassword = b64_sha512crypt(password, genRandomString(16))

  const sql = await readFileAsync(filePath, { encoding: 'utf-8' })
  const domain = process.env.DOMAINNAME || 'mailinabox.lan'

  await db.runSql(
    sql
      .replace(/%domain%/g, domain)
      .replace(/%adminEmail%/g, adminEmail)
      .replace(/%postmasterAddress%/g, process.env.POSTMASTER_ADDRESS || 'postmaster@mailinabox.lan')
      .replace(/%password%/g, encryptedPassword),
  )

  console.log('-----------------------------------------------------------------')
  console.log(`-- Postmaster mailbox credentials,`)
  console.log('-- This will only be shown once, please record this and store in')
  console.log('-- a safe place')
  console.log(`-- { "email" : "${adminEmail}@${domain}", "password": "${password}" }`)
  console.log('-----------------------------------------------------------------')

  if (!fs.existsSync(DMS_POSTFIX_ACCOUNTS)) {
    const dirPath = path.dirname(DMS_POSTFIX_ACCOUNTS)
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath)
    fs.writeFileSync(DMS_POSTFIX_ACCOUNTS, `${adminEmail}@${domain}|${password}`)
  } else {
    console.log(
      `-- WARNING - ${DMS_POSTFIX_ACCOUNTS} already exists.  Accounts within this file will be synced automatically.`,
    )
  }
}

exports.down = (db) => {
  var filePath = path.join(__dirname, 'sqls', '20200706032804-initial-down.sql')
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
      if (err) return reject(err)
      console.log('received data: ' + data)

      resolve(data)
    })
  }).then(function (data) {
    return db.runSql(data)
  })
}

exports._meta = {
  version: 1,
}
