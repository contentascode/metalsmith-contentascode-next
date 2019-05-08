const debug = require('debug')('metalsmith:contentascode_next')
const async = require('async')
const path = require('path')
const match = require('multimatch')
const spawnSync = require('child_process').spawnSync
const spawn = require('child_process').spawn
const fs = require('fs-extra')
/**
 * Expose `plugin`.
 */

module.exports = plugin

/**
 * Metalsmith plugin to transform content for a contentascode next.js pipeline.
 *
 *
 * @param {Object} options
 *
 * @return {Function}
 */

function plugin(options) {
  const { destination, patterns = ['**/*.md'], install = true, start = true } =
    options || {}

  return function contentascode_next(files, metalsmith, done) {
    Object.keys(files).forEach(key => {
      // debug('<< File keys: ', Object.keys(files[key]));
      // debug('<< Res keys: ', Object.keys(res[key]));
      // if (match(key, [...patterns, '**/content.json']).length === 0) {
      debug('move', key)
      files[path.join(destination, key)] = files[key]
      delete files[key]
      // } else {
      //   delete files[key]
      // }
    })

    const { watch, watchRun } = metalsmith.metadata()
    debug('watchRun', watchRun)
    if (watchRun !== true) {
      const npmInstall =
        install &&
        spawnSync('npm', ['install', '--silent'], {
          cwd: path.join(metalsmith._destination),
          stdio: 'inherit',
        })

      if (npmInstall.signal === 'SIGINT') {
        process.kill(process.pid, 'SIGINT')
      } else {
        // const npmBuild =
        //   start &&
        //   watch &&
        //   spawn('npm', ['run', 'build'], {
        //     cwd: path.join(metalsmith._destination),
        //     detached: true,
        //     stdio: 'inherit',
        //   })

        const npmStart =
          start &&
          watch &&
          spawn('npm', ['run', 'dev'], {
            cwd: path.join(metalsmith._destination),
            // detached: true,
            stdio: 'inherit',
          })
        //
        // npmBuild &&
        //   npmBuild.on('exit', () => {
        //     process.kill(process.pid, 'SIGINT')
        //   })

        npmStart &&
          npmStart.on('exit', () => {
            process.kill(process.pid, 'SIGINT')
          })
      }
    }
    done()
  }
}
