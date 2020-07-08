import { DmsSync } from './src/service'
require("log-timestamp")

console.log("Watching for local configuration changes")

DmsSync.start()
