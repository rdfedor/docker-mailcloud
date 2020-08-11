import { expect } from 'chai'
import 'mocha'
import { isEmail } from '../validator'

describe('util/validator', () => {
  it('should validate a valid email', () => {
    expect(isEmail('user@example.com')).to.equal(true)
  })

  it('should not validate an invalid email', () => {
    expect(isEmail('user@example')).to.equal(false)
  })
})
