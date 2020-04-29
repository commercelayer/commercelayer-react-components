/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe('Order with different category', () => {
  const filename = 'categoryOrder'

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

  it('Check categories', () => {
    cy.wait(['@token', '@prices'])
    cy.get(':nth-child(1) > :nth-child(4) > .text-green-600').should(
      'contain.text',
      '€20,00'
    )
    cy.get(':nth-child(1) > :nth-child(5) > input').should('not.be.disabled')
    cy.get(':nth-child(1) > .pt-2.w-full > button').should('not.be.disabled')
    cy.get(':nth-child(2) > :nth-child(4) > .text-green-600').should(
      'contain.text',
      '€49,00'
    )
    cy.get(':nth-child(2) > :nth-child(5) > input').should('not.be.disabled')
    cy.get(':nth-child(2) > .pt-2.w-full > button').should('not.be.disabled')

    cy.get(':nth-child(3) > :nth-child(5) > input').should('be.disabled')
    cy.get(':nth-child(3) > .pt-2.w-full > button').should('be.disabled')
  })

  it('Add to bag', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['retrieveLineItems1'])
    }
    cy.get(':nth-child(2) > .pt-2.w-full > button').click()

    cy.wait(['@orders', '@insertLineItems', '@getOrders'])

    cy.get('#items-count').should('contain.text', '1')
    cy.get('.font-medium > .text-right > span').should('contain.text', '€49,00')
    cy.get('#total-amount').should('contain.text', '49,00')
  })

  it('Update lineItem', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['getOrders1', 'retrieveLineItems2'])
    }
    cy.get('#line-item-quantity').select('3')

    cy.wait(['@lineItems', '@updateLineItems'])

    cy.get('#items-count').should('contain.text', '3')
    cy.get('.font-medium > .text-right > span').should(
      'contain.text',
      '€147,00'
    )
    cy.get('#total-amount').should('contain.text', '€147,00')
  })

  it('Add to bag the second SKU', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['getOrders2', 'retrieveLineItems3'])
    }

    cy.get(':nth-child(1) > .pt-2.w-full > button').click()

    cy.get('#items-count').should('contain.text', '4')

    cy.get('.font-medium > .text-right > span').should(
      'contain.text',
      '€167,00'
    )
    cy.get('#total-amount').should('contain.text', '€167,00')
  })

  if (Cypress.env('RECORD')) {
    // NOTE cypress does not dispatch getOrders request after deleting the lineItem (only in STUB mode 🤷🏻‍♂️)
    it('Remove the second lineItem', () => {
      cy.get(':nth-child(4) > #line-item-remove').click()
      cy.wait([
        '@lineItems',
        '@deleteLineItems',
        '@getOrders',
        '@retrieveLineItems',
      ])
      cy.get('#items-count').should('contain.text', '3')
      cy.get('.font-medium > .text-right > span').should(
        'contain.text',
        '€147,00'
      )
      cy.get('#total-amount').should('contain.text', '€147,00')
    })
    it('Remove the first lineItem', () => {
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
