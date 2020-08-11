import { expect } from 'chai'
import 'mocha'
import { genRandomString, md5, hashPassword } from '../crypto'

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
})
