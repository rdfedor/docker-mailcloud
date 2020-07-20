

import { Router } from 'express'
import apiRouter from './api'
import filterBanned from '../middleware/filter-banned'
import logResponse from '../middleware/log-response'

const router = new Router()

router.get('/', (req, res) => res.redirect('https://www.google.com/'))

router.use(filterBanned)
router.use(logResponse)

router.use('/api', apiRouter)

export const Api = apiRouter

export default router
