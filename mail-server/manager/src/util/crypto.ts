import { PEM_PUBLIC_KEY, PEM_PRIVATE_KEY } from '../config'
import { randomBytes, generateKeyPair, createHash } from 'crypto'
import { writeFile, readFile, exists } from 'fs'
import { promisify } from 'util'
import { b64_sha512crypt } from 'sha512crypt-node'

const generateKeyPairAsync = promisify(generateKeyPair)
const writeFileAsync = promisify(writeFile)
const readFileAsync = promisify(readFile)
const existsAsync = promisify(exists)
/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
export const genRandomString = length => {
    return randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
}

export const md5 = (data) => createHash('md5').update(data).digest('hex')

export const hashPassword = (password, salt = '') => {
  //Creating the hash in the required format
  return b64_sha512crypt(password, salt || genRandomString(16))
}

export const generatePemKeys = async () => {
  const { publicKey, privateKey } = await generateKeyPairAsync('rsa', {
    modulusLength: 1024,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: '',
    },
  })

  await writeFileAsync(PEM_PUBLIC_KEY, publicKey)
  await writeFileAsync(PEM_PRIVATE_KEY, privateKey)

  return {
    publicKey,
    privateKey
  }
}

export const getPublicKey = async () => {
  const publicKeyExists = await existsAsync(PEM_PUBLIC_KEY)

  if (publicKeyExists) {
    const publicKey = await readFileAsync(PEM_PUBLIC_KEY)
    return publicKey
  }

  const keys = await generatePemKeys()

  return keys.publicKey
}
export const getPrivateKey = async () => {
  const privateKeyExists = await existsAsync(PEM_PRIVATE_KEY)

  if (privateKeyExists) {
    const privateKey = await readFileAsync(PEM_PRIVATE_KEY)
    return privateKey
  }

  const keys = await generatePemKeys()

  return keys.privateKey
}

