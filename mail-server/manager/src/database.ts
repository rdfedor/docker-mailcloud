import sqlite3 from 'sqlite3'
import { SQL_CONNECT, LOG_DATABASE_QUERIES } from './config'

const sqlite3Verbose = sqlite3.verbose()

const db = new sqlite3Verbose.Database(SQL_CONNECT)

/**
 *
 * @param {String} verb Name of command ending in ing
 * @param {String} query Query being executed
 * @param {Object} params Parameters being passed with the query
 */
const filteredLog = (verb, query, params) => {
  if (!LOG_DATABASE_QUERIES) {
    return
  }

  const outputParmas = {...params}
  if (outputParmas.$password) {
    delete outputParmas.$password
  }
  const queryNameStart = query.indexOf('--') + 2
  const queryNameLength = query.indexOf("\n", queryNameStart) - queryNameStart
  const queryName = query.substr(queryNameStart, queryNameLength).trim()
  console.log(`${verb} ${queryName}, ${JSON.stringify(outputParmas)}`)
}

export const prepare = (query, parameters  = {}) => {
  return new Promise((resolve, reject) => {
    filteredLog('Preparing', query, parameters)
    db.prepare(query).run(parameters, function (err, row) {
      if (err) reject('Read error: ' + err.message)
      else {
        resolve(row)
      }
    })
  })
}

export const get = (query, parameters = {}) => {
  return new Promise((resolve, reject) => {
    filteredLog('Getting', query, parameters)
    db.get(query, parameters, function (err, row) {
      if (err) reject('Read error: ' + err.message)
      else {
        resolve(row)
      }
    })
  })
}

export const all = (query, parameters = {}) => {
  return new Promise((resolve, reject) => {
    filteredLog('Getting All', query, parameters)
    db.all(query, parameters, function (err, row) {
      if (err) reject('Read error: ' + err.message)
      else {
        resolve(row)
      }
    })
  })
}

export default db
