import '@commercelayer/cypress-vcr'
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// const requestsData = []

// Cypress.Commands.add('setRoutes', ({ endpoint, routes, record, filename }) => {
//   const allAlias = []
//   if (!record) {
//     const file = filename || 'requests'
//     cy.fixture(file).then((requests) => {
//       const firstCalls = requests.filter(({ aliasRequest }) => !aliasRequest)
//       firstCalls.map(({ url, method, data, alias }) => {
//         cy.route({ url, method, response: data }).as(alias)
//       })
//     })
//     return
//   }
//   routes.map(({ url, alias, method }) => {
//     cy.route({
//       url: `${endpoint}${url}`,
//       method: method,
//       onResponse: ({ url: requestUrl, method, response }) => {
//         const data = response.body ? response.body : {}
//         const filterAlias = allAlias.filter((a) => a.search(alias) !== -1)
//         const aliasIndex = allAlias.indexOf(alias)
//         if (_.isEmpty(filterAlias)) {
//           allAlias.push(alias)
//           requestsData.push({
//             url: requestUrl,
//             method,
//             data,
//             alias,
//             relativeUrl: url,
//           })
//         }
//         if (filterAlias.length === 1) {
//           const currentAlias = allAlias[aliasIndex]
//           allAlias.push(`${currentAlias}${1}`)
//           requestsData.push({
//             url: requestUrl,
//             method,
//             data,
//             alias,
//             aliasRequest: `${currentAlias}${1}`,
//             relativeUrl: url,
//           })
//         }
//         if (filterAlias.length > 1) {
//           const lastAlias = _.last(filterAlias)
//           const lastNumber = lastAlias.substr(lastAlias.length - 1)
//           const newAlias = lastAlias.replace(lastNumber, Number(lastNumber) + 1)
//           allAlias.push(newAlias)
//           requestsData.push({
//             url: requestUrl,
//             method,
//             data,
//             alias,
//             aliasRequest: newAlias,
//             relativeUrl: url,
//           })
//         }
//       },
//     }).as(alias)
//   })
// })
// Cypress.Commands.add('saveRequests', (filename = 'requests') => {
//   const path = `./cypress/fixtures/${filename}.json`
//   cy.writeFile(path, requestsData)
// })

// Cypress.Commands.add('newStubData', (findAlias, filename = 'requests') => {
//   cy.fixture(filename).then((requests) => {
//     const { method, data, url, alias } = requests.find(
//       ({ aliasRequest }) => aliasRequest === findAlias
//     )
//     cy.route({ url, method, response: data }).as(alias)
//   })
// })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
