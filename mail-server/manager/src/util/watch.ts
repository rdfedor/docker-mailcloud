import fs from "fs"
import { dirname } from "path"
import md5 from "md5"

/**
 * Watches a specific resource on the filesystem
 *
 * @param {String} path Path to the file or folder to watch
 * @param {Object} [options]
 * @param {Function} callback Function to call when changes are detected
 */
export const Watch = function (path, options = {}, callback = false) {
  this.path = path
  this.options = options
  this.callback = callback

  if (options instanceof Function) {
    this.options = { interval: 1000 }
    this.callback = options
  }

  if (!fs.existsSync(path)) {
    const dirPath = dirname(path)
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath)

    fs.writeFileSync(path, '')
  }

  this.handler = null
  this.previousMD5 = false
}

Watch.prototype.start = function() {
    if (this.handler) {
        throw new Error(`${this.path} is already being watched.`)
    }

    this.handler = fs.watch(
      this.path,
      this.options,
      async (event, filename) => {
        if (filename && fs.existsSync(this.path)) {
          const md5Current = md5(fs.readFileSync(this.path))
          if (md5Current === this.previousMD5) {
            return
          }
          this.previousMD5 = md5Current
          console.log(`Change detected in ${filename}`)

          if (this.callback)
            await this.callback()
        }
      }
    )
}

Watch.prototype.stop = function() {
    fs.unwatchFile(this.path)
    this.handler = null
}

Watch.prototype.isRunning = function() {
  return this.handler !== null
}

export default Watch
