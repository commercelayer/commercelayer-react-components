/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe('Prices', () => {
  const filename = 'prices'

  before(() => {
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

  it('View prices', () => {
    cy.wait(['@token', '@prices'])
    if (!Cypress.env('RECORD')) {
      cy.newStubData('prices1')
    }
    cy.get('.justify-around > :nth-child(1) > .flex > :nth-child(1)').should(
      'contain.text',
      '€29,00'
    )
    cy.get('.justify-around > :nth-child(1) > .flex > :nth-child(2)').should(
      'contain.text',
      '€37,70'
    )
    cy.get(':nth-child(1) > .flex > :nth-child(3)').should(
      'contain.text',
      '$34.80'
    )
    cy.get(':nth-child(1) > .flex > :nth-child(4)').should(
      'contain.text',
      '$45.24'
    )
  })
})
