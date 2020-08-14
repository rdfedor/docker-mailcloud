import { Router } from 'express'
import { processAddApiKey, processDeleteApiKey, processGetApiKeys } from '../../service/api-key'
import verifyJwt from '../../middleware/verify-jwt'
import { limitString } from '../../util/validator'

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

    console.log(`Add Api-Key ${JSON.stringify({ domain: limitString(domain, 200) })} [${req.jwt.domain}]`)

    res.status(200).json(await processAddApiKey(limitString(domain, 200)))
  } catch (err) {
    next(err)
  }
})

router.delete('/', async (req, res, next) => {
  try {
    const { domain, passkey } = req.body

    console.log(`Delete Api-Key ${JSON.stringify({ domain: domain.substr(0, 200) })} [${req.jwt.domain}]`)

    await processDeleteApiKey(limitString(domain, 200), limitString(passkey, 2000))

    res.status(200).send()
  } catch (err) {
    next(err)
  }
})

export default router
