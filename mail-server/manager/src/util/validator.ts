import { isEmail as isEmailValidator } from 'validator'

export const isEmail = value => isEmailValidator(value)
