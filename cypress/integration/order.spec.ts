/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe('Order', () => {
  const filename = 'order'

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
    cy.get('#quantity-selector').type('{backspace}2')
    cy.get('#quantity-selector').should('have.value', '2')
  })

  it('Add to bag', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['prices1', 'retrieveLineItems1'])
    }
    cy.get('#add-to-bag').click()

    cy.wait(['@orders', '@insertLineItems', '@getOrders'])

    cy.get('#items-count').should('have.text', '2')
    cy.get('.font-medium > .text-right > span').should('have.text', '€58,00')
    cy.get('#total-amount').should('have.text', '€58,00')
  })

  it('Update lineItem', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['getOrders1', 'retrieveLineItems2'])
    }
    cy.get('#line-item-quantity').select('3')

    cy.wait(['@lineItems', '@updateLineItems'])

    cy.get('#items-count').should('have.text', '3')
    cy.get('.font-medium > .text-right > span').should('have.text', '€87,00')
    cy.get('#total-amount').should('have.text', '€87,00')
  })

  it('Select second SKU', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['retrieveSku1'])
    }

    cy.get('#variant-selector').select('6 months')
    cy.get('#variant-selector').should('have.value', 'BABYONBU000000E63E746MXX')

    cy.get('.w-auto > :nth-child(1)').should('have.text', '€20,00')
  })

  it('Add to bag the second SKU', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['getOrders2', 'retrieveLineItems3'])
    }

    cy.get('#add-to-bag').click()

    cy.get('#items-count').should('have.text', '4')

    cy.get('.font-medium > .text-right > span').should('have.text', '€107,00')
    cy.get('#total-amount').should('have.text', '€107,00')
  })

  if (Cypress.env('RECORD')) {
    // NOTE cypress does not dispatch getOrders request after deleting the lineItem (only in STUB mode 🤷🏻‍♂️)
    it('Remove the second lineItem', () => {
      cy.get(':nth-child(2) > #line-item-remove').click()

      cy.wait([
        '@lineItems',
        '@deleteLineItems',
        '@getOrders',
        '@retrieveLineItems',
      ])

      cy.get('#items-count').should('have.text', '1')
      cy.get('.font-medium > .text-right > span').should('have.text', '€20,00')
      cy.get('#total-amount').should('have.text', '€20,00')
    })
    it('Remove the first lineItem', () => {
      cy.get('#line-item-remove').click()

      cy.get('#items-count').should('have.text', '0')
      cy.get('.font-medium > .text-right > span').should('have.text', '€0,00')
      cy.get('#total-amount').should('have.text', '€0,00')
    })
  }
})
