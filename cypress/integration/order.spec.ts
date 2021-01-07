/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe('Order', () => {
  const filename = 'order'

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
    cy.get('[data-cy="add-to-cart"]').as('addToCart')
    cy.get('[data-cy="quantity-selector"]').as('quantitySelector')
    cy.get('[data-cy="variant-selector"]').as('variantSelector')
    cy.get('[data-cy="items-count"]').as('itemsCount')
    cy.get('[data-cy="total-amount"]').as('totalAmount')
  })

  after(() => {
    if (Cypress.env('RECORD')) {
      cy.saveRequests(filename)
    }
  })

  it('Initial', () => {
    // cy.wait('@prices')
    // cy.wait('@skus')
    cy.get('@addToCart').should('be.disabled')
    cy.get('@quantitySelector').should('be.disabled')
    cy.get('.w-auto > :nth-child(1)').should('have.text', '€29,00')
  })

  it('Select SKU', () => {
    cy.get('@variantSelector').select('BABYONBU000000E63E7412MX')
    // cy.wait('@retrieveSku')
    cy.get('@quantitySelector').type('{selectall}{backspace}2')
    cy.get('@quantitySelector').should('have.value', '2')
  })

  it('Add to bag', () => {
    // if (!Cypress.env('RECORD')) {
    //   cy.newStubData(['prices1', 'retrieveLineItems1'])
    // }
    cy.get('@addToCart').click()
    // cy.wait(['@orders', '@insertLineItems', '@getOrders'])
    cy.get('@itemsCount').should('have.text', '2')
    cy.get('.font-medium > .text-right > span').should('have.text', '€58,00')
    cy.get('@totalAmount').should('have.text', '€58,00')
  })

  it('Update lineItem', () => {
    // if (!Cypress.env('RECORD')) {
    //   cy.newStubData(['getOrders1', 'retrieveLineItems2'])
    // }
    cy.get('[data-cy="line-item-quantity"]').as('lineItemQuantity')
    cy.get('@lineItemQuantity').select('3')

    // cy.wait(['@lineItems', '@updateLineItems'])

    cy.get('@itemsCount').should('have.text', '3')
    cy.get('.font-medium > .text-right > span').should('have.text', '€87,00')
    cy.get('@totalAmount').should('have.text', '€87,00')
  })

  it('Select second SKU', () => {
    // if (!Cypress.env('RECORD')) {
    //   cy.newStubData(['retrieveSku1'])
    // }

    cy.get('@variantSelector').select('6 months')
    cy.get('@variantSelector').should('have.value', 'BABYONBU000000E63E746MXX')

    cy.get('.w-auto > :nth-child(1)').should('have.text', '€29,00')
  })

  it('Add to bag the second SKU', () => {
    // if (!Cypress.env('RECORD')) {
    //   cy.newStubData(['getOrders2', 'retrieveLineItems3'])
    // }

    cy.get('@addToCart').click()

    cy.get('@itemsCount').should('have.text', '4')

    cy.get('.font-medium > .text-right > span').should('have.text', '€116,00')
    cy.get('@totalAmount').should('have.text', '€116,00')
  })

  if (Cypress.env('RECORD')) {
    // NOTE cypress does not dispatch getOrders request after deleting the lineItem (only in STUB mode 🤷🏻‍♂️)
    it('Remove lineItems', () => {
      cy.get('[data-cy="line-item-remove"]').as('lineItemRemove')
      cy.get('@lineItemRemove').click({ multiple: true })

      cy.get('@itemsCount').should('have.text', '0')
      cy.get('.font-medium > .text-right > span').should('have.text', '€0,00')
      cy.get('@totalAmount').should('have.text', '€0,00')
    })
  }
})
