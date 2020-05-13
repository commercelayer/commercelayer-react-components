/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe('Order with SkuOptions', () => {
  const filename = 'orderWithSkuOptions'

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

  it('Select an SKU without SkuOptions', () => {
    cy.wait(['@token', '@skus', '@prices'])
    cy.get('#add-to-bag').should('be.disabled')
    cy.get('#quantity-selector').should('be.disabled')

    cy.get('#variant-selector').select('6 months')
    // cy.wait('@retrieveSku')

    cy.get('.w-auto > :nth-child(1)').should('contain.text', '€20,00')
    cy.get('[name="message"]').should('not.exist')
    cy.get('[name="size"]').should('not.exist')
    cy.get('[name="back"]').should('not.exist')
  })

  it('Select an SKU with SkuOptions', () => {
    if (!Cypress.env('RECORD')) {
      cy.newStubData(['prices1', 'retrieveSku1'])
    }
    cy.get('#variant-selector').select('12 months')

    // cy.wait(['@retrieveSku'])
    // cy.wait(['@prices'])

    cy.get('.w-auto > :nth-child(1)').should('contain.text', '€29,00')
    cy.get('[name="message"]').should('exist')
    cy.get('[name="size"]').should('exist')
    cy.get('[name="back"]').should('exist')
  })

  it('Add message, size and color', () => {
    cy.get('[name="message"]').type('Happy BDay!')
    cy.get('[name="size"]').type('Big')
    cy.get('[name="back"]').type('Red')

    cy.get('[name="message"]').should('contain.value', 'Happy BDay!')
    cy.get('[name="size"]').should('contain.value', 'Big')
    cy.get('[name="back"]').should('contain.value', 'Red')
  })

  it('Add quantity to SKU', () => {
    cy.get('#quantity-selector').type('{backspace}2')
    cy.get('#quantity-selector').should('contain.value', '2')
  })

  it('Add to bag', () => {
    cy.get('#add-to-bag').click()

    cy.wait([
      '@orders',
      '@insertLineItems',
      '@retrieveLineItems',
      '@getOrders',
      '@insertLineItemOptions',
      '@retrieveLineItems',
    ])

    // cy.wait(['@getOrders'])
    // cy.wait(['@insertLineItemOptions'])

    cy.get('#items-count').should('contain.text', '2')
    cy.get('.font-medium > .text-right > span').should('contain.text', '€63,50')
    cy.get('#total-amount').should('contain.text', '€63,50')
  })

  if (Cypress.env('RECORD')) {
    // NOTE cypress does not dispatch getOrders request after deleting the lineItem (only in STUB mode 🤷🏻‍♂️)
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
