/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />
import { euAddress, usAddress } from '../support/utils'

describe('Checkout Shipments', () => {
  const filename = 'checkout-shipments'

  before(() => {
    // @ts-ignore
    cy.setRoutes({
      endpoint: 'https://the-blue-brand-3.commercelayer.co',
      routes: Cypress.env('requests'),
      record: Cypress.env('RECORD'),
      filename,
    })
    cy.visit(`/${filename}`)
  })

  after(() => {
    if (Cypress.env('RECORD')) {
      // @ts-ignore
      cy.saveRequests(filename)
    }
  })

  beforeEach(() => {
    cy.setRoutes({
      endpoint: 'https://the-blue-brand-3.commercelayer.co',
      routes: Cypress.env('requests'),
      record: Cypress.env('RECORD'),
      filename,
    })
    // Line Item
    cy.get('[data-cy="line-item-name"]').each((e, i) => {
      cy.wrap(e).as(`lineItemName${i}`)
    })
    cy.get('[data-cy="line-item-quantity"]').each((e, i) => {
      cy.wrap(e).as(`lineItemQuantity${i}`)
    })
    // Stock Transfer
    cy.get('[data-cy="stock-transfer"]').as('stockTransfer')
    // Shipping Method
    cy.get('[data-cy="shipping-method-button"]').each((e, i) => {
      cy.wrap(e).as(`shippingMethodButton${i}`)
    })
    cy.get('[data-cy="shipping-method-name"]').each((e, i) => {
      cy.wrap(e).as(`shippingMethodName${i}`)
    })
    cy.get('[data-cy="shipping-method-price"]').each((e, i) => {
      cy.wrap(e).as(`shippingMethodPrice${i}`)
    })
    // Delivery Lead Time
    cy.get('[data-cy="delivery-lead-time-min-days"]').each((e, i) => {
      cy.wrap(e).as(`deliveryLeadTimeMinDays${i}`)
    })
    cy.get('[data-cy="delivery-lead-time-max-days"]').each((e, i) => {
      cy.wrap(e).as(`deliveryLeadTimeMaxDays${i}`)
    })
    // Current shipping method
    cy.get('[data-cy="current-shipping-method"]').as('currentShippingMethod')
  })

  it('Checking shipments', () => {
    cy.wait(['@token', '@getOrders'])
    cy.get('@lineItemName0').should(
      'have.text',
      'Black Long Sleeve T-shirt with White Logo (M)'
    )
    cy.get('@lineItemQuantity0').should('have.text', '9')
    cy.get('@lineItemName1').should(
      'have.text',
      'Black Baby Onesie Short Sleeve with White Logo (New born)'
    )
    cy.get('@lineItemQuantity1').should('have.text', '3')
    cy.get('@shippingMethodName0').should('have.text', 'Standard Shipping')
    cy.get('@shippingMethodPrice0').should('have.text', '€7,00')
    cy.get('@shippingMethodName1').should('have.text', 'Express Delivery')
    cy.get('@shippingMethodPrice1').should('have.text', '€12,00')
    cy.get('@deliveryLeadTimeMinDays0').should('contain.html', '3')
    cy.get('@deliveryLeadTimeMaxDays0').should('contain.text', '5')
    cy.get('@deliveryLeadTimeMinDays1').should('contain.html', '2')
    cy.get('@deliveryLeadTimeMaxDays1').should('contain.text', '3')
    cy.get('@currentShippingMethod').should('contain.text', '')
  })

  it('Choosing Standard Shipping', () => {
    cy.get('@shippingMethodButton0').click()
    cy.get('@currentShippingMethod').should('contain.text', 'Standard Shipping')
  })

  it('Choosing Express Delivery', () => {
    cy.get('@shippingMethodButton1').click()
    cy.get('@currentShippingMethod').should('contain.text', 'Express Delivery')
  })
})
