import { isEmail as isEmailValidator } from 'validator'

export const isEmail = (value) => isEmailValidator(value)

export const limitString = (val: string, length: number, defaultValue?: string) =>
  val
    ? val instanceof Array
      ? val.map((valRow) => valRow.substr(0, length))
      : val.substr(0, length)
    : defaultValue !== null
    ? defaultValue
    : null
