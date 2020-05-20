/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe('Handle Error', () => {
  const filename = 'handleError'

  before(() => {
    cy.server()
    cy.setRoutes({
      endpoint: Cypress.env('apiEndpoint'),
      routes: [Cypress.env('requests')[0]],
      record: Cypress.env('RECORD'),
      filename,
    })
    cy.visit(`/${filename}`)
  })

  beforeEach(() => {
    cy.server()
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

    cy.get('#variant-selector').select('12 months')
    cy.wait('@retrieveSku')

    cy.get('.w-auto > :nth-child(1)').should('have.text', '€29,00')
  })

  it('Add quantity to SKU', () => {
    cy.get('#quantity-selector').type('{backspace}31')
    cy.get('#quantity-selector').should('have.value', '31')
  })

  it('Add to bag', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['prices1', 'retrieveLineItems1'])
    }
    cy.get('#add-to-bag').click()

    cy.wait(['@orders', '@insertLineItems', '@getOrders'])

    cy.get('#items-count').should('have.text', '30')
    cy.get('.font-medium > .text-right > span').should('have.text', '€870,00')
    cy.get('#total-amount').should('have.text', '€870,00')
  })

  it('Update lineItem and get quantity error', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['getOrders1', 'retrieveLineItems2'])
    }
    cy.get('#line-item-quantity').select('31')

    cy.wait(['@lineItems', '@updateLineItems'])

    cy.get('#items-count').should('have.text', '30')
    cy.get('.flex-col.p-2 > .flex > span.text-red-700').should(
      'have.text',
      'quantity - must be less than or equal to 30'
    )
  })

  it('Add new quantity to SKU', () => {
    cy.get('#quantity-selector').type('{backspace}{backspace}1')
    cy.get('#quantity-selector').should('have.value', '1')
  })

  it('Add to bag and get quantity error', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['prices1', 'retrieveLineItems1'])
    }
    cy.get('#add-to-bag').click()

    cy.wait(['@insertLineItems'])

    cy.get(':nth-child(7) > .text-red-700').should(
      'have.text',
      'quantity - is out of stock'
    )
  })
})
