/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe('Order with radio variants', () => {
  const filename = 'radioOrder'

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

    cy.get('#variant-selector-1').check()
    // cy.get('#variant-selector').select('12 months')
    cy.wait('@retrieveSku')

    cy.get('.w-auto > :nth-child(1)').should('contain.text', '€29,00')
  })

  it('Add quantity to SKU', () => {
    cy.get('#quantity-selector').type('{backspace}2')
    cy.get('#quantity-selector').should('contain.value', '2')
  })

  it('Add to bag', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['prices1', 'retrieveLineItems1'])
    }
    cy.get('#add-to-bag').click()

    cy.wait(['@orders', '@insertLineItems', '@getOrders'])

    cy.get('#items-count').should('contain.text', '2')
    cy.get('.font-medium > .text-right > span').should('contain.text', '€58,00')
    cy.get('#total-amount').should('contain.text', '€58,00')
  })

  it('Update lineItem', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['getOrders1', 'retrieveLineItems2'])
    }
    cy.get('#line-item-quantity').select('3')

    cy.wait(['@lineItems', '@updateLineItems'])

    cy.get('#items-count').should('contain.text', '3')
    cy.get('.font-medium > .text-right > span').should('contain.text', '€87,00')
    cy.get('#total-amount').should('contain.text', '€87,00')
  })

  it('Select second SKU', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['retrieveSku1'])
    }

    cy.get('#variant-selector-0').check()

    cy.get('.w-auto > :nth-child(1)').should('contain.text', '€20,00')
  })

  it('Add to bag the second SKU', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['getOrders2', 'retrieveLineItems3'])
    }

    cy.get('#add-to-bag').click()

    cy.get('#items-count').should('contain.text', '3')

    cy.get('.font-medium > .text-right > span').should('contain.text', '€87,00')
    cy.get('#total-amount').should('contain.text', '€87,00')
  })

  if (Cypress.env('RECORD')) {
    // NOTE cypress does not dispatch getOrders request after deleting the lineItem (only in STUB mode 🤷🏻‍♂️)
    it('Remove line items', () => {
      cy.get('#line-item-remove').click()

      cy.get('#items-count').should('contain.text', '0')
      cy.get('.font-medium > .text-right > span').should(
        'contain.text',
        '€0,00'
      )
      cy.get('#total-amount').should('contain.text', '€0,00')
    })
  }
})
