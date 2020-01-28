const lodash = require('lodash')

const uniqueAlias = (key, request) => {
  const count = []
  request.map(v => {
    if (v === key) {
      count.push(key)
    }
  })
  return count.length > 1 ? `${key}${count.length - 1}` : key
}

module.exports.fixRoute = (url, aliasRoutes, method, baseUrl, request) => {
  console.log('aliasRoutes :', aliasRoutes)
  const routes = {}
  const urlId = lodash.first(url.match(/\/[a-zA-Z]{10,}\/|\/[a-zA-Z]{10,}/))
  Object.keys(aliasRoutes).map(k => {
    if (k.search(/\/\*\*\//) !== -1 && urlId) {
      const newK = k.replace('/**/', urlId)
      if (url.includes(newK) && aliasRoutes[k][method]) {
        routes[`${baseUrl}${newK}`] = {
          [method]: aliasRoutes[k][method]
        }
        return
      }
    } else if (k.search(/\/\*\*/) !== -1 && urlId) {
      const newK = k.replace('/**', urlId)
      if (url.includes(newK) && aliasRoutes[k][method]) {
        routes[`${baseUrl}${newK}`] = {
          [method]: aliasRoutes[k][method]
        }
        return
      }
    }
    if (url.includes(k)) {
      routes[`${baseUrl}${k}`] = {
        [method]: aliasRoutes[k][method]
      }
    }
  })
  request.push(routes[url][method])
  console.log('request :', request)
  return { alias: uniqueAlias(routes[url][method], request), request }
}
