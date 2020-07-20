import { Router } from 'express'
import { getAccounts, processUpdateAccount, processAddAccount, processDeleteAccount } from '../../service/account'
import verifyJwt from '../../middleware/verify-jwt'

const router = new Router()

router.use(verifyJwt())

router.get('/', async (req, res, next) => {
  try {
    const accounts = await getAccounts()
    console.log(`List Accounts [${req.jwt.domain}]`)
    res.json(accounts.map(account => {
      delete account.password
      return account
    }))
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { email, password, quota, extra, privleges } = req.body

    console.log(`Add Account ${JSON.stringify({email, quota, privleges, extra})} [${req.jwt.domain}]`)

    await processAddAccount(email, password, quota, privleges, extra)

    res.status(200).send()
  } catch (err) {
    next(err)
  }
})

router.put('/', async (req, res, next) => {
  try {
    const { email, password, quota, extra, privleges } = req.body

    console.log(`Update Account ${JSON.stringify({ email, quota, privleges, extra })} [${req.jwt.domain}]`)

    await processUpdateAccount(email, password, quota, extra, privleges)

    res.status(200).send()
  } catch (err) {
    next(err)
  }
})

router.delete('/', async (req, res, next) => {
  try {
    const { email } = req.body

    console.log(`Delete Account ${JSON.stringify({ email })} [${req.jwt.domain}]`)

    await processDeleteAccount(email)

    res.status(200).send()
  } catch (err) {
    next(err)
  }
})

export default router
