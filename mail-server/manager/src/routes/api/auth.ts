import { Router } from 'express'
import { processVerifyAuth } from '../../service/api-key'
import { buildToken } from '../../util/jwt'
import { limitString } from '../../util/validator'

const router = new Router()

router.post('/verify', async (req, res, next) => {
  try {
    const { domain, passkey } = req.body

    console.log(`Verify Api-Key ${JSON.stringify({ domain: limitString(domain, 200) })} []`)

    const apikey = await processVerifyAuth(limitString(domain, 200), limitString(passkey, 2000))

    res.status(200).send(await buildToken(apikey))
  } catch (err) {
    next(err)
  }
})

export default router
