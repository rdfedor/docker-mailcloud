import { Router } from 'express'
import { processVerifyAuth } from '../../service/api-key'
import { buildToken } from '../../util/jwt'

const router = new Router()

router.post('/verify', async (req, res, next) => {
  try {
    const { domain, passkey } = req.body

    console.log(`Verify Api-Key ${JSON.stringify({ domain: domain.substr(0, 200) })} []`)

    const apikey = await processVerifyAuth(domain.substr(0, 200), passkey.substr(0, 2000))

    res.status(200).send(await buildToken(apikey))
  } catch (err) {
    next(err)
  }
})

export default router
