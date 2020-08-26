// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const fs = require('fs')

module.exports = (on, config) => {
  require('@cypress/code-coverage/task')(on, config)
  on('task', {
    readFileMaybe(filename) {
      if (fs.existsSync(filename)) {
        return fs.readFileSync(filename, 'utf8')
      }
      return null
    },
    // createRoutes(cmd) {
    //   console.log('config', config.env.requests)
    //   console.log('routeCMD', cmd)
    //   debugger
    //   // config.env.requests.map((r) => {
    //   //   cmd(r.url).as(r.alias)
    //   // })
    //   return null
    // },
  })
  return config
}
