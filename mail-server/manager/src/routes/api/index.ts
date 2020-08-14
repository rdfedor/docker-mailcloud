import { Router } from 'express'
import accountRouter from './account'
import aliasRouter from './alias'
import apiKeyRouter from './api-key'
import authRouter from './auth'
import {
  getSystemStatus,
  getServiceStatus,
  HEALTH_CHECK_STATUS_OK,
  HEALTH_CHECK_STATUS_DEGRADED,
} from '../../service/health-check'

const router = new Router()

router.use('/account', accountRouter)
router.use('/alias', aliasRouter)
router.use('/api-key', apiKeyRouter)
router.use('/auth', authRouter)

router.get('/status', (req, res) => {
  const system = getSystemStatus()
  const systemStatusMap = {
    [HEALTH_CHECK_STATUS_OK]: 200,
    [HEALTH_CHECK_STATUS_DEGRADED]: 424,
  }
  res.status(systemStatusMap[system] || 500).json({
    system,
    services: getServiceStatus(),
  })
})

export const Account = accountRouter
export const Alias = aliasRouter
export const ApiKey = apiKeyRouter
export const Auth = authRouter

export default router
