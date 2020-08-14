import { expect } from 'chai'
import 'mocha'
import { genRandomString, md5, hashPassword, generatePemKeys } from '../crypto'
import { existsSync, unlinkSync } from 'fs'
import { PEM_PUBLIC_KEY, PEM_PRIVATE_KEY } from '../../config'

describe('util/crypto', () => {
  it('should generate two random strings', () => {
    expect(genRandomString(4)).to.not.equal(genRandomString(4))
  })

  it('should calculate the md5 hash of a string', () => {
    const string = 'testdata'
    const md5hash = md5(string)
    expect(md5hash).to.not.equal(string)
    expect(md5hash.length).to.equal(32)
  })

  let previousHashSalt = ''
  let previousHash = ''

  it('should hash a password w/o salt', () => {
    const string = 'testdata'
    const hash = hashPassword(string)
    previousHash = hash
    previousHashSalt = hash.split('$')[2]
    expect(hash).to.not.equal(string)
    expect(hash.length).to.equal(106)
  })

  it('should generate the same hash a password w/ salt', () => {
    const string = 'testdata'
    const hash = hashPassword(string, previousHashSalt)
    expect(hash).to.not.equal(string)
    expect(hash.length).to.equal(106)
    expect(hash).to.equal(previousHash)
  })

  it('should generate PEM keys', async () => {
    ;[PEM_PUBLIC_KEY, PEM_PRIVATE_KEY]
      .filter((keyPath) => existsSync(keyPath))
      .forEach((keyPath) => unlinkSync(keyPath))
    expect(existsSync(PEM_PUBLIC_KEY)).to.equal(false)
    expect(existsSync(PEM_PRIVATE_KEY)).to.equal(false)

    const { publicKey, privateKey } = await generatePemKeys()

    expect(publicKey).to.not.equal(null)
    expect(privateKey).to.not.equal(null)
  })
})
