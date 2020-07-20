import { Router } from 'express'
import accountRouter from './account'
import aliasRouter from './alias'
import apiKeyRouter from './api-key'
import authRouter from './auth'

const router = new Router()

router.use('/account', accountRouter)
router.use('/alias', aliasRouter)
router.use('/api-key', apiKeyRouter)
router.use('/auth', authRouter)

export const Account = accountRouter
export const Alias = aliasRouter
export const ApiKey = apiKeyRouter
export const Auth = authRouter

export default router
