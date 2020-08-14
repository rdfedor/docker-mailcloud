import { Router } from 'express'
import { getAliases, processRemoveAlias, processUpdateAlias, processAddAlias } from '../../service/alias'
import verifyJwt from '../../middleware/verify-jwt'
import { limitString } from '../../util/validator'

const router = new Router()

router.use(verifyJwt())

router.get('/', async (req, res, next) => {
  try {
    console.log(`List Aliases [${req.jwt.domain}]`)

    const aliases = await getAliases()

    res.json(aliases)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { source, destination, permittedSenders } = req.body

    console.log(
      `Add Alias ${JSON.stringify({
        source: limitString(source, 2000, ''),
        destination: limitString(destination, 2000, ''),
        permittedSenders: limitString(permittedSenders, 2000, ''),
      })} [${req.jwt.domain}]`,
    )

    await processAddAlias(
      limitString(source, 2000, ''),
      limitString(destination, 2000, ''),
      limitString(permittedSenders, 2000, ''),
    )
    res.status(200).send()
  } catch (err) {
    next(err)
  }
})

router.put('/', async (req, res, next) => {
  try {
    const { source, destination, permittedSenders } = req.body

    console.log(
      `Update Alias ${JSON.stringify({
        source: limitString(source, 2000, ''),
        destination: limitString(destination, 2000, ''),
        permittedSenders: limitString(permittedSenders, 2000, ''),
      })} [${req.jwt.domain}]`,
    )

    await processUpdateAlias(
      limitString(source, 2000, ''),
      limitString(destination, 2000, ''),
      limitString(permittedSenders, 2000, ''),
    )

    res.status(200).send()
  } catch (err) {
    next(err)
  }
})

router.delete('/', async (req, res, next) => {
  try {
    const { source, destination, permittedSenders } = req.body

    console.log(
      `Delete Alias ${JSON.stringify({
        source: limitString(source, 2000, ''),
        destination: limitString(destination, 2000, ''),
        permittedSenders: limitString(destination, 2000, ''),
      })} [${req.jwt.domain}]`,
    )

    await processRemoveAlias(
      limitString(source, 2000, ''),
      limitString(destination, 2000, ''),
      limitString(permittedSenders, 2000, ''),
    )

    res.status(200).send()
  } catch (err) {
    next(err)
  }
})

export default router
