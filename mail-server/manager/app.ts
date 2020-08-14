import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import { DmsSync } from './src/service'
import router from './src/routes'
import { MANAGER_PORT } from './src/config'
import { NotFoundError } from './src/error'
import { startLogManager } from './src/service/api-log'

require("log-timestamp")

console.info('Starting  mail-manager')

console.info("Watching for local configuration changes")

DmsSync.start()

console.info('Loading web')

export const app = express()

app.disable('x-powered-by')

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
)

//get real ip if passed by nginx
morgan.token('remote-addr', function (req) {
  return req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
});

app.use(morgan('combined'))

app.use(router)

app.use(function (req, res, next) {
  next(new NotFoundError('Page Not Found'))
})

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500)
        res.json({
          message: err.message,
          error: err
        })
        if (!err.status) {
          console.log(err)
        }
    })
}

app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.json({
      message: err.message
    })
    if (!err.status) {
      console.log(err)
    }
})

app.listen(MANAGER_PORT, function () {
  console.info(`Started mail-manager on port ${MANAGER_PORT}`)
  console.info('Starting log manager')
  startLogManager()
})
