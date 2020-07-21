import { Router } from 'express'
import { getAliases, processRemoveAlias, processUpdateAlias, processAddAlias } from '../../service/alias'
import verifyJwt from '../../middleware/verify-jwt'

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

    console.log(`Add Alias ${JSON.stringify({ source, destination, permittedSenders })} [${req.jwt.domain}]`)

    processAddAlias(source, destination, permittedSenders)
    res.status(200).send()
  } catch (err) {
    next(err)
  }
})

router.put('/', async (req, res, next) => {
  try {
    const { source, destination, permittedSenders } = req.body

    console.log(`Update Alias ${JSON.stringify({ source, destination, permittedSenders })} [${req.jwt.domain}]`)

    await processUpdateAlias(source, destination, permittedSenders)

    res.status(200).send()
  } catch (err) {
    next(err)
  }
})

router.delete('/', async (req, res, next) => {
  try {
    const { source, destination } = req.body

    console.log(`Delete Alias ${JSON.stringify({ source, destination })} [${req.jwt.domain}]`)

    await processRemoveAlias(source, destination)

    res.status(200).send()
  } catch (err) {
    next(err)
  }
})

export default router
