import { addManagerApiLog } from '../service/api-log'

export default (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', async () => {
    await addManagerApiLog(
      `${req.method} ${req.originalUrl}`,
      req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      req.body,
      res.statusCode,
      (req.jwt && req.jwt.domain) || ''
    )
  })

  next()
}
