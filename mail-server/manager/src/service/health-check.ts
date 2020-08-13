const serviceCheckProfiles = {}
const serviceCheckHandlers = {}
const serviceCheckResult = {}

/**
 * Trigger a check of a particular service
 * @param {String} name Service name
 */
export const checkServiceStatus = async name => {
  const func = serviceCheckProfiles[name]
  if (!func) {
    throw new Error('Service check does not exist')
  }
  serviceCheckResult[name] = { time: Date.now(), status: !!(await func()) }
}

export const registerServiceCheck = async (name, func) => {
  if (serviceCheckHandlers[name]) {
    throw new Error('Service check already exists')
  }

  serviceCheckProfiles[name] = func

  serviceCheckHandlers[name] = setInterval(async () => {
    await checkServiceStatus(name)
  }, 90 * 1000)

  await checkServiceStatus(name)
}

export const HEALTH_CHECK_STATUS_OK = 'ok'
export const HEALTH_CHECK_STATUS_DEGRADED = 'degraded'
export const HEALTH_CHECK_STATUS_UNKNOWN = 'unknown'
export const HEALTH_CHECK_STATUS_DOWN = 'down'

export const getServiceStatus = () => {
  const ret = {...serviceCheckResult}
  const now = Date.now()
  Object.keys(serviceCheckResult).forEach(key => {
    if ((now - ret[key].time) / 1000 < 120) {
      ret[key] = ret[key].status ? HEALTH_CHECK_STATUS_OK : HEALTH_CHECK_STATUS_DOWN
    } else {
      ret[key] = HEALTH_CHECK_STATUS_UNKNOWN
    }
  })
  return ret
}

export const getSystemStatus = () => {
  let status = true
  const serviceStatuses = getServiceStatus()
  Object.keys(serviceStatuses).forEach((key) => {
    status = status && serviceStatuses[key] === HEALTH_CHECK_STATUS_OK
  })
  return status ? HEALTH_CHECK_STATUS_OK : HEALTH_CHECK_STATUS_DEGRADED
}
