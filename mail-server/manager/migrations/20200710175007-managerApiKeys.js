'use strict';

const { b64_sha512crypt } = require('sha512crypt-node');
const fs = require('fs');
const { randomBytes } = require('crypto');
const path = require('path')

const { readFile } = require('fs')
const { promisify } = require('util')
const readFileAsync = promisify(readFile)
let  dbm
let type
let seed
let Promise

const genRandomString = length => {
    return randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
  Promise = options.Promise;
}

exports.up = async (db) => {
  const filePath = path.join(__dirname, 'sqls', '20200710175007-managerApiKeys-up.sql');
  const domainKey = `root-${genRandomString(5)}`
  const passKey = genRandomString(32)
  const sql = await readFileAsync(filePath, {encoding: 'utf-8'})

  await db.runSql(
    sql.replace('%domain%', domainKey).replace('%passkey%', b64_sha512crypt(passKey, genRandomString(16))),
  )

  console.log('-----------------------------------------------------------------');
  console.log(`-- Root API credentials,`);
  console.log('-- This will only be shown once, please record this and store in');
  console.log('-- a safe place');
  console.log(`-- { "domain" : "${domainKey}", "passkey": "${passKey}" }`);
  console.log('-----------------------------------------------------------------');
};

exports.down = function(db) {
  const filePath = path.join(__dirname, 'sqls', '20200710175007-managerApiKeys-down.sql');
  return new Promise( function( resolve, reject ) {
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
      if (err) return reject(err);
      console.log('received data: ' + data);

      resolve(data);
    });
  })
  .then(function(data) {
    return db.runSql(data);
  });
};

exports._meta = {
  "version": 1
};
