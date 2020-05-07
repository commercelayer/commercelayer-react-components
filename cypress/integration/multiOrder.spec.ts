/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe('Order', () => {
  const filename = 'multiOrder'

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

  it('Select an SKU in OrderUS', () => {
    cy.wait(['@token', '@skus', '@prices'])
    cy.get('button[name="add-us"]').should('be.disabled')
    cy.get('input[name="qty-us"]').should('be.disabled')

    cy.get('select[name="selector-us"]').select('12 months')
    cy.wait('@retrieveSku')

    cy.get('.w-auto > :nth-child(1)').should('contain.text', '€29,00')
  })

  it('Select an SKU in OrderIT', () => {
    // cy.wait(['@token', '@skus', '@prices'])
    cy.get('button[name="add-it"]').should('be.disabled')
    cy.get('input[name="qty-it"]').should('be.disabled')

    cy.get('select[name="selector-it"]').select('6 months')
    cy.wait('@retrieveSku')

    cy.get('.w-auto > :nth-child(1)').should('contain.text', '€29,00')
  })

  it('Add quantity to SKU in OrderUS', () => {
    cy.get('input[name="qty-us"]').type('{backspace}2')
    cy.get('input[name="qty-us"]').should('contain.value', '2')
  })

  it('Add quantity to SKU in OrderIT', () => {
    cy.get('input[name="qty-it"]').type('{backspace}3')
    cy.get('input[name="qty-it"]').should('contain.value', '3')
  })

  it('Add to bag in OrderUS', () => {
    // if (!Cypress.env('RECORD')) {
    //   cy.newStubData(['prices1', 'retrieveLineItems1'])
    // }
    cy.get('button[name="add-us"]').click()
    cy.wait(['@orders', '@insertLineItems', '@getOrders'])
    cy.get('span[name="count-us"]').should('contain.text', '2')
    cy.get(
      ':nth-child(2) > .m-auto > .font-medium > .text-right > span'
    ).should('contain.text', '€58,00')
    cy.get('span[name="total-us"]').should('contain.text', '€58,00')
  })

  it('Add to bag in OrderUS', () => {
    // if (!Cypress.env('RECORD')) {
    //   cy.newStubData(['prices1', 'retrieveLineItems1'])
    // }
    cy.get('button[name="add-it"]').click()
    cy.wait(['@orders', '@insertLineItems', '@getOrders'])
    cy.get('span[name="count-it"]').should('contain.text', '3')
    cy.get('.bg-gray-900 > .m-auto > .font-medium > .text-right > span').should(
      'contain.text',
      '€87,00'
    )
    cy.get('span[name="total-it"]').should('contain.text', '€87,00')
  })

  it('Update lineItem in OrderUS', () => {
    // if (!Cypress.env('RECORD')) {
    //   cy.newStubData(['getOrders1', 'retrieveLineItems2'])
    // }
    // cy.get('#line-item-quantity').select('3')
    // cy.wait(['@lineItems', '@updateLineItems'])
    // cy.get('#items-count').should('contain.text', '3')
    // cy.get('.font-medium > .text-right > span').should('contain.text', '€87,00')
    // cy.get('#total-amount').should('contain.text', '€87,00')
  })

  it('Update lineItem in OrderIT', () => {
    // if (!Cypress.env('RECORD')) {
    //   cy.newStubData(['getOrders1', 'retrieveLineItems2'])
    // }
    // cy.get('#line-item-quantity').select('3')
    // cy.wait(['@lineItems', '@updateLineItems'])
    // cy.get('#items-count').should('contain.text', '3')
    // cy.get('.font-medium > .text-right > span').should('contain.text', '€87,00')
    // cy.get('#total-amount').should('contain.text', '€87,00')
  })

  // it('Select second SKU', () => {
  //   if (!Cypress.env('RECORD')) {
  //     cy.newStubData(['retrieveSku1'])
  //   }

  //   cy.get('#variant-selector')
  //     .select('6 months')
  //     .should('contain.text', '6 months')

  //   cy.get('.w-auto > :nth-child(1)').should('contain.text', '€20,00')
  // })

  // it('Add to bag the second SKU', () => {
  //   if (!Cypress.env('RECORD')) {
  //     cy.newStubData(['getOrders2', 'retrieveLineItems3'])
  //   }

  //   cy.get('#add-to-bag').click()

  //   cy.get('#items-count').should('contain.text', '4')

  //   cy.get('.font-medium > .text-right > span').should(
  //     'contain.text',
  //     '€107,00'
  //   )
  //   cy.get('#total-amount').should('contain.text', '€107,00')
  // })

  // if (Cypress.env('RECORD')) {
  //   // NOTE cypress does not dispatch getOrders request after deleting the lineItem (only in STUB mode 🤷🏻‍♂️)
  //   it('Remove the second lineItem', () => {
  //     cy.get(':nth-child(2) > #line-item-remove').click()

  //     cy.wait([
  //       '@lineItems',
  //       '@deleteLineItems',
  //       '@getOrders',
  //       '@retrieveLineItems',
  //     ])

  //     cy.get('#items-count').should('contain.text', '1')
  //     cy.get('.font-medium > .text-right > span').should(
  //       'contain.text',
  //       '€20,00'
  //     )
  //     cy.get('#total-amount').should('contain.text', '€20,00')
  //   })
  //   it('Remove the first lineItem', () => {
  //     cy.get('#line-item-remove').click()

  //     cy.get('#items-count').should('contain.text', '0')
  //     cy.get('.font-medium > .text-right > span').should(
  //       'contain.text',
  //       '€0,00'
  //     )
  //     cy.get('#total-amount').should('contain.text', '€0,00')
  //   })
  // }
})
