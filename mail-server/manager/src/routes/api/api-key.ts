import { Router } from 'express'
import { processAddApiKey, processDeleteApiKey, processGetApiKeys } from '../../service/api-key'
import verifyJwt from '../../middleware/verify-jwt'

const router = new Router()

router.use(verifyJwt())

router.get('/', async (req, res, next) => {
  try {
    console.log(`List Api-Keys [${req.jwt.domain}]`)

    res.status(200).json(await processGetApiKeys())
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { domain } = req.body

    console.log(`Add Api-Key ${JSON.stringify({ domain })} [${req.jwt.domain}]`)

    res.status(200).json(await processAddApiKey(domain))
  } catch (err) {
    next(err)
  }
})

router.delete('/', async (req, res, next) => {
  try {
    const { domain, passkey } = req.body

    console.log(`Delete Api-Key ${JSON.stringify({ domain })} [${req.jwt.domain}]`)

    await processDeleteApiKey(domain, passkey)

    res.status(200).send()
  } catch (err) {
    next(err)
  }
})

export default router
