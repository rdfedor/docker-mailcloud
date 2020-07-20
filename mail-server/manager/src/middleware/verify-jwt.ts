import { AccessDeniedError } from "../error"
import { verifyToken } from "../util/jwt"

export default () => async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throw new AccessDeniedError('Access Forbidden')
    }

    const { authorization } = req.headers
    const [transport, token] = authorization.split(' ')

    if (transport.toLowerCase() !== 'bearer') {
      throw new AccessDeniedError('Access Forbidden')
    }

    const data = await verifyToken(token)

    req.jwt = data

    next()
  } catch (err) {
    return res.status(err.status || 500).send(err.message)
  }
}
