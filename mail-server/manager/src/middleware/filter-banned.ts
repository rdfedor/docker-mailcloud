import { checkIsRemoteAddrBanned } from "../service/api-log"

export default async (req: Request, res: Response, next: NextFunction) => {
  const remoteAddr = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress

  if (await checkIsRemoteAddrBanned(remoteAddr)) {
    return res.status(403).send('Access Denied')
  }

  next()
}
