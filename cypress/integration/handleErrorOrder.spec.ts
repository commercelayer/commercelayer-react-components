/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe('Handle Error', () => {
  const filename = 'handleError'

  before(() => {
    cy.setRoutes({
      endpoint: Cypress.env('apiEndpoint'),
      routes: [Cypress.env('requests')[0]],
      record: Cypress.env('RECORD'),
      filename,
    })
    cy.visit(`/${filename}`)
  })

  beforeEach(() => {
    cy.setRoutes({
      endpoint: Cypress.env('apiEndpoint'),
      routes: Cypress.env('requests'),
      record: Cypress.env('RECORD'),
      filename,
    })
  })

  after(() => {
    if (Cypress.env('RECORD')) {
      cy.saveRequests(filename)
    }
  })

  it('Select an SKU', () => {
    cy.wait(['@token', '@skus', '@prices'])
    cy.get('#add-to-bag').should('be.disabled')
    cy.get('#quantity-selector').should('be.disabled')

    cy.get('#variant-selector').select('BABYONBU000000E63E746MXX')
    cy.wait('@retrieveSku')

    cy.get('.w-auto > :nth-child(1)').should('have.text', '€20,00')
  })

  it('Out of stock', () => {
    cy.get(':nth-child(6) > p').should('contain.text', 'Out of stock')
  })
})
