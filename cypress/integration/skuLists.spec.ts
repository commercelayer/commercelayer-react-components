/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe('SkuLists', () => {
  const filename = 'skuLists'

  before(() => {
    cy.server()
    cy.setRoutes({
      endpoint: Cypress.env('apiEndpoint'),
      routes: Cypress.env('requests'),
      record: Cypress.env('RECORD'),
      filename,
    })
    cy.visit(`/${filename}`)
  })

  after(() => {
    if (Cypress.env('RECORD')) {
      cy.saveRequests(filename)
    }
  })

  it('Load bundles', () => {
    cy.wait(['@token', '@skuLists'])
    if (!Cypress.env('RECORD')) {
      cy.newStubData('skuLists')
    }
    cy.get(':nth-child(1) > button.inline-flex').click()
    cy.wait(['@orders', '@insertLineItems', '@retrieveLineItems'])
    // cy.get('.justify-around > :nth-child(1) > .flex > :nth-child(2)').should(
    //   'contain.text',
    //   '€37,70'
    // )
    // cy.get(':nth-child(1) > .flex > :nth-child(3)').should(
    //   'contain.text',
    //   '$34.80'
    // )
    // cy.get(':nth-child(1) > .flex > :nth-child(4)').should(
    //   'contain.text',
    //   '$45.24'
    // )
  })
})
