import { Router } from 'express'
import { getAccounts, processUpdateAccount, processAddAccount, processDeleteAccount } from '../../service/account'
import verifyJwt from '../../middleware/verify-jwt'
import { limitString } from '../../util/validator'

const router = new Router()

router.use(verifyJwt())

router.get('/', async (req, res, next) => {
  try {
    const accounts = await getAccounts()
    console.log(`List Accounts [${req.jwt.domain}]`)
    res.json(
      accounts.map((account) => {
        delete account.password
        return account
      }),
    )
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { email, password, quota, extra, privileges } = req.body

    console.log(`Add Account ${JSON.stringify({ email, quota, privileges, extra })} [${req.jwt.domain}]`)

    await processAddAccount(
      limitString(email, 2000),
      limitString(password, 200),
      limitString(quota, 10, '0'),
      limitString(extra, 2000, ''),
      limitString(privileges, 2000, ''),
    )

    res.status(200).send()
  } catch (err) {
    next(err)
  }
})

router.put('/', async (req, res, next) => {
  try {
    const { email, password, quota, extra, privileges } = req.body

    console.log(`Update Account ${JSON.stringify({ email, quota, privileges, extra })} [${req.jwt.domain}]`)

    await processUpdateAccount(
      limitString(email, 2000),
      limitString(password, 200),
      limitString(quota, 10, '0'),
      limitString(extra, 2000, ''),
      limitString(privileges, 2000, ''),
    )

    res.status(200).send()
  } catch (err) {
    next(err)
  }
})

router.delete('/', async (req, res, next) => {
  try {
    const { email } = req.body

    console.log(`Delete Account ${JSON.stringify({ email })} [${req.jwt.domain}]`)

    await processDeleteAccount(email.substr(0, 2000))

    res.status(200).send()
  } catch (err) {
    next(err)
  }
})

export default router
